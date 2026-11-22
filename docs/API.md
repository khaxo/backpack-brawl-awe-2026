# Backpack Brawl API

The local API is a small Express server in `server/index.js`. It listens on port 4200 (override with the `PORT` environment variable). During Vite development, `/api` is proxied to it, so the frontend uses relative URLs such as `/api/opponents?round=1`. All responses are JSON.

The opponent endpoint keeps no state: restarting the server changes nothing about its answers. The hall of fame does keep state, **in memory only** — every submitted run is lost when the server stops, and two people running the app each have their own list. The task allows this explicitly; see `GET /api/runs`.

## `GET /api/health`

Always answers immediately with status 200:

```json
{ "ok": true, "service": "backpack-brawl" }
```

## `GET /api/opponents`

Returns the opponent for one round of a run. The opponent table lives in `server/opponents.js`.

### Query parameters

| Parameter | Required | Meaning |
|---|---|---|
| `round` | yes | The 1-based round number. Must be a positive whole number written in digits (`1`, `2`, …). |
| `latency` | no | Response delay in milliseconds, clamped to 0–5000. Defaults to 1200. A value that is not a number falls back to the default. |
| `fail` | no | `fail=true` forces a 503 response (see below). |

### Success — 200

```json
{
  "id": "mossback-hermit",
  "name": "Mossback Hermit",
  "icon": "🐢",
  "hp": 25,
  "items": ["chipped-dagger", "pot-lid"],
  "round": 1
}
```

| Field | Type | Meaning |
|---|---|---|
| `id` | string | Stable identifier of the opponent |
| `name` | string | Display name |
| `icon` | string | Emoji shown in the battle view |
| `hp` | number | Maximum (and starting) HP |
| `items` | string[] | Item ids from the catalog in `src/items.ts`; the same id may appear several times |
| `round` | number | The round this opponent was requested for (echoes `round`) |

The response matches the `Opponent` type in `src/types.ts`.

The answer is deterministic: the same `round` always returns the same opponent. There is one hand-built opponent per round for rounds 1–7. Every round past the table returns the last opponent with +6 HP per additional round. The table never needs more than 7 rounds (5 wins + 3 lives − 1), and an opponent never carries more than 6 items, the size of the player's 2×3 backpack.

### Errors

Every error response has the shape:

```json
{ "error": "human-readable explanation" }
```

| Status | When | `error` |
|---|---|---|
| 400 | `round` is missing, not a whole number, or less than 1 | `round must be a positive whole number` |
| 503 | `fail=true`, or the server was started with `API_FAIL=true` | `The arena gates are shut. No challenger answered the call.` |

An invalid `round` is reported as 400 even when failure is forced. All responses from this endpoint, errors included, arrive after the configured delay.

## `POST /api/runs`

Submits a finished run to the hall of fame. Store, checks and ordering all live in `server/runs.js`.

`latency` and `fail` work exactly as for `GET /api/opponents`.

### Request body

```json
{ "runId": "9f1c…", "name": "Khaled", "wins": 5, "lives": 1, "round": 7 }
```

| Field | Type | Meaning |
|---|---|---|
| `runId` | string | Identifies the run. Created when the run starts and kept in `RunState`, so it survives a reload. |
| `name` | string | Player name. Stored trimmed; 1–20 characters after trimming. |
| `wins` | number | Battles won, 0–5 |
| `lives` | number | Lives left, 0–3 |
| `round` | number | The round the run ended in, ≥ 1 |

**`outcome` is not accepted.** The server works it out from `wins` and `lives`, because a client that reports its own result can report any result.

### Success — 201

The stored entry:

```json
{ "runId": "9f1c…", "name": "Khaled", "outcome": "victory", "wins": 5, "lives": 1, "round": 7 }
```

The submitted fields, with the name trimmed, plus `outcome`: `"victory"` at 5 wins, otherwise `"defeat"`.

### Errors

| Status | When | Example `error` |
|---|---|---|
| 400 | a field is missing, has the wrong type, or is out of range | `wins must be a whole number between 0 and 5` |
| 400 | the name is empty or only spaces | `Please enter a name` |
| 400 | the run has neither 5 wins nor 0 lives | `This run is not finished yet` |
| 400 | the numbers contradict each other | `These numbers do not add up: 5 wins and 0 losses cannot happen in 2 rounds` |
| 409 | this `runId` is already stored | `This run is already in the hall of fame.` |
| 503 | `fail=true` or `API_FAIL=true` | `The hall of fame is closed. Your run was not recorded.` |

#### What "implausible" means

Every round is one battle, and every battle either adds a win or costs a life. When a run ends, the round counter stops at the final battle. So for every run the game can actually produce:

```
wins + (3 − lives) === round
```

A submission that breaks this equation was not produced by playing, and is refused. This is the check that cannot be passed by editing a single number — raising `wins` also has to raise `round`, which makes the run look worse in the ranking.

**The 409 is what makes "never submit the same run twice" hold.** The interface also prevents the second click, but a retry after a timeout, a second browser tab, or a reloaded page would otherwise slip past it. Because `runId` is created with the run and stored in `RunState`, it is the same value in all of those cases.

## `GET /api/runs`

Returns the best runs. `latency` and `fail` work as above.

### Success — 200

```json
{
  "order": "Victories first, then more wins, then fewer rounds.",
  "entries": [ { "runId": "9f1c…", "name": "Khaled", "outcome": "victory", "wins": 5, "lives": 1, "round": 7 } ]
}
```

| Field | Type | Meaning |
|---|---|---|
| `order` | string | The sorting rule in one sentence. The page shows this text rather than writing its own, so the list and its explanation cannot drift apart. |
| `entries` | array | Best first. An empty array is a normal answer, not an error. |

Equal entries keep the order they arrived in, because `Array.prototype.sort` is stable.

### Errors

| Status | When | `error` |
|---|---|---|
| 503 | `fail=true` or `API_FAIL=true` | `The hall of fame is closed. Come back later.` |

## Environment variables

| Variable | Effect |
|---|---|
| `PORT` | Port to listen on (default 4200). The Vite proxy expects 4200. |
| `API_LATENCY` | Default delay in milliseconds when a request has no `latency` parameter. |
| `API_FAIL` | `true` makes **every** endpoint fail with 503 — the opponent search and both hall-of-fame endpoints. |

Example: `API_FAIL=true npm run server`.

## Client

`fetchOpponent(round, signal)` in `src/api.ts` performs the request. It resolves with the `Opponent` on success. The optional `signal` is an `AbortSignal`: aborting it rejects the promise with an `AbortError`, which the caller recognises by the signal and swallows, because an abandoned search is not a failure to report.

Every other failure rejects with an `Error` whose `message` is written to be read by the player, since the shop shows it as-is:

| Situation | `message` |
|---|---|
| The response carries the `{ "error": … }` body above | that text — the API explains the problem better than the client could |
| A 5xx without that body (the Vite proxy answering because the API is not running) | `The arena cannot be reached. The game server may be down.` |
| `fetch` itself rejects (no network, no proxy) | the same message, with the original reason kept as the error's `cause` |
| A 4xx without that body | `Opponent search failed (<status>)` — a malformed request is the client's own bug, so the status stays visible |
