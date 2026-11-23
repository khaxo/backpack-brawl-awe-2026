import type { HallOfFameEntry, Opponent } from "./types";

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

/** B7 Shown when the hall of fame cannot be reached at all. Same idea as `UNREACHABLE`. */
const HALL_UNREACHABLE = "The hall of fame cannot be reached. The game server may be down.";

/** B7 What the player sends: the facts. `outcome` is the server's to decide. */
export interface RunSubmission {
  runId: string;
  name: string;
  wins: number;
  lives: number;
  round: number;
}

/** B7 The list plus the sentence it was sorted by, so the page cannot claim a different rule. */
export interface HallOfFame {
  order: string;
  entries: HallOfFameEntry[];
}

/** B7 The API's own sentence if it sent one — it knows the cause better than we do. */
async function errorFrom(response: Response): Promise<Error> {
  const body = (await response.json().catch(() => null)) as { error?: string } | null;
  return new Error(body?.error ?? HALL_UNREACHABLE);
}

/**
 * B7 Submits a finished run.
 *
 * A 409 means the server already has this run. That is not a failure — it is
 * the result we wanted — so it resolves like a fresh 201. This is what makes
 * "never submits the same run twice" survive a retry after a timeout, a
 * second tab, or a reload: the `runId` is the same in all three cases.
 */
export async function submitRun(run: RunSubmission): Promise<void> {
  let response: Response;
  try {
    response = await fetch("/api/runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(run),
    });
  } catch (error) {
    throw new Error(HALL_UNREACHABLE, { cause: error });
  }
  if (response.status === 409) return;
  if (!response.ok) throw await errorFrom(response);
}

/** B7 Reads the hall of fame. An empty list is a normal answer, not an error. */
export async function fetchHallOfFame(): Promise<HallOfFame> {
  let response: Response;
  try {
    response = await fetch("/api/runs");
  } catch (error) {
    throw new Error(HALL_UNREACHABLE, { cause: error });
  }
  if (!response.ok) throw await errorFrom(response);
  return response.json() as Promise<HallOfFame>;
}
