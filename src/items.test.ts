import { describe, expect, it } from "vitest";
import { CATALOG } from "./items";

describe("catalog", () => {
  it("has at least 3 poison items and 3 heal items", () => {
    expect(CATALOG.filter((item) => item.effects.poison).length).toBeGreaterThanOrEqual(3);
    expect(CATALOG.filter((item) => item.effects.heal).length).toBeGreaterThanOrEqual(3);
  });

  it("has unique item ids", () => {
    expect(new Set(CATALOG.map((item) => item.id)).size).toBe(CATALOG.length);
  });
});