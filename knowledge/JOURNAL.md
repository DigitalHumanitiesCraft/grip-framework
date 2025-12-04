# JOURNAL: Arbeitstagebuch

Dieses Dokument protokolliert die Entwicklung des GRIP-Frameworks in chronologischer Reihenfolge.

---

## 2025-12-04: Projektinitialisierung

Das Repository enthielt fünf Konzeptdokumente ohne lauffähige Software. Die zentrale Erkenntnis war, dass GRIP primär eine Wissensbasis für LLM-gestützte Entwicklung ist, kein klassisches Software-Projekt.

Drei Bereiche wurden spezifiziert. Die vier Archetypen (Reader, Scope, Navigator, Workbench) mit klaren Grenzen und Ausschlüssen. Die Mapping-Logik als Wenn-Dann-Heuristik mit Fallback-Regel. Das Dialog-Protokoll mit drei Kategorien von Rückfragen.

Die Entscheidung fiel auf Praxistest vor weiterer Dokumentation. Um den Test zu ermöglichen, wurde ein Master System Prompt erstellt.

---

## 2025-12-04: Wissensbasis-Dokumentation

Vier neue Dokumente wurden erstellt.

04-SYSTEM-PROMPT.md kondensiert das methodische Wissen für Frontier-Modelle. 05-ARCHETYPEN.md spezifiziert kognitive Aufgaben, geeignete Daten und UI-Elemente pro Archetyp. 02-MAPPINGS.md wurde überarbeitet mit vier Topologien, vier Intentionen und Wenn-Dann-Regeln. 06-DIALOG.md dokumentiert Szenarien und Beispielfragen für Rückfragen.

Das Repository umfasst nun neun Dokumente mit konsistenter Terminologie.

---

## 2025-12-04: Terminologie-Harmonisierung

Die alte Terminologie (sechs Module, Datentypen wie tabellarisch/relational) wurde durch die neue ersetzt (vier Archetypen, vier Topologien). Drei Dokumente wurden aktualisiert: 00-PROJEKTAUFTRAG.md, 01-ARCHITEKTUR.md, 03-BEISPIEL.md.

---

## 2025-12-04: Vollständige Entscheidungsmatrix

Die 4×4-Matrix wurde vervollständigt mit allen 16 Kombinationen.

Vier primäre Zuordnungen bilden die Diagonale. Acht sekundäre Zuordnungen sind eindeutig ableitbar. Vier ambige Fälle (Sequenziell+Rekonstruktion, Vernetzt+Verstehen, Vernetzt+Vergleich, Hierarchisch+Verstehen) erfordern Rückfragen.

Die Matrix wurde als interaktives Element im Website-Prototyp implementiert.

---

## 2025-12-04: Design-System

Das Design-System "Organic Academic" wurde in DESIGN.md dokumentiert.

Farbpalette mit Paper Sand (#FDFBF7), Ink Black (#1A1A1A), Terracotta (#C4705A) und Archetypen-Farben. Typografie mit Lora (Headlines), Inter (UI), JetBrains Mono (Code). Asymmetrische Border-Radii für organischen Charakter.

---

## 2025-12-04: UI-Verfeinerung

Vier Verbesserungen wurden implementiert. Vertikale Führungslinien und Small Caps für Matrix-Lesbarkeit. Semantisches Reframing von "Ambig" zu "Dialog" mit Terracotta statt Warn-Gelb. Hover-Effekte mit Elevation und Pfeil-Cue für Affordance. Asymmetrische Border-Radii für Organic Touch.

---

## 2025-12-04: Selbstreferenzieller Prototyp-Auftrag

Das Dokument 08-PROTOTYP-AUFTRAG.md definiert einen Prototypen, der GRIP auf sich selbst anwendet.

Die Wissensbasis ist vernetzt (Wikilinks) und hierarchisch (Ableitungsstruktur). Die Intention ist Verstehen. Nach der Matrix ist Vernetzt×Verstehen ambig. Die Antwort (lokal und global) führt zu Navigator für Gesamtstruktur, Reader für Details, Scope für die Matrix.

Erfolgskriterium: Ein Besucher kann nach fünf Minuten erklären, was die Archetypen sind, wie die Matrix funktioniert und warum der Prototyp so aufgebaut ist.

---

## 2025-12-04: Archetypen-Demos

Vier interaktive Demo-Seiten wurden implementiert. Jede zeigt einen Archetyp mit realistischen Beispieldaten und passendem Interface.

Der Reader zeigt die Korrespondenz Hannah Arendt / Karl Jaspers (1926-1969). Drei-Spalten-Layout mit Brief-Navigation, annotiertem Lesebereich und Kontext-Panel. Keyboard-Navigation mit Pfeiltasten. Die Daten sind sequenziell, die Intention ist Verstehen.

Der Scope zeigt Umfragedaten einer Mitarbeiterbefragung. Filter-Sidebar, KPI-Cards mit Veränderungsindikatoren, Balken- und Liniendiagramme, paginierte Datentabelle. Die Daten sind multidimensional, die Intention ist Vergleich.

Der Navigator zeigt ein Zitationsnetzwerk mit zehn Publikationen. SVG-Graph mit farbcodierten Clustern (Methoden, Theorie, Anwendung). Node-Selektion mit Detail-Panel, Cluster-Filter, Zoom-Controls. Die Daten sind vernetzt, die Intention ist Rekonstruktion.

Die Workbench zeigt einen JSON-Metadaten-Export mit Validierungsfehlern. Tree-View der Datenstruktur, editierbare Tabelle mit Inline-Bearbeitung, Inspector-Panel mit Fehleranalyse, Quick-Fix für Datumsformate. Die Daten sind hierarchisch, die Intention ist Kuratierung.

Jede Demo erklärt im Footer die GRIP-Matrix-Zuordnung. Die Hauptseite verlinkt alle Demos über farbcodierte Buttons in den Archetypen-Cards.

---

## 2025-12-04: Adaptive Interfaces

Die statischen Demo-Seiten wurden zu dynamischen, JSON-basierten Interfaces umgebaut. Jeder Archetyp lädt Daten via fetch() und passt die UI automatisch an.

### Reader: Arendt-Jaspers Korrespondenz

AdaptiveReader-Klasse mit positionsbasierten Annotationen (start/end-Zeichen). Interaktive Timeline mit historischen Perioden. Brief-Referenzen als klickbare Links. Statistik-Panel zeigt Wortanzahl, Annotationen und Referenzen.

Datenformat: Fünf fiktive Briefe mit Annotations-Array, Referenzen auf andere Briefe und Timeline-Perioden.

### Scope: Umfragedaten zur Digitalisierung

AdaptiveScope-Klasse mit Echtzeit-Aggregation aus 120 Rohdatensätzen. Dynamische Filter für Abteilung, Altersgruppe, Home-Office-Tage. Pearson-Korrelationsmatrix zeigt Zusammenhänge zwischen Variablen. KPI-Cards mit Änderungsindikatoren. CSV-Export und Pagination.

Datenformat: 120 Befragte mit 12 Variablen (Zufriedenheit, Kommunikation, Training, Veränderungsbereitschaft auf Skala 1-10).

### Navigator: Zitationsnetzwerk

AdaptiveNavigator-Klasse mit Force-Directed Layout ohne D3-Dependency. Drei Layout-Modi (Force, Radial, Cluster). Physik-Simulation mit Alpha-Decay-Visualisierung. Node-Dragging, Pan, Zoom. Cluster-Filter und Jahr-Filter. Netzwerk-Metriken (Degree, In-Degree, Out-Degree, Dichte).

Datenformat: 10 Publikationen in drei thematischen Clustern (Methoden, Theorie, Anwendung). 19 gerichtete Kanten für Zitationsbeziehungen.

### Workbench: Sammlungsmetadaten mit Fehlern

AdaptiveWorkbench-Klasse mit Auto-Validierung gegen Schema. Drei Ansichten: Tabelle (editierbar), JSON, Fehlerübersicht. Quick-Fix-Vorschläge für bekannte Fehlermuster (Datumsformate, Kategorien, fehlende Felder). Batch-Operationen für Massenkorrektur. Undo/Redo mit Ctrl+Z/Y. Export als JSON, CSV oder Validierungsreport.

Datenformat: 25 Kunstobjekte mit absichtlichen Fehlern (ungültige Datumsformate, Duplikate, Tippfehler, fehlende Pflichtfelder).

### Info-Boxen mit User Stories

Jede Demo-Seite enthält eine Info-Box mit drei Sektionen:
- **Datensatz**: Beschreibung der Beispieldaten
- **Visualisierung**: Auflistung der UI-Features
- **User Story**: Konkrete Nutzerperspektive im Format "Als [Rolle] möchte ich [Aktion], indem ich [Methode], um [Ziel]."

User Stories:
- Reader: Editionsphilologin rekonstruiert intellektuelle Beziehung
- Scope: Personalentwicklerin plant zielgerichtete Trainingsmaßnahmen
- Navigator: Wissenschaftshistorikerin macht intellektuelle Genealogien sichtbar
- Workbench: Sammlungsregistrarin bereinigt Metadaten für Systemimport

---

## Dateistruktur nach Adaptive-Implementierung

```
docs/
  index.html              Hauptseite mit Matrix und Archetypen
  css/
    style.css             Basis-Styles, Demo-Footer, Info-Boxen
    reader.css            Reader: Timeline, Annotationen, Referenzen
    scope.css             Scope: KPIs, Korrelationsmatrix, Pagination
    navigator.css         Navigator: Simulation, Metriken, Graph-Controls
    workbench.css         Workbench: Schema, Fehler-Cards, JSON-View
  js/
    main.js               Matrix-Interaktion
    reader.js             AdaptiveReader-Klasse
    scope.js              AdaptiveScope-Klasse (NEU)
    navigator.js          AdaptiveNavigator-Klasse
    workbench.js          AdaptiveWorkbench-Klasse
  examples/
    reader.html           Dynamische Korrespondenz-Ansicht
    scope.html            Dynamisches Umfrage-Dashboard
    navigator.html        Dynamisches Zitationsnetzwerk
    workbench.html        Dynamische Metadaten-Kuratierung
    data/
      reader-correspondence.json   Arendt-Jaspers Briefe
      scope-survey.json            120 Umfrage-Rohdaten
      navigator-citations.json     Zitationsnetzwerk
      workbench-metadata.json      Kunstsammlung mit Fehlern
```

---

## 2025-12-04: Workflow-Dokumentation

Das Dokument 09-WORKFLOWS.md beschreibt typische Pfade durch die Archetypen für verschiedene Forschungstypen.

Fünf Referenz-Workflows wurden dokumentiert:
- Qualitative Analyse (Reader → Workbench → Navigator → Scope)
- Systematisches Literaturreview (Navigator → Reader → Workbench → Scope)
- Datenbereinigung und Migration (Scope → Workbench → Scope)
- Digitale Edition (Reader → Workbench → Navigator → Reader)
- Survey-Forschung (Workbench → Scope → Navigator → Reader)

Jeder Workflow enthält ein ASCII-Diagramm, Phasenbeschreibungen mit Übergangsbedingungen, Iterationsschleifen und eine User Story.

Das Konzept: Archetypen sind Momentaufnahmen, Forschung ist Prozess. Workflows zeigen, wie sich Topologie und Intention im Projektverlauf ändern und jeder Phasenwechsel eine neue Matrix-Abfrage auslöst.