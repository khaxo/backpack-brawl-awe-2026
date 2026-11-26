# Backpack Brawl

> This README has two parts. **Part 1** describes the game as our team has built it (current state). **Part 2** is the original starter README, kept unchanged below for reference. Where the two differ, Part 1 is correct.

---

# Part 1 — Current state of the game

## What has been added to the starter

| Requirement | What the game does now |
|---|---|
| **B1 Shop economy** | Items can be **sold** for half their price (rounded down). The shop can be **rerolled** for 1 🪙. The interface shows why an action is not possible, and the same rule protects the action itself. |
| **B2 Backpack arrangement** | An item can be selected, moved to another slot, or swapped with the item in an occupied slot. Possible moves are shown, and a selection can be cancelled. |
| **B3 Poison and heal** | New effects with 3 items each (see catalog). Poison and heal are shown in the battle view, in the combat log, in the rules panel and in tooltips. |
| **B4 Item sets** | Two sets, **Fire** and **Guardian**, with 3 items each. Set badges are shown on items, and active bonuses are visible. Bonuses apply to the player and to opponents alike. |
| **B5 Reliable opponent search** | A running search is shown, a second one cannot be started, and a failed API returns to a usable shop with a message. A late or duplicate response cannot start or apply a battle twice. |
| **B6 Save and resume** | The run is saved in the browser (`localStorage`) and continues on the matching screen after a refresh. Broken or incompatible saves are discarded and the game falls back to a fresh, playable state. |
| **B7 Hall of fame** | After a run the player enters a name. The run is sent to the API, validated there, and listed on its own page (`/hall-of-fame`). |

## Rules that changed

- The shop shows **6 offers** per round (the starter had 4). The same offer may appear more than once. Rerolling replaces all 6 for 1 🪙.
- The backpack is still a 2×3 grid (6 slots), but items can now be **moved and swapped** and **sold**.
- Only items in the backpack fight. Their position still does not matter for the fight.
- Everything else (3 lives, 5 wins, 10 🪙 start gold, +5 🪙 per round, 40 base HP, 0.5 s ticks, 60 ticks at most) is unchanged.

## Effects

| Effect | What it does |
|---|---|
| ⚔️ Damage | Hits the enemy. Block absorbs it first. |
| 🛡️ Block | Absorbs incoming damage. Unused block stays for the whole battle. |
| ☠️ Poison | Adds poison stacks to the enemy. Every **2 ticks (1 s)** each stack costs **1 HP**. Stacks add up, block does not help, and poison does not wear off. |
| 💚 Heal | Restores your own HP, never above the maximum. A fighter at 0 HP cannot be healed. |
| 🔥 Burn | Comes from the Fire set. Costs **1 HP per stack every tick**. Block absorbs it first. **1 stack wears off every tick.** |

## Sets

A set bonus is active while **2 or more** of its items are in the backpack.

| Set | Bonus |
|---|---|
| 🔥 **Fire** (Hunting Bow, Iron Cleaver, Spiked Shield) | Every hit of a Fire item sets the enemy on fire: **+2 burn stacks**. |
| 🛡️ **Guardian** (Oak Buckler, Pot Lid, Herb Pouch) | **+5 max HP**. |

## Item catalog

| Item | Price | Cooldown (ticks) | Effect | Set |
|---|---:|---:|---|---|
| 🗡️ Chipped Dagger | 2 | 4 | 3 damage | — |
| 🏹 Hunting Bow | 4 | 4 | 5 damage | 🔥 Fire |
| 🪓 Iron Cleaver | 5 | 8 | 12 damage | 🔥 Fire |
| ⚔️ Spiked Shield | 4 | 6 | 3 damage, +3 block | 🔥 Fire |
| 🛡️ Oak Buckler | 3 | 5 | +4 block | 🛡️ Guardian |
| 🍳 Pot Lid | 2 | 3 | +2 block | 🛡️ Guardian |
| 🌿 Herb Pouch | 2 | 6 | +3 heal | 🛡️ Guardian |
| 🎯 Venom Dart | 3 | 4 | +1 poison | — |
| 🐍 Viper Fang | 4 | 6 | 2 damage, +1 poison | — |
| 🧪 Plague Flask | 5 | 8 | +3 poison | — |
| 🍷 Healing Potion | 4 | 8 | +7 heal | — |
| 🧿 Troll Charm | 5 | 5 | +3 heal, +2 block | — |

## Hall of fame

- `POST /api/runs` stores a finished run. The API rejects invalid or implausible data (for example an empty name, an unfinished run, or a run that was already submitted) with a clear error.
- `GET /api/runs` lists the runs. Order: **victories first, then more wins, then fewer rounds.**
- The entries are kept **in memory only**; they are lost when the server stops.
- The page shows loading, empty and error states and lets the player retry without retyping the name. See [docs/API.md](docs/API.md).

## Save and resume

- Saved: the phase, the run (gold, lives, wins, backpack, shop, seed) and, during a battle, the opponent. The replay is **recomputed** on load, because the simulation has no randomness and gives the same result every time.
- A finished replay is saved as already settled, so a refresh cannot count the result twice.
- A refresh cannot be used for a free reroll (the shop offers are part of the save), a different opponent, or a second result.

## Project structure

```
src/
  game/        Game rules in plain TypeScript, without React
    battle.ts    fighters and the battle simulation
    game.ts      phase transitions, replay steps, routes
    items.ts     item catalog and effect labels
    rules.ts     rule texts and tooltips built from the constants
    run.ts       run rules: buying, selling, rerolling, moving, win/loss
    sets.ts      sets and their bonuses
    shop.ts      seeded random numbers, shop rolls, backpack size
    storage.ts   save and resume in the browser
  tests/       Vitest tests for the game rules
  components/  presentational parts (shop, backpack, item card, set badge, ...)
  pages/       one component per screen
  state/       game state for all pages, route guard
  api.ts       opponent and hall-of-fame requests
  types.ts     shared types
server/        Express API (opponents, hall of fame) and its test
docs/          API documentation
```

Run the tests with `npm test`.

---

# Part 2 — Original starter README (old state)

Backpack Brawl is a small browser-based inventory auto-battler. You are a travelling hero entering the arena with nothing but an empty backpack and a few coins. Between fights you buy items in a shop and pack them into your backpack. The fights themselves run on their own: every item in the backpack fires whenever its cooldown is up, and you watch the battle play out.

This is a partially completed starter for the Advanced Web Development practical exam. It is playable, but it is not yet a finished game. Investigate its existing behavior and extend it according to the requirements.

## How the game works

### The run

A run is a series of rounds. Every round you shop, then fight one opponent.

| Rule | Value |
|---|---:|
| Lives at the start | 3 |
| Wins needed for victory | 5 |
| Starting gold | 10 🪙 |
| Gold at the start of every new round | +5 🪙 |
| Hero base HP | 40 |

A won battle gives +1 win, a lost battle costs one life. The run ends with a victory screen after the fifth win, or a game-over screen when the last life is gone. Unspent gold and the whole backpack carry over from round to round. Opponents get tougher every round.

### Shop and backpack

- The shop shows **4 offers**, rolled from the catalog at the start of every round. The same offer may appear more than once.
- **Buy** pays the price and puts the item into the first free slot of the backpack. A bought offer is marked as sold until the next round.
- The backpack is a **2×3 grid** (2 columns, 3 rows, 6 slots), and every item takes exactly one slot. A bought item stays in its slot for the whole run. Hover over an item to see its details.
- Only items in the backpack fight. Their position in the grid does not matter.

Shop rolls are driven by a seeded random number generator stored in the run state, so the same seed always produces the same offers.

### Battles

Press **Find opponent** to request this round's opponent from the local API. The request is deliberately slow, so there is a short "searching" phase. While searching, the shop and the backpack are locked.

Once the opponent arrives, the whole battle is simulated at once and then replayed on screen, one step every 250 ms. **Skip** jumps straight to the end. The result is applied to the run when the replay reaches its last step; the button below the result then leads to the next round's shop or to the end screen.

Battle time runs in **ticks of 0.5 s**:

- Every item has a **cooldown** in ticks. Each tick, every item charges by one. When the charge reaches the cooldown, the item fires and starts charging again.
- **Damage** hits the enemy. **Block** absorbs incoming damage first. Only the rest is lost from HP. Unused block stays for the rest of the battle.
- A fighter at 0 HP is knocked out. If both fall in the same tick, the hero loses.
- A battle lasts at most **60 ticks (30 s)**. If time runs out, the fighter with the higher share of their max HP wins. A tie counts as a loss for the hero.

The battle screen shows HP and block for both fighters, their items, a timer, and a combat log. Hover over values to see an explanation of each rule.

### Item catalog

| Item | Price | Cooldown (ticks) | Effect |
|---|---:|---:|---|
| 🗡️ Chipped Dagger | 2 | 4 | 3 damage |
| 🏹 Hunting Bow | 4 | 4 | 5 damage |
| 🪓 Iron Cleaver | 5 | 8 | 12 damage |
| 🛡️ Oak Buckler | 3 | 5 | +4 block |
| 🍳 Pot Lid | 2 | 3 | +2 block |
| ⚔️ Spiked Shield | 4 | 6 | 3 damage, +3 block |

Items have no sets and no other effects. The "How it works" panel in the shop summarises these rules in the game itself.

## Current starter features

- A start page, a shop page, a battle page and a result page, each with its own URL.
- A run with rounds, gold, lives and wins, ending in victory or defeat.
- A seeded shop with buying.
- A fixed 2×3 backpack grid with item tooltips.
- A deterministic battle simulation with damage and block.
- A replayed battle view with HP and block bars, a timer, a combat log and a skip button.
- A delayed local opponent API with success and failure responses.
- Tooltips and a rules panel explaining every mechanic.
- A responsive React interface styled with Tailwind CSS.

The starter does **not** include any automated tests. Vitest is installed and configured; add your own tests as `*.test.ts` files next to the code they test.

## Run locally

Requirements: Node.js 20.19+ or 22.12+ and pnpm (npm works as well; replace `pnpm` with `npm run` / `npm install`).

```bash
pnpm install
pnpm dev
```

The web app runs at `http://localhost:5174`; its API runs at `http://localhost:4200`. During development Vite forwards every `/api` request to the API, so the frontend only ever calls relative `/api/...` URLs.

| Command | Purpose |
|---|---|
| `pnpm dev` | Start the Vite frontend and the Express API together |
| `pnpm server` | Start only the API on port 4200 |
| `pnpm build` | Type-check and create a production frontend build |
| `pnpm lint` | Run ESLint over the project |
| `pnpm test` | Run all Vitest tests once (there are none yet) |
| `pnpm preview` | Preview a previously created production build |

## API

- `GET /api/health`
- `GET /api/opponents?round=1`

The opponent for each round is fixed. Add `?latency=2500` to change the delay (default 1200 ms, at most 5000 ms) or `?fail=true` to force a failed request. Starting the server with `API_FAIL=true` makes every opponent request fail.

See [docs/API.md](docs/API.md) for the full contract.

## Project orientation

Game rules live in plain TypeScript modules that do not depend on React. Every rule function takes the current state and returns a new one.

- `src/types.ts` defines items, the run, opponents, phases, battle frames and events, and the overall game state.
- `src/items.ts` contains the item catalog and the effect labels.
- `src/shop.ts` contains the seeded random number generator, shop rolls and the backpack size.
- `src/run.ts` contains the run rules: starting values, buying, round progression and win/loss.
- `src/battle.ts` turns item lists into fighters and contains the battle simulation (`simulateBattle`).
- `src/game.ts` contains the phase transitions of a run (`shop → searching → battle → shop … → finished`), the replay steps and the mapping from phase to page.
- `src/rules.ts` builds the rule explanations and tooltips from the game constants.
- `src/api.ts` contains the opponent HTTP request.
- `src/state/` holds the game state for all pages (`GameProvider`, `useGame`) and `RequireRoute`, which redirects every page to the one matching the current phase.
- `src/pages/` contains one component per screen; `src/App.tsx` defines the routes.
- `src/components/` contains the presentational parts: run header, shop, backpack, item card, rules panel, fight bar, battle view and end-of-run screen.
- `server/index.js` implements the local API; `server/opponents.js` contains the opponent table.
