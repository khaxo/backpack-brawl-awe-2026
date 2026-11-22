# Backpack Brawl API

The local API is a small Express server in `server/index.js`. It listens on port 4200 (override with the `PORT` environment variable). During Vite development, `/api` is proxied to it, so the frontend uses relative URLs such as `/api/opponents?round=1`. All responses are JSON. The server keeps no state: restarting it changes nothing about the answers.

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

## Environment variables

| Variable | Effect |
|---|---|
| `PORT` | Port to listen on (default 4200). The Vite proxy expects 4200. |
| `API_LATENCY` | Default delay in milliseconds when a request has no `latency` parameter. |
| `API_FAIL` | `true` makes every opponent request fail with 503. |

Example: `API_FAIL=true pnpm server`.

## Client

`fetchOpponent(round, signal)` in `src/api.ts` performs the request. It resolves with the `Opponent` on success. The optional `signal` is an `AbortSignal`: aborting it rejects the promise with an `AbortError`, which the caller recognises by the signal and swallows, because an abandoned search is not a failure to report.

Every other failure rejects with an `Error` whose `message` is written to be read by the player, since the shop shows it as-is:

| Situation | `message` |
|---|---|
| The response carries the `{ "error": … }` body above | that text — the API explains the problem better than the client could |
| A 5xx without that body (the Vite proxy answering because the API is not running) | `The arena cannot be reached. The game server may be down.` |
| `fetch` itself rejects (no network, no proxy) | the same message, with the original reason kept as the error's `cause` |
| A 4xx without that body | `Opponent search failed (<status>)` — a malformed request is the client's own bug, so the status stays visible |
