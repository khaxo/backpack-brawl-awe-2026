import { describe, expect, it } from "vitest";
import { POISON_INTERVAL, simulateBattle } from "./battle";
import type { Fighter, ItemEffects } from "./types";

/** A fighter with one test item per `[cooldown, effects]` pair. */
const fighter = (maxHp: number, ...items: [number, ItemEffects][]): Fighter => ({
  name: "Test",
  maxHp,
  sets: [],
  items: items.map(([cooldown, effects], i) => ({ itemId: `test-${i}`, name: `Item ${i}`, icon: "?", cooldown, effects })),
});

describe("poison", () => {
  it("ignores block", () => {
    const last = simulateBattle(fighter(40, [1, { poison: 1 }]), fighter(1000, [1, { block: 100 }])).frames.at(-1)!;
    expect(last.opponent.block).toBeGreaterThan(0);
    expect(last.opponent.hp).toBeLessThan(1000);
  });

  it("hurts every POISON_INTERVAL ticks, for every stack", () => {
    const result = simulateBattle(fighter(40, [3, { poison: 2 }]), fighter(1000));
    const ticks = result.events.filter((e) => e.kind === "poison" && e.itemId === undefined);
    expect(ticks.every((e) => e.tick % POISON_INTERVAL === 0)).toBe(true);
    expect(ticks[0]).toMatchObject({ tick: 4, amount: 2, target: "opponent" });
    expect(ticks[1]).toMatchObject({ tick: 6, amount: 4 }); // the item fired again: 4 stacks
  });
});

describe("heal", () => {
  it("never exceeds max hp", () => {
    const result = simulateBattle(fighter(40, [1, { heal: 50 }]), fighter(40, [2, { damage: 1 }]));
    for (const frame of result.frames) expect(frame.player.hp).toBeLessThanOrEqual(40);
  });

    it("does not bring a knocked-out fighter back", () => {
    // The hero hits for exactly the opponent's HP; the opponent's heal fires in the same tick, after the hit.
    const result = simulateBattle(fighter(40, [1, { damage: 10 }]), fighter(10, [1, { heal: 5 }]));
    expect(result.frames[1].opponent.hp).toBe(0);
    expect(result.events.some((e) => e.kind === "heal")).toBe(false);
    expect(result.frames.at(-1)!.tick).toBe(1); // over after the first tick
  });
});

describe("battle", () => {
  it("is deterministic", () => {
    const run = () => simulateBattle(fighter(40, [2, { poison: 1 }], [3, { heal: 2 }]), fighter(50, [4, { damage: 5 }]));
    expect(run()).toEqual(run());
  });
});