# Team-Konventionen — AWE Praktische Prüfung

**Team:** Khaled Salama, Aida Heric
**Stand:** 6. November 2026, vor Erhalt des Aufgaben-Repos

Dieses Dokument richtet sich an **beide Teammitglieder** — und an die
KI-Assistenten, mit denen wir arbeiten. Es liegt im Repo, damit alle Beteiligten
denselben Stand haben.

> **Hinweis:** Der Entwurf stammt von Khaled. Er ist eine Arbeitsvereinbarung,
> keine Vorgabe von außen — Aida entscheidet, ob sie ihn übernimmt. Wer etwas
> darin für fachlich falsch hält, sagt es, statt es stillschweigend anders zu
> machen.

---

## 1. Warum dieses Dokument wichtiger ist als es aussieht

Die Prüfung bewertet nicht nur das Ergebnis, sondern **den Prozess** — und der
Prozess ist die Git-Historie plus das Tagebuch. Beides entsteht ab dem ersten
Commit und lässt sich nachträglich nicht herstellen, ohne die Historie
umzuschreiben.

Punkteverteilung, 60 insgesamt:

| Teil | Punkte | Art |
| --- | --- | --- |
| Artefakt (Anforderungen + Verifikation) | 20 | Team |
| **Prozess (Git, Tagebuch, Entscheidungen)** | **10** | **Team** |
| Navigation, Verständnis, Reasoning | 30 | **einzeln** |

Positiv ab 36 von 60 **und** mindestens 60 % der Anforderungen umgesetzt.

---

## 2. Die wichtigste Regel beim Arbeiten mit KI

**In der Prüfungssitzung sind KI, Google und Ähnliches nicht erlaubt.** Die 30
Einzelpunkte — die Hälfte der Note — müssen Khaled und Aida **ohne Hilfsmittel**
beantworten: Code lokalisieren und erklären, Entscheidungen begründen, Abläufe
nachvollziehen.

Dazu steht in der Prüfungsinformation ausdrücklich:

> *More code or greater complexity does not mean a better solution. We value
> appropriate and understandable implementations.*

**Daraus folgt eine Arbeitsweise, die dem üblichen Reflex widerspricht:**

| statt | besser |
| --- | --- |
| eine Anforderung vollständig generieren | vorschlagen, dann gemeinsam durchgehen |
| eine elegante Abstraktion einziehen | die naheliegende Lösung, die man erklären kann |
| fünf Dateien anlegen, weil es saubere Architektur ist | zwei, wenn zwei reichen |
| nach dem Bauen zusammenfassen | nach dem Bauen **abfragen** |

Konkret an den Assistenten: Was geschrieben wurde und von der Person nicht
selbst erklärt werden kann, ist ein Problem — auch wenn der Code gut ist. Nach
dem Bauen aktiv abfragen, nicht zusammenfassen: *„Welche Datei wird aufgerufen, wenn der
Benutzer X klickt?"* Das ist unangenehmer als eine Zusammenfassung, zahlt aber
auf die 30 Punkte ein.

**Umfang ist kein Ziel. Er ist ein Risiko.** Jede Zeile, die niemand im Team
erklären kann, ist eine potenzielle Frage ohne Antwort.

---

## 3. Git-Konventionen

### 3.1 Branches

Ein Branch pro Anforderung, kein Direkt-Commit auf `main`:

```
feature/<kurzer-name>      z. B. feature/filter-persistenz
fix/<kurzer-name>
docs/<kurzer-name>
```

`main` bleibt immer lauffähig. Wer das nicht schafft, merged nicht.

### 3.2 Commits

Format wie bisher in Khaleds Übungs-Repo (Conventional Commits):

```
<typ>(<bereich>): <was, in einem Satz>

<warum, wenn es nicht offensichtlich ist>
<welche Entscheidung dahintersteht>
```

Typen: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`.

**Wichtig ist der Rumpf, nicht die Kopfzeile.** Ein Commit, der begründet
*warum* etwas so gemacht wurde, ist gleichzeitig ein Tagebucheintrag und eine
vorbereitete Antwort auf eine Prüfungsfrage. Die Kopfzeile allein ist das
nicht.

Lieber mehrere kleine Commits als ein großer. Ein Commit sollte eine Sache tun
und sich in einem Satz beschreiben lassen.

### 3.3 Nachvollziehbare Beiträge — und die Falle dabei

Die Aufgabenstellung verlangt *traceable contributions*. **Zwei Autorennamen im
Log sind dafür nicht ausreichend.** Wenn eine Person tippt und bei manchen
Commits `--author` auf die andere setzt, sieht `git shortlog` ausgeglichen aus —
aber das Tagebuch verlangt „Verantwortlichkeiten", und die Einzelfragen deckten
es sofort auf.

Was tatsächlich Zusammenarbeit belegt, in der Reihenfolge der Aussagekraft:

1. **Pull Requests, die die andere Person reviewt.** Review-Kommentare sind das
   stärkste Artefakt, das Git hergibt — sie zeigen, dass zwei Leute über
   denselben Code nachgedacht haben. Mindestens eine inhaltliche Anmerkung pro
   PR, keine reinen „LGTM".
2. **Branches pro Anforderung**, über PR gemerged. Dann liest man an der
   Historie ab, welche Anforderung wann von wem kam.
3. **`Co-authored-by:`** bei echter Paararbeit (siehe unten).
4. Ausgeglichene Commit-Zahlen. Nützlich, aber am schwächsten.

**Nicht machen:** Historie nachträglich umschreiben, um sie ausgeglichener
aussehen zu lassen.

### 3.4 Co-Autorschaft

Bei echter gemeinsamer Arbeit an einem Commit — eine tippt, beide denken:

```
Co-authored-by: Aida Heric <aidas-mail@example.com>
```

bzw. umgekehrt

```
Co-authored-by: Khaled Salama <khaled.salama@stud.hcw.ac.at>
```

GitHub rechnet solche Commits beiden an. Das ist der git-native und ehrliche Weg,
Paararbeit zu kennzeichnen — besser als getrennte Commits, die Paararbeit
verschleiern.

> Die echten Mailadressen müssen hier eingesetzt werden, und zwar die, die in
> `git config user.email` stehen. Sonst ordnet GitHub den Commit nicht zu.

### 3.5 KI-Nutzung gehört ins Tagebuch, nicht in die Historie

**Keine KI-Trailer in Commits.** `Co-authored-by` bleibt dem Fall vorbehalten,
dass Khaled und Aida tatsächlich gemeinsam an einer Änderung gesessen sind
(Abschnitt 3.4).

Die Aufgabenstellung verlangt, die KI-Nutzung zu beschreiben, und die offizielle
Tagebuchvorlage hat dafür einen eigenen Abschnitt („AI Usage"). Dort gehört es
hin — in Prosa. Ein Commit-Trailer behauptet Mitautorschaft an einer konkreten
Änderung; gefragt ist aber, **wie und warum** das Werkzeug eingesetzt wurde, und
das lässt sich nicht als Metadatum ausdrücken.

Damit der Abschnitt im Tagebuch nicht beliebig wirkt, gehören drei Dinge hinein:

- wofür KI eingesetzt wurde — und wofür bewusst nicht
- **wo ein Vorschlag verworfen oder zurückgebaut wurde, und warum** ← das
  Wertvollste, weil es zeigt, dass ihr den Code beurteilt und nicht übernommen habt
- wie ihr sichergestellt habt, dass ihr versteht, was im Repo steht

### 3.6 Arbeitsteilung — nach Funktionsbereich, nicht nach Dateityp

**Nicht** so aufteilen: eine macht „alles Frontend", der andere „alles Backend".
Dann kann niemand einen Ablauf von vorn bis hinten erklären — und genau das wird
gefragt (*„execution paths"*, *„component interactions"*).

**Sondern:** Jede Person besitzt zwei bis drei Anforderungen **vollständig**,
von der Oberfläche bis zur Datenhaltung.

Und trotzdem: **Beide lesen den Code der anderen Person.** Die Einzelfragen
können alles abdecken, nicht nur den eigenen Teil. Vorschlag: einmal in der
Woche 30 Minuten gegenseitig durchgehen — eine erklärt, die andere fragt.

---

## 4. Das Tagebuch

Verlangt sind: **Entscheidungen, Schwierigkeiten, Verantwortlichkeiten,
KI-Nutzung.** Format frei, *„meaningful reflection and traceability matter more
than presentation or length"*.

**Ab Tag eins mitführen, nicht am Vorabend schreiben.** Ein nachträglich
verfasstes Tagebuch erkennt man daran, dass es keine Schwierigkeiten enthält.

Vorschlag für die Struktur — eine Datei `TAGEBUCH.md` im Repo, umgekehrt
chronologisch, pro Eintrag:

```markdown
## 2026-11-14 — Filterzustand: URL oder Komponente?

**Wer:** Aida (Entscheidung), Khaled (Gegenlesen im PR #7)

**Problem:** Die Filter sollen nach einem Reload erhalten bleiben. Zwei
Möglichkeiten: in der URL als Query-Parameter, oder im localStorage.

**Entscheidung:** URL. Grund: Ein gefilterter Stand soll verschickbar sein,
und der Zurück-Button soll eine Filteränderung zurücknehmen.

**Verworfen:** localStorage — überlebt den Reload, aber nicht das Verschicken,
und der Zurück-Button bleibt außen vor.

**KI-Nutzung:** Der erste Entwurf mit `useSearchParams` kam vom Assistenten.
Ich habe die Validierung der Parameter ergänzt, weil der Entwurf `null` nicht
behandelt hat.

**Commit:** abc1234
```

Was einen Eintrag wertvoll macht, ist der Abschnitt **Verworfen**. Eine
Entscheidung ohne benannte Alternative ist keine Entscheidung, sondern ein
Zufall — und in der Sitzung ist „wir haben X genommen, weil Y nicht
funktioniert hätte" die Antwort, die zählt.

Schwierigkeiten gehören ausdrücklich dazu, auch die peinlichen. Ein Eintrag
„wir haben zwei Stunden an einem Fehler gesucht, der daran lag, dass …" ist
mehr wert als drei Einträge, in denen alles glattging.

---

## 5. Zwei KI-Assistenten am selben Repo

**Das ist die größte technische Gefahr an diesem Setup.** Die beiden Assistenten
sehen einander nicht. Jeder trifft Architekturentscheidungen und weiß nicht, was
der andere entschieden hat. Ergebnis ohne Gegenmaßnahme:
zwei Stile, zwei Muster für dasselbe Problem, Konflikte beim Merge.

Drei Maßnahmen:

1. **Dieses Dokument liegt im Repo** und wird gelesen, bevor jemand anfängt.
2. **Entscheidungen landen im Tagebuch, bevor sie Code werden** — nicht danach.
   Wer eine Bibliothek einführt, eine Ordnerstruktur festlegt oder ein Muster
   wählt, schreibt vorher einen Eintrag und sagt es der anderen Person.
3. **Immer `git pull` vor Arbeitsbeginn**, und lieber kurze Branches als eine
   Woche parallel.

**Regel für beide Assistenten:** Eine Entscheidung, die über eine Datei
hinausgeht — Ordnerstruktur, Bibliothek, Zustandsverwaltung, Datenfluss — wird
vorgeschlagen, nicht getroffen, und der Hinweis gehört dazu, dass sie mit der
anderen Person abzustimmen ist.

---

## 6. Verifikation

Verlangt ist *„appropriate strategies of your choice"* — also nicht zwingend ein
Testframework. Was zählt, ist, dass die Strategie **begründet** und
**vorführbar** ist.

Realistische Mischung:

- Automatisierte Tests für reine Funktionen — Logik ohne UI, ohne Netzwerk. Das
  sind die, bei denen ein Test billig und aussagekräftig ist.
- Eine kurze, geschriebene Prüfliste für die Abläufe, die man per Hand prüft:
  *Was klicke ich, was muss passieren?* Im Repo, nicht im Kopf.
- Typprüfung und Linter im CI, falls das Projekt sie hergibt.

Wichtig für die Sitzung: **Sagen können, was man NICHT geprüft hat und warum.**
Das ist eine bessere Antwort als eine behauptete Vollständigkeit.

---

## 7. Was in diesem Dokument noch fehlt

Die **Arbeitsaufteilung**. Sie braucht die Anforderungen und kommt in ein
zweites Dokument, sobald das Repo da ist (Freitag vor der Prüfung).

Wichtig dabei: Die Aufteilung soll eine **Entscheidung von Khaled und Aida**
sein, keine Vorgabe einer KI. Die Assistenten können einen Vorschlag machen —
die Abstimmung gehört den beiden, und sie gehört ins Tagebuch. Ein
Prozess, in dem die KI die Verantwortlichkeiten verteilt hat, wäre schwer als
Teamarbeit zu verkaufen.

**Außerdem offen:** Das Team hat **eine** Rückfrage zur Klärung der
Anforderungen frei (Thomas und der Lehrende in der Kundenrolle). Die nicht für
etwas verbrauchen, das im Aufgabentext steht — erst die Anforderungen gründlich
durchgehen, dann entscheiden, welche Stelle wirklich auslegungsbedürftig ist.

---

## Checkliste vor dem ersten Commit

- [ ] `git config user.name` und `user.email` bei beiden korrekt gesetzt
- [ ] Beide Mailadressen in Abschnitt 3.4 eingesetzt
- [ ] Dieses Dokument im Repo, von beiden gelesen
- [ ] `TAGEBUCH.md` angelegt, erster Eintrag geschrieben (z. B. „Aufteilung
      beschlossen")
- [ ] Branch-Schema vereinbart, `main` geschützt oder zumindest als Regel
- [ ] Arbeitsaufteilung beschlossen und im Tagebuch festgehalten
