/** B4 Ids of the item sets. */
export type SetId = "fire" | "guardian";

export interface ItemEffects {
  damage?: number;
  block?: number;
  /** B3 Poison stacks put on the enemy */
  poison?: number;
  /** B3 HP restored to the owner, never above max HP */
  heal?: number;
}

export interface ItemDef {
  id: string;
  name: string;
  icon: string;
  price: number;
  /** Cooldown in battle ticks (1 tick = 0.5 s). */
  cooldown: number;
  effects: ItemEffects;
  /** B4Set this item belongs to, if any. */
  setId?: SetId;
}

/** A concrete item the player owns; several instances may share one `itemId`. */
export interface ItemInstance {
  uid: string;
  itemId: string;
}

/** Fixed-size grid, row by row; `null` marks a free slot. */
export type Backpack = (ItemInstance | null)[];

/** Shop offers by item id; `null` marks an offer that was already bought. */
export type ShopOffers = (string | null)[];

export type Phase = "shop" | "searching" | "battle" | "finished";

export interface RunState {
  round: number;
  gold: number;
  lives: number;
  wins: number;
  /** Seed for the next shop roll — keeps every shop deterministic. */
  seed: number;
  shop: ShopOffers;
  backpack: Backpack;
  /** Counter for generating unique `ItemInstance.uid`s. */
  nextUid: number;
}

export interface Opponent {
  id: string;
  name: string;
  icon: string;
  hp: number;
  round: number;
  items: string[];
}

export type Side = "player" | "opponent";

export interface FighterSnapshot {
  hp: number;
  maxHp: number;
  poison: number;    //B3
  burn: number;    //B4
  block: number;
}

export type BattleEventKind = "damage" | "block" | "poison" | "heal" | "burn"; //B3, B4

export interface BattleEvent {
  tick: number;
  /** Who caused the event. */
  source: Side;
  /** Who is affected by it. */
  target: Side;
  kind: BattleEventKind;
  amount: number;
  /** Item that triggered the event. Poison ticks come from no item. */
  itemId?: string;
  message: string;
}

export interface BattleFrame {
  tick: number;
  player: FighterSnapshot;
  opponent: FighterSnapshot;
  /** Events that happened during this tick. */
  events: BattleEvent[];
}

export interface BattleResult {
  winner: Side;
  reason: "knockout" | "timeout";
  frames: BattleFrame[];
  events: BattleEvent[];
}

/** An item as it fights: the catalog values it brings into battle. */
export interface FighterItem {
  itemId: string;
  name: string;
  icon: string;
  cooldown: number;
  effects: ItemEffects;
  /** B4 Set this item belongs to, if any. */
  setId?: SetId;
}

/** Everything `simulateBattle` needs to know about one side. */
export interface Fighter {
  name: string;
  maxHp: number;
  items: FighterItem[];
  /** B4 Sets whose bonus is active (2 or more items). */
  sets: SetId[];
}

/** A simulated battle being replayed frame by frame. */
export interface BattleReplay {
  opponent: Opponent;
  player: Fighter;
  enemy: Fighter;
  result: BattleResult;
  /** Index into `result.frames` that is currently shown. */
  frame: number;
}

/** Everything the UI needs: the run plus where in the round loop we are. */
export interface GameState {
  phase: Phase;
  run: RunState;
  /** Set while `phase === "battle"`. */
  battle: BattleReplay | null;
  /** Last opponent-search error, shown in the shop. */
  error: string | null;
  /**
   * B7 Identifies this run to the hall of fame, so the same run cannot be
   * listed twice. It sits here and not in `RunState` because `newRun` is pure
   * and should stay that way; the id is handed in from outside.
   */
  runId: string;
}

/** B7 One row of the hall of fame, as `GET /api/runs` returns it. */
export interface HallOfFameEntry {
  runId: string;
  name: string;
  outcome: "victory" | "defeat";
  wins: number;
  lives: number;
  round: number;
}
