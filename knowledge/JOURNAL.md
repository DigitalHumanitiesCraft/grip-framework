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

---

## 2025-12-04: Strategische Planrevision

Der IMPLEMENTIERUNGSPLAN.md wurde nach kritischer Analyse überarbeitet.

Kern-Erkenntnis: Das eigentliche Produkt ist der System Prompt und das mentale Modell. Die Website ist der Beweis, dass das Modell funktioniert. Das LLM ist der primäre User des Frameworks.

Fünf strategische Änderungen wurden vorgenommen:

1. Spezialisierungen mit Operationalisierungs-Anforderung: Jede Spezialisierung muss unterscheidende UI-Elemente, spezifische Datenfelder und eigene Heuristiken definieren. Ohne diese Substanz sind Spezialisierungen nur Taxonomie-Dekoration.

2. Phase 5 umbenannt zu GRIP-Configurator: Keine automatische Schema-Inferenz. Client-side ML für Topologie-Erkennung ist fragil. Stattdessen manuelle Konfiguration mit Struktur-Preview.

3. Phase 6 umbenannt zu Prompt-Generator: Keine direkte LLM-API-Integration. GRIP generiert Prompts, die Nutzer in ihr bevorzugtes LLM kopieren. Vermeidet API-Kosten und Backend-Komplexität.

4. Technische Schulden priorisiert: JS-Modularisierung als Voraussetzung für Phase 5 eingestuft.

5. Prioritäten revidiert: System Prompt auf Platz 1. Alle anderen Phasen hängen davon ab, dass die Entscheidungslogik robust ist.

---

## 2025-12-04: System Prompt v2.0

Der System Prompt wurde von v1.0 auf v2.0 erweitert.

Neue Inhalte:

1. Vollständige 4×4 Entscheidungsmatrix mit allen 16 Feldern. DIALOG-Felder ersetzen "ambig" für bessere Lesbarkeit.

2. Strukturierte Topologie-Erkennung mit Leitfragen. Sequenziell, Multidimensional, Vernetzt, Hierarchisch.

3. Strukturierte Intentions-Erkennung mit Schlüsselwörtern. Verstehen, Vergleich, Rekonstruktion, Kuratierung.

4. Detailliertes Dialog-Protokoll mit exakten Rückfragen für alle vier ambigen Matrix-Felder.

5. Workflow-Erkennung für Gesamtprojekte. Fünf Referenz-Workflows mit Phasensequenz und Kurzbeschreibung.

6. Überarbeitetes Protokoll unterscheidet jetzt zwischen Datei-Upload und Projektbeschreibung.

Der Prompt ist von 81 auf 157 Zeilen gewachsen. Die Struktur folgt der Nummerierung 1-8 für bessere Navigierbarkeit.

---

## 2025-12-04: Design Rationale

Das Dokument 08-DESIGN-RATIONALE.md wurde erstellt. Es liefert wissenschaftliche Begründungen für Interface-Entscheidungen basierend auf HCI-Forschung.

Vier Abschnitte dokumentieren kognitive Anforderungen pro Archetyp:

1. Reader: Sakkaden-Forschung. Zeilenlänge 60-75 Zeichen, Zeilenhöhe 1.6em, keine Unterstreichungen im Fließtext.

2. Scope: Prä-attentive Wahrnehmung. Small Multiples statt interaktiver Einzel-Charts, semantische Farbkodierung, Filter-Sidebar.

3. Navigator: Hairball-Problem. Filterpflicht ab 50 Knoten, Progressive Disclosure für Labels, mehrere Layout-Modi.

4. Workbench: Mode Awareness. Visuell abgegrenzte Editier-Modi, sofortiges Validierungs-Feedback, Undo/Redo.

Zusätzlich: Design Constraints für LLM-Codegenerierung als harte Regeln formuliert.

---

## 2025-12-04: Spezialisierungen

Das Dokument 10-SPEZIALISIERUNGEN.md wurde erstellt. Es definiert 12 operationalisierte Archetyp-Varianten (drei pro Archetyp).

### Reader-Spezialisierungen

Edition für kritische Textausgaben mit Variantenapparat, Siglenliste und Lemma-Markierungen. Protokoll für Sitzungsmitschriften mit Sprecherwechsel-Markierungen, Beschluss-Highlighting und Tagesordnungsnavigation. Transcript für Interviewtranskripte mit Turn-Taking-Visualisierung, Code-Margin und Timestamp-Syncing.

### Scope-Spezialisierungen

Survey für Umfragedaten mit Likert-Visualisierung, demografischen Filtern und Korrelationsmatrix. Monitor für Echtzeitdaten mit Ampel-Indikatoren, Anomalie-Highlighting und Threshold-Linien. Matrix für Kreuztabellen mit Heatmap-Färbung, Residuen-Anzeige und Chi-Quadrat-Indikator.

### Navigator-Spezialisierungen

Citation für bibliometrische Netzwerke mit Publikationsjahr-Achse, Impact-Indikator und Co-Citation-Hervorhebung. Genealogy für Verwandtschaftsbeziehungen mit Generationen-Layout, Geschlechts-Symbolen und Ahnentafel-Ansichten. Concept für Ontologien mit hierarchischer Baumansicht, Kantentyp-Legende und Pfad-Hervorhebung.

### Workbench-Spezialisierungen

Registry für Sammlungsinventare mit Inventarnummer-Suche, Standort-Hierarchie und Duplikat-Warnung. Codebook für Variablendefinitionen mit Variable-Liste, Werte-Tabelle und Validierungsregeln-Editor. Schema für JSON-Schema-Editierung mit Schema-Tree, Live-Validierung und Fehler-Highlighting.

Jede Spezialisierung ist vollständig operationalisiert mit unterscheidenden UI-Elementen, spezifischen JSON-Datenfeldern und Erkennungsheuristiken für den System Prompt.

---

## 2025-12-04: Workflow-Visualisierung

Die Website wurde um eine interaktive Workflow-Sektion erweitert.

### Neue Komponenten

Workflow-Picker mit fünf Buttons für die Referenz-Workflows (Qualitative Analyse, Literaturreview, Datenbereinigung, Digitale Edition, Survey-Forschung).

Animierte Workflow-Pfade zeigen die Phasensequenz mit farbcodierten Archetyp-Icons. Jede Phase ist klickbar und verlinkt zur entsprechenden Demo-Seite.

Iterationshinweise zeigen an, welche Phasen typischerweise Rücksprünge haben.

User Stories und Zusammenfassungen werden dynamisch unter dem Pfad angezeigt.

### Technische Umsetzung

HTML: Neue Section "workflows" mit Picker-Buttons und Container für dynamischen Content.

CSS: Styles für workflow-picker, workflow-path, workflow-phase, workflow-arrow und workflow-iteration. Responsive Layout für Mobile (vertikale Anordnung).

JavaScript: workflows-Objekt mit allen fünf Workflows, initWorkflows() und renderWorkflow() Funktionen. Phasen-Icons zeigen den ersten Buchstaben des Archetyps.

---

## 2025-12-04: ES6-Modularisierung

Die JavaScript-Architektur wurde auf native ES6-Module umgestellt. Die Entscheidung gegen Build-Tooling (Vite, Webpack) folgt dem Prinzip der Einfachheit.

### Neue Struktur

```
docs/js/
  main.js                 Entry Point für index.html (11 Zeilen)
  modules/
    matrix.js             matrixData, reasonings, initMatrix()
    workflows.js          workflows, initWorkflows()
  archetypes/
    reader.js             export class AdaptiveReader
    scope.js              export class AdaptiveScope
    navigator.js          export class AdaptiveNavigator
    workbench.js          export class AdaptiveWorkbench
  reader-entry.js         Entry Point für reader.html
  scope-entry.js          Entry Point für scope.html
  navigator-entry.js      Entry Point für navigator.html
  workbench-entry.js      Entry Point für workbench.html
```

### Änderungen

main.js wurde von 249 Zeilen auf 11 Zeilen reduziert. Der Code importiert jetzt initMatrix() und initWorkflows() aus den Modulen.

Alle HTML-Dateien verwenden jetzt script type="module".

Die Archetyp-Klassen exportieren jetzt mit export class und export default.

Entry-Point-Dateien instanziieren die Klassen mit den korrekten Datenpfaden.

### Neue Dokumentation

Das Dokument 11-CODE-MAP.md wurde erstellt. Es dokumentiert die JavaScript-Architektur, Modul-Abhängigkeiten, HTML-zu-JS-Mapping und den Datenfluss.

---

## 2025-12-04: Wissensbasis-Analyse

Die 15 Markdown-Dokumente wurden auf Redundanzen und Verbesserungspotenzial analysiert.

### Identifizierte Redundanzen

Archetypen-Beschreibungen existieren dreifach (00-PROJEKTAUFTRAG, 05-ARCHETYPEN, 04-SYSTEM-PROMPT). Die Redundanz im Projektauftrag ist problematisch.

Die Entscheidungsmatrix existiert zweifach (02-MAPPINGS, 04-SYSTEM-PROMPT). Die System-Prompt-Kopie ist notwendig, da der Prompt autark sein muss.

Design-Dokumentation hat Überlappungen zwischen DESIGN.md und 08-DESIGN-RATIONALE.md im Bereich "Organic Academic".

### Verbesserungspotenzial

System Prompt v2.0 fehlt die Spezialisierungs-Heuristiken aus 10-SPEZIALISIERUNGEN.md.

Die Code Map (11-CODE-MAP.md) fehlte und wurde erstellt.

### Status-Übersicht

Aktuell: 00-PROJEKTAUFTRAG, 02-MAPPINGS, 03-BEISPIEL, 05-ARCHETYPEN, 06-DIALOG, 07-PROTOTYP, 09-WORKFLOWS, 10-SPEZIALISIERUNGEN, DESIGN, CLAUDE, CLAUDE-METHODE.

Unvollständig: 01-ARCHITEKTUR (fehlte 11-CODE-MAP), 04-SYSTEM-PROMPT (fehlen Spezialisierungen), 08-DESIGN-RATIONALE (redundant mit DESIGN).

Neu erstellt: 11-CODE-MAP.

---

## 2025-12-04: Wissensbasis-Konsolidierung

Zwei Maßnahmen zur Redundanzbereinigung wurden umgesetzt.

### Projektauftrag verschlankt

Das Dokument 00-PROJEKTAUFTRAG.md enthielt redundante Archetypen-Beschreibungen (13 Zeilen), die bereits ausführlicher in 05-ARCHETYPEN.md dokumentiert sind. Der Abschnitt wurde auf zwei Sätze mit Verweisen zur kanonischen Quelle reduziert.

05-ARCHETYPEN.md ist jetzt die Single Source of Truth für Archetypen-Definitionen.

### System Prompt auf v2.1 aktualisiert

Der System Prompt wurde um die 12 Spezialisierungen aus 10-SPEZIALISIERUNGEN.md erweitert.

Neuer Abschnitt 6 "SPEZIALISIERUNGEN" mit Erkennungsheuristiken für alle drei Varianten pro Archetyp:
- Reader: Edition, Protokoll, Transcript
- Scope: Survey, Monitor, Matrix
- Navigator: Citation, Genealogy, Concept
- Workbench: Registry, Codebook, Schema

Die nachfolgenden Abschnitte wurden renummeriert (7. WORKFLOW-ERKENNUNG, 8. DEIN PROTOKOLL, 9. REGELN).

Version wurde auf 2.1 hochgesetzt.

---

## 2025-12-04: Spezialisierungs-Schemata in Demo-Daten

Die JSON-Dateien der Demo-Seiten wurden aktualisiert, um die Spezialisierungs-Heuristiken aus 10-SPEZIALISIERUNGEN.md zu implementieren. Dies ermöglicht die automatische Erkennung durch den System Prompt.

### Navigator → Citation

Die Datei navigator-citations.json wurde von generischen `nodes`/`edges` auf das Citation-Schema umgestellt:

- `publications` statt `nodes` mit vollständigen bibliografischen Daten (authors, venue, type, citations_received)
- `citations` statt `edges` mit Kontext (context, section)
- `clusters` als Array mit id, label, color, description
- `metrics` mit Netzwerk-Kennzahlen

Erkennbare Felder: `publications`, `citations`, `year` → System Prompt erkennt Citation-Spezialisierung

### Scope → Survey

Die Datei scope-survey.json wurde um das Survey-Schema erweitert:

- `survey_meta` mit n, response_rate, collection_period
- `scales` mit item-Listen und cronbach_alpha
- `items` mit type=likert und vollständiger Skalenbeschreibung
- `demographics` mit Typ-Annotationen (categorical, numeric, ordinal)

Erkennbare Felder: `scales`, `items`, `likert` → System Prompt erkennt Survey-Spezialisierung

### Workbench → Registry

Die Datei workbench-metadata.json wurde um das Registry-Schema erweitert:

- `collection_meta` mit Institution und Objektzahl
- `schema.required_fields` und `schema.controlled_vocabularies`
- `locations` als hierarchische Struktur (building, rooms)
- Erstes Objekt als Referenz mit `inventory_number`, strukturierter `location`, `completeness_score`

Erkennbare Felder: `inventory_number`, `location`, `condition` → System Prompt erkennt Registry-Spezialisierung

### Testbarkeit

Die aktualisierten Daten dienen als Testfälle für den System Prompt v2.1. Wenn ein LLM diese JSONs analysiert, sollte es:

1. Die Topologie korrekt erkennen (vernetzt/multidimensional/hierarchisch)
2. Die Spezialisierung aus den Feldnamen ableiten
3. Die passenden UI-Elemente vorschlagen (Zeitachse für Citation, Likert-Bars für Survey, etc.)

---

## 2025-12-04: Wissensbasis-Destillation

Die Wissensbasis wurde von 16 auf 13 Dokumente konsolidiert. Redundanzen wurden eliminiert, Wissen präziser gefasst.

### Zusammengeführte Dokumente

CLAUDE.md + CLAUDE-METHODE.md → CLAUDE.md
Die Trennung zwischen Regeln und Methode war künstlich. Das neue Dokument enthält beides unter dem Titel "Stilregeln und Methode".

DESIGN.md + 08-DESIGN-RATIONALE.md → DESIGN.md
Design-Spezifikation und kognitive Begründungen gehören zusammen. Jede Entscheidung ist jetzt mit ihrer Begründung dokumentiert. Das neue Dokument enthält sowohl CSS-Tokens als auch HCI-Prinzipien pro Archetyp.

### JavaScript-Fixes

Die ES6-Module wurden an die neuen Spezialisierungs-Schemata angepasst:

navigator.js: Unterstützt jetzt sowohl altes (nodes/edges/clusters als Object) als auch neues Format (publications/citations/clusters als Array). Feldnormalisierung für authors → author.

workbench.js: Unterstützt sowohl altes (key: description string) als auch neues Schema-Format (required_fields, controlled_vocabularies). Objektnormalisierung für inventory_number → id, creator → artist.

### Dokumentenstatus

13 Dokumente total:
- Kerndokumente: 00-PROJEKTAUFTRAG, 05-ARCHETYPEN, 02-MAPPINGS, 06-DIALOG
- Operative: 04-SYSTEM-PROMPT, 03-BEISPIEL, 07-PROTOTYP, 09-WORKFLOWS, 10-SPEZIALISIERUNGEN
- Technisch: 11-CODE-MAP, DESIGN
- Meta: CLAUDE, JOURNAL

Gelöscht: CLAUDE-METHODE.md (in CLAUDE.md integriert), 08-DESIGN-RATIONALE.md (in DESIGN.md integriert)