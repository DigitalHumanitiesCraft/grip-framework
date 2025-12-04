# GRIP Framework: Implementierungsplan

Stand: 2025-12-04

---

## Vision

GRIP ist ein Context Engineering Artifact für LLM-gestützte Interface-Entwicklung. Es beantwortet die Frage: "Welches Interface passt zu meinen Daten und meiner Intention?"

---

## Abgeschlossen

### Wissensbasis (knowledge/)

- [x] 00-PROJEKTAUFTRAG.md - Vision und Grundannahmen
- [x] 01-ARCHITEKTUR.md - Dokumentstruktur und Abhängigkeiten
- [x] 02-MAPPINGS.md - 4×4 Matrix (Topologie × Intention → Archetyp)
- [x] 03-BEISPIEL.md - Anwendungsbeispiel
- [x] 04-SYSTEM-PROMPT.md - Kondensierter LLM-Prompt
- [x] 05-ARCHETYPEN.md - Spezifikation der vier Grundformen
- [x] 06-DIALOG.md - Rückfrage-Protokoll bei Ambiguität
- [x] 07-PROTOTYP.md - Selbstreferenzieller Prototyp-Auftrag
- [x] 09-WORKFLOWS.md - Pfade durch die Archetypen
- [x] DESIGN.md - Organic Academic Design-System
- [x] JOURNAL.md - Entwicklungstagebuch
- [x] CLAUDE.md - Stilrichtlinien

### Website-Prototyp (docs/)

- [x] index.html - Hauptseite mit interaktiver 4×4 Matrix
- [x] Archetypen-Cards mit Demo-Links
- [x] Organic Academic Design-System implementiert

### Adaptive Demo-Seiten (docs/examples/)

- [x] reader.html - Korrespondenz Arendt/Jaspers
  - AdaptiveReader-Klasse
  - Positionsbasierte Annotationen
  - Timeline mit historischen Perioden
  - Brief-Referenzen

- [x] scope.html - Mitarbeiterbefragung Digitalisierung
  - AdaptiveScope-Klasse
  - Echtzeit-Aggregation aus 120 Rohdatensätzen
  - Pearson-Korrelationsmatrix
  - KPI-Cards, Filter, Pagination

- [x] navigator.html - Zitationsnetzwerk
  - AdaptiveNavigator-Klasse
  - Force-Directed Layout (ohne D3)
  - Drei Layout-Modi (Force, Radial, Cluster)
  - Physik-Simulation mit Alpha-Decay

- [x] workbench.html - Sammlungsmetadaten
  - AdaptiveWorkbench-Klasse
  - Auto-Validierung gegen Schema
  - Quick-Fix und Batch-Operationen
  - Undo/Redo, Multi-Export

### Beispieldaten (docs/examples/data/)

- [x] reader-correspondence.json - 5 fiktive Briefe
- [x] scope-survey.json - 120 Umfrage-Rohdaten
- [x] navigator-citations.json - 10 Publikationen, 19 Kanten
- [x] workbench-metadata.json - 25 Kunstobjekte mit Fehlern

### Dokumentation auf Demo-Seiten

- [x] Info-Boxen mit Datensatz, Visualisierung, User Story
- [x] Matrix-Erklärung im Footer jeder Demo

---

## Offen

### Phase 1: Spezialisierungen dokumentieren

Drei Spezialisierungen pro Archetyp definieren:

**Reader-Spezialisierungen:**
- Edition (Briefe, Manuskripte mit Annotationen)
- Protokoll (Sitzungsprotokolle, Verlaufsdokumentation)
- Transcript (Interview-Transkripte, qualitative Daten)

**Scope-Spezialisierungen:**
- Survey (Umfragedaten, Befragungen)
- Monitor (Zeitreihen, KPI-Dashboards)
- Matrix (Fälle × Kategorien, Fallvergleich)

**Navigator-Spezialisierungen:**
- Citation (Zitationsnetzwerke)
- Genealogy (Stammbäume, Ableitungsbeziehungen)
- Concept (Begriffsnetze, Ontologien, Code-Systeme)

**Workbench-Spezialisierungen:**
- Registry (Sammlungsmetadaten, Objektdaten)
- Codebook (Variablendefinitionen, Skalendokumentation)
- Schema (Datenmodell-Validierung, Strukturprüfung)

Liefergegenstand: 10-SPEZIALISIERUNGEN.md

### Phase 2: Workflow-Visualisierung

Workflows auf der Website interaktiv darstellen:

- Workflow-Picker: "Was machst du?" → Empfohlene Sequenz
- Animierte Pfade durch die Archetypen
- Klickbare Phasen verlinken zu Demo-Seiten
- Iteration-Loops visualisieren

Liefergegenstand: docs/workflows.html + docs/js/workflows.js

### Phase 3: System Prompt verfeinern

04-SYSTEM-PROMPT.md erweitern um:

- Workflow-Erkennung: "User beschreibt Projekt" → Workflow vorschlagen
- Spezialisierungs-Auswahl: Passende Variante des Archetyps
- Multi-Phase-Unterstützung: Kontext über Phasenwechsel bewahren

### Phase 4: Weitere Demo-Datensätze

Pro Spezialisierung einen Beispiel-Datensatz:

- reader-transcript.json (Interview für qualitative Analyse)
- scope-timeseries.json (Zeitreihen für Monitoring)
- navigator-genealogy.json (Stammbaum oder Begriffshierarchie)
- workbench-codebook.json (Variablendefinitionen)

### Phase 5: Daten-Upload-Feature

Nutzer können eigene Daten hochladen:

- JSON-Upload auf jeder Demo-Seite
- Automatische Topologie-Erkennung
- Schema-Inferenz für Workbench
- Export der angepassten Konfiguration

### Phase 6: LLM-Integration

Direkte Verbindung zum LLM für:

- Natürlichsprachliche Beschreibung → Matrix-Abfrage
- Automatische Archetyp-Empfehlung mit Begründung
- Rückfragen bei ambigen Fällen
- Workflow-Begleitung über mehrere Phasen

---

## Technische Schulden

- [ ] CSS-Variablen konsolidieren (Duplikate in Archetyp-Stylesheets)
- [ ] JavaScript-Module statt globaler Klassen
- [ ] Responsive Design für mobile Geräte verbessern
- [ ] Accessibility-Audit (ARIA, Keyboard-Navigation)
- [ ] Performance-Optimierung für große Datensätze

---

## Nicht im Scope

- Backend-Server (bleibt statische Website)
- Benutzerkonten oder Persistenz
- Echtzeit-Kollaboration
- Native Apps

---

## Prioritäten

| Priorität | Phase | Begründung |
|-----------|-------|------------|
| 1 | Spezialisierungen | Zeigt Tiefe des Frameworks |
| 2 | Workflow-Visualisierung | Macht Prozess-Perspektive greifbar |
| 3 | Weitere Datensätze | Demonstriert Breite der Anwendung |
| 4 | System Prompt | Verbessert LLM-Nutzung |
| 5 | Daten-Upload | Ermöglicht echte Nutzung |
| 6 | LLM-Integration | Volles Potenzial des Frameworks |

---

## Metriken für Erfolg

1. **5-Minuten-Test**: Ein Besucher kann nach 5 Minuten erklären, was die Archetypen sind und wie die Matrix funktioniert.

2. **Workflow-Klarheit**: Ein Forscher kann seinen Projekttyp identifizieren und den empfohlenen Workflow nachvollziehen.

3. **Datensatz-Fit**: Nutzer mit eigenem Datensatz können den passenden Archetyp und die passende Spezialisierung finden.

4. **LLM-Konsistenz**: Der System Prompt führt zuverlässig zur richtigen Archetyp-Empfehlung.
