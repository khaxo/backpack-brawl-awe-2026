import { describe, expect, it } from "vitest";
import { createBattle, newGame, skipReplay, startBattle, startSearch } from "./game";
import { buyItem } from "./run";
import { fromSave, saveBlocker, toSave, type SavedGame } from "./storage";
import type { GameState, Opponent } from "./types";

const opponentFor = (round: number): Opponent => ({
  id: "mossback-hermit", name: "Mossback Hermit", icon: "🐢", hp: 25, round, items: ["chipped-dagger"],
});

/** A run with one item, ready to search. */
const readyGame = (): GameState => {
  const game = newGame(1, "test-run");
  return { ...game, run: buyItem(game.run, 0) };
};

/** A save that passes every check, so each test can break exactly one thing. */
const save = (overrides: Partial<SavedGame> = {}): SavedGame => ({ ...toSave(readyGame()), ...overrides });

describe("saveBlocker (B6) — what is accepted", () => {
  it("accepts a shopping run", () => {
    expect(saveBlocker(save())).toBeNull();
  });

  it("accepts a running battle with its opponent", () => {
    const battle = startBattle(startSearch(readyGame()), opponentFor(1));
    expect(saveBlocker(toSave(battle))).toBeNull();
  });
});

describe("saveBlocker (B6) — what is refused", () => {
  it("refuses anything that is not a save", () => {
    for (const junk of [null, undefined, "", 42, [], {}]) expect(saveBlocker(junk)).not.toBeNull();
  });

  it("refuses a save written by another version", () => {
    expect(saveBlocker(save({ version: 2 }))).toContain("version");
  });

  it("refuses an unknown phase", () => {
    expect(saveBlocker(save({ phase: "dancing" as never }))).toContain("phase");
  });

  it("refuses values outside the ranges the game can produce", () => {
    const base = save();
    expect(saveBlocker({ ...base, run: { ...base.run, lives: 9 } })).toContain("lives");
    expect(saveBlocker({ ...base, run: { ...base.run, wins: -1 } })).toContain("wins");
    expect(saveBlocker({ ...base, run: { ...base.run, round: 0 } })).toContain("round");
    expect(saveBlocker({ ...base, run: { ...base.run, gold: 2.5 } })).toContain("gold");
  });

  it("refuses a backpack or shop of the wrong size", () => {
    const base = save();
    expect(saveBlocker({ ...base, run: { ...base.run, backpack: [] } })).toContain("backpack");
    expect(saveBlocker({ ...base, run: { ...base.run, shop: ["pot-lid"] } })).toContain("shop");
  });

  it("refuses an item that is not in the catalog", () => {
    const base = save();
    const backpack = [...base.run.backpack];
    backpack[0] = { uid: "x", itemId: "excalibur" };
    expect(saveBlocker({ ...base, run: { ...base.run, backpack } })).toContain("excalibur");
  });

  it("refuses the same uid twice", () => {
    const base = save();
    const backpack = [...base.run.backpack];
    backpack[0] = { uid: "same", itemId: "pot-lid" };
    backpack[1] = { uid: "same", itemId: "pot-lid" };
    expect(saveBlocker({ ...base, run: { ...base.run, backpack } })).toContain("duplicate uid");
  });

  /**
   * The same arithmetic the hall of fame uses: every round is one battle, and
   * every battle either adds a win or costs a life. Editing a single number in
   * the saved JSON breaks the equation.
   */
  it("refuses a run whose numbers cannot have happened", () => {
    const base = save();
    expect(saveBlocker({ ...base, run: { ...base.run, wins: 4 } })).toContain("impossible run");
    expect(saveBlocker({ ...base, run: { ...base.run, lives: 1 } })).toContain("impossible run");
  });

  it("refuses a phase that disagrees with the run", () => {
    const base = save();
    expect(saveBlocker({ ...base, phase: "finished" })).toContain("not over");
  });

  it("refuses a battle without an opponent, or with one from another round", () => {
    const battle = toSave(startBattle(startSearch(readyGame()), opponentFor(1)));
    expect(saveBlocker({ ...battle, opponent: null })).toContain("without an opponent");
    expect(saveBlocker({ ...battle, opponent: opponentFor(4) })).toContain("another round");
  });
});

describe("toSave (B6)", () => {
  it("keeps no replay — the frames are recomputed, not stored", () => {
    const battle = startBattle(startSearch(readyGame()), opponentFor(1));
    expect(JSON.stringify(toSave(battle))).not.toContain("frames");
  });

  /**
   * The point of the whole package: a finished replay has already changed the
   * run. Saving it as a battle would replay it after a reload and count the
   * result a second time — a free win, or a second life lost.
   */
  it("does not save a finished replay as a battle", () => {
    const done = skipReplay(startBattle(startSearch(readyGame()), opponentFor(1)));
    const saved = toSave(done);
    expect(saved.phase).not.toBe("battle");
    expect(saved.opponent).toBeNull();
  });
});

describe("fromSave (B6)", () => {
  it("returns to the shop after a reload during a search", () => {
    const searching = toSave(startSearch(readyGame()));
    expect(searching.phase).toBe("searching");
    expect(fromSave(searching).phase).toBe("shop");
  });

  it("rebuilds the very same battle", () => {
    const battle = startBattle(startSearch(readyGame()), opponentFor(1));
    const restored = fromSave(toSave(battle));
    expect(restored.battle?.result).toEqual(battle.battle?.result);
  });

  it("restarts the replay at the first frame", () => {
    const running = startBattle(startSearch(readyGame()), opponentFor(1));
    const watched = { ...running, battle: { ...running.battle!, frame: 5 } };
    expect(fromSave(toSave(watched)).battle?.frame).toBe(0);
  });

  it("keeps the runId, so the hall of fame still refuses a second entry", () => {
    expect(fromSave(toSave(readyGame())).runId).toBe("test-run");
  });

  it("gives the same battle as createBattle does on its own", () => {
    const battle = startBattle(startSearch(readyGame()), opponentFor(1));
    const saved = toSave(battle);
    expect(createBattle(saved.run, saved.opponent!).result).toEqual(battle.battle?.result);
  });
});
