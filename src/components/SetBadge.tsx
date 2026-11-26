import { SET_HELP } from "../rules";
import { SETS } from "../sets";
import type { SetId } from "../types";

/** B4 Small label for a set, with the bonus text as tooltip. Highlighted when the bonus is active. */
export function SetBadge({ setId, active = false }: { setId: SetId; active?: boolean }) {
  const { name, icon } = SETS[setId];
  return (
    <span title={SET_HELP[setId]} className={`cursor-help rounded px-1.5 py-0.5 text-xs ${active ? "bg-gold/30 text-gold" : "bg-ink/50 text-muted"}`}>
      {icon} {name}
    </span>
  );
}