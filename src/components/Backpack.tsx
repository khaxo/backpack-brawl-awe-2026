import { TICK_SECONDS } from "../battle";
import { describeEffects, getItem } from "../items";
import { BACKPACK_COLS } from "../shop";
import type { Backpack as BackpackSlots, ItemDef } from "../types";
// import { useState } from "react";
// import { moveBlocker } from "../run";
// import type { ItemDef, RunState } from "../types"; // Vorher: Backpack as BackpackSlots

/** Hover text for a backpack slot: name, effects and cooldown. */
const tooltip = (item: ItemDef) =>
  [item.name, ...describeEffects(item.effects).map(({ label }) => label), `⏱️ every ${item.cooldown * TICK_SECONDS}s`].join("\n");

/**  B2
interface BackpackProps { 
//The whole run, not just the slots: moveBlocker takes a RunState, like buyBlocker does
  run: RunState;
  // Asks the parent to move or swap the item in slot from to slot to. The rules live in moveItem
  onMove: (from: number, to: number) => void;
  // onSell: (slot: number) => void;   // B1, später einkommentieren
} */

  /** B2  
export function Backpack({ run, onMove }: BackpackProps) {
   /**
   * Index of the selected slot, or `null` if nothing is selected.
   * Local on purpose: the selection is part of the interface, not of the game
   * rules, so it is not in `RunState` and does not have to be saved (B6).
  const [selected, setSelected] = useState<number | null>(null);
  */

  /** 
  function handleSlotClick(index: number) {
    if (selected === null) {
    // Nothing selected yet: only a filled slot can be picket up
      if (run.backpack[index]) setSelected(index); // auswählen
    } else if (selected === index) {
     // Clicking the selected slot again cancels the selection
      setSelected(null); // abbrechen
    } else {
      // Second click on another slot: move there, or swap if it is occupied.
      // The move itself is checked again in `moveItem`, so this click is safe
      // even if the interface were out of date.
      onMove(selected, index); // verschieben oder tauschen
      setSelected(null);
    }
  }
  */

  /** 
  return (
  <section
      className="rounded-lg border border-panel-edge bg-panel p-4"
      // Escape cancels the selection. Only fires while focus is inside this
      // section, which may not be the case after a mouse click in some browsers.
      onKeyDown={(e) => e.key === "Escape" && setSelected(null)}
    >
      <h2 className="font-display text-xl font-bold"> Backpack</h2>
      <p className="mb-3 text-sm text-muted">Click an item, then another slot to move or swap. Escape cancels.</p>
      {// A div, not a ul: buttons are not valid direct children of a list. }
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${BACKPACK_COLS}, minmax(0, 1fr))` }}>
        {run.backpack.map((slot, index) => {
          const item = slot ? getItem(slot.itemId) : null;
          const isSelected = selected === index;
          // A slot is a target when a different slot is selected and the move is allowed.
          // It uses the same `moveBlocker` as `moveItem`, so display and action cannot disagree.
          const isTarget = selected !== null && !isSelected && moveBlocker(run, selected, index) === null;
          return (
            <button
              type="button"
              // The uid follows the item, so React keeps the right element when two items swap.
              // Empty slots have no uid and fall back to their position.
              key={slot?.uid ?? `empty-${index}`}
              onClick={() => handleSlotClick(index)}
              // Tells screen readers (and tests) which slot is selected.
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
              {// Empty slots render nothing inside, only the dashed frame. *}
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
    </section>
  );
}  */

export function Backpack({ backpack }: { backpack: BackpackSlots }) {
  return (
    <section className="rounded-lg border border-panel-edge bg-panel p-4">
      <h2 className="font-display text-xl font-bold">🎒 Backpack</h2>
      <p className="mb-3 text-sm text-muted">Hover an item to see its stats.</p>
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
              {item && (
                <>
                  <span className="text-3xl leading-none sm:text-4xl" aria-hidden>
                    {item.icon}
                  </span>
                  <span className="text-center text-xs leading-tight">{item.name}</span>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
