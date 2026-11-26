import { describe, expect, it } from "vitest";
import { newGame, searchFailed, skipReplay, startBattle, startSearch } from "../game/game";
import { buyItem } from "../game/run";
import type { GameState, Opponent } from "../types";

/**
 * These tests cover B5: a search may not run twice, and a response that is no
 * longer relevant may not change anything. They test the pure transitions in
 * game.ts rather than the component, because that is where the rules live —
 * the component only decides when to call them.
 */

/** A run that is allowed to fight: the cheapest offer bought into the backpack. */
function readyGame(): GameState {
  const game = newGame(1, "test-run");
  return { ...game, run: buyItem(game.run, 0) };
}

const opponentFor = (round: number): Opponent => ({
  id: "test-dummy",
  name: "Test Dummy",
  icon: "🎯",
  hp: 10,
  round,
  items: ["pot-lid"],
});

describe("startSearch", () => {
  it("moves a shopping run into the search", () => {
    expect(startSearch(readyGame()).phase).toBe("searching");
  });

  it("ignores a second search while one is running", () => {
    const searching = startSearch(readyGame());
    expect(startSearch(searching)).toBe(searching);
  });

  it("refuses to search with an empty backpack", () => {
    const empty = newGame(1, "test-run");
    expect(startSearch(empty)).toBe(empty);
  });
});

describe("searchFailed", () => {
  it("returns to a usable shop and keeps the message", () => {
    const failed = searchFailed(startSearch(readyGame()), "gates are shut");
    expect(failed.phase).toBe("shop");
    expect(failed.error).toBe("gates are shut");
  });

  it("ignores a failure that belongs to no search", () => {
    const shopping = readyGame();
    expect(searchFailed(shopping, "late")).toBe(shopping);
  });
});

describe("startBattle", () => {
  it("starts the battle for the current round", () => {
    const battle = startBattle(startSearch(readyGame()), opponentFor(1));
    expect(battle.phase).toBe("battle");
  });

  it("ignores a response that arrives outside a search", () => {
    const shopping = readyGame();
    expect(startBattle(shopping, opponentFor(1))).toBe(shopping);
  });

  it("ignores a response for a round that is over", () => {
    const searching = startSearch(readyGame());
    expect(startBattle(searching, opponentFor(2))).toBe(searching);
  });

  // "A slow, duplicate or late response must never restart a battle": the late
  // response here is for the right round, so only the phase can reject it.
  it("ignores a response that arrives while a battle is running", () => {
    const battle = startBattle(startSearch(readyGame()), opponentFor(1));
    expect(startBattle(battle, opponentFor(1))).toBe(battle);
  });
});

describe("the battle result", () => {
  it("is applied only once, however often the replay is finished", () => {
    const finished = skipReplay(startBattle(startSearch(readyGame()), opponentFor(1)));
    expect(skipReplay(finished).run).toBe(finished.run);
  });
});
