import { createBattle, isReplayDone, leaveBattle } from "./game";
import { CATALOG } from "./items";
import { START_LIVES, WINS_TO_VICTORY, runOutcome } from "./run";
import { BACKPACK_SIZE, SHOP_SIZE } from "./shop";
import type { GameState, Opponent, Phase, RunState } from "./types";

/**
 * B6 — saving a run in the browser and picking it up again.
 *
 * Two rules: save the facts, not the consequences (the replay is recomputed
 * from run + opponent, and `simulateBattle` has no randomness, so it comes
 * back identical). And trust nothing that is read back — `localStorage` is
 * the player's own machine.
 */

const KEY = "backpack-brawl-save";

/** Bumped when the shape below changes; an older save is then discarded instead of misread. */
const VERSION = 1;

export interface SavedGame {
  version: number;
  phase: Phase;
  run: RunState;
  runId: string;
  /** Only set while a battle is running; `null` otherwise. */
  opponent: Opponent | null;
}

const PHASES: Phase[] = ["shop", "searching", "battle", "finished"];
const ITEM_IDS = new Set(CATALOG.map((item) => item.id));

const whole = (n: unknown, min: number, max: number): n is number =>
  typeof n === "number" && Number.isInteger(n) && n >= min && n <= max;

/**
 * The smallest thing worth writing.
 *
 * A **finished** replay needs care: its result is already counted in `run`.
 * Saved as `"battle"` it would replay after a reload and count twice — a free
 * win, or a second life lost. So save what `leaveBattle` would give.
 */
export function toSave(game: GameState): SavedGame {
  const settled = game.phase === "battle" && game.battle && isReplayDone(game.battle) ? leaveBattle(game) : game;
  return {
    version: VERSION,
    phase: settled.phase,
    run: settled.run,
    runId: settled.runId,
    opponent: settled.phase === "battle" ? (settled.battle?.opponent ?? null) : null,
  };
}

/**
 * Writes the already-serialised save, or removes it for `null`. Takes text so
 * the caller can skip a write that changes nothing. A browser that refuses
 * (private mode, full quota) is no reason to interrupt play.
 */
export function writeSave(payload: string | null): void {
  try {
    if (payload === null) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, payload);
  } catch {
    /* ignored on purpose */
  }
}

/** Removes the save. */
export const clearGame = () => writeSave(null);

/**
 * Why this save cannot be used, or `null` if it can. Same shape as
 * `buyBlocker` and the server's `runBlocker`. The reason is never shown to the
 * player — a broken save is just dropped — but it makes the tests say what
 * they mean.
 */
export function saveBlocker(data: unknown): string | null {
  if (!data || typeof data !== "object") return "not an object";
  const save = data as Partial<SavedGame>;

  if (save.version !== VERSION) return `unknown version ${String(save.version)}`;
  if (typeof save.runId !== "string" || save.runId === "") return "runId missing";
  if (!PHASES.includes(save.phase as Phase)) return `unknown phase ${String(save.phase)}`;

  const run = save.run as Partial<RunState> | undefined;
  if (!run || typeof run !== "object") return "run missing";
  if (!whole(run.round, 1, Number.MAX_SAFE_INTEGER)) return "round out of range";
  if (!whole(run.gold, 0, Number.MAX_SAFE_INTEGER)) return "gold out of range";
  if (!whole(run.lives, 0, START_LIVES)) return "lives out of range";
  if (!whole(run.wins, 0, WINS_TO_VICTORY)) return "wins out of range";
  if (!whole(run.nextUid, 1, Number.MAX_SAFE_INTEGER)) return "nextUid out of range";
  if (typeof run.seed !== "number" || !Number.isFinite(run.seed)) return "seed is not a number";

  if (!Array.isArray(run.shop) || run.shop.length !== SHOP_SIZE) return "shop has the wrong size";
  for (const offer of run.shop) {
    if (offer !== null && !ITEM_IDS.has(offer)) return `unknown item in the shop: ${String(offer)}`;
  }

  if (!Array.isArray(run.backpack) || run.backpack.length !== BACKPACK_SIZE) return "backpack has the wrong size";
  const uids = new Set<string>();
  for (const slot of run.backpack) {
    if (slot === null) continue;
    if (typeof slot !== "object" || typeof slot.uid !== "string" || typeof slot.itemId !== "string") return "broken backpack slot";
    if (!ITEM_IDS.has(slot.itemId)) return `unknown item in the backpack: ${slot.itemId}`;
    if (uids.has(slot.uid)) return `duplicate uid ${slot.uid}`;
    uids.add(slot.uid);
  }

  // The same arithmetic the hall of fame uses: every round is one battle, and
  // every battle adds a win or costs a life. Off by one between the two cases
  // because the round only advances while the run continues.
  const battles = (run.wins as number) + (START_LIVES - (run.lives as number));
  const finished = runOutcome(run as RunState) !== null;
  const expected = finished ? (run.round as number) : (run.round as number) - 1;
  if (battles !== expected) return `impossible run: ${battles} battles in round ${run.round}`;

  if (save.phase === "finished" && !finished) return "phase says finished but the run is not over";
  if (save.phase !== "finished" && finished) return "the run is over but the phase says otherwise";

  if (save.phase === "battle") {
    const opponent = save.opponent;
    if (!opponent || typeof opponent !== "object") return "battle without an opponent";
    if (!whole(opponent.round, 1, Number.MAX_SAFE_INTEGER)) return "opponent round out of range";
    if (opponent.round !== run.round) return "the opponent belongs to another round";
    if (!Array.isArray(opponent.items) || opponent.items.some((id) => !ITEM_IDS.has(id))) return "unknown opponent item";
    if (!whole(opponent.hp, 1, Number.MAX_SAFE_INTEGER)) return "opponent hp out of range";
  }

  return null;
}

/**
 * Rebuilds the live state from a checked save.
 *
 * `searching` is not restored: the request died with the page, and waiting for
 * an answer that cannot arrive would strand the player on a disabled screen.
 * Not a free reroll either — a round always has the same opponent.
 */
export function fromSave(save: SavedGame): GameState {
  const battle = save.phase === "battle" && save.opponent ? createBattle(save.run, save.opponent) : null;
  const phase = battle ? "battle" : save.phase === "searching" ? "shop" : save.phase;
  return { phase, run: save.run, runId: save.runId, battle, error: null };
}

/**
 * The saved run, or `null` if there is none or it cannot be trusted. Every
 * failure removes the save: a game that refuses to load is worse than one that
 * forgot.
 */
export function loadGame(): GameState | null {
  let raw: string | null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return null; // storage blocked entirely
  }
  if (raw === null) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    clearGame();
    return null;
  }

  if (saveBlocker(parsed) !== null) {
    clearGame();
    return null;
  }
  return fromSave(parsed as SavedGame);
}
