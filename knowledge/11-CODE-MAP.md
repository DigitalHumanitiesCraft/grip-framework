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
    specializations/            Spezialisierungs-CSS
      edition.css               Edition (Reader)
      protokoll.css             Protokoll (Reader)
      transcript.css            Transcript (Reader)
      survey.css                Survey (Scope)
      monitor.css               Monitor (Scope)
      matrix.css                Matrix (Scope)
      citation.css              Citation (Navigator)
      genealogy.css             Genealogy (Navigator)
      concept.css               Concept (Navigator)
      registry.css              Registry (Workbench)
      codebook.css              Codebook (Workbench)
      schema.css                Schema (Workbench)
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
    specializations/            Spezialisierungs-Module
      edition.js                Edition-Klasse
      edition-entry.js          Entry Point
      protokoll.js              Protokoll-Klasse
      protokoll-entry.js        Entry Point
      transcript.js             Transcript-Klasse
      transcript-entry.js       Entry Point
      survey.js                 Survey-Klasse
      survey-entry.js           Entry Point
      monitor.js                Monitor-Klasse
      monitor-entry.js          Entry Point
      matrix.js                 Matrix-Klasse
      matrix-entry.js           Entry Point
      citation.js               Citation-Klasse
      citation-entry.js         Entry Point
      genealogy.js              Genealogy-Klasse
      genealogy-entry.js        Entry Point
      concept.js                Concept-Klasse
      concept-entry.js          Entry Point
      registry.js               Registry-Klasse
      registry-entry.js         Entry Point
      codebook.js               Codebook-Klasse
      codebook-entry.js         Entry Point
      schema.js                 Schema-Klasse
      schema-entry.js           Entry Point
  examples/
    reader.html                 Reader-Demo (Basis)
    scope.html                  Scope-Demo (Basis)
    navigator.html              Navigator-Demo (Basis)
    workbench.html              Workbench-Demo (Basis)
    reader-edition.html         Edition-Spezialisierung
    reader-protokoll.html       Protokoll-Spezialisierung
    reader-transcript.html      Transcript-Spezialisierung
    scope-survey.html           Survey-Spezialisierung
    scope-monitor.html          Monitor-Spezialisierung
    scope-matrix.html           Matrix-Spezialisierung
    navigator-citation.html     Citation-Spezialisierung
    navigator-genealogy.html    Genealogy-Spezialisierung
    navigator-concept.html      Concept-Spezialisierung
    workbench-registry.html     Registry-Spezialisierung
    workbench-codebook.html     Codebook-Spezialisierung
    workbench-schema.html       Schema-Spezialisierung
    data/
      reader-correspondence.json    Arendt-Jaspers Korrespondenz
      reader-edition.json           TEI-Edition (Faust)
      reader-protokoll.json         Akoma Ntoso Protokoll
      reader-transcript.json        EXMARaLDA Interview
      scope-survey.json             DDI-C Umfragedaten
      scope-monitor.json            SensorThings Zeitreihen
      scope-matrix.json             SDMX Kreuztabelle
      navigator-citations.json      MODS Zitationsnetzwerk
      navigator-genealogy.json      GEDCOM X Stammbaum
      navigator-concept.json        SKOS Ontologie
      workbench-metadata.json       LIDO Sammlungsdaten
      workbench-codebook.json       DDI-Lifecycle Codebook
      workbench-schema.json         JSON Schema Definition
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

## Spezialisierungs-Module

Die 12 Spezialisierungen erweitern die 4 Basis-Archetypen für spezifische wissenschaftliche Methoden.

### Architektur-Prinzip

Jede Spezialisierung besteht aus:
- entry.js: Lädt die Klasse und initialisiert bei DOMContentLoaded
- klasse.js: Erweitert oder spezialisiert den Basis-Archetyp
- HTML: Spezifische UI-Elemente gemäß 10-SPEZIALISIERUNGEN.md
- CSS: Spezialisierungs-spezifische Styles
- JSON: Datensatz im standardkonformen Format (siehe 12-STANDARDS.md)

### Spezialisierungs-zu-Standard-Mapping

| Spezialisierung | Basis | Standard | Erkennungsheuristik |
|-----------------|-------|----------|---------------------|
| Edition | Reader | TEI P5 | witnesses, apparatus, siglum |
| Protokoll | Reader | Akoma Ntoso | session, agenda, speaker |
| Transcript | Reader | EXMARaLDA | turns, start_ms, codes |
| Survey | Scope | DDI-C | scales, items, likert |
| Monitor | Scope | SensorThings | thresholds, alerts, readings |
| Matrix | Scope | SDMX-JSON | dimensions.rows, cells |
| Citation | Navigator | MODS | publications, citations |
| Genealogy | Navigator | GEDCOM X | persons, parent_child |
| Concept | Navigator | SKOS | concepts, broader, narrower |
| Registry | Workbench | LIDO | inventory_number, location |
| Codebook | Workbench | DDI-Lifecycle | variables, valid_values |
| Schema | Workbench | JSON Schema | $schema, properties |

---

## Parser-Module (geplant)

Die Parser konvertieren Standardformate in GRIP-JSON:

```
Input-Datei (XML/JSON/CSV)
    ↓
Container-Erkennung (Endung/MIME)
    ↓
Inhalts-Scanning (Tags/Keys)
    ↓
Standard-Parser auswählen
    ↓
GRIP-JSON erzeugen
    ↓
Spezialisierung erkennen
    ↓
Interface laden
```

Geplante Parser in js/parsers/:
- tei-parser.js, akoma-parser.js, exmaralda-parser.js
- ddi-parser.js, sdmx-parser.js, sensorthings-parser.js
- mods-parser.js, gedcom-parser.js, skos-parser.js
- lido-parser.js

---

## Erweiterung

Neue Spezialisierungen folgen dem Muster:

1. Spezialisierung in 10-SPEZIALISIERUNGEN.md dokumentieren
2. Standard-Mapping in 12-STANDARDS.md ergänzen
3. Klasse in js/specializations/ erstellen
4. HTML-Template mit spezifischen UI-Elementen
5. CSS-Datei für spezialisierungsspezifische Styles
6. JSON-Referenzdatensatz im Standardformat
7. Parser-Modul für Import (optional)
8. Dokumentation in dieser Code Map ergänzen

---

## Verknüpfungen

- [[01-ARCHITEKTUR]] beschreibt die Wissensbasis-Struktur
- [[07-PROTOTYP]] definiert den Prototyp-Auftrag
- [[10-SPEZIALISIERUNGEN]] spezifiziert UI-Elemente und Erkennungsheuristiken
- [[12-STANDARDS]] definiert Standard-Mappings und Parser-Architektur
- [[DESIGN]] enthält die CSS-Variablen-Definitionen
- [[05-ARCHETYPEN]] spezifiziert die konzeptuelle Grundlage der Klassen
