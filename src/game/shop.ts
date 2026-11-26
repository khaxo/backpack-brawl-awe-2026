import { CATALOG } from "../game/items";
import type { Backpack } from "../types";

export const SHOP_SIZE = 6;
export const BACKPACK_COLS = 2;
export const BACKPACK_ROWS = 3;
export const BACKPACK_SIZE = BACKPACK_COLS * BACKPACK_ROWS;

/** Small seeded PRNG: same seed → same sequence of numbers in [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Rolls `SHOP_SIZE` offers (duplicates allowed) and returns the seed for the next roll. */
export function rollShop(seed: number): { offers: string[]; seed: number } {
  const rng = mulberry32(seed);
  const offers = Array.from({ length: SHOP_SIZE }, () => CATALOG[Math.floor(rng() * CATALOG.length)].id);
  return { offers, seed: Math.floor(rng() * 4294967296) };
}

/** Item ids of all occupied backpack slots, in grid order. */
export function itemIdsOf(backpack: Backpack): string[] {
  return backpack.flatMap((slot) => (slot ? [slot.itemId] : []));
}
