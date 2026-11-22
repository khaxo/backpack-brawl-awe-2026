import type { Opponent } from "./types";

/** B5
 * Shown when the API is not there at all.
 *
 * Without it the player reads a status code (`502` from the Vite proxy) or the
 * browser's own wording ("Failed to fetch"). Neither says anything a player can
 * act on, and B5 asks for an understandable message.
 */
const UNREACHABLE = "The arena cannot be reached. The game server may be down.";

/** B5
 * Asks the API for this round's opponent; throws an `Error` whose message is
 * meant to be read by the player.
 *
 * `signal` lets the caller abandon a search that no longer matters. Aborting
 * rejects this promise with an `AbortError`, which the caller recognises and
 * swallows — an abandoned search is not a failure the player should read about.
 *
 * Three ways this can fail, and they are not the same thing:
 *
 * - `fetch` itself rejects: there is no answer at all (no network, no proxy).
 * - The answer carries the API's own `{ error }` body: the API is alive and
 *   explains the problem better than we could, so its text wins.
 * - The answer is an error without that body: somebody else answered — the
 *   proxy when the API is not running. A 5xx here means "not there"; a 4xx
 *   would be our own malformed request, so that one keeps its status code
 *   instead of blaming the server.
 */
export async function fetchOpponent(round: number, signal?: AbortSignal): Promise<Opponent> {
  let response: Response;
  try {
    response = await fetch(`/api/opponents?round=${encodeURIComponent(round)}`, { signal });
  } catch (error) {
    // An abort stays an abort: the caller tells it apart by the signal, not by the message.
    if (signal?.aborted) throw error;
    // `cause` keeps the browser's original reason for the console; the message is for the player.
    throw new Error(UNREACHABLE, { cause: error });
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    if (body?.error) throw new Error(body.error);
    throw new Error(response.status >= 500 ? UNREACHABLE : `Opponent search failed (${response.status})`);
  }

  return response.json() as Promise<Opponent>;
}
