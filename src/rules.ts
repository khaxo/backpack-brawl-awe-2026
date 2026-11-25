import { HERO_BASE_HP, MAX_TICKS, TICK_SECONDS, POISON_DAMAGE_PER_STACK, POISON_INTERVAL } from "./battle";
import { GOLD_PER_ROUND, REROLL_COST, START_GOLD, START_LIVES, WINS_TO_VICTORY } from "./run";
import { BACKPACK_COLS, BACKPACK_ROWS, SHOP_SIZE } from "./shop";
import type { ItemEffects } from "./types";

/**
 * Player-facing explanations of the rules. Built from the game constants so
 * the texts stay correct when numbers are rebalanced.
 */

const BATTLE_SECONDS = MAX_TICKS * TICK_SECONDS;

/** Tooltip per item effect. */
export const EFFECT_HELP: Record<keyof ItemEffects, string> = {
  damage: "Damage: hits the enemy. Block absorbs it first, the rest is lost from HP.",
  block: "Block: absorbs incoming damage until used up. Unused block stays for the rest of the battle.",
  poison: `Poison: adds stacks to the enemy. Every ${POISON_INTERVAL * TICK_SECONDS} s each stack costs ${POISON_DAMAGE_PER_STACK} HP. Stacks add up, block does not help, and poison does not wear off.`,
  heal: "Heal: restores your own HP, never above your maximum. A fighter at 0 HP cannot be healed.",
};

export const COOLDOWN_HELP = `Cooldown: the item fires every time this much battle time has passed (1 tick = ${TICK_SECONDS} s).`;

/** Tooltip per fighter status shown in battle. */
export const STATUS_HELP = {
  hp: "HP: reaching 0 is a knockout.",
  block: EFFECT_HELP.block,
  poison: EFFECT_HELP.poison,  //B3
  timer: `After ${BATTLE_SECONDS} s the fighter with the higher share of HP wins; a tie counts as your loss.`,
};

export interface RuleSection {
  title: string;
  rules: string[];
}

export const RULES: RuleSection[] = [
  {
    title: "🏆 The run",
    rules: [
      `Reach ${WINS_TO_VICTORY} wins before you lose all ${START_LIVES} lives.`,
      `Each battle is one round: a win gives +1 win, a loss costs 1 life.`,
      `Opponents get tougher every round.`,
    ],
  },
  {
    title: "🏪 Shop & backpack",
    rules: [
      `You start with ${START_GOLD} 🪙 and earn ${GOLD_PER_ROUND} 🪙 at the start of every new round. Unspent gold carries over.`,
      `The shop offers ${SHOP_SIZE} new items every round. Rerolling replaces all ${SHOP_SIZE} of them, sold-out slots included, for ${REROLL_COST} 🪙.`,
      `Bought items go to the first free slot of your ${BACKPACK_COLS}×${BACKPACK_ROWS} backpack. With every slot taken you cannot buy until you sell something.`,
      `Selling an item pays half its price, rounded down — buying and selling the same item always costs you gold.`,
            `Only items in your backpack fight. Their position doesn't matter, but you can rearrange them: click an item, then another slot to move it there or swap the two. Escape cancels.`,
    ],
  },
  {
    title: "💾 Reloading",
    rules: [
      `Your run is saved in this browser. Reload or close the tab and you continue where you were.`,
      `Reloading during a search returns you to the shop — the request is gone. You find the same opponent again: each round has one.`,
      `Reloading during a battle replays it from the start. The battle is recomputed from your backpack and your opponent, so the outcome is the one you already had.`,
      `Reloading cannot give you a new shop, a different opponent, a second result or an escape from a loss.`,
    ],
  },
  {
    title: "⚔️ Battle",
    rules: [
      `Battles run on their own. Your hero has ${HERO_BASE_HP} HP; every item fires whenever its cooldown is up.`,
      `Damage hits block first; only the rest is lost from HP. Unused block stays for the rest of the battle.`,
      `Knock the enemy out to win. ${STATUS_HELP.timer} If both fall at once, you lose.`,
      `☠️ Poison adds stacks to the enemy. Every ${POISON_INTERVAL * TICK_SECONDS} s each stack costs ${POISON_DAMAGE_PER_STACK} HP. Stacks add up, block does not help, and poison does not wear off.`,
      `💚 Heal restores your own HP, never above your maximum. A fighter at 0 HP cannot be healed.`,
    ],
  },
];
