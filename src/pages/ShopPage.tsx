import { useRef } from "react";
import { fetchOpponent } from "../api";
import { Backpack } from "../components/Backpack";
import { FightBar } from "../components/FightBar";
import { RulesPanel } from "../components/RulesPanel";
import { RunHeader } from "../components/RunHeader";
import { Shop } from "../components/Shop";
import { fightBlocker, searchFailed, startBattle, startSearch, updateRun } from "../game";
import { buyItem, rerollShop, sellItem } from "../run";
import { useActiveGame } from "../state/GameContext";

export function ShopPage() {
  const { game, update } = useActiveGame();
  const { run, phase } = game;

  /** The request of the search that is currently running, if any. */
  const searchRef = useRef<AbortController | null>(null);

  function handleBuy(offerIndex: number) {
    update((current) => updateRun(current, (currentRun) => buyItem(currentRun, offerIndex)));
  }

  // B1 `updateRun` refuses every shop action outside the "shop" phase, so no
  // handler here needs a phase check of its own.
  function handleSell(slotIndex: number) {
    update((current) => updateRun(current, (currentRun) => sellItem(currentRun, slotIndex)));
  }

  function handleReroll() {
    update((current) => updateRun(current, rerollShop));
  }

  // Once the opponent is found the phase becomes "battle" and RequireRoute redirects to the battle page.
  async function handleFindOpponent() {
    if (phase !== "shop" || fightBlocker(game) !== null) return;

    // `phase` above is the value of *this* render. A second click that lands
    // before React has re-rendered therefore passes that check with stale
    // data and would send a second request. Aborting the previous controller
    // keeps at most one request alive; the guards in game.ts then decide
    // whether a response that still arrives may do anything.
    searchRef.current?.abort();
    const controller = new AbortController();
    searchRef.current = controller;

    update(startSearch);
    try {
      const opponent = await fetchOpponent(run.round, controller.signal);
      update((current) => startBattle(current, opponent));
    } catch (error) {
      // An aborted request was abandoned on purpose — not a failure to report.
      if (controller.signal.aborted) return;
      const message = error instanceof Error ? error.message : "Opponent search failed.";
      update((current) => searchFailed(current, message));
    } finally {
      if (searchRef.current === controller) searchRef.current = null;
    }
  }

  return (
    <>
      <RunHeader run={run} />
      <FightBar phase={phase} blocker={fightBlocker(game)} error={game.error} onFight={handleFindOpponent} />

      {/* While searching, the whole shop/backpack area is disabled so the fighting build can't change. */}
      <fieldset disabled={phase !== "shop"} className="grid min-w-0 gap-4 disabled:opacity-60 lg:grid-cols-[1fr_16rem_18rem]">
        <Shop run={run} onBuy={handleBuy} onReroll={handleReroll} />
        <Backpack backpack={run.backpack} onSell={handleSell} />
        <aside className="flex flex-col gap-4">
          <RulesPanel open={run.round === 1} />
        </aside>
      </fieldset>
    </>
  );
}
