import { describe, expect, it } from "vitest";
import { CATALOG } from "./items";
import { activeSets, SETS } from "./sets";

describe("sets", () => {
  it("has at least 2 sets, one of them Fire, each with at least 3 items", () => {
    const ids = Object.keys(SETS);
    expect(ids.length).toBeGreaterThanOrEqual(2);
    expect(ids).toContain("fire");
    for (const id of ids) expect(CATALOG.filter((item) => item.setId === id).length).toBeGreaterThanOrEqual(3);
  });

  it("is active from 2 items of the set", () => {
    expect(activeSets(["hunting-bow"])).toEqual([]);
    expect(activeSets(["hunting-bow", "iron-cleaver"])).toEqual(["fire"]);
  });

  it("counts every set on its own", () => {
    expect(activeSets(["hunting-bow", "oak-buckler"])).toEqual([]);
    expect(activeSets(["hunting-bow", "iron-cleaver", "oak-buckler", "pot-lid"])).toEqual(["fire", "guardian"]);
  });
});