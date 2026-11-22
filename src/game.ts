import { buildOpponentFighter, buildPlayerFighter, simulateBattle } from "./battle";
import { applyBattleResult, newRun, runOutcome } from "./run";
import { itemIdsOf } from "./shop";
import type { BattleReplay, GameState, Opponent, RunState } from "./types";

/**
 * Phase transitions of one run: shop → searching → battle → shop … → finished.
 * Every function is pure, so they can be passed straight to `setState`.
 */

export function newGame(seed: number, runId: string): GameState {
  return { phase: "shop", run: newRun(seed), battle: null, error: null, runId };
}

/** Applies a shop/backpack action; only allowed while shopping. */
export function updateRun(game: GameState, action: (run: RunState) => RunState): GameState {
  if (game.phase !== "shop") return game;
  const run = action(game.run);
  return run === game.run ? game : { ...game, run };
}

/** Why the player can't look for an opponent right now, or `null` if they can. */
export function fightBlocker(game: GameState): string | null {
  if (itemIdsOf(game.run.backpack).length === 0) return "Buy at least one item first";
  return null;
}

/** B5
 * Starts the search for an opponent.
 *
 * The phase check is not a duplicate of the disabled button: the button only
 * stops the common case. A second call can still arrive while a search runs —
 * from a double click that fires before the re-render, or from any other code
 * path. The rule that the user is shown ("you cannot search twice") has to
 * protect the transition itself, not only the control that triggers it.
 */
export function startSearch(game: GameState): GameState {
  if (game.phase !== "shop") return game;
  if (fightBlocker(game) !== null) return game;
  return { ...game, phase: "searching", error: null };
}

/** B5
 * Ends a failed search.
 *
 * Returning to `shop` is the whole point: the shop and the backpack are
 * disabled while the phase is `searching`, so leaving the phase alone would
 * leave the player stranded on a dead screen with an error message.
 */
export function searchFailed(game: GameState, error: string): GameState {
  if (game.phase !== "searching") return game;
  return { ...game, phase: "shop", error };
}

/**
 * Simulates the battle against `opponent` and starts its replay at the first frame.
 *
 * Both guards exist because a response can arrive long after it stopped being
 * relevant — the API is deliberately slow:
 *
 * - `phase !== "searching"` rejects a battle that nobody is waiting for, for
 *   example a response that outlived its own search.
 * - `opponent.round !== run.round` rejects a response for a round that is over.
 *   The round travels with the opponent (the API echoes it back), so no extra
 *   bookkeeping is needed to tell the two apart.
 */
export function startBattle(game: GameState, opponent: Opponent): GameState {
  if (game.phase !== "searching") return game;
  if (opponent.round !== game.run.round) return game;
  const player = buildPlayerFighter(game.run.backpack);
  const enemy = buildOpponentFighter(opponent);
  const result = simulateBattle(player, enemy);
  return { ...game, phase: "battle", battle: { opponent, player, enemy, result, frame: 0 } };
}

export const isReplayDone = (battle: BattleReplay) => battle.frame >= battle.result.frames.length - 1;

/** Shows the given frame; reaching the last frame applies the battle result to the run (exactly once). */
export function showFrame(game: GameState, frame: number): GameState {
  const { battle } = game;
  if (game.phase !== "battle" || !battle || isReplayDone(battle)) return game;
  const last = battle.result.frames.length - 1;
  const next = { ...battle, frame: Math.min(Math.max(frame, battle.frame), last) };
  if (!isReplayDone(next)) return { ...game, battle: next };
  return { ...game, battle: next, run: applyBattleResult(game.run, battle.result.winner) };
}

export const advanceReplay = (game: GameState) => showFrame(game, (game.battle?.frame ?? 0) + 1);
export const skipReplay = (game: GameState) => showFrame(game, Infinity);

/** Leaves a finished replay: back to the shop, or to the end screen if the run is over. */
export function leaveBattle(game: GameState): GameState {
  if (game.phase !== "battle" || !game.battle || !isReplayDone(game.battle)) return game;
  return { ...game, phase: runOutcome(game.run) ? "finished" : "shop", battle: null };
}

/** URL paths of the app's screens. */
export const ROUTES = { start: "/", shop: "/shop", battle: "/battle", result: "/result" } as const;
export type GameRoute = (typeof ROUTES)[keyof typeof ROUTES];

/**
 * The screen that matches the game's phase. Shop, battle and result pages
 * redirect here when they don't match, so the URL always follows the phase.
 */
export function routeForGame(game: GameState | null): GameRoute {
  if (!game) return ROUTES.start;
  switch (game.phase) {
    case "shop":
    case "searching":
      return ROUTES.shop;
    case "battle":
      return ROUTES.battle;
    case "finished":
      return ROUTES.result;
  }
}
