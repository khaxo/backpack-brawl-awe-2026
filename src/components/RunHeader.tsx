import { START_LIVES, WINS_TO_VICTORY } from "../game/run";
import type { RunState } from "../types";

export function RunHeader({ run }: { run: RunState }) {
  const stats = [
    { label: "Round", value: run.round },
    { label: "Gold", value: `🪙 ${run.gold}`, className: "text-gold" },
    { label: "Lives", value: "❤️".repeat(run.lives) + "🖤".repeat(Math.max(0, START_LIVES - run.lives)), className: "text-life" },
    { label: "Wins", value: `🏆 ${run.wins} / ${WINS_TO_VICTORY}` },
  ];

  return (
    <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-md border border-panel-edge bg-panel px-3 py-2">
          <dt className="text-xs uppercase tracking-wider text-muted">{stat.label}</dt>
          <dd className={`font-display text-lg font-bold ${stat.className ?? ""}`}>{stat.value}</dd>
        </div>
      ))}
    </dl>
  );
}
