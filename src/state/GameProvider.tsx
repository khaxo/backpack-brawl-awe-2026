import { useEffect, useMemo, useState, type ReactNode } from "react";
import { newGame } from "../game";
import { loadGame, toSave, writeSave } from "../storage";
import type { GameState } from "../types";
import { GameContext, type GameContextValue } from "./GameContext";

const randomSeed = () => Math.floor(Math.random() * 2 ** 32);

/** Holds the game state for all routes, so it survives navigating between pages. */
export function GameProvider({ children }: { children: ReactNode }) {
  /**
   * B6 The saved run, read once. The function form matters: passed as a plain
   * value, `loadGame()` would run on every render and read storage each time.
   */
  const [game, setGame] = useState<GameState | null>(loadGame);

  /**
   * B6 What a save would look like right now — or `null` without a run.
   *
   * It is the serialised text, not the state, that the effect below watches.
   * The replay advances four times a second and changes `game` every time,
   * but the saved facts stay the same, so this string stays the same and no
   * write happens.
   */
  const payload = useMemo(() => (game ? JSON.stringify(toSave(game)) : null), [game]);

  useEffect(() => writeSave(payload), [payload]);

  const value: GameContextValue = {
    game,
    startNewRun: () => setGame(newGame(randomSeed(), crypto.randomUUID())),
    update: (transition) => setGame((current) => (current ? transition(current) : current)),
  };

  return <GameContext value={value}>{children}</GameContext>;
}
