# Code Map: JavaScript und HTML-Architektur

Dieses Dokument beschreibt die technische Struktur des GRIP-Prototypen. Es definiert die JavaScript-Module, ihre Abhängigkeiten und die Verbindungen zu HTML-Dateien.

Abhängigkeiten: [[01-ARCHITEKTUR]], [[07-PROTOTYP]]

---

## Architektur-Überblick

Der Prototyp verwendet native ES6-Module ohne Build-Tooling. Die Entscheidung gegen Webpack oder Vite folgt dem Prinzip der Einfachheit: Der Code bleibt direkt lesbar und lauffähig.

---

## Verzeichnisstruktur

```
docs/
  index.html                    Hauptseite mit Matrix und Workflows
  css/
    style.css                   Basis-Styles, Matrix, Workflows
    reader.css                  Reader-spezifische Styles
    scope.css                   Scope-spezifische Styles
    navigator.css               Navigator-spezifische Styles
    workbench.css               Workbench-spezifische Styles
  js/
    main.js                     Entry Point für index.html
    modules/
      matrix.js                 Matrix-Daten und Interaktion
      workflows.js              Workflow-Daten und Rendering
    archetypes/
      reader.js                 AdaptiveReader-Klasse
      scope.js                  AdaptiveScope-Klasse
      navigator.js              AdaptiveNavigator-Klasse
      workbench.js              AdaptiveWorkbench-Klasse
  examples/
    reader.html                 Reader-Demo
    scope.html                  Scope-Demo
    navigator.html              Navigator-Demo
    workbench.html              Workbench-Demo
    data/
      reader-correspondence.json    Arendt-Jaspers Korrespondenz
      scope-survey.json             Umfragedaten
      navigator-citations.json      Zitationsnetzwerk
      workbench-metadata.json       Sammlungsmetadaten
```

---

## Module

### modules/matrix.js

Verantwortlichkeit: Entscheidungsmatrix-Interaktion auf der Hauptseite.

Exporte:
- matrixData: Objekt mit Archetypen-Beschreibungen und ambigen Fällen
- reasonings: Objekt mit Begründungen für Sekundärfälle
- initMatrix(): Funktion für Event-Listener auf Matrix-Zellen

Abhängigkeiten: Keine (autark)

---

### modules/workflows.js

Verantwortlichkeit: Workflow-Visualisierung auf der Hauptseite.

Exporte:
- workflows: Objekt mit fünf Referenz-Workflows (Phasen, Iterationen, User Stories)
- initWorkflows(): Funktion für Workflow-Picker und dynamisches Rendering

Abhängigkeiten: Keine (autark)

---

### archetypes/reader.js

Verantwortlichkeit: Adaptive Leseansicht für sequenzielle Daten.

Export: AdaptiveReader (Klasse)

Konstruktor: new AdaptiveReader(dataUrl)

Methoden:
- init(): Lädt JSON, ruft render() und bindEvents()
- render(): Rendert Korpus-Info, Personen, Navigation, Timeline, Brief
- renderLetter(index): Zeigt einen Brief mit Annotationen
- bindEvents(): Keyboard-Navigation, Annotation-Klicks, Referenz-Links

Datenformat erwartet: Objekt mit metadata, persons, letters, timeline

---

### archetypes/scope.js

Verantwortlichkeit: Analytisches Dashboard für multidimensionale Daten.

Export: AdaptiveScope (Klasse)

Konstruktor: new AdaptiveScope(dataUrl)

Methoden:
- init(): Lädt JSON, initialisiert Filter, ruft applyFilters()
- applyFilters(): Filtert und sortiert Daten, ruft render()
- render(): Rendert KPIs, Charts, Korrelationsmatrix, Tabelle
- pearsonCorrelation(x, y): Berechnet Korrelationskoeffizient
- exportCSV(): Generiert CSV-Download

Datenformat erwartet: Objekt mit respondents-Array und Metadaten

---

### archetypes/navigator.js

Verantwortlichkeit: Graph-Visualisierung für vernetzte Daten.

Export: AdaptiveNavigator (Klasse)

Konstruktor: new AdaptiveNavigator(dataUrl)

Methoden:
- init(): Lädt JSON, erstellt Graph, startet Simulation
- processData(): Berechnet In-/Out-Degree für Knoten
- startSimulation(): Initialisiert Force-Directed Layout
- tick(): Physik-Schritt mit requestAnimationFrame
- applyForces(): Center, Repulsion, Link-Attraktion, Layout-Modi
- selectNode(id): Zeigt Node-Details, hebt Kanten hervor

Datenformat erwartet: Objekt mit nodes, edges, clusters, metadata

---

### archetypes/workbench.js

Verantwortlichkeit: Kuratierungs-Interface für hierarchische Daten.

Export: AdaptiveWorkbench (Klasse)

Konstruktor: new AdaptiveWorkbench(dataUrl)

Methoden:
- init(): Lädt JSON, validiert, rendert Tabelle
- validateAll(): Prüft gegen Schema, setzt Fehlerstatus
- renderTable(): Zeigt editierbare Tabelle mit Pagination
- generateQuickFix(): Schlägt Korrektur für bekannte Fehlermuster vor
- undo()/redo(): Implementiert mit Stack
- exportData(format): JSON, CSV oder Validierungsreport

Datenformat erwartet: Objekt mit schema, objects, validation_errors

---

## HTML-zu-JavaScript-Mapping

| HTML-Datei | Script-Tag | Geladene Module | Daten-Datei |
|------------|------------|-----------------|-------------|
| index.html | main.js | matrix.js, workflows.js | - |
| examples/reader.html | archetypes/reader.js | - | data/reader-correspondence.json |
| examples/scope.html | archetypes/scope.js | - | data/scope-survey.json |
| examples/navigator.html | archetypes/navigator.js | - | data/navigator-citations.json |
| examples/workbench.html | archetypes/workbench.js | - | data/workbench-metadata.json |

---

## Datenfluss

Der Datenfluss in jeder Demo-Seite folgt einem einheitlichen Muster:

```
HTML lädt                   JavaScript-Modul
       ↓
DOMContentLoaded            new AdaptiveArchetype(dataUrl)
       ↓
fetch(dataUrl)              → JSON-Daten
       ↓
this.data = response        Speicherung im Klassen-State
       ↓
this.render()               DOM-Manipulation
       ↓
this.bindEvents()           Event-Listener registrieren
       ↓
User-Interaktion            → State-Änderung → re-render()
```

---

## CSS-Architektur

Die CSS-Dateien sind nach Archetyp getrennt, um die Wartbarkeit zu erhöhen.

style.css enthält:
- CSS-Variablen (Design Tokens aus DESIGN.md)
- Basis-Styles (Typography, Layout)
- Matrix-Styles
- Workflow-Styles
- Archetypen-Cards

Die Archetyp-CSS-Dateien enthalten jeweils nur die spezifischen Styles für ihre Demo-Seite.

---

## Erweiterung

Neue Archetypen oder Spezialisierungen folgen dem Muster:

1. Neue Klasse in archetypes/ erstellen mit export class
2. JSON-Datenformat in examples/data/ definieren
3. HTML-Seite mit type="module" Script-Tag
4. CSS-Datei für spezifische Styles
5. Dokumentation in dieser Code Map ergänzen

---

## Verknüpfungen

- [[01-ARCHITEKTUR]] beschreibt die Wissensbasis-Struktur
- [[07-PROTOTYP]] definiert den Prototyp-Auftrag
- [[DESIGN]] enthält die CSS-Variablen-Definitionen
- [[05-ARCHETYPEN]] spezifiziert die konzeptuelle Grundlage der Klassen
