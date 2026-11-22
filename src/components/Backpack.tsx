import { TICK_SECONDS } from "../battle";
import { describeEffects, getItem } from "../items";
import { sellPrice } from "../run";
import { BACKPACK_COLS } from "../shop";
import type { Backpack as BackpackSlots, ItemDef } from "../types";
// import { useState } from "react";
// import { moveBlocker } from "../run";
// import type { ItemDef, RunState } from "../types"; // Vorher: Backpack as BackpackSlots

/** Hover text for a backpack slot: name, effects and cooldown. */
const tooltip = (item: ItemDef) =>
  [item.name, ...describeEffects(item.effects).map(({ label }) => label), `⏱️ every ${item.cooldown * TICK_SECONDS}s`].join("\n");

interface BackpackProps {
  backpack: BackpackSlots;
  /** B1 Sells the item in that slot. */
  onSell: (slotIndex: number) => void;
}

export function Backpack({ backpack, onSell }: BackpackProps) {
  return (
    <section className="rounded-lg border border-panel-edge bg-panel p-4">
      <h2 className="font-display text-xl font-bold">🎒 Backpack</h2>
      <p className="mb-3 text-sm text-muted">Hover an item to see its stats. Selling pays half the price.</p>
      <ul className="grid gap-2" style={{ gridTemplateColumns: `repeat(${BACKPACK_COLS}, minmax(0, 1fr))` }}>
        {backpack.map((slot, index) => {
          const item = slot ? getItem(slot.itemId) : null;
          return (
            <li
              key={slot?.uid ?? `empty-${index}`}
              title={item ? tooltip(item) : undefined}
              aria-label={item ? item.name : `Empty slot ${index + 1}`}
              className={[
                "flex aspect-square flex-col items-center justify-center gap-1 rounded-md border-2 p-1",
                item ? "cursor-help border-gold/40 bg-ink/40" : "border-dashed border-panel-edge",
              ].join(" ")}
            >
              {item && slot && (
                <>
                  <span className="text-2xl leading-none sm:text-3xl" aria-hidden>
                    {item.icon}
                  </span>
                  <span className="text-center text-xs leading-tight">{item.name}</span>
                  {/* B1 Its own button, so B2 can later use a click on the slot for selecting. */}
                  <button
                    type="button"
                    onClick={() => onSell(index)}
                    aria-label={`Sell ${item.name} for ${sellPrice(slot.itemId)} gold`}
                    className="rounded bg-panel-edge px-1.5 py-0.5 text-xs font-bold text-gold hover:brightness-125"
                  >
                    Sell {sellPrice(slot.itemId)} 🪙
                  </button>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
