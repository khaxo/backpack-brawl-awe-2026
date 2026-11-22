import { useState, type FormEvent } from "react";
import { submitRun } from "../api";
import type { RunState } from "../types";

/**
 * B7 Sends a finished run to the hall of fame.
 *
 * Three states, held locally because they belong to this form and not to the
 * game: `idle` (type a name), `sending`, `done`. A failure goes back to
 * `idle` with the message above the field — the name is still there, so
 * retrying costs one click and no typing.
 */
type Status = "idle" | "sending" | "done";

export function SubmitRun({ runId, run }: { runId: string; run: RunState }) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  // B7 Same blocker shape as the shop: the reason is readable before the click.
  const blocker = name.trim() === "" ? "Enter a name first" : null;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (blocker !== null || status === "sending") return;
    setStatus("sending");
    setError(null);
    try {
      await submitRun({ runId, name, wins: run.wins, lives: run.lives, round: run.round });
      setStatus("done");
    } catch (caught) {
      setStatus("idle");
      setError(caught instanceof Error ? caught.message : "Could not submit the run.");
    }
  }

  if (status === "done") {
    return <p className="text-sm font-bold text-gold">🏛️ Your run is in the hall of fame.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col items-center gap-2">
      {error && (
        <p role="alert" className="text-sm text-life">
          {error}
        </p>
      )}
      <div className="flex w-full max-w-sm gap-2">
        <label htmlFor="hof-name" className="sr-only">
          Your name for the hall of fame
        </label>
        <input
          id="hof-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={20}
          placeholder="Your name"
          disabled={status === "sending"}
          className="min-w-0 flex-1 rounded-md border border-panel-edge bg-ink/40 px-3 py-2 text-sm disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={blocker !== null || status === "sending"}
          title={blocker ?? undefined}
          className="rounded-md border border-gold/40 px-3 py-2 text-sm font-bold text-gold hover:bg-gold/10 disabled:border-panel-edge disabled:text-muted disabled:hover:bg-transparent"
        >
          {status === "sending" ? "Sending…" : error ? "Try again" : "🏛️ Submit"}
        </button>
      </div>
    </form>
  );
}
