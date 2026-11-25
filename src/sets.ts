/** B4 */
import { getItem } from "./items";
import type { SetId } from "./types";

/** Items of one set needed for its bonus. */
export const SET_THRESHOLD = 2;
/** Max HP added by the Guardian set. */
export const GUARDIAN_BONUS_HP = 5;

export const SETS: Record<SetId, { name: string; icon: string }> = {
  fire: { name: "Fire", icon: "🔥" },
  guardian: { name: "Guardian", icon: "🛡️" },
};

/** Sets with at least `SET_THRESHOLD` items in `itemIds`. Every item counts, also several of the same kind. */
export function activeSets(itemIds: string[]): SetId[] {
  const counts: Partial<Record<SetId, number>> = {};
  for (const id of itemIds) {
    const setId = getItem(id).setId;
    if (setId) counts[setId] = (counts[setId] ?? 0) + 1;
  }
  return (Object.keys(SETS) as SetId[]).filter((setId) => (counts[setId] ?? 0) >= SET_THRESHOLD);
}