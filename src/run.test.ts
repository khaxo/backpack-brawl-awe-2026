import { describe, expect, it } from "vitest";
import { getItem } from "./items";
import { buyBlocker, buyItem, firstFreeSlot, newRun, sellBlocker, sellItem, sellPrice } from "./run";
import { BACKPACK_SIZE } from "./shop";
import type { RunState } from "./types";

/**
 * B1 — the shop economy. These tests cover the rules, not the components:
 * "gold never becomes negative", "an item I pay for always ends up in my
 * backpack" and "every action either completes fully or changes nothing" are
 * properties of the pure functions in run.ts.
 *
 * `toBe` rather than `toEqual` throughout: a refused action must return the
 * *same* object, because that is what stops React from re-rendering.
 */

/** A run whose backpack has no free slot left. */
function withFullBackpack(state: RunState): RunState {
  return { ...state, backpack: state.backpack.map((_, i) => ({ uid: `seed-${i}`, itemId: "pot-lid" })) };
}

describe("buyItem", () => {
  it("puts the item in the first free slot and charges its price", () => {
    const run = newRun(1);
    const price = getItem(run.shop[0]!).price;
    const bought = buyItem(run, 0);

    expect(bought.backpack[0]).not.toBeNull();
    expect(bought.backpack[0]!.itemId).toBe(run.shop[0]);
    expect(bought.gold).toBe(run.gold - price);
    expect(bought.shop[0]).toBeNull();
  });

  it("ignores an offer that is already sold", () => {
    const sold = buyItem(newRun(1), 0);
    expect(buyItem(sold, 0)).toBe(sold);
  });

  it("ignores a purchase the player cannot afford", () => {
    const broke = { ...newRun(1), gold: 0 };
    expect(buyBlocker(broke, 0)).toBe("Not enough gold");
    expect(buyItem(broke, 0)).toBe(broke);
  });

  // The starter spent the gold and wrote the item to backpack[-1], where it
  // vanished: "an item I pay for always ends up in my backpack" was broken.
  it("ignores a purchase that has nowhere to go", () => {
    const full = withFullBackpack(newRun(1));
    expect(buyBlocker(full, 0)).toBe("Backpack is full");
    expect(buyItem(full, 0)).toBe(full);
  });

  it("reports the full backpack before the price when both apply", () => {
    const full = { ...withFullBackpack(newRun(1)), gold: 0 };
    expect(buyBlocker(full, 0)).toBe("Backpack is full");
  });

  it("never lets gold go negative, however often the player buys", () => {
    let run = newRun(1);
    for (let i = 0; i < run.shop.length; i++) run = buyItem(run, i);
    expect(run.gold).toBeGreaterThanOrEqual(0);
  });

  it("gives every bought item its own uid", () => {
    let run = newRun(1);
    for (let i = 0; i < run.shop.length; i++) run = buyItem(run, i);
    const uids = run.backpack.flatMap((slot) => (slot ? [slot.uid] : []));
    expect(new Set(uids).size).toBe(uids.length);
  });
});

describe("sellItem", () => {
  /** A run holding one `itemId` in slot 0. */
  const holding = (itemId: string): RunState => {
    const run = newRun(1);
    const backpack = [...run.backpack];
    backpack[0] = { uid: "held", itemId };
    return { ...run, backpack };
  };

  it("frees the slot and pays half the price", () => {
    const run = holding("hunting-bow"); // 4 🪙
    const sold = sellItem(run, 0);

    expect(sold.backpack[0]).toBeNull();
    expect(sold.gold).toBe(run.gold + 2);
  });

  it("rounds an odd price down", () => {
    expect(sellPrice("iron-cleaver")).toBe(2); // 5 / 2
    expect(sellPrice("oak-buckler")).toBe(1); // 3 / 2
  });

  it("costs the player gold to buy and sell the same item", () => {
    const run = newRun(1);
    const back = sellItem(buyItem(run, 0), firstFreeSlot(run));
    expect(back.gold).toBeLessThan(run.gold);
  });

  it("ignores an empty slot", () => {
    const run = newRun(1);
    expect(sellBlocker(run, 0)).toBe("Empty slot");
    expect(sellItem(run, 0)).toBe(run);
  });

  it("keeps the other slots where they are", () => {
    const run = newRun(1);
    const two = buyItem(buyItem(run, 0), 1);
    const sold = sellItem(two, 0);

    expect(sold.backpack).toHaveLength(BACKPACK_SIZE);
    expect(sold.backpack[0]).toBeNull();
    expect(sold.backpack[1]).toBe(two.backpack[1]);
  });

  it("makes room for a purchase that was blocked", () => {
    const full = withFullBackpack(newRun(1));
    expect(buyBlocker(full, 0)).toBe("Backpack is full");
    expect(buyBlocker(sellItem(full, 0), 0)).toBeNull();
  });
});

describe("firstFreeSlot", () => {
  it("finds the first empty slot and reports -1 when there is none", () => {
    expect(firstFreeSlot(newRun(1))).toBe(0);
    expect(firstFreeSlot(withFullBackpack(newRun(1)))).toBe(-1);
    expect(newRun(1).backpack).toHaveLength(BACKPACK_SIZE);
  });
});
