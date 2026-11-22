import { beforeEach, describe, expect, it } from "vitest";
import { addRun, clearRuns, hasRun, listRuns, runBlocker } from "./runs.js";

/** A submission that passes every check, so each test breaks exactly one thing. */
const run = (overrides = {}) => ({ runId: "r1", name: "Khaled", wins: 5, lives: 1, round: 7, ...overrides });

beforeEach(clearRuns);

describe("runBlocker (B7)", () => {
  it("accepts a victory and a defeat", () => {
    expect(runBlocker(run())).toBeNull();
    expect(runBlocker(run({ wins: 2, lives: 0, round: 5 }))).toBeNull();
  });

  it("refuses a missing runId, an empty name and a name that is too long", () => {
    expect(runBlocker(run({ runId: "" }))).toBe("runId is required");
    expect(runBlocker(run({ name: "   " }))).toBe("Please enter a name");
    expect(runBlocker(run({ name: "x".repeat(21) }))).toContain("20");
  });

  it("refuses values the game cannot produce", () => {
    expect(runBlocker(run({ wins: 2.5, lives: 0, round: 5 }))).not.toBeNull();
    expect(runBlocker(run({ wins: 6 }))).not.toBeNull();
    expect(runBlocker(run({ lives: 4 }))).not.toBeNull();
    expect(runBlocker(run({ round: 0 }))).not.toBeNull();
    expect(runBlocker("not an object")).not.toBeNull();
  });

  it("refuses a run that is still in progress", () => {
    expect(runBlocker(run({ wins: 2, lives: 2, round: 3 }))).toBe("This run is not finished yet");
  });

  it("refuses numbers that do not add up", () => {
    expect(runBlocker(run({ wins: 5, lives: 3, round: 2 }))).toContain("do not add up");
    expect(runBlocker(run({ wins: 0, lives: 0, round: 1 }))).toContain("do not add up");
  });

  /**
   * Walks real runs battle by battle, exactly as `applyBattleResult` does in
   * `src/run.ts`. This ties the duplicated constants to the game: change one
   * side only and this goes red instead of rejecting honest players.
   */
  it("accepts every run the game itself can produce", () => {
    for (const script of ["WWWWW", "LLL", "WLWLWWW", "LWLWLW"]) {
      let wins = 0, lives = 3, round = 1;
      for (const battle of script) {
        battle === "W" ? (wins += 1) : (lives -= 1);
        if (wins >= 5 || lives <= 0) break;
        round += 1;
      }
      expect(runBlocker(run({ wins, lives, round })), script).toBeNull();
    }
  });
});

describe("the list (B7)", () => {
  it("starts empty and knows which runs it holds", () => {
    expect(listRuns()).toEqual([]);
    addRun(run({ runId: "abc" }));
    expect(hasRun("abc")).toBe(true);
    expect(hasRun("xyz")).toBe(false);
  });

  it("trims the name and works out the outcome instead of believing the client", () => {
    const entry = addRun({ ...run({ wins: 2, lives: 0, round: 5, name: "  Aida  " }), outcome: "victory" });
    expect(entry.name).toBe("Aida");
    expect(entry.outcome).toBe("defeat");
  });

  it("sorts victories first, then more wins, then fewer rounds", () => {
    addRun(run({ runId: "a", name: "slow winner", round: 9, lives: 3, wins: 5 }));
    addRun(run({ runId: "b", name: "good loser", wins: 4, lives: 0, round: 7 }));
    addRun(run({ runId: "c", name: "fast winner", wins: 5, lives: 3, round: 5 }));
    addRun(run({ runId: "d", name: "bad loser", wins: 0, lives: 0, round: 3 }));
    expect(listRuns().map((e) => e.name)).toEqual(["fast winner", "slow winner", "good loser", "bad loser"]);
  });

  it("keeps the arrival order for an exact tie", () => {
    addRun(run({ runId: "a", name: "first" }));
    addRun(run({ runId: "b", name: "second" }));
    expect(listRuns().map((e) => e.name)).toEqual(["first", "second"]);
  });
});
