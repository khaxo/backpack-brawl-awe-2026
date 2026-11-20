import type { Opponent } from "./types";

/**
 * Asks the API for this round's opponent; throws with the server's error text on failure.
 *
 * `signal` lets the caller abandon a search that no longer matters. Aborting
 * rejects this promise with an `AbortError`, which the caller recognises and
 * swallows — an abandoned search is not a failure the player should read about.
 */
export async function fetchOpponent(round: number, signal?: AbortSignal): Promise<Opponent> {
  const response = await fetch(`/api/opponents?round=${encodeURIComponent(round)}`, { signal });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `Opponent search failed (${response.status})`);
  }
  return response.json() as Promise<Opponent>;
}
