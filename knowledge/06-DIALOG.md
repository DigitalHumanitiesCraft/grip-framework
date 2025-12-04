# Dialog-Protokoll: Rückfragen im GRIP-Workflow

Dieses Dokument spezifiziert die Rückfragen, die das LLM im Dialog mit dem Forschenden stellen muss. Das Protokoll verhindert voreilige Annahmen und erzwingt die Klärung von Ambiguitäten.

Abhängigkeiten: [[00-PROJEKTAUFTRAG]], [[02-MAPPINGS]], [[05-ARCHETYPEN]]

---

## Grundprinzip

Das LLM darf nicht raten. Wenn die Daten-Topologie oder die epistemische Intention nicht eindeutig aus den Eingabedaten ablesbar ist, muss eine Rückfrage gestellt werden. Die Rückfragen sind Teil des Protokolls, nicht optionale Höflichkeit.

---

## Kategorie A: Auflösung der Daten-Topologie

Diese Fragen klären, welche Struktur die Daten haben.

### Szenario: CSV-Datei mit unklarer Struktur

Das Dateiformat CSV kann eine Tabelle (Scope), eine Kantenliste (Navigator) oder eine Zeitreihe (Reader) enthalten.

Rückfrage: Enthält Ihre Datei Beziehungen zwischen Akteuren (etwa Absender und Empfänger) oder unabhängige Messpunkte (etwa Temperaturwerte)?

Begründung: Das Dateiformat ist nur ein Container. Die logische Struktur entscheidet über den Archetyp.

### Szenario: JSON-Datei

JSON kann einen Baum (Workbench), einen Graphen (Navigator) oder eine Dokumentensammlung (Reader) darstellen.

Rückfrage: Handelt es sich um verschachtelte Konfigurationsdaten, die Sie bearbeiten wollen, oder um verknüpfte Objekte, deren Beziehungen Sie analysieren wollen?

Begründung: Die Verschachtelungstiefe und das Vorhandensein von Referenzen bestimmen den Archetyp.

### Szenario: Mehrere Dateien

Der Forschende lädt mehrere Dateien unterschiedlichen Typs hoch.

Rückfrage: Sollen diese Dateien als ein zusammenhängender Datensatz behandelt werden oder getrennt analysiert werden?

Begründung: Zusammenhängende Daten erfordern eventuell einen hybriden Ansatz.

---

## Kategorie B: Klärung der epistemischen Intention

Diese Fragen klären, was der Forschende wissen will.

### Szenario: Textdaten ohne klare Fragestellung

Textdaten können qualitativ gelesen (Reader) oder quantitativ analysiert (Scope) werden.

Rückfrage: Möchten Sie einzelne Texte lesen und interpretieren, oder Worthäufigkeiten und Trends über viele Texte hinweg analysieren?

Begründung: Gleiche Daten können völlig unterschiedliche Interfaces erfordern.

### Szenario: Tabellarische Daten ohne klare Fragestellung

Tabellen können verglichen (Scope) oder kuratiert (Workbench) werden.

Rückfrage: Sollen Muster und Verteilungen sichtbar werden, oder wollen Sie fehlerhafte Einträge direkt korrigieren?

Begründung: Analyse und Manipulation erfordern unterschiedliche UI-Strukturen.

### Szenario: Netzwerkdaten ohne klare Fragestellung

Netzwerke können strukturell analysiert (Navigator) oder als Kontext für Einzelobjekte genutzt (Reader mit Links) werden.

Rückfrage: Interessiert Sie die Gesamtstruktur des Netzwerks (Cluster, Zentralität) oder wollen Sie einzelne Knoten im Kontext ihrer Verbindungen verstehen?

Begründung: Globale vs. lokale Perspektive erfordert unterschiedliche Interfaces.

---

## Kategorie C: Festlegung der Interaktionstiefe

Diese Fragen klären, ob Daten nur betrachtet oder auch verändert werden sollen.

### Szenario: Daten mit erkennbaren Fehlern

Unsaubere Daten können visualisiert (Scope) oder bereinigt (Workbench) werden.

Rückfrage: Soll das Interface Fehler nur anzeigen und markieren, oder wollen Sie diese direkt im Tool korrigieren?

Begründung: Read-only vs. Read-Write bestimmt den Archetyp.

### Szenario: Annotationswunsch

Der Forschende erwähnt, dass er Notizen machen will.

Rückfrage: Sollen Annotationen an den Originaldaten gespeichert werden oder nur für Ihre persönliche Arbeit dienen?

Begründung: Persistente Annotationen erfordern eine Workbench-Komponente.

---

## Kategorie D: Klärung von Prioritäten bei Hybridfällen

Diese Fragen klären, welcher Aspekt Vorrang hat.

### Szenario: Daten sind sowohl temporal als auch relational

Rückfrage: Was ist für Ihre Forschungsfrage wichtiger: Die zeitliche Entwicklung oder die Beziehungsstruktur?

Begründung: Die primäre Dimension bestimmt den Hauptarchetyp. Die sekundäre kann als ergänzende Ansicht hinzukommen.

### Szenario: Intention ist sowohl Verstehen als auch Vergleichen

Rückfrage: Geht es primär darum, einzelne Fälle tief zu verstehen, oder darum, systematische Unterschiede zwischen Fällen zu identifizieren?

Begründung: Tiefenanalyse und Breitenanalyse erfordern unterschiedliche Ansätze.

---

## Fragetechnik

### Geschlossene Fragen bevorzugen

Gute Frage: Wollen Sie einzelne Texte lesen (Reader) oder Worthäufigkeiten vergleichen (Scope)?

Schlechte Frage: Was wollen Sie mit den Daten machen?

Begründung: Geschlossene Fragen mit konkreten Optionen sind schneller zu beantworten und führen zu eindeutigen Entscheidungen.

### Fachbegriffe erklären

Die Archetypen-Namen (Reader, Scope, Navigator, Workbench) können dem Forschenden unbekannt sein. Die Frage sollte die Funktion beschreiben, nicht den Namen.

Gute Frage: Sollen Fehler nur sichtbar sein oder behoben werden?

Schlechte Frage: Brauchen Sie einen Scope oder eine Workbench?

### Maximal zwei Fragen pro Runde

Mehr als zwei Fragen auf einmal überfordern. Nach der Antwort können weitere Fragen folgen.

---

## Wann keine Rückfragen nötig sind

Rückfragen sind überflüssig, wenn:

Die Daten-Topologie eindeutig ist (z.B. eine Kantenliste mit Source/Target-Spalten ist offensichtlich ein Graph).

Die Intention explizit formuliert wurde (z.B. der Forschende sagt, er will Cluster finden).

Die Fallback-Regel greift und der Forschende dies akzeptiert.

---

## Verknüpfungen

- [[02-MAPPINGS]] beschreibt die Zuordnungslogik, die durch die Rückfragen geklärt wird
- [[05-ARCHETYPEN]] definiert die Optionen, zwischen denen die Rückfragen unterscheiden
- [[04-SYSTEM-PROMPT]] enthält die kondensierte Form des Protokolls
