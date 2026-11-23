/**
 * B7 — the hall of fame.
 *
 * Entries live in memory and are gone when the server restarts. The task
 * allows that; the cost is that two people running the app see two lists.
 */

/** Mirrors `src/run.ts`. Duplicated because the server cannot import TypeScript. */
const START_LIVES = 3;
const WINS_TO_VICTORY = 5;
const MAX_NAME = 20;

/** The ordering rule. Sent with the list so the page shows what it was sorted by. */
export const ORDER = "Victories first, then more wins, then fewer rounds.";

/** Every accepted run, in arrival order. Sorting happens on reading. */
const runs = [];

const whole = (n, min, max) => Number.isInteger(n) && n >= min && n <= max;

/**
 * Why this submission is refused, or `null` if it is fine. Same shape as
 * `buyBlocker` and friends on the client: one pattern on both sides.
 */
export function runBlocker(body) {
  if (!body || typeof body !== "object") return "A run must be sent as a JSON object";
  const { runId, name, wins, lives, round } = body;

  if (typeof runId !== "string" || runId.trim() === "") return "runId is required";
  if (typeof name !== "string" || name.trim() === "") return "Please enter a name";
  if (name.trim().length > MAX_NAME) return `Name must be at most ${MAX_NAME} characters`;

  if (!whole(wins, 0, WINS_TO_VICTORY)) return `wins must be a whole number between 0 and ${WINS_TO_VICTORY}`;
  if (!whole(lives, 0, START_LIVES)) return `lives must be a whole number between 0 and ${START_LIVES}`;
  if (!whole(round, 1, Number.MAX_SAFE_INTEGER)) return "round must be a positive whole number";

  if (wins < WINS_TO_VICTORY && lives > 0) return "This run is not finished yet";

  // Every round is one battle, and every battle either adds a win or costs a
  // life. When the run ends the round counter stops, so any honest run has
  // `wins + losses === round`. Raising wins alone fails here; raising round
  // too makes the run rank worse.
  const losses = START_LIVES - lives;
  if (wins + losses !== round) {
    return `These numbers do not add up: ${wins} wins and ${losses} losses cannot happen in ${round} rounds`;
  }
  return null;
}

/** Whether this run was already submitted. */
export const hasRun = (runId) => runs.some((entry) => entry.runId === runId);

/**
 * Stores a checked submission. `outcome` is worked out here, never read from
 * the request — a client that reports its own result can report any result.
 */
export function addRun({ runId, name, wins, lives, round }) {
  const entry = { runId, name: name.trim(), outcome: wins >= WINS_TO_VICTORY ? "victory" : "defeat", wins, lives, round };
  runs.push(entry);
  return entry;
}

/** The runs in the order of `ORDER`. `sort` is stable, so a tie keeps arrival order. */
export const listRuns = () =>
  [...runs].sort((a, b) =>
    a.outcome !== b.outcome ? (a.outcome === "victory" ? -1 : 1) : b.wins - a.wins || a.round - b.round);

/** Empties the list. Only used by the tests. */
export const clearRuns = () => runs.splice(0);
