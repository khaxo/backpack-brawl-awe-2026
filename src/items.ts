import type { ItemDef, ItemEffects } from "./types";

export const CATALOG: ItemDef[] = [
  { id: "chipped-dagger", name: "Chipped Dagger", icon: "🗡️", price: 2, cooldown: 4, effects: { damage: 3 } },
  { id: "hunting-bow", name: "Hunting Bow", icon: "🏹", price: 4, cooldown: 4, effects: { damage: 5 } },
  { id: "iron-cleaver", name: "Iron Cleaver", icon: "🪓", price: 5, cooldown: 8, effects: { damage: 12 } },
  { id: "oak-buckler", name: "Oak Buckler", icon: "🛡️", price: 3, cooldown: 5, effects: { block: 4 } },
  { id: "pot-lid", name: "Pot Lid", icon: "🍳", price: 2, cooldown: 3, effects: { block: 2 } },
  { id: "spiked-shield", name: "Spiked Shield", icon: "⚔️", price: 4, cooldown: 6, effects: { damage: 3, block: 3 } },
  { id: "venom-dart", name: "Venom Dart", icon: "🎯", price: 3, cooldown: 4, effects: { poison: 1 } },
  { id: "viper-fang", name: "Viper Fang", icon: "🐍", price: 4, cooldown: 6, effects: { damage: 2, poison: 1 } },
  { id: "plague-flask", name: "Plague Flask", icon: "🧪", price: 5, cooldown: 8, effects: { poison: 3 } },
  { id: "herb-pouch", name: "Herb Pouch", icon: "🌿", price: 2, cooldown: 6, effects: { heal: 3 } },
  { id: "healing-potion", name: "Healing Potion", icon: "🍷", price: 4, cooldown: 8, effects: { heal: 7 } },
  { id: "troll-charm", name: "Troll Charm", icon: "🧿", price: 5, cooldown: 5, effects: { heal: 3, block: 2 } },
];

const byId = new Map(CATALOG.map((item) => [item.id, item]));

export function getItem(id: string): ItemDef {
  const item = byId.get(id);
  if (!item) throw new Error(`Unknown item: ${id}`);
  return item;
}

const EFFECT_LABELS: [keyof ItemEffects, (n: number) => string][] = [
  ["damage", (n) => `⚔️ ${n} dmg`],
  ["block", (n) => `🛡️ +${n} block`],
  /** B3 */
  ["poison", (n) => `☠️ +${n} poison`],
  ["heal", (n) => `💚 +${n} heal`],
];

/** Short labels for an item's effects, e.g. `[{ effect: "damage", label: "⚔️ 2 dmg" }, …]`. */
export function describeEffects(effects: ItemEffects): { effect: keyof ItemEffects; label: string }[] {
  return EFFECT_LABELS.flatMap(([effect, label]) => (effects[effect] ? [{ effect, label: label(effects[effect]) }] : []));
}
