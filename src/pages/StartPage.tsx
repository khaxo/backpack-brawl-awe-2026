import { useNavigate } from "react-router";
import { ROUTES } from "../game/game";
import { START_GOLD, START_LIVES, WINS_TO_VICTORY } from "../game/run";
import { useGame } from "../state/GameContext";

export function StartPage() {
  const { startNewRun } = useGame();
  const navigate = useNavigate();

  function handleNewRun() {
    startNewRun();
    navigate(ROUTES.shop);
  }

  return (
    <section className="mx-auto flex w-full max-w-lg flex-col items-center gap-4 rounded-lg border-2 border-gold bg-panel p-8 text-center">
      <p className="text-6xl" aria-hidden>
        🎒⚔️
      </p>
      <h2 className="font-display text-3xl font-bold">Pack your bag. Win the arena.</h2>
      <ul className="flex flex-col gap-1 text-muted">
        <li>🏪 Buy items in the shop and arrange them in your backpack.</li>
        <li>⚔️ Your items fight on their own — watch the battle unfold.</li>
        <li>
          🏆 Reach {WINS_TO_VICTORY} wins before you lose all {START_LIVES} lives. You start with {START_GOLD} 🪙.
        </li>
      </ul>
      <button type="button" onClick={handleNewRun} autoFocus className="rounded-md bg-gold px-5 py-2 font-display font-bold text-ink hover:brightness-110">
        🎒 New run
      </button>
    </section>
  );
}
