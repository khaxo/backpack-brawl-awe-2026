## Team members

- **Khaled Salama** — GitHub `khaxo`
- **Aida Heric** — GitHub `AidaHeric` (ältere Commits auch unter `Heralinska`)

## Repository

`github.com/khaxo/backpack-brawl-awe-2026`

---

## Development Overview

### How did you organize your work?

**Alle sieben Anforderungen (B1–B7) sind umgesetzt.** Jede in einem eigenen
Feature-Branch mit einem Pull Request nach `main`.

**Aufteilung nach Dateien, nicht nach Prozenten.** Wir haben vorab festgelegt,
welches Paket welche Dateien besitzt, damit wir seltener in denselben Zeilen
landen. Teamregeln und Plan liegen im Branch `docs/team-setup` (`be924e0`);
der zugehörige **PR #1 ist noch offen** — die Regeln galten im Team trotzdem
von Anfang an.

**Reihenfolge.** B5 zuerst, weil B1, B6 und B7 darauf aufbauen. Dann B1 und B2
parallel, danach B3 und B7, dann B6, zuletzt B4.

**Reviews.** Jeder Pull Request wurde von der jeweils anderen Person gelesen
und gemergt — **mit einer dokumentierten Ausnahme**: PR #3
hat Khaled nach zwei Tagen ohne Review selbst gemergt. Das steht so auch im
Gameplan und ist im Merge-Commit `776dce1` nachlesbar.

**Aufräumen am Ende.** Am 26. 11. haben wir die Dateien sortiert: Spiellogik
nach `src/game/`, Tests nach `src/tests/`, dazu ein README, das den
tatsächlichen Stand beschreibt statt den Starter.

### Who was responsible for which parts?

| Anforderung | Gewicht | Verantwortlich | Belege |
| --- | ---: | --- | --- |
| B1 Shop-Ökonomie | 10 % | Khaled | PR #4 · `606d2c3`, `96821f6`, `7d9b22e` |
| B2 Rucksack ordnen | 15 % | Aida | PR #5 · `fb2c085`…`e7ce33c` |
| B3 Statuseffekte (Gift, Heilung) | 15 % | Aida | PR #6 · `9541737`…`b4876b4` |
| B4 Item-Sets (Fire, Guardian, Burn) | 20 % | Aida | PR #9 · `a958539`…`995dd57` |
| B5 Robuste Gegnersuche | 10 % | Khaled | PR #3 · `721caee`, `2640605` |
| B6 Speichern und Fortsetzen | 10 % | Khaled | PR #8 · `a4b73f1` |
| B7 Hall of Fame | 20 % | Khaled | PR #7 · `2798aa6`, `8c20d22`, `a8225df` |

Beide haben `types.ts` und `run.ts` angefasst. Dort galt die Regel: nach
Funktionen trennen, und Änderungen an `types.ts` vorher ankündigen.

### Which requirements were not implemented, if any?

**Keine.** Alle sieben Anforderungen sind in `main` — 100 % der funktionalen
Anforderungen.

Bewusst **nicht** umgesetzt und hier festgehalten:

- **Die Hall of Fame liegt nur im Arbeitsspeicher des Servers** und ist nach
  einem Neustart leer. Die Aufgabenstellung erlaubt das ausdrücklich
  (*„Storing the entries in memory on the server is sufficient"*).
- **Keine automatisierten Tests für die React-Komponenten.** Getestet werden
  die reinen Regeln (77 Tests) und der Server. Die Oberfläche haben wir von
  Hand durchgeklickt und die Belege in den Pull Requests festgehalten. Eine
  Testumgebung für Komponenten hätte in der verfügbaren Zeit mehr Aufwand als
  Erkenntnis gebracht.
---

## Qualitative goals


| Ziel | Warum es hier zählt | Abwägung | Woran wir es prüfen |
| --- | --- | --- | --- |
| **Regeln liegen in reinen Funktionen, nicht in Komponenten** | Fast jede Anforderung ist eine Regel („Gold nie negativ", „kein Kampf außerhalb einer Suche"). In einer Komponente wäre sie an eine Schaltfläche gebunden und bei jedem neuen Aufrufer erneut zu schreiben. | Mehr Dateien und eine Schicht mehr zwischen Klick und Wirkung. Ein Klick durchläuft Handler → `updateRun` → reine Funktion, was beim Lesen länger dauert. | Jede Regel ist ohne React testbar. Alle 77 Tests kommen ohne Testumgebung für Komponenten aus. Geht das nicht mehr, ist die Regel an der falschen Stelle. |
| **Jede verweigerte Aktion nennt ihren Grund** | Die Anforderung verlangt es zweimal wörtlich: *„tells me why before I try it"* **und** *„the same rule also protects the action itself"*. | Jede Regel steht zweimal im Code: einmal als `…Blocker`, der den Grund als Text liefert, einmal als Prüfung in der Aktion. Das ist bewusste Doppelung — die Oberfläche darf die einzige Absicherung nicht sein. | Jede Aktion hat eine `…Blocker`-Funktion, die Oberfläche benutzt denselben Rückgabewert für Beschriftung, `disabled` und Tooltip, und jede Aktion ruft ihren Blocker selbst auf. Ein Test je Aktion prüft, dass der abgelehnte Fall **dasselbe** Zustandsobjekt zurückgibt. |
| **Gleicher Startwert, gleicher Verlauf** | Shop und Kampf sind zufällig für den Spieler, aber reproduzierbar für das Programm. B6 (Speichern) und B7 (Plausibilitätsprüfung auf dem Server) hängen beide daran. | Kein `Math.random()`. Jede ziehende Funktion muss den nächsten Startwert zurückgeben und weiterreichen, statt ihn intern zu halten. | Ein Test zieht zweimal aus demselben Startwert und vergleicht die Angebote. Für den Kampf gilt dasselbe: er wird beim Laden neu simuliert statt gespeichert. |

Das Blocker-Muster hat sich über alle sieben Pakete und bis in den Server
getragen: `buyBlocker`, `sellBlocker`, `rerollBlocker`, `moveBlocker`,
`fightBlocker`, `saveBlocker` — und auf dem Server `runBlocker`.

---

## Important Decisions


### 1. Veraltete Serverantworten über die Rundennummer erkennen, nicht über einen Zähler

**Gewählt:** `startBattle` verwirft eine Antwort, wenn
`opponent.round !== game.run.round`. Der Server spiegelt die angefragte Runde
in der Antwort zurück; das ist in `docs/API.md` als Vertrag festgehalten. Die
Antwort trägt ihre Zuordnung also selbst mit sich.

**Verworfen:** ein Zähler `searchId: number` in `GameState`, den `startSearch`
erhöht und `startBattle` vergleicht — **weil** das ein zweites Feld wäre, das
dieselbe Information noch einmal speichert. `GameState` liegt in `types.ts`,
der einen Datei, die beide Arbeitsstränge anfassen. Jedes Feld, das dort nicht
entsteht, ist ein Merge-Konflikt weniger.

**Preis:** Die Lösung hängt daran, dass der Server die Runde zurückgibt.
Ändert sich der API-Vertrag, bricht sie. Außerdem unterscheidet die Runde
**nur** zwischen Runden, nicht zwischen zwei Suchen innerhalb derselben Runde
— dass es die nicht geben kann, stellen drei andere Schichten sicher
(gesperrter Knopf, Phasenprüfung in `startSearch`, `AbortController`).

**Beleg:** `721caee` · PR #3

---

### 2. Dem Spieler einen Satz zeigen, nicht einen Statuscode

**Gewählt:** `fetchOpponent` unterscheidet drei Fehlerfälle. Antwortet die API
selbst mit `{ error }`, gewinnt ihr Text. Antwortet stattdessen der
Vite-Proxy — was passiert, wenn der Server gar nicht läuft — oder wirft `fetch`
selbst, steht dort „The arena cannot be reached. The game server may be down."
Der ursprüngliche Grund bleibt als `cause` am Fehler hängen und ist in der
Konsole lesbar.

**Verworfen:** die vorherige Fassung, die den Statuscode durchreichte
(„Opponent search failed (502)") — **weil** die Anforderung ausdrücklich
*„an understandable message"* verlangt und „502" für einen Spieler keine
Auskunft ist.

**Preis:** Eine Fallunterscheidung mehr im Client, und eine Annahme darin: ein
5xx ohne `{ error }`-Feld stammt nicht von unserer API. Ein 4xx behält deshalb
bewusst seinen Statuscode — das wäre eine fehlerhafte Anfrage von uns, und die
Meldung geht dann an den Entwickler, nicht an den Spieler.

**Beleg:** `2640605` · PR #3

---

### 3. Der Verkaufsknopf

**Gewählt:** Jedes belegte Rucksackfeld bekommt einen
eigenen kleinen Knopf mit dem Erlös darauf.

**Verworfen:** die ursprüngliche Planung — „Feld anklicken, dann verkaufen" —
**weil** B2 genau diese Geste für seine Auswahl braucht (*„I can select an
item, see that it is selected, and move it"*). Hätten beide Pakete um den
Klick auf dasselbe Feld konkurriert, hätte eine Person den Code der anderen
umbauen müssen. Außerdem wäre B1 erst vollständig gewesen, wenn B2 fertig ist.

**Nachtrag (22. 11. abends), und das ist der eigentliche Punkt:** Die
Entscheidung hat nicht gehalten. B2 macht aus jedem Rucksackfeld ein
`<button>`, damit man es anklicken und mit der Tastatur erreichen kann — und
ein `<button>` in einem `<button>` ist ungültiges HTML. Der Parser bricht die
Verschachtelung auf; was danach noch klickbar ist, hängt vom Browser ab. Die
saubere Trennung war damit nicht mehr nur unnötig, sondern technisch
unmöglich. Aida hat den Verkaufsknopf unter das Raster verlegt, wo er für das
ausgewählte Item gilt.

**Was die Trennung trotzdem gebracht hat.** Umgezogen ist der *Knopf*, nicht
die *Regel*: `sellBlocker`, `sellPrice` und `sellItem` werden unverändert
aufgerufen, und alle sechs `sellItem`-Tests liefen beim B2-Merge ohne eine
Zeile Änderung durch. Die Entscheidung war also nicht falsch — sie hat genau
das geschützt, was sie schützen sollte, nämlich die Logik. Nur die Oberfläche
hat sich bewegt, und dort war der Umbau ein Zehnzeiler statt eines
Paketkonflikts.

**Preis:** Verkaufen braucht jetzt zwei Klicks statt einem.

**Was wir daraus mitnehmen:** Eine Paketgrenze auf dem Papier ist eine
Vermutung. Diese hier ist an einer HTML-Regel zerbrochen, die in keinem
Planungsdokument stand. Die Lehre ist nicht „weniger planen", sondern: die
Grenze entlang der *Logik* ziehen, nicht entlang der *Oberfläche* — die
Logikgrenze hat gehalten, die Oberflächengrenze nicht.

**Beleg:** `96821f6` (B1, PR #4) · `006da12` (B2, PR #5) ·
`Backpack.tsx:116-127`

---


### 4. Der Shop bleibt aus dem Startwert ableitbar

**Gewählt:** `rollShop(seed)` zieht die Angebote aus einem gespeicherten
Startwert und gibt den **nächsten** Startwert mit zurück. Kein `Math.random()`
irgendwo im Spiel.

**Verworfen:** die Angebote direkt mit `Math.random()` ziehen — **weil** sich
ein Spielstand dann nicht mehr überprüfen ließe und ein Neuladen jedes Mal
einen anderen Shop ergäbe, also einen Gratis-Reroll.

**Preis:** Jede ziehende Funktion muss den Startwert durchreichen, statt ihn
intern zu halten. Das macht die Signaturen etwas umständlicher.

**Beleg:** `mulberry32` und `rollShop` in `shop.ts` · Test „same seed, same
offers"

---

### 5. Gespeichert werden Tatsachen, nicht Folgen (B6)

**Gewählt:** Gespeichert werden Phase, Lauf, `runId` und — nur während eines
Kampfes — der Gegner. Der Kampf selbst wird **nicht** gespeichert, sondern beim
Laden neu gerechnet, weil `simulateBattle` keinen Zufall enthält und dasselbe
Ergebnis liefert. Ein bereits fertig abgespieltes Replay wird als *schon
verrechnet* gespeichert, eine laufende Suche kommt als Shop zurück.

**Verworfen:** ein fertiges Replay als `"battle"` speichern — **weil** das
Kampfergebnis bereits beim letzten Bild der Wiedergabe angewendet wird. Nach
einem Neuladen wäre derselbe Kampf erneut abgelaufen und das Ergebnis ein
zweites Mal gezählt worden: ein geschenkter Sieg oder ein zweites verlorenes
Leben. Genau das verbietet die Anforderung (*„a second result, or to avoid a
loss"*).

**Preis:** Ein unterbrochener Suchlauf geht verloren, der Spieler startet ihn
neu. Weil der Gegner einer Runde fest ist, bringt das keinen anderen Gegner —
also keinen Vorteil.

**Beleg:** `a4b73f1` · PR #8 · `storage.ts:44`

---

### 6. Set-Boni werden in `buildFighter` berechnet (B4)

**Gewählt:** Aktive Sets und der Guardian-Bonus (+5 max. HP) entstehen in
`buildFighter` aus der Item-Liste.

**Verworfen:** getrennte Berechnung für Spieler und Gegner — **weil** beide
Seiten durch `buildFighter` gebaut werden und die Regel sonst doppelt stünde.
So gilt *„Bonuses apply to the player and to opponents alike"* automatisch: es
gibt keine zweite Stelle, die man vergessen könnte.

**Preis:** Die Gegner sind dadurch stärker geworden, ohne dass jemand ihre
Werte angefasst hat. Die Kampf-HP eines Gegners weichen jetzt von der Tabelle
in `server/opponents.js` ab.

**Beleg:** `cefba4b` · PR #9 · `battle.ts:29`

---

### 7. Der Shop zeigt 6 statt 4 Angebote

**Gewählt:** `SHOP_SIZE = 6`. Weder `REQUIREMENTS.md` noch der Gameplan legen
eine Zahl fest — nachgeprüft, bevor wir sie geändert haben. Bei 12 Items im
Katalog, 6 Rucksackplätzen und 10 Startgold (+5 pro Runde) sind 6 Angebote mehr
Auswahl, ohne dass der Shop unübersichtlich wird.

**Verworfen:** Die ursprüngliche Konfiguration mit 4 Items im Shop.

**Preis:** Alte Spielstände mit 4 Angeboten gelten als ungültig und starten ein
neues Spiel. Das ist genau das in B6 verlangte Verhalten und wurde im Browser
nachgestellt: `saveBlocker` meldet „shop has the wrong size", der Stand wird
gelöscht, das Spiel beginnt neu.

**Beleg:** `0c39dbf` · **PR #10**

---

## AI Usage

**Wofür.** Wir haben einen KI-Programmierassistenten (Claude Code) im Editor
benutzt — vor allem zum Lesen, Planen und Prüfen, für Vorschläge zur Umsetzung der Pakete,
für Testfälle und für die interne Dokumentation.

**Wofür konkret:**

- **Planung.** Der Assistent hat den Starter gelesen und einen Plan sowie einen
  Aufteilungsvorschlag geschrieben. Die Aufteilung haben wir selbst entschieden.
- **Aufräumen am 26. 11.** Vorschlag für die Dateistruktur (`src/game/`,
  `src/tests/`), Erklärung, was der Editor beim Verschieben mit den Imports
  macht, anschließend Tests und Build (77 Tests, Build ohne Fehler).
- **Dokumentation.** Entwurf des neuen README-Teils, danach jede Behauptung
  gegen den Code geprüft (Werte, Regeln, API). Dabei fielen drei veraltete
  Kommentare auf, die noch „four offers" und alte Dateipfade nannten.
- **Reviews.** Die Pull Requests der jeweils anderen Person wurden mit seiner
  Hilfe gegengeprüft — unter anderem durch gezieltes Kaputtmachen des Codes,
  um zu sehen, ob der passende Test rot wird (siehe unten).
- **Bewusst nicht.** Keine Anforderung ohne Durchsicht übernommen. Commits und
  Pull Requests haben wir selbst ausgelöst.

**Eine Probe, die wir uns angewöhnt haben.** Ein Test, der auch ohne die
Reparatur grün wäre, belegt nichts. Deshalb nehmen wir den Fix testweise wieder
heraus und sehen nach, ob genau der richtige Test rot wird. Bei B4 waren das
fünf solcher Proben, bei B2, B3 und B6 je drei.

---

## Final Reflection and Lessons learned

**Was sich bewährt hat.** Die Aufteilung nach Dateien und die feste Reihenfolge
haben funktioniert: Beide haben in `types.ts` und `run.ts` gearbeitet, und das
ging mit getrennten Funktionen ohne nennenswerte Konflikte. Das Blocker-Muster
— eine Funktion, die den Grund nennt und dieselbe Aktion schützt — haben wir im
ganzen Spiel und im Server wiederverwendet.

Dazu eine Angewohnheit, die wir übernehmen würden: **Tests gegenprüfen, indem
man den Code kaputt macht.** Ein Test, der auch ohne die Reparatur grün wäre,
belegt nichts. Den Fix testweise herauszunehmen kostet eine Minute und ist die
einzige Probe, die zählt.

**Was wir beim nächsten Mal anders machen würden:**

1. **Dateien früher sortieren.** Wir haben Logik, Tests und Oberfläche erst am
   letzten Tag getrennt. Das hat viele Imports geändert.
2. **Das README laufend pflegen.** Es beschrieb bis zum Schluss den Starter
   (vier Angebote, keine Sets). Auch Kommentare im Code nannten alte Zahlen.
3. **Paketgrenzen entlang der Logik ziehen, nicht entlang der Oberfläche.** Wir
   hatten früh festgelegt, welche Geste welchem Paket gehört — und genau diese
   Grenze ist an einer HTML-Regel zerbrochen, die in keinem Planungsdokument
   stand. Die Logikgrenze hat gehalten, die Oberflächengrenze nicht.

Die Teile ohne Ärger waren die, bei denen eine Regel genau **einmal** im Code
steht und alles andere sie nur benutzt. Der Ärger kam von dem, was dazwischen
liegt: Paketgrenzen auf Papier und Dokumentation neben dem Code.

---

