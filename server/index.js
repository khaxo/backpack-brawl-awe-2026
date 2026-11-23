import cors from "cors";
import express from "express";
import { opponentForRound, parseRound } from "./opponents.js";
import { ORDER, addRun, hasRun, listRuns, runBlocker } from "./runs.js";

const app = express();
const port = Number(process.env.PORT ?? 4200);

app.use(cors()); app.use(express.json());
app.get("/api/health", (_req, res) => res.json({ ok: true, service: "backpack-brawl" }));

/** B7 Delay shared by every endpoint, so the loading states can be seen. `?latency=`, `API_LATENCY`, else 1200 ms. */
function latencyFor(req) {
  const requested = Number(req.query.latency ?? process.env.API_LATENCY ?? 1200);
  return Number.isFinite(requested) ? Math.max(0, Math.min(5000, requested)) : 1200;
}

/** B7 Artificial failure, same switch as the opponent search: `?fail=true` or `API_FAIL=true`. */
const shouldFail = (req) => req.query.fail === "true" || process.env.API_FAIL === "true";

app.get("/api/opponents", (req, res) => {
  setTimeout(() => {
    const round = parseRound(req.query.round);
    if (round === null) return res.status(400).json({ error: "round must be a positive whole number" });
    if (shouldFail(req)) {
      return res.status(503).json({ error: "The arena gates are shut. No challenger answered the call." });
    }
    res.json(opponentForRound(round));
  }, latencyFor(req));
});

/**
 * B7 Submits a finished run: 400 if it is wrong or implausible, 409 if it is
 * already stored, 201 if it was accepted.
 *
 * The 409 is what makes "never submits the same run twice" hold when the
 * interface cannot: a retry after a timeout, a second tab or a reload.
 */
app.post("/api/runs", (req, res) => {
  setTimeout(() => {
    if (shouldFail(req)) {
      return res.status(503).json({ error: "The hall of fame is closed. Your run was not recorded." });
    }

    const blocker = runBlocker(req.body);
    if (blocker !== null) return res.status(400).json({ error: blocker });

    if (hasRun(req.body.runId)) {
      return res.status(409).json({ error: "This run is already in the hall of fame." });
    }

    res.status(201).json(addRun(req.body));
  }, latencyFor(req));
});

/** B7 The hall of fame. `order` travels with the list so the page shows the rule it was sorted by. */
app.get("/api/runs", (req, res) => {
  setTimeout(() => {
    if (shouldFail(req)) {
      return res.status(503).json({ error: "The hall of fame is closed. Come back later." });
    }
    res.json({ order: ORDER, entries: listRuns() });
  }, latencyFor(req));
});

app.listen(port, () => console.log(`Backpack Brawl API listening on http://localhost:${port}`));
