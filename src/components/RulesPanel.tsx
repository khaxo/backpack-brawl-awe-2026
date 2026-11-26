import { RULES } from "../game/rules";

/** Collapsible summary of every game rule. */
export function RulesPanel({ open = false }: { open?: boolean }) {
  return (
    <details open={open} className="group rounded-lg border border-panel-edge bg-panel p-4">
      <summary className="cursor-pointer font-display text-xl font-bold marker:text-gold">📖 How it works</summary>
      <div className="mt-3 flex flex-col gap-3 text-sm">
        {RULES.map((section) => (
          <section key={section.title}>
            <h3 className="font-bold">{section.title}</h3>
            <ul className="list-disc pl-5 text-muted">
              {section.rules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </details>
  );
}
