import { getItem } from "./items";
import { BACKPACK_SIZE, rollShop } from "./shop";
import type { RunState, Side } from "./types";

export const START_GOLD = 10;
export const START_LIVES = 3;
export const WINS_TO_VICTORY = 5;
export const GOLD_PER_ROUND = 5;

export function newRun(seed: number): RunState {
  const roll = rollShop(seed);
  return {
    round: 1,
    gold: START_GOLD,
    lives: START_LIVES,
    wins: 0,
    seed: roll.seed,
    shop: roll.offers,
    backpack: Array(BACKPACK_SIZE).fill(null),
    nextUid: 1,
  };
}

export function firstFreeSlot(state: RunState): number {
  return state.backpack.indexOf(null);
}

/** B1
 * Why an offer can't be bought right now, or `null` if it can.
 *
 * The backpack check is not cosmetic. Without it `firstFreeSlot` returns -1 and
 * `buyItem` writes to `backpack[-1]`, which JavaScript happily accepts as a
 * property nobody ever reads: the gold is gone and the item never arrives.
 * "An item I pay for always ends up in my backpack" has to be decided *before*
 * the gold is spent, and that decision is this function.
 *
 * A full backpack is reported before the price, because it is the harder
 * obstacle: no slot exists at all, while gold is only an amount. Both are
 * solved by selling something, so the player is pointed at the same action.
 */
export function buyBlocker(state: RunState, offerIndex: number): string | null {
  const itemId = state.shop[offerIndex];
  if (!itemId) return "Already sold";
  if (firstFreeSlot(state) === -1) return "Backpack is full";
  if (state.gold < getItem(itemId).price) return "Not enough gold";
  return null;
}

/** Buys a shop offer into the first free backpack slot; unchanged state if not allowed. */
export function buyItem(state: RunState, offerIndex: number): RunState {
  if (buyBlocker(state, offerIndex) !== null) return state;
  const itemId = state.shop[offerIndex]!;
  const slot = firstFreeSlot(state);
  const backpack = [...state.backpack];
  backpack[slot] = { uid: `item-${state.nextUid}`, itemId };
  const shop = [...state.shop];
  shop[offerIndex] = null;
  return { ...state, gold: state.gold - getItem(itemId).price, shop, backpack, nextUid: state.nextUid + 1 };
}

/** B1
 * What one item is worth when sold: half its price, rounded down.
 *
 * Rounding down is what makes buying and selling a loss rather than a way to
 * print gold — a 5 🪙 item returns 2 🪙. The shop can therefore never be farmed.
 */
export const sellPrice = (itemId: string) => Math.floor(getItem(itemId).price / 2);

/** B1 Why a backpack slot can't be sold right now, or `null` if it can. */
export function sellBlocker(state: RunState, slotIndex: number): string | null {
  if (!state.backpack[slotIndex]) return "Empty slot";
  return null;
}

/** B1
 * Sells the item in `slotIndex`; unchanged state if not allowed.
 *
 * The item leaves the run for good — it does not return to the shop. The
 * requirement's "never lost or duplicated" is about the accident the buy bug
 * caused, not about a sale the player asked for. Putting it back would also
 * have to pick a shop slot, and those belong to the current roll.
 *
 * The backpack array keeps its length: selling frees exactly the slot that was
 * used, it does not shift the others. That matters for B2, where positions are
 * something the player arranges.
 */
export function sellItem(state: RunState, slotIndex: number): RunState {
  if (sellBlocker(state, slotIndex) !== null) return state;
  const slot = state.backpack[slotIndex]!;
  const backpack = [...state.backpack];
  backpack[slotIndex] = null;
  return { ...state, gold: state.gold + sellPrice(slot.itemId), backpack };
}

export type RunOutcome = "victory" | "defeat";

/** `victory` / `defeat` once the run is over, otherwise `null`. */
export function runOutcome(state: RunState): RunOutcome | null {
  if (state.wins >= WINS_TO_VICTORY) return "victory";
  if (state.lives <= 0) return "defeat";
  return null;
}

/** Starts the next round: round + 1, round gold, fresh shop. The backpack is kept. */
export function startNextRound(state: RunState): RunState {
  const roll = rollShop(state.seed);
  return { ...state, round: state.round + 1, gold: state.gold + GOLD_PER_ROUND, seed: roll.seed, shop: roll.offers };
}

/** Records a battle (win → +1 win, loss → −1 life) and moves on to the next round unless the run is over. */
export function applyBattleResult(state: RunState, winner: Side): RunState {
  const scored = winner === "player" ? { ...state, wins: state.wins + 1 } : { ...state, lives: state.lives - 1 };
  return runOutcome(scored) ? scored : startNextRound(scored);
}
