import { useEffect, useState } from "react";
import { Link } from "react-router";
import { fetchHallOfFame, type HallOfFame } from "../api";
import { routeForGame } from "../game";
import { useGame } from "../state/GameContext";

/**
 * B7 The hall of fame.
 *
 * Reachable with no run in progress, so it sits outside `RequireRoute`. The
 * list comes from the API alone; the game state is read only to offer a way
 * back, because leaving through the header would land on the start page and
 * the only button there throws the run away.
 *
 * Exactly one of three things is true at any moment, so they are one value
 * rather than three booleans that could contradict each other.
 */
type State = { status: "loading" } | { status: "error"; message: string } | { status: "ready"; data: HallOfFame };

export function HallOfFamePage() {
  const { game } = useGame();
  const [state, setState] = useState<State>({ status: "loading" });
  /** Bumped by the retry button; the effect watches it and loads again. */
  const [attempt, setAttempt] = useState(0);

  /**
   * The initial state is already "loading" and the retry button sets it
   * again, so the effect never writes state synchronously — it only reacts
   * to the answer. React's `set-state-in-effect` rule asks for exactly this.
   */
  useEffect(() => {
    // Same lesson as the opponent search: a late answer must not win. If the
    // player clicks retry again, or leaves, the earlier response is dropped.
    let current = true;
    fetchHallOfFame()
      .then((data) => current && setState({ status: "ready", data }))
      .catch((error: unknown) => {
        if (!current) return;
        setState({ status: "error", message: error instanceof Error ? error.message : "Could not load the hall of fame." });
      });
    return () => {
      current = false;
    };
  }, [attempt]);

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col gap-4 rounded-lg border border-panel-edge bg-panel p-6">
      <h2 className="font-display text-2xl font-bold">🏛️ Hall of fame</h2>

      {state.status === "loading" && <p className="text-muted">Loading the hall of fame…</p>}

      {state.status === "error" && (
        <>
          <p role="alert" className="text-life">
            {state.message}
          </p>
          <button
            type="button"
            onClick={() => {
              setState({ status: "loading" });
              setAttempt((n) => n + 1);
            }}
            className="self-start rounded-md border border-gold/40 px-3 py-1.5 text-sm font-bold text-gold hover:bg-gold/10"
          >
            Try again
          </button>
        </>
      )}

      {state.status === "ready" && (
        <>
          {/* The rule comes from the API, so the list and its explanation cannot disagree. */}
          <p className="text-sm text-muted">{state.data.order}</p>

          {state.data.entries.length === 0 ? (
            <p className="text-muted">No runs yet. Finish a run and be the first.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="text-muted">
                <tr>
                  <th scope="col" className="py-1 pr-2 font-normal">#</th>
                  <th scope="col" className="py-1 pr-2 font-normal">Player</th>
                  <th scope="col" className="py-1 pr-2 font-normal">Result</th>
                  <th scope="col" className="py-1 pr-2 text-right font-normal">Wins</th>
                  <th scope="col" className="py-1 text-right font-normal">Rounds</th>
                </tr>
              </thead>
              <tbody>
                {state.data.entries.map((entry, index) => (
                  <tr key={entry.runId} className="border-t border-panel-edge">
                    <td className="py-1.5 pr-2 text-muted">{index + 1}</td>
                    <td className="py-1.5 pr-2 font-bold">{entry.name}</td>
                    <td className="py-1.5 pr-2">{entry.outcome === "victory" ? "👑 Victory" : "🪦 Defeat"}</td>
                    <td className="py-1.5 pr-2 text-right">{entry.wins}</td>
                    <td className="py-1.5 text-right">{entry.round}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* `routeForGame` already knows which screen the phase belongs to — the same
          function RequireRoute uses, so the link can never point at the wrong page. */}
      {game && (
        <Link to={routeForGame(game)} className="self-start text-sm font-bold text-gold hover:underline">
          ← Back to your run
        </Link>
      )}
    </section>
  );
}
