# Arbeitsaufteilung — Vorschlag

**Status: Vorschlag, kein Beschluss.** Khaled und Aida entscheiden. Die
getroffene Entscheidung und die Gründe dafür gehören als erster Eintrag ins
Entwicklungstagebuch — die Verantwortlichkeiten sind ausdrücklich Teil der
Prozessbewertung.

Gelesen wurde dafür der komplette Starter (1854 Zeilen, Stand `3ac4780`).

---

## 1. Die sieben Anforderungen

| Nr. | Thema | Gewicht | Kern |
| --- | --- | ---: | --- |
| B1 | Shop-Ökonomie | 10 % | Verkaufen zum halben Preis (abgerundet), Shop neu würfeln für 1 🪙 |
| B2 | Rucksack ordnen | 15 % | Auswählen, verschieben, tauschen, abbrechen |
| B3 | Statuseffekte | 15 % | Gift (stapelt, ignoriert Block) und Heilung (nie über max. HP) |
| B4 | Item-Sets | 20 % | ≥ 2 Sets à ≥ 3 Items, davon „Fire" mit neuem Brand-Effekt |
| B5 | Robuste Gegnersuche | 10 % | Keine Doppelsuche, kein Kampf aus veralteter Antwort |
| B6 | Speichern & Fortsetzen | 10 % | Neuladen setzt den Lauf fort, ohne Schummelmöglichkeit |
| B7 | Hall of Fame | 20 % | Läufe an die API senden, Bestenliste als eigene Seite |

Dazu kommt ein Teil ohne eigene Prozentzahl, der aber ausdrücklich in der
Prüfung verteidigt werden muss: **qualitative Ziele**, siehe Abschnitt 7.

---

## 2. Was der Starter schon kaputt hat

B5 beschreibt keine neue Funktion. Es beschreibt drei Fehler, die bereits
im Starter stecken. Das ist beim Planen wichtig: B5 ist kein Bau, sondern eine
Reparatur, und sie ist kleiner als ihre 10 % vermuten lassen.

| Verlangt | Ist-Zustand |
| --- | --- |
| Nach einem Fehler ein **benutzbarer** Shop | `searchFailed` (`src/game.ts:33`) setzt nur den Fehlertext. Die Phase bleibt `searching`, also bleibt das `fieldset` in `src/pages/ShopPage.tsx:38` deaktiviert. |
| **Keine zweite** Suche möglich | Der Knopf (`src/components/FightBar.tsx:29`) ist nur bei leerem Rucksack gesperrt. Während der Suche ist er anklickbar. |
| Kampf nur für **aktuelle** Runde und Suche | `startBattle` (`src/game.ts:38`) prüft die Phase gar nicht. Eine verspätete Antwort startet einen Kampf aus dem Nichts. |

Ebenfalls hilfreich zu wissen: `updateRun` (`src/game.ts:16`) erzwingt bereits
„nur während des Einkaufens". Neue Shop- und Rucksackaktionen müssen durch diese
Funktion laufen, dann ist dieser Teil von B1 und B2 ohne Zusatzarbeit erfüllt.

Das Muster `buyBlocker` / `buyItem` (`src/run.ts:29` und `:37`) ist die Vorlage
für B1 und B2: **eine** Funktion sagt, warum etwas nicht geht, die Oberfläche
zeigt den Grund an, und dieselbe Funktion schützt die Aktion selbst. Genau das
verlangt B1 mit „the same rule also protects the action itself".

---

## 3. Der Vorschlag

Die Aufteilung folgt den **Dateien**, nicht den Prozenten. Wer sich die Dateien
teilt, merged dauernd; wer sich die Prozente teilt, hat zufällig eine faire Zahl
und trotzdem Konflikte.

### Khaled — Ökonomie, Netz und Persistenz (50 %)

**B1 (10) · B5 (10) · B6 (10) · B7 (20)**

Dateien: `src/api.ts`, `src/state/GameProvider.tsx`, `src/components/Shop.tsx`,
`src/components/FightBar.tsx`, `src/pages/ShopPage.tsx`, `server/`,
`docs/API.md`, neue Hall-of-Fame-Seite.

*Begründung:* B5 ist genau der Anfrage-Wettlauf, den Khaled in Übung 6 gebaut,
gemessen und erklärt hat. B7 ist ein Express-Endpunkt mit Lade-, Leer- und
Fehlerzustand — dieselbe Übung. In den Einzelfragen zählt, was man aus eigenem
Verständnis beantwortet, nicht aus Erinnerung.

### Aida — Rucksack und Kampf (50 %)

**B2 (15) · B3 (15) · B4 (20)**

Dateien: `src/items.ts`, `src/battle.ts`, `src/rules.ts`,
`src/components/Backpack.tsx`, `src/components/ItemCard.tsx`,
`src/components/BattleView.tsx`, `src/components/RulesPanel.tsx`.

*Begründung:* B3 und B4 hängen eng zusammen — Brand muss sich nachweisbar von
Gift unterscheiden (stapelt schneller, mehr Schaden, wird von Block absorbiert,
klingt ab). Diese Abwägung gehört in **einen** Kopf, sonst entstehen zwei
Effektsysteme nebeneinander. B2 liegt in denselben Dateien.

---

## 4. Die zwei geteilten Dateien

`src/types.ts` und `src/run.ts` gehören beiden. Dort entstehen sonst die
Konflikte.

**Regel für `types.ts`:** Änderungen vorher ankündigen, nie beiläufig
mitcommitten. Jeder hängt neue Felder nur an, niemand ändert bestehende
Bedeutungen allein. Beide Tracks erweitern `ItemEffects` und `RunState` — das
muss abgesprochen sein, bevor die erste Zeile fällt.

**Regel für `run.ts`:** nach Funktionen trennen, nicht nach Zeilen.
Khaled ergänzt `sellItem` und `rerollShop`, Aida `moveItem` und `swapSlots`.
Getrennte Funktionen lassen sich konfliktfrei mergen, auch wenn sie in derselben
Datei liegen.

---

## 5. Reihenfolge

**Aida:** B2 → B3 → B4
B2 ist unabhängig und kann sofort beginnen. B3 baut die Mechanik für
Statuseffekte, auf der B4 mit Brand aufsetzt.

**Khaled:** B5 → B1 → B7 → B6
B5 zuerst, weil es bestehende Fehler behebt: Solange eine fehlgeschlagene Suche
den Shop lähmt, ist jedes Testen des restlichen Spiels mühsam.

**B6 kommt zuletzt — das ist kein Zufall.** Was gespeichert werden muss, hängt
davon ab, welche Felder B2, B3 und B4 am Zustand anhängen. Wer vorher ein
Speicherformat festlegt, schreibt es zweimal und hat dann noch ein
Migrationsproblem, das niemand verlangt hat.

**Daraus folgt ein Stichtag:** Ab einem gemeinsam gesetzten Zeitpunkt wird
`RunState` nicht mehr erweitert. Dieser Zeitpunkt gehört ins Tagebuch.

---

## 6. Gegenprüfung ist Pflicht, nicht Höflichkeit

Die Aufteilung oben teilt die *Arbeit*. Sie teilt **nicht** die Verantwortung
fürs Verstehen: Die 30 Einzelpunkte werden auf der ganzen Anwendung geprüft,
nicht nur auf dem eigenen Teil. „Das hat Aida gemacht" ist in der Prüfung keine
Antwort.

Daraus folgen zwei feste Regeln:

1. **Jeder Pull Request wird vom anderen gelesen**, mit mindestens einer
   inhaltlichen Rückfrage. Nicht „LGTM". Die Rückfrage ist gleichzeitig der
   Nachweis der Zusammenarbeit und die eigene Prüfungsvorbereitung.
2. **Nach jedem fertigen Bereich erklärt der andere ihn laut** — ohne in den
   Code zu sehen. Was dabei nicht erklärbar ist, ist noch nicht verstanden.

---

## 7. Qualitative Ziele — gemeinsame Entscheidung

Die Aufgabenstellung verlangt neben den Funktionen „a small set of qualitative
goals", mit Begründung, mit den daraus folgenden Abwägungen und mit einer
Vorstellung davon, wie man ihre Erfüllung prüft.

**Klein heißt klein.** Zwei oder drei Ziele, die man wirklich verteidigen kann,
sind mehr wert als sechs aus einem Lehrbuch. Kandidaten, die zu diesem Projekt
tatsächlich passen:

- **Determinismus.** Der Kampf ist eine reine Funktion, der Shop läuft über
  einen gesetzten Startwert. Das ist bereits Architektur des Starters und wird
  durch B3/B4 auf die Probe gestellt: Jeder neue Effekt muss deterministisch
  bleiben, sonst ist er nicht testbar und nicht erklärbar.
- **Kein unmöglicher Zustand.** Gold nie negativ, kein Item verdoppelt oder
  verloren, jede Aktion ganz oder gar nicht. B1 verlangt das wörtlich, B6
  verlangt es gegen manipulierte Speicherstände.
- **Ein Grund, bevor man es versucht.** Jede gesperrte Aktion sagt, warum sie
  gesperrt ist — und dieselbe Regel schützt die Aktion selbst. Der Starter macht
  das bei `buyBlocker` vor; es konsequent durchzuziehen ist eine echte
  Entscheidung mit Preis.

Zu jedem gewählten Ziel gehört die Frage, **woran man merkt, dass es erfüllt
ist.** Das ist gleichzeitig die Verifikationsstrategie, die die Aufgabenstellung
ohnehin verlangt. Vitest ist eingerichtet und leer — die reinen Module
(`battle.ts`, `run.ts`, `shop.ts`) sind ohne React testbar und damit der
naheliegende Ort dafür.

---

## 8. Was dieses Dokument noch nicht entscheidet

- **Die Aufteilung selbst.** Sie steht hier als Vorschlag. Falls ihr tauscht:
  Der Grund für den Tausch ist ein guter Tagebucheintrag.
- **Die qualitativen Ziele.** Gemeinsame Entscheidung, siehe Abschnitt 7.
- **Der Stichtag für `RunState`.** Siehe Abschnitt 5.
- **Die eine Rückfrage ans Team.** Bester Kandidat bisher: Was bei B7
  „implausible data" heißt, die der Server ablehnen soll — der Server kann nicht
  wissen, ob ein Lauf ehrlich gespielt wurde. Diese Frage ist in ein paar Tagen
  mehr wert als heute, wenn klar ist, woran ihr tatsächlich hängt.
