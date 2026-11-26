import { describe, expect, it } from "vitest";
import { getItem } from "../game/items";
import { REROLL_COST, buyBlocker, buyItem, firstFreeSlot, newRun, rerollBlocker, rerollShop, sellBlocker, sellItem, sellPrice, moveBlocker, moveItem } from "../game/run";
import { BACKPACK_SIZE } from "../game/shop";
import type { RunState } from "../types";

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

describe("rerollShop", () => {
  it("charges a coin and replaces every offer", () => {
    const run = newRun(1);
    const rolled = rerollShop(run);

    expect(rolled.gold).toBe(run.gold - REROLL_COST);
    expect(rolled.shop).toHaveLength(run.shop.length);
    expect(rolled.shop.every((offer) => offer !== null)).toBe(true);
  });

  it("refills slots the player has already bought", () => {
    const emptied = buyItem(newRun(1), 0);
    expect(emptied.shop[0]).toBeNull();
    expect(rerollShop(emptied).shop[0]).not.toBeNull();
  });

  it("ignores a reroll the player cannot afford", () => {
    const broke = { ...newRun(1), gold: 0 };
    expect(rerollBlocker(broke)).toBe("Not enough gold");
    expect(rerollShop(broke)).toBe(broke);
  });

  // B6 will restore a run from its seed; the same seed has to give the same shop.
  it("is deterministic for the same seed", () => {
    expect(rerollShop(newRun(7)).shop).toEqual(rerollShop(newRun(7)).shop);
  });

  it("moves the seed on, so two rerolls are different draws", () => {
    const once = rerollShop(newRun(1));
    expect(rerollShop(once).seed).not.toBe(once.seed);
  });
});

describe("firstFreeSlot", () => {
  it("finds the first empty slot and reports -1 when there is none", () => {
    expect(firstFreeSlot(newRun(1))).toBe(0);
    expect(firstFreeSlot(withFullBackpack(newRun(1)))).toBe(-1);
    expect(newRun(1).backpack).toHaveLength(BACKPACK_SIZE);
  });
});

/** A run whose backpack holds the given items, one per slot; `null` leaves a slot empty. */
function runWith(...slots: (string | null)[]): RunState {
  const run = newRun(1);
  const backpack = run.backpack.map((_, i) => (slots[i] ? { uid: `item-${i}`, itemId: slots[i]! } : null));
  return { ...run, backpack };
}

/** The uids in the backpack, sorted: lets a test compare "the same items" regardless of order. */
const uids = (run: RunState) => run.backpack.flatMap((slot) => (slot ? [slot.uid] : [])).sort();

describe("moveItem (B2)", () => {
  it("moves an item to an empty slot", () => {
    const run = moveItem(runWith("pot-lid"), 0, 3);
    expect(run.backpack[0]).toBeNull();
    expect(run.backpack[3]?.itemId).toBe("pot-lid");
  });

  it("swaps two items", () => {
    const run = moveItem(runWith("pot-lid", "hunting-bow"), 0, 1);
    expect(run.backpack[0]?.itemId).toBe("hunting-bow");
    expect(run.backpack[1]?.itemId).toBe("pot-lid");
  });

  it("changes nothing when moving onto itself, from an empty slot, or out of range", () => {
    const run = runWith("pot-lid");
    expect(moveItem(run, 0, 0)).toBe(run);
    expect(moveItem(run, 2, 0)).toBe(run);
    expect(moveItem(run, 0, 99)).toBe(run);
    expect(moveBlocker(run, 2, 0)).toBe("Nothing to move");
    expect(moveBlocker(run, 0, 0)).toBe("Already in this slot");
    expect(moveBlocker(run, 0, 99)).toBe("No such slot");
  });

  it("never loses or duplicates an item, even over a chain of moves", () => {
    const run = runWith("pot-lid", null, "hunting-bow", "iron-cleaver");
    const moves: [number, number][] = [[0, 1], [2, 3], [3, 5], [1, 2]];
    let state = run;
    for (const [from, to] of moves) {
      const next = moveItem(state, from, to);
      expect(next).not.toBe(state); // the move really happened
      expect(uids(next)).toEqual(uids(run)); // still the same items as at the start
      state = next;
    }
  });
});