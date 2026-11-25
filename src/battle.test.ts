import { describe, expect, it } from "vitest";
import { BURN_DECAY_PER_TICK, BURN_STACKS_PER_HIT, buildFighter, POISON_INTERVAL, simulateBattle } from "./battle";
import type { Fighter, ItemEffects } from "./types";
import { GUARDIAN_BONUS_HP } from "./sets";


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

describe("set bonuses", () => {
  it("Guardian adds max HP from 2 items", () => {
    expect(buildFighter(["oak-buckler"], 40).maxHp).toBe(40);
    expect(buildFighter(["oak-buckler", "pot-lid"], 40).maxHp).toBe(40 + GUARDIAN_BONUS_HP);
  });

  it("the battle starts at the boosted max HP", () => {
    const result = simulateBattle(buildFighter(["oak-buckler", "pot-lid"], 40), buildFighter(["chipped-dagger"], 30));
    expect(result.frames[0].player.hp).toBe(40 + GUARDIAN_BONUS_HP);
  });
});


/** Like `fighter`, but every item is a Fire item and the Fire bonus is active. */
const fireFighter = (maxHp: number, ...items: [number, ItemEffects][]): Fighter => {
  const base = fighter(maxHp, ...items);
  return { ...base, sets: ["fire"], items: base.items.map((item) => ({ ...item, setId: "fire" as const })) };
};

describe("burn", () => {
  it("only starts while the Fire bonus is active", () => {
    const result = simulateBattle({ ...fireFighter(40, [1, { damage: 1 }]), sets: [] }, fighter(1000));
    expect(result.events.some((e) => e.kind === "burn")).toBe(false);
  });

  it("is absorbed by block first", () => {
    const result = simulateBattle(fireFighter(40, [1, { damage: 1 }]), fighter(1000, [1, { block: 100 }]));
    const after = result.frames[1].opponent;
    expect(after.hp).toBe(999); // only the hit itself: the burn went into the block
    expect(after.block).toBeLessThan(100);
  });

  it("wears off", () => {
    // Cooldown 40: the item hits once, at tick 40.
    const result = simulateBattle(fireFighter(40, [40, { damage: 1 }]), fighter(1000));
    expect(result.frames[40].opponent.burn).toBe(BURN_STACKS_PER_HIT - BURN_DECAY_PER_TICK);
    expect(result.frames[41].opponent.burn).toBe(0);
  });
});