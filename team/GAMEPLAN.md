# Game Plan

**Repo:** https://github.com/khaxo/backpack-brawl-awe-2026
**Starter:** `3ac4780` (leonardo1710), vollständig gelesen, 1854 Zeilen
**Stand:** 2026-11-20

> **Annahme, die ihr prüfen müsst:** Dieser Plan rechnet mit der Prüfung am
> **Fr 27.11.** Steht ein anderer Termin, verschiebt sich alles entsprechend —
> die Reihenfolge bleibt.

---

## 1. Korrektur zum ersten Vorschlag

Im `ARBEITSAUFTEILUNG-VORSCHLAG.md` steht, B6 (Speichern) müsse zuletzt kommen,
weil das Speicherformat von B2/B3/B4 abhänge. **Das stimmt nach genauer
Durchsicht nicht**, und es ändert den Plan:

- **B2** braucht die Auswahl eines Rucksackfachs. Das ist Oberflächenzustand,
  kein Laufzustand — er gehört in die Komponente und wird nicht gespeichert.
- **B3/B4** verändern den *Kampf*, nicht den Lauf. Der Kampf ist eine reine
  Funktion (`simulateBattle`), er wird beim Laden neu berechnet statt
  gespeichert.
- **B7** hängt eine einzige Zeile an `RunState` an (`runId`), und die kommt aus
  Khaleds eigenem Track.

**Folge:** Die beiden Tracks sind fast vollständig entkoppelt. B6 muss nicht
warten, und das ist gut so — B6 früh zu bauen ist sicherer, weil es mit B5
zusammenspielt.

Die einzigen wirklich geteilten Dateien sind `src/types.ts` und `src/run.ts`.
Die Regeln dafür stehen in Abschnitt 3.

---

## 2. Zeitplan — in Takten, nicht in Blöcken

**Beschluss:** Das Artefakt ist **Sonntagabend fertig, inklusive Tagebuch**.
Montag bis Donnerstag wird nur noch gelernt.

**Warum das die richtige Rechnung ist:**

| | Punkte | Hilfsmittel |
| --- | ---: | --- |
| Artefakt | 20 | KI erlaubt |
| Prozess | 10 | KI erlaubt |
| **Einzelfragen** | **30** | **keine** |

Vier Tage Feinschliff am Artefakt bewegen Bruchteile von 20 Punkten. Vier Tage
Abfrage bewegen Punkte aus 30 — und die bekommt jeder für sich.

**Preis:** Keine Umwege. Jedes Paket wird genau auf die Anforderung gebaut,
keine Zeile darüber hinaus.

---

### Das Problem, das die Taktung löst

Khaled arbeitet mit KI-Unterstützung und ist dadurch deutlich schneller. Wenn
er einfach durchzieht, entsteht eine Historie, in der zuerst vier Pakete von
einer Person stehen und danach drei von der anderen. Die Prüfung bewertet
ausdrücklich **nachvollziehbare Beiträge** — und ein Verlauf, der wie
„einer hat gebaut, die andere hat ergänzt" aussieht, kostet dort Punkte,
unabhängig davon, ob er die Wahrheit abbildet.

Deshalb wird nicht in Blöcken gearbeitet, sondern in **Takten**: kurze
Abschnitte, an deren Ende von beiden etwas im Repo steht.

### Die zwei Regeln, die das erzwingen

**Regel 1 — Niemand merged den eigenen Pull Request.**
Der andere liest ihn, stellt mindestens eine inhaltliche Rückfrage und merged
dann. Damit steht bei **jedem** Merge in der Historie der Name der anderen
Person. Das ist der stärkste Beleg für Zusammenarbeit, den Git überhaupt
hergibt — stärker als jede Commit-Zahl, und er lässt sich nicht nachträglich
herstellen.

**Regel 2 — Niemand beginnt den nächsten Takt, bevor der PR des anderen aus
dem laufenden Takt offen ist.**
Das ist eine echte Bremse für den Schnelleren. Sie ist der Preis dafür, dass
die Historie am Ende stimmt. Wer wartet, arbeitet die Pufferliste ab
(Abschnitt 2c) — aber **nicht** an den Paketen der anderen Person.

### Die Takte

| Takt | Khaled | Aida | Übergabe im Takt |
| --- | --- | --- | --- |
| **T1** Fr Abend | **B5** (fertig, wartet auf Push) | **B2 reine Funktionen** — `moveBlocker`, `moveItem` + Tests | — |
| **T2** Sa früh | **B1 reine Funktionen** + Reroll-Knopf | **B2 Oberfläche** — Auswahl, Verschieben, Tauschen | — |
| **T3** Sa Mittag | **B7 Server** — Endpunkte, `validate.js`, `docs/API.md` | **B2 Verkaufen-Knopf** (nutzt B1), dann **B3 Typen + Kampflogik** | `sellItem` → Aida |
| **T4** Sa Abend | **Gift-/Heilitems bei den Gegnern** (1 Commit für Aida), dann **B7 Oberfläche** | **B3 Items + Anzeige** | `server/opponents.js` → Khaled baut, Aida reviewt |
| **T5** So früh | **B6 Speichern** | **B4 Sets + Bonus in `buildFighter`** | — |
| **T6** So Mittag | **B6 fertig**, Integration, `README.md` | **B4 Burn + Anzeige** | — |
| **T7** So Abend | **gemeinsam**: qualitative Ziele, Tagebuch, lint/test/build, Abgabe | | |

**T1 beginnt heute.** Aidas erste Aufgabe ist bewusst winzig und hängt von
nichts ab: zwei reine Funktionen in `run.ts` plus Tests, ohne Oberfläche. Sie
kann damit sofort loslegen und hat heute Abend einen PR offen — und die
Historie startet mit beiden Namen statt mit einem.

### Die zwei Übergaben sind Absicht

In T3 und T4 steckt je eine Abhängigkeit über die Trackgrenze. Die hätte man
wegplanen können; sie bleibt drin, weil sie Kontakt erzwingt. Zwei PRs, in
denen die eine Person etwas für die andere baut, sind im Verlauf sichtbar und
nicht wegzudiskutieren.

---

## 2a. Das Risiko, das Khaled nicht allein lösen kann

Dieser Plan verlangt von Aida **drei Pakete in zweieinhalb Tagen**, darunter B4
mit 20 %. Wenn sie diese Woche anders eingeplant hat, kippt der Sonntagstermin
für das Team, nicht nur für Khaled.

**Das muss heute geklärt sein, nicht morgen.** Zwei mögliche Antworten:

1. *Sie kann.* → Plan läuft wie oben.
2. *Sie kann nicht.* → Dann wird **vorher** entschieden, was wegfällt, und es
   wird im Tagebuch unter „not implemented" begründet. Nicht am Sonntagabend im
   Panikmodus.

**Die Abbruchbedingung, damit es keine Diskussion gibt:** Steht Samstagabend
kein PR von Aida zu B2 offen, übernimmt Khaled eines ihrer Pakete. Die
Übernahme wird im Tagebuch als Entscheidung festgehalten — mit Datum, Grund und
Commit. Verschweigen wäre schlechter als die Tatsache selbst: Die
Zuständigkeiten sind ein ausdrücklich bewerteter Punkt, und ein ehrlich
dokumentierter Planwechsel ist Prozessarbeit, kein Makel.

---

## 2b. Triage — vorher entschieden, nicht im Panikmodus

Falls Sonntagmittag etwas nicht fertig ist, wird **in dieser Reihenfolge**
gekürzt. Die Reihenfolge steht jetzt fest, damit sie später keine Diskussion
mehr ist:

| # | Was zuerst schrumpft | Warum zuerst |
| --- | --- | --- |
| 1 | Das zweite Set in B4 auf den einfachsten denkbaren Bonus (+5 max. HP) | Die Anforderung verlangt „at least 2 sets", nicht zwei interessante |
| 2 | Set-Abzeichen nur im Shop, nicht in der Kampfansicht | Teilerfüllung ist besser als gar nichts, und sie ist benennbar |
| 3 | B6 auf Shop-Phase beschränken: Neuladen während Suche/Kampf → zurück in den Shop der Runde, Ergebnis wird **nicht** angewandt | Deutlich kleiner — aber ehrlich dokumentieren, dass damit „avoid a loss" offen bleibt |
| 4 | B2 ohne Tastaturbedienung | Kostet Qualität, nicht die Anforderung |

**Was nie gekürzt wird:** die Tests zu den Invarianten (kein Item verdoppelt,
Gold nie negativ, kein Ergebnis zweimal). Sie sind die Verifikationsstrategie,
die die Aufgabenstellung ausdrücklich verlangt, und sie sind billig.

---

## 2c. Pufferliste — was der Schnellere tut, statt vorzulaufen

Alles davon ist nützlich und gehört ohnehin erledigt. Nichts davon frisst ein
Paket der anderen Person:

- **Aidas offenen PR gründlich lesen.** Nicht überfliegen — das ist zugleich
  die Vorbereitung auf die Einzelfragen zu ihrem Teil, und der ist die größere
  Lücke.
- Tests zu bereits gemergtem Code nachziehen
- `README.md` gegen den tatsächlichen Stand abgleichen (der Starter behauptet
  nach B2 und B3 an mehreren Stellen Falsches)
- Tagebuch-Rohnotizen schreiben, solange die Entscheidung frisch ist
- `docs/API.md` schärfen
- Die Liste „nicht umgesetzt, und warum" fortschreiben

**Nicht erlaubt:** an B2, B3 oder B4 anfangen, „weil es schneller geht".

---

## 3. Die zwei geteilten Dateien

### `src/types.ts`

Alle Erweiterungen sind **additiv** und kommen fast alle aus Aidas Track:

| Änderung | Wer | Wofür |
| --- | --- | --- |
| `ItemEffects` + `poison?`, `heal?` | Aida | B3 |
| `BattleEventKind` + `"poison" \| "heal"` | Aida | B3 |
| `FighterSnapshot` + `poison`, `burn` | Aida | B3/B4 |
| `ItemDef` + `setId?` | Aida | B4 |
| `RunState` + `runId` | Khaled | B7 |

**Regel:** Wer `types.ts` anfasst, sagt es vorher und macht daraus einen eigenen,
kleinen Commit. Nie beiläufig in einem Feature-Commit mitändern — dort
übersieht der andere es beim Review.

### `src/run.ts`

Nach **Funktionen** getrennt, nicht nach Zeilen:

- Khaled: `sellBlocker`, `sellItem`, `rerollBlocker`, `rerollShop`
- Aida: `moveBlocker`, `moveItem`

Getrennte Funktionen in derselben Datei mergen konfliktfrei.

---

## 4. Die sieben Pakete

Das Muster, das der Starter vorgibt und das überall einzuhalten ist
(`buyBlocker` / `buyItem`, `src/run.ts:29` und `:37`):

> **Eine** Funktion sagt, *warum* etwas nicht geht. Die Oberfläche zeigt diesen
> Grund an. **Dieselbe** Funktion schützt die Aktion selbst und gibt bei
> Blockade den unveränderten Zustand zurück.

B1 verlangt genau das wörtlich: *„the interface tells me why before I try it,
and the same rule also protects the action itself."* Es gilt sinngemäß für B2
und B5 genauso.

Und: Jede Shop- oder Rucksackaktion läuft durch `updateRun` (`src/game.ts:16`).
Das erzwingt bereits *„only possible while I am shopping"* — ohne eine Zeile
Zusatzarbeit.

---

### B5 — Robuste Gegnersuche · 10 % · **Khaled** · `fix/b5-resilient-matchmaking`

**Zuerst, weil es Reparatur ist, nicht Neubau.** Solange eine fehlgeschlagene
Suche den Shop lähmt, ist jedes weitere Testen mühsam.

**Dateien:** `src/game.ts`, `src/types.ts`, `src/api.ts`,
`src/pages/ShopPage.tsx`, `src/components/FightBar.tsx`

**Zu bauen:**

1. `searchFailed` setzt die Phase zurück auf `"shop"`. Ein Wort, der größte
   Effekt im ganzen Paket.
2. `startSearch` bekommt eine Phasenprüfung: `if (game.phase !== "shop") return game;`
3. `GameState` bekommt `searchId: number`. `startSearch` erhöht ihn.
4. `startBattle(game, opponent, searchId)` verwirft die Antwort, wenn
   `game.phase !== "searching"`, `game.searchId !== searchId` **oder**
   `opponent.round !== game.run.round`.
5. `fetchOpponent(round, signal)` nimmt ein `AbortSignal`.
   `handleFindOpponent` bricht eine laufende Suche ab.
6. `FightBar`: `disabled={blocker !== null || searching}`.

**Die Unterscheidung, die hier geprüft wird:** Abbrechen und Verwerfen sind
**zwei verschiedene Dinge**. Der `AbortController` spart die Anfrage; der
`searchId`-Vergleich schützt gegen die Antwort, die trotzdem noch ankommt. Wer
nur eines von beidem baut, hat die Anforderung nicht erfüllt — und genau danach
wird gefragt.

**Fallen:** `StrictMode` montiert Effekte doppelt; im Netzwerk-Tab sieht man
dann abgebrochene Anfragen, das ist korrekt und kein Fehler.

**Verifikation:** `src/game.test.ts` — fehlgeschlagene Suche hinterlässt Phase
`shop`; `startBattle` mit veraltetem `searchId` ist wirkungslos; `startBattle`
aus Phase `shop` ist wirkungslos. Dazu von Hand: `?fail=true`,
`?latency=4000`, Doppelklick.

**Commits:** (1) `fix: reset phase to shop after a failed search`
(2) `feat: guard battles with a search id` (3) `feat: abort a running search`
(4) `test: cover stale and duplicate search responses`

---

### B1 — Shop-Ökonomie · 10 % · **Khaled** · `feature/b1-shop-economy`

**Früh, weil Aida `sellItem` für die Oberfläche in B2 braucht.**

**Dateien:** `src/run.ts`, `src/components/Shop.tsx`, `src/pages/ShopPage.tsx`

**Zu bauen:**

1. `sellBlocker(run, slot)` / `sellItem(run, slot)` — Erlös
   `Math.floor(price / 2)`, Fach wird `null`.
2. `rerollBlocker(run)` / `rerollShop(run)` — kostet 1 🪙, `rollShop(run.seed)`
   liefert neue Angebote **und** den nächsten Startwert.
3. Reroll-Knopf in `Shop.tsx` mit Grund im `title`, wie beim Kaufen.
4. Den Verkaufs-Knopf baut **Aida** in B2 an die Auswahl; Khaled liefert nur die
   Regel. → **Übergabepunkt, siehe Abschnitt 6.**

**Ein Punkt, der in der Prüfung sicher kommt:** Abrunden heißt, dass Kaufen und
Verkaufen nie Gewinn bringt — das billigste Item kostet 2 und bringt 1. Es gibt
also **keine Geldschleife**. Das ist kein Zufall, das ist der Grund für
„rounded down", und es gehört geprüft statt behauptet.

**Fallen:** Reroll bei 0 Gold muss in *beiden* Ebenen blockiert sein. `nextUid`
nie wiederverwenden, sonst kollidieren React-`key`s. Beide Aktionen durch
`updateRun`.

**Verifikation:** `src/run.test.ts` — Verkauf gibt `floor(price/2)`; Verkauf
eines leeren Fachs ändert nichts; Reroll kostet genau 1 und ändert den
Startwert; Reroll bei 0 Gold ändert nichts; **Kaufen + sofort Verkaufen erhöht
das Gold nie**.

**Commits:** (1) `feat: sell items for half their price`
(2) `feat: reroll the shop for one gold` (3) `test: shop economy invariants`

---

### B7 — Hall of Fame · 20 % · **Khaled** · `feature/b7-hall-of-fame`

**Das größte Paket. Zwei Tage, Server zuerst.**

**Dateien:** `server/index.js`, neu `server/runs.js` + `server/validate.js`,
`docs/API.md`, `src/api.ts`, `src/App.tsx`, neu
`src/pages/HallOfFamePage.tsx`, `src/components/RunOver.tsx`,
`src/pages/ResultPage.tsx`, `src/pages/Layout.tsx` (Navigationslink)

**Server:**

1. `POST /api/runs` — prüft, speichert im Arbeitsspeicher, antwortet `201`.
2. `GET /api/runs` — sortierte Liste.
3. Sortierung: Siege zuerst, dann mehr Siege, dann weniger Runden. **Die
   gewählte Ordnung muss in der Oberfläche stehen**, nicht nur im Code.
4. Die Prüfregeln gehören in `server/validate.js` als **reine Funktion** —
   dann sind sie mit Vitest testbar, ohne den Server zu starten.

**Was „implausible" konkret heißt** — der Server kann nicht wissen, ob ehrlich
gespielt wurde, aber er kann Widersprüche erkennen:

| Regel | Begründung |
| --- | --- |
| `name` nach Trimmen 1–24 Zeichen | sonst leere oder sprengende Einträge |
| `outcome ∈ {victory, defeat}` | |
| `victory` ⇒ `wins === 5` und `lives ≥ 1` | ein Sieg ohne 5 Siege ist unmöglich |
| `defeat` ⇒ `lives === 0` und `wins < 5` | |
| `rounds ≥ wins` | man gewinnt nicht mehr Runden als man spielt |
| `rounds ≤ 7` | 5 Siege + 3 Leben − 1; steht so im Kommentar von `server/opponents.js:2` |

Das ist die beste Antwort auf die Rückfrage, die wir uns sonst aufheben
müssten: Die Grenze steht bereits im Starter.

**Oberfläche:**

5. Route `/hall-of-fame` — **außerhalb von `RequireRoute`.** Sonst leitet
   `routeForGame` jeden Aufruf auf die Phasenseite um und die Seite ist nie
   erreichbar. Das ist die Stelle, an der dieses Paket am ehesten scheitert.
6. Namenseingabe in `RunOver` am Ende eines Laufs.
7. Absenden: Ladezustand, Fehlerzustand, **Wiederholen ohne erneutes Tippen**
   (der Name bleibt im Zustand), nie zweimal.
8. Liste: Laden / leer / Fehler als drei unterscheidbare Zustände.
9. `RunState` bekommt `runId` in `newRun`. Der Server lehnt eine bereits
   vorhandene `runId` ab — damit hält die Regel „nie zweimal" auch über ein
   Neuladen hinweg (siehe B6).

**Fallen:** `RequireRoute`. Doppeltes Absenden per Doppelklick. `docs/API.md`
muss die neuen Endpunkte enthalten — das verlangt B7 ausdrücklich.

**Verifikation:** `server/validate.test.js` für jede Regel oben.
Von Hand: Server stoppen → Fehlerzustand; leere Liste → Leerzustand.

**Commits:** (1) `feat(api): store and list finished runs`
(2) `feat(api): validate submitted runs` (3) `docs: document the run endpoints`
(4) `feat: hall of fame page` (5) `feat: submit a finished run`
(6) `test: run validation rules`

---

### B6 — Speichern & Fortsetzen · 10 % · **Khaled** · `feature/b6-save-and-resume`

**Dateien:** neu `src/persistence.ts`, `src/state/GameProvider.tsx`,
`src/components/RulesPanel.tsx`

**Der Kern des Pakets ist eine Einsicht, nicht Code:** Der Kampf ist
deterministisch. Also wird er **nicht gespeichert, sondern neu berechnet**.

Gespeichert wird:

```
{ version: 1, run, phase, opponent, frame }
```

Beim Laden wird `startBattle` erneut aufgerufen. `simulateBattle` ist rein, also
kommt **dasselbe Ergebnis** heraus. Der gespeicherte `frame` wird
wiederhergestellt.

**Damit löst sich der gesamte Schummel-Teil von B6 von selbst** — und das ist
die Antwort, die in der Prüfung zählt:

| „Refreshing must not become a way to get…" | Warum es nicht geht |
| --- | --- |
| …einen freien Reroll | Die Angebote stehen in `run.shop` und werden mitgespeichert |
| …einen anderen Gegner | `opponentForRound` ist deterministisch |
| …ein zweites Ergebnis | Bei `frame === last` ist `showFrame` wirkungslos (`src/game.ts:50`) |
| …eine vermiedene Niederlage | Die Neuberechnung liefert denselben Sieger |

**Politik für Neuladen** (B6 verlangt ausdrücklich, dass das Team eine
festlegt **und mitteilt**): *Während der Suche* → zurück in den Shop derselben
Runde, die Suche ist verloren und muss neu gestartet werden. *Während des
Kampfes* → die Wiedergabe beginnt von vorn, das Ergebnis bleibt dasselbe. Beides
gehört als Satz in die Regeltafel, nicht nur ins Tagebuch.

**Kaputte Speicherstände:** `JSON.parse` in `try/catch`; falsche `version` →
verwerfen; unmögliche Werte prüfen (Gold < 0, Leben außerhalb 0–3, Siege > 5,
Rucksacklänge ≠ 6, unbekannte Item-Ids, Runde < 1). Jeder dieser Fälle führt
zurück auf die Startseite, **nie** in einen Absturz.

**Fallen:** Die ESLint-Regel `react-hooks/set-state-in-effect`. Lesen gehört in
den trägen Initialisierer von `useState`, nicht in einen Effekt.

**Verifikation:** `src/persistence.test.ts` — Hin- und Rückweg; Müll im
Speicher; falsche Version; jeder unmögliche Wert einzeln.
Von Hand: mitten im Kampf neu laden und prüfen, dass Siege/Leben sich **nicht**
zweimal ändern.

**Commits:** (1) `feat: persist the run in the browser`
(2) `feat: reject malformed or impossible saves`
(3) `feat: resume a battle by re-simulating it`
(4) `docs: explain the refresh policy in the rules panel`
(5) `test: persistence round trip and rejection`

---

### B2 — Rucksack ordnen · 15 % · **Aida** · `feature/b2-backpack-arrangement`

**Dateien:** `src/components/Backpack.tsx`, `src/run.ts`,
`src/pages/ShopPage.tsx`

**Zu bauen:**

1. `moveBlocker(run, from, to)` / `moveItem(run, from, to)` in `run.ts` —
   leeres Zielfach: verschieben; belegtes Zielfach: tauschen.
2. Auswahl als **Komponentenzustand** in `Backpack.tsx`
   (`useState<number | null>`), nicht in `RunState`. Begründung: Es ist
   Oberflächenzustand. Er überlebt kein Neuladen und soll es auch nicht —
   das hält B6 klein.
3. Sichtbare Auswahl, sichtbare mögliche Ziele, Abbrechen (erneuter Klick und
   `Escape`).
4. Fächer als `<button>`, nicht als `<li>` mit `onClick` — sonst ist das Raster
   per Tastatur unbedienbar.
5. **Verkaufen anhängen** (aus B1): Das ausgewählte Item kann verkauft werden.
   Khaled liefert `sellItem`/`sellBlocker`.

**Ehrlich dazu, weil es in der Prüfung kommt:** Die Position im Raster hat
**keine** Auswirkung auf den Kampf — `itemIdsOf` liest nur die Reihenfolge aus,
und `README.md` sagt ausdrücklich „their position doesn't matter". B2 ist also
reine Bedienbarkeit. Das ist kein Mangel, aber es muss man wissen und sagen
können, statt eine Wirkung zu behaupten, die es nicht gibt.

**Falle:** `README.md` behauptet *„A bought item stays in its slot for the whole
run."* Das wird durch B2 **falsch** und muss im selben PR mitgeändert werden.
Widersprüchliche Doku fällt beim Lesen sofort auf.

**Verifikation:** `src/run.test.ts` — auf leeres Fach; Tausch; auf sich selbst
ist wirkungslos; aus leerem Fach ist wirkungslos; kein Item geht verloren oder
verdoppelt sich (Anzahl der `uid`s vorher = nachher).

**Commits:** (1) `feat: move and swap backpack items`
(2) `feat: select a backpack slot` (3) `feat: sell the selected item`
(4) `docs: items can be rearranged` (5) `test: backpack moves keep every item`

---

### B3 — Statuseffekte · 15 % · **Aida** · `feature/b3-status-effects`

**Dateien:** `src/types.ts`, `src/items.ts`, `src/battle.ts`, `src/rules.ts`,
`src/components/BattleView.tsx`, `server/opponents.js`

**Zu bauen:**

1. `ItemEffects` + `poison?`, `heal?`. `EFFECT_LABELS` in `items.ts` und
   `EFFECT_HELP` in `rules.ts` mit erweitern — sonst zeigen Tooltips die neuen
   Effekte nicht an.
2. `FighterState` + `poison: number`; `FighterSnapshot` + `poison: number`.
3. `BattleEventKind` + `"poison" | "heal"`.
4. **Mindestens 3 Items je Effekt** im Katalog. Der Shop bietet sie dadurch
   automatisch an — `rollShop` würfelt aus `CATALOG`.
5. Gegner dürfen sie nutzen → Item-Ids in `server/opponents.js` ergänzen.
   **Achtung: das ist Khaleds Datei.** Kurz absprechen; der Kommentar dort
   sagt: *„Item ids must exist in src/items.ts."*
6. Anzeige: Giftzähler je Kämpfer in `BattleView`, Meldungen im Kampflog,
   Erklärung in der Regeltafel und in den Tooltips.

**Werte — Vorschlag, nicht Gesetz** (die Aufgabe überlässt sie euch
ausdrücklich, verlangt aber *deterministisch und erklärt*):

- Gift wirkt **jeden zweiten Tick (1 s)**: 1 HP pro Stapel, **ignoriert Block**.
  Stapel bauen sich auf und klingen **nicht** ab.
- Heilung: `Math.min(maxHp, hp + x)` — **nie** über das Maximum.
- Reihenfolge je Tick: erst feuern die Items, dann wirkt der Schaden über Zeit,
  dann die Niederschlagsprüfung. Diese Reihenfolge ist eine Entscheidung und
  gehört ins Tagebuch.

**Balance im Auge behalten:** 1 HP/s pro Stapel über 30 s sind 30 Schaden — bei
40 HP Grundwert ist Gift damit sehr stark. Nach dem ersten Spieltest
nachjustieren und die Änderung begründen; das ist ein guter Tagebucheintrag.

**Verifikation:** `src/battle.test.ts` — Gift ignoriert Block nachweislich
(Kämpfer mit Block verliert trotzdem HP); Heilung übersteigt `maxHp` nie;
zweimal dieselbe Aufstellung ergibt denselben Kampf (Determinismus).

**Commits:** (1) `feat: poison and heal effects in the types`
(2) `feat: resolve damage over time in the battle`
(3) `feat: poison and healing items` (4) `feat: show poison in battle and log`
(5) `test: poison ignores block, heal respects max hp`

---

### B4 — Item-Sets · 20 % · **Aida** · `feature/b4-item-sets`

**Das größte Paket auf Aidas Seite. Baut auf B3 auf.**

**Dateien:** neu `src/sets.ts`, `src/items.ts`, `src/battle.ts`, `src/rules.ts`,
`src/components/ItemCard.tsx`, `src/components/Backpack.tsx`,
`src/components/BattleView.tsx`

**Zu bauen:**

1. `src/sets.ts`: mindestens **2 Sets**, davon eines **Fire**, je mindestens
   **3 Items**. Bestehende Items dürfen wiederverwendet werden.
2. Bonus aktiv ab **2 oder mehr** Set-Items im Rucksack.
3. **Der entscheidende Bauplatz:** Der Bonus wird in `buildFighter`
   (`src/battle.ts:12`) aus der Item-Id-Liste berechnet. Dann gilt er für Held
   **und** Gegner automatisch — `buildPlayerFighter` und `buildOpponentFighter`
   rufen beide diese eine Funktion. „Bonuses apply to the player and to
   opponents alike" ist damit erfüllt, ohne es zweimal zu schreiben.
4. **Burn** als neuer Effekt, der sich in **allen vier** genannten Punkten von
   Gift unterscheidet:

| | Gift | Brand |
| --- | --- | --- |
| Stapelaufbau | +1 | **+2** (schneller) |
| Schaden je Stapel | 1 HP / 1 s | **2 HP / 0,5 s** (mehr) |
| Block | ignoriert ihn | **wird zuerst absorbiert** |
| Abklingen | gar nicht | **−1 Stapel je Tick** |

Diese Tabelle ist eine Prüfliste, die der Prüfer Punkt für Punkt abgehen kann.
Fehlt einer, fehlt die Anforderung.

5. Set-Abzeichen auf Items **im Shop und im Kampf**; aktive Boni sichtbar.
6. Brand in Kampfansicht, Kampflog und Regeltafel.

**Zweites Set:** Da Brand die ganze Fire-Seite trägt, reicht beim zweiten Set
ein einfacher, erklärbarer Bonus — etwa +2 Block je Blockitem oder +5 maximale
HP. Komplexität bringt hier keine Punkte, Erklärbarkeit schon.

**Verifikation:** `src/battle.test.ts` — Bonus greift bei 2 Items, nicht bei 1;
Bonus greift auch für den Gegner; Brand wird von Block absorbiert, Gift nicht;
Brand klingt nachweislich ab.

**Commits:** (1) `feat: item sets and set bonuses`
(2) `feat: apply set bonuses to both fighters`
(3) `feat: burn as the fire set status` (4) `feat: show set badges and bonuses`
(5) `test: set bonuses and burn versus poison`

---

## 5. Wer committet was — Übersicht

| Paket | Wer | Branch | Commits | Gewicht |
| --- | --- | --- | ---: | ---: |
| Setup | beide | `docs/team-setup` | 1 | — |
| B5 | Khaled | `fix/b5-resilient-matchmaking` | 4 | 10 % |
| B1 | Khaled | `feature/b1-shop-economy` | 3 | 10 % |
| B7 | Khaled | `feature/b7-hall-of-fame` | 6 | 20 % |
| B6 | Khaled | `feature/b6-save-and-resume` | 5 | 10 % |
| B2 | Aida | `feature/b2-backpack-arrangement` | 5 | 15 % |
| B3 | Aida | `feature/b3-status-effects` | 5 | 15 % |
| B4 | Aida | `feature/b4-item-sets` | 5 | 20 % |

Khaled ≈ 18 Commits / 50 %, Aida ≈ 15 Commits / 50 %. Die Zahlen müssen nicht
gleich sein — aber sie dürfen nicht 30 zu 2 stehen.

**Ablauf je Paket, ausnahmslos:**

1. `git switch main && git pull`
2. `git switch -c <branch>`
3. Arbeiten, in den oben geschnittenen Commits
4. `git push -u origin <branch>` · `gh pr create`
5. **Der andere liest und stellt mindestens eine inhaltliche Rückfrage**
6. Autor antwortet, bessert nach
7. **Der andere merged** — nie der Autor selbst (Regel 1, Abschnitt 2)
8. Tagebuch-Rohnotiz, falls eine Entscheidung gefallen ist

Die Schritte 5 und 7 sind nicht Höflichkeit. Ein PR mit einer echten Rückfrage,
einer Antwort und einem Merge durch die andere Person ist der **stärkste Beleg
für Zusammenarbeit**, den Git hergibt — stärker als jede Commit-Zahl, und er
lässt sich am Ende nicht nachbauen.

---

## 6. Die zwei Übergabepunkte

Zwei Stellen kreuzen die Tracks. Sie sind klein, aber wenn sie nicht
abgesprochen sind, kosten sie einen halben Tag:

1. **`sellItem` (B1 → B2):** Khaled liefert die Regel, Aida baut den Knopf an
   die Auswahl. Khaleds B1-PR muss vor Aidas B2-Knopf gemergt sein.
2. **`server/opponents.js` (B3 → Khaleds Datei):** Aida braucht Gift- und
   Heilitems bei den Gegnern. Entweder Khaled ergänzt sie auf Zuruf, oder Aida
   macht es und Khaled liest den PR. Beides geht — festlegen, nicht annehmen.

---

## 7. Sonntagabend: Abschluss

Kein neuer Code mehr. Reihenfolge:

1. `pnpm lint` · `pnpm test` · `pnpm build` — alle drei sauber. Ein roter Build
   am Abgabetag ist teurer als jede fehlende Funktion.
2. `README.md` gegen den Ist-Stand abgleichen. Der Starter behauptet an zwei
   Stellen Dinge, die nach B2 und B3 nicht mehr stimmen (Items bleiben im Fach;
   Itemtabelle ohne die neuen Effekte).
3. **Qualitative Ziele** festlegen — zwei oder drei, jedes mit Prüfkriterium.
   Kandidaten in `ARBEITSAUFTEILUNG-VORSCHLAG.md`, Abschnitt 7.
4. **Tagebuch**: Rohnotizen zu „Important Decisions" verdichten. Mindestens
   drei, jede mit Commit- oder PR-Beleg. Die Tabelle der Zuständigkeiten
   ausfüllen. „Not implemented" ehrlich und vollständig.
5. **Abgabe in Moodle**: Repo-Link und Tagebuch.

Das Tagebuch funktioniert nur, wenn die Rohnotizen **während** des Sprints
entstehen. Drei Zeilen nach jedem gemergten PR, nicht Sonntagabend aus der
Erinnerung — dann fehlt genau das, was zählt: welche Alternative verworfen wurde.

---

## 8. Montag bis Donnerstag: die 30 Punkte

Ab hier ändert sich die Arbeitsweise. Nicht mehr bauen, sondern verteidigen
können. Grundlage: `EINZELFRAGEN-VORBEREITUNG.md`.

| Tag | Inhalt |
| --- | --- |
| **Mo** | Khaleds eigene Pakete: B5, B1, B7, B6. Drei-Warum-Ketten zu jeder Entscheidung, bis sie bei etwas Hartem enden. |
| **Di** | Aidas Pakete: B2, B3, B4. Fremder Code — hier ist die Lücke am größten, deshalb der ganze Tag. |
| **Mi** | Ebene 4: „was passiert, wenn ich diese Zeile lösche". Dazu die Kontrafaktischen zum Kampf und zur Persistenz. |
| **Do** | Navigationsdrill über das ganze Repo. Die Liste „nicht umgesetzt, und warum" laut durchgehen. Prozessteil proben: Tagebuch und Git in zwei Minuten vorstellen. |

**Eine Regel für diese vier Tage:** Was sich bei der Abfrage als unerklärbar
herausstellt, wird **nicht** nachgebaut. Es wird notiert und als bekannte
Schwäche benannt. Code ändern ohne Zeit zum Verstehen macht die Lage schlechter,
nicht besser.

Die fünf Fragen, die mit Sicherheit kommen, weil sie direkt an den
Anforderungen hängen:

1. Was passiert, wenn zwei Gegnersuchen gleichzeitig laufen und die langsamere
   zuletzt antwortet? *(B5)*
2. Warum kann man sich durch Neuladen keinen Vorteil verschaffen? *(B6)*
3. Wie unterscheidet sich Brand von Gift — alle vier Punkte? *(B4)*
4. Was genau prüft der Server an einem eingesandten Lauf, und warum reicht das
   nicht, um Betrug auszuschließen? *(B7)*
5. Warum kann Kaufen und Verkaufen kein Gold erzeugen? *(B1)*
