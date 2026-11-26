import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { routeForGame, type GameRoute } from "../game/game";
import { useGame } from "./GameContext";

/** Renders `children` only if `route` matches the game's phase; otherwise redirects to the matching page. */
export function RequireRoute({ route, children }: { route: GameRoute; children: ReactNode }) {
  const { game } = useGame();
  const target = routeForGame(game);
  if (target !== route) return <Navigate to={target} replace />;
  return children;
}
