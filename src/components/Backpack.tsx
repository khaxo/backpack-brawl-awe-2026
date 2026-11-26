import { TICK_SECONDS } from "../game/battle";
import { describeEffects, getItem } from "../game/items";
import { sellPrice, moveBlocker, sellBlocker } from "../game/run";
import { activeSets, SET_THRESHOLD, SETS } from "../game/sets";
import { BACKPACK_COLS, itemIdsOf } from "../game/shop";
import { SetBadge } from "./SetBadge";
import { useState } from "react";
import type { ItemDef, RunState } from "../types"; // Vorher: Backpack as BackpackSlots

/** Hover text for a backpack slot: name, effects and cooldown. */
const tooltip = (item: ItemDef) =>
  [
    item.name,
    ...describeEffects(item.effects).map(({ label }) => label),
    `⏱️ every ${item.cooldown * TICK_SECONDS}s`,
    ...(item.setId ? [`${SETS[item.setId].icon} ${SETS[item.setId].name} set`] : []),
  ].join("\n");

interface BackpackProps {
  /** The whole run, not just the slots: `moveBlocker` and `sellBlocker` take a `RunState`, like `buyBlocker`. */
  run: RunState;
  /** B2 Moves the item in slot `from` to slot `to`, or swaps the two items. The rules live in `moveItem`. */
  onMove: (from: number, to: number) => void;
  /** B1 Sells the item in that slot. */
  onSell: (slotIndex: number) => void;
}

export function Backpack({ run, onMove, onSell }: BackpackProps) {
  /**
   * Index of the selected slot, or `null` if nothing is selected.
   * Local on purpose: the selection is only part of the interface, not of the
   * game rules, so it is not stored in `RunState` and is lost on a reload.
   */
  const [selected, setSelected] = useState<number | null>(null);
  const selectedSlot = selected !== null ? run.backpack[selected] : null;
  const sets = activeSets(itemIdsOf(run.backpack));
  
  function handleSlotClick(index: number) {
    if (selected === null) {
      // Nothing selected yet: only a filled slot can be picked up.
      if (run.backpack[index]) setSelected(index);
    } else if (selected === index) {
      // Clicking the selected slot again cancels the selection.
      setSelected(null);
    } else {
      // Second click on another slot: move there, or swap if it is occupied.
      // `moveItem` checks the move again, so this is safe even if the view is out of date.
      onMove(selected, index);
      setSelected(null);
    }
  }

  function handleSellSelected() {
    if (selected === null) return;
    onSell(selected);
    setSelected(null);
  }
  return (
    <section
      className="rounded-lg border border-panel-edge bg-panel p-4"
      // Escape cancels the selection. Only fires while focus is inside this
      // section, which may not be the case after a mouse click in some browsers.
      onKeyDown={(e) => e.key === "Escape" && setSelected(null)}
    >
      <h2 className="font-display text-xl font-bold">🎒 Backpack</h2>
      <p className="mb-3 text-sm text-muted">Click an item, then another slot to move or swap. Escape cancels.</p>
      {/* A div, not a ul: buttons are not valid direct children of a list. */}
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${BACKPACK_COLS}, minmax(0, 1fr))` }}>
        {run.backpack.map((slot, index) => {
          const item = slot ? getItem(slot.itemId) : null;
          const isSelected = selected === index;
          // A target is any other slot the selected item may move to. It uses the same
          // `moveBlocker` as `moveItem`, so the display and the action cannot disagree.
          const isTarget = selected !== null && !isSelected && moveBlocker(run, selected, index) === null;
          return (
            <button
              type="button"
              // The uid follows the item, so React keeps the right element when two items swap.
              key={slot?.uid ?? `empty-${index}`}
              onClick={() => handleSlotClick(index)}
              aria-pressed={isSelected}
              title={item ? tooltip(item) : undefined}
              aria-label={item ? item.name : `Empty slot ${index + 1}`}
              className={[
                "flex aspect-square flex-col items-center justify-center gap-1 rounded-md border-2 p-1",
                // Priority: selected > possible target > filled > empty.
                isSelected
                  ? "border-gold ring-2 ring-gold"
                  : isTarget
                    ? "border-dashed border-gold"
                    : item
                      ? "border-gold/40 bg-ink/40"
                      : "border-dashed border-panel-edge",
              ].join(" ")}
            >
              {item && (
                <>
                  <span className="text-3xl leading-none sm:text-4xl" aria-hidden>
                    {item.icon}
                  </span>
                  <span className="text-center text-xs leading-tight">{item.name}</span>
                </>
              )}
            </button>
          );
        })}
      </div>
            <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted">
        Active sets:
        {sets.length === 0 ? (
          <span>none ({SET_THRESHOLD} items of a set needed)</span>
        ) : (
          sets.map((id) => <SetBadge key={id} setId={id} active />)
        )}
      </p>
      {/* B1 Selling moved here from the slot: a button inside a slot button is not valid HTML. */}
      {selected !== null && selectedSlot && (
        <button
          type="button"
          onClick={handleSellSelected}
          disabled={sellBlocker(run, selected) !== null}
          title={sellBlocker(run, selected) ?? undefined}
          className="mt-3 rounded bg-panel-edge px-2 py-1 text-sm font-bold text-gold hover:brightness-125 disabled:opacity-50"
        >
          Sell for {sellPrice(selectedSlot.itemId)} 🪙
        </button>
      )}
    </section>
  );
}
