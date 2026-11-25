import { getItem } from "./items";
import { itemIdsOf } from "./shop";
import { activeSets, GUARDIAN_BONUS_HP } from "./sets";
import type { Backpack, BattleEvent, BattleResult, Fighter, FighterItem, FighterSnapshot, Opponent, Side } from "./types";

/** Seconds per battle tick. */
export const TICK_SECONDS = 0.5;
/** Battles that last longer are decided by the timeout rule. */
export const MAX_TICKS = 60;
export const HERO_BASE_HP = 40;
/** B3 Ticks between two poison damages (2 ticks = 1 s). */
export const POISON_INTERVAL = 2;
/** B3 HP lost per poison stack at every poison damage. */
export const POISON_DAMAGE_PER_STACK = 1;

/** Turns a list of item ids into a fighter with the catalog values of each item. */
export function buildFighter(itemIds: string[], baseHp: number, name = "Fighter"): Fighter {
  const items: FighterItem[] = itemIds.map((id) => {
    const def = getItem(id);
    return { itemId: def.id, name: def.name, icon: def.icon, cooldown: def.cooldown, effects: { ...def.effects }, setId: def.setId };
  });
  // B4 Set bonuses are worked out here, so the player and every opponent get them from the same code.
  const sets = activeSets(itemIds);
  const maxHp = baseHp + (sets.includes("guardian") ? GUARDIAN_BONUS_HP : 0);
  return { name, maxHp, items, sets };
}

/** The player's fighter: every backpack item and the hero's base HP. */
export function buildPlayerFighter(backpack: Backpack): Fighter {
  return buildFighter(itemIdsOf(backpack), HERO_BASE_HP, "Hero");
}

export function buildOpponentFighter(opponent: Opponent): Fighter {
  return buildFighter(opponent.items, opponent.hp, opponent.name);
}

interface FighterState {
  fighter: Fighter;
  hp: number;
  block: number;
  /** Ticks each item has charged towards its cooldown. */
  charge: number[];
  /** B3 Number of poison stacks on the fighter. */
  poison: number;    //B3
}

const other = (side: Side): Side => (side === "player" ? "opponent" : "player");

const snapshot = (s: FighterState): FighterSnapshot => ({
  hp: Math.max(0, s.hp),
  maxHp: s.fighter.maxHp,
  block: s.block,
  poison: s.poison,    //B3
});

const isDown = (s: FighterState) => s.hp <= 0;

/**
 * Runs a full battle. Pure and deterministic: the same fighters always give
 * the same result.
 *
 * Each tick:
 * 1. Each fighter charges all items by one tick; items whose charge reaches their cooldown fire.
 * 2. Fired items resolve (player first, then opponent). Both sides fire "simultaneously":
 *    which items fire is decided before any effect is applied.
 * 3. Every 'POISON_INTERVAL' ticks each poisoned fighter loses 'POISON_DAMAGE_PER_STACK' HP per 
 *    poison stack. Block does not help against it.
 * After step 3 the battle ends if someone is down; if both are down, the player loses.
 * After `MAX_TICKS` the higher HP percentage wins; a tie is a player loss.
 */
export function simulateBattle(player: Fighter, opponent: Fighter): BattleResult {
  const state: Record<Side, FighterState> = {
    player: initState(player),
    opponent: initState(opponent),
  };
  const frames: BattleResult["frames"] = [
    { tick: 0, player: snapshot(state.player), opponent: snapshot(state.opponent), events: [] },
  ];
  const events: BattleEvent[] = [];

  const knockoutWinner = (): Side | null => {
    if (isDown(state.player)) return "opponent";
    if (isDown(state.opponent)) return "player";
    return null;
  };

  let winner: Side | null = null;
  let tick = 0;
  while (winner === null && tick < MAX_TICKS) {
    tick += 1;
    const tickEvents: BattleEvent[] = [];
    const emit = (event: Omit<BattleEvent, "tick">) => tickEvents.push({ tick, ...event });

    const fired: Record<Side, FighterItem[]> = {
      player: chargeItems(state.player),
      opponent: chargeItems(state.opponent),
    };
    for (const side of ["player", "opponent"] as const) {
      for (const item of fired[side]) resolveItem(item, state[side], state[other(side)], side, emit);
    }
    /** B3 Poison ticks after the items, so stacks added this tick already count.
     * The knockout check below then sees poison deaths as well
     */
    if (tick % POISON_INTERVAL === 0) {
      for (const side of ["player", "opponent"] as const) {
        const s = state[side];
        if (s.poison > 0) {
          const lost = s.poison * POISON_DAMAGE_PER_STACK;
          s.hp -= lost; // goes straight to HP: block is not touched
          /** B3 The poison was put there by the enemy, so the enemy is the source. No item: no itemId */
          emit({ source: other(side), target: side, kind: "poison", amount: lost, message: `${s.fighter.name} takes ${lost} poison damage` });
        }
      }
    }
    winner = knockoutWinner();

    frames.push({ tick, player: snapshot(state.player), opponent: snapshot(state.opponent), events: tickEvents });
    events.push(...tickEvents);
  }

  if (winner !== null) return { winner, reason: "knockout", frames, events };
  return { winner: timeoutWinner(state.player, state.opponent), reason: "timeout", frames, events };
}

function initState(fighter: Fighter): FighterState {
  return { fighter, hp: fighter.maxHp, block: 0, poison: 0, charge: fighter.items.map(() => 0) }; //B3
}

/** Advances one tick of cooldowns and returns the items that fire this tick. */
function chargeItems(s: FighterState): FighterItem[] {
  const fired: FighterItem[] = [];
  s.fighter.items.forEach((item, i) => {
    s.charge[i] += 1;
    if (s.charge[i] >= item.cooldown) {
      s.charge[i] = 0;
      fired.push(item);
    }
  });
  return fired;
}

function resolveItem(
  item: FighterItem,
  self: FighterState,
  enemy: FighterState,
  side: Side,
  emit: (event: Omit<BattleEvent, "tick">) => void,
) {
  const { damage, block, poison, heal } = item.effects;
  const base = { source: side, itemId: item.itemId };
  const enemySide = other(side);

  if (damage) {
    const absorbed = Math.min(enemy.block, damage);
    enemy.block -= absorbed;
    enemy.hp -= damage - absorbed;
    const note = absorbed > 0 ? ` (${absorbed} blocked)` : "";
    emit({ ...base, target: enemySide, kind: "damage", amount: damage, message: `${item.name} hits ${enemy.fighter.name} for ${damage}${note}` });
  }
  if (block) {
    self.block += block;
    emit({ ...base, target: side, kind: "block", amount: block, message: `${item.name} grants ${self.fighter.name} ${block} block` });
  }
  if (poison) {
    /** B3 Poison goes on the enemy and is never reduced: it wears off only with the battle */
    enemy.poison += poison;
    emit({ ...base, target: enemySide, kind: "poison", amount: poison, message: `${item.name} poisons ${enemy.fighter.name}` });
  }
  if (heal && self.hp > 0) {
    /** B3 A fighter at 0 HP is already knocked out and stays down */
    const healed = Math.min(heal, self.fighter.maxHp - self.hp);
    if (healed > 0) { //at full HP nothing appens and nothing is logged
      self.hp += healed;
      emit({ ...base, target: side, kind: "heal", amount: healed, message: `${item.name} heals ${self.fighter.name} for ${healed}` });
    }
  }
}

function timeoutWinner(player: FighterState, opponent: FighterState): Side {
  const ratio = (s: FighterState) => s.hp / s.fighter.maxHp;
  return ratio(player) > ratio(opponent) ? "player" : "opponent";
}
