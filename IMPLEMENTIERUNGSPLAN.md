# GRIP Framework: Implementierungsplan

Stand: 2025-12-04

---

## Vision

GRIP ist ein Context Engineering Artifact für LLM-gestützte Interface-Entwicklung. Es beantwortet die Frage: "Welches Interface passt zu meinen Daten und meiner Intention?"

**Kern-Erkenntnis:** Das eigentliche Produkt ist der System Prompt und das mentale Modell. Die Website ist der Beweis, dass das Modell funktioniert. Das LLM ist der primäre "User" des Frameworks.

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

Drei Spezialisierungen pro Archetyp definieren.

Kritischer Hinweis: Spezialisierungen dürfen keine bloßen Labels sein. Jede Spezialisierung muss operationalisiert werden durch:
- Unterscheidende UI-Elemente (was hat Transcript, was Edition nicht hat?)
- Spezifische Datenfelder (welche JSON-Struktur erwartet Monitor vs. Survey?)
- Eigene Heuristiken im System Prompt (wann empfehle ich welche Variante?)

Ohne diese Operationalisierung sind Spezialisierungen nur Taxonomie-Dekoration.

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

Liefergegenstand: 10-SPEZIALISIERUNGEN.md mit vollständiger Operationalisierung

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

### Phase 5: GRIP-Configurator

Nutzer können eigene Daten erkunden und konfigurieren.

Strategische Entscheidung: Keine automatische Schema-Inferenz. Client-side ML für Topologie-Erkennung ist fragil und vermittelt falsche Sicherheit. Stattdessen: manuelle Konfiguration mit intelligenter Unterstützung.

Funktionsumfang:
- JSON-Upload auf jeder Demo-Seite
- Struktur-Preview: Felder anzeigen, Nutzer wählt Spalten für X/Y/Label
- Manuelle Topologie-Angabe mit Erklärung der Optionen
- Export der Konfiguration als wiederverwendbares Template
- Keine Black-Box-Magie, sondern transparente Konfiguration

### Phase 6: Prompt-Generator

GRIP als Prompt-Generator, nicht als Prompt-Executor.

Strategische Entscheidung: Keine direkte LLM-API-Integration. Stattdessen generiert GRIP optimierte Prompts, die Nutzer in ihr bevorzugtes LLM kopieren. Das vermeidet API-Kosten, Vendor-Lock-in und Backend-Komplexität.

Funktionsumfang:
- Projektbeschreibungs-Formular: Nutzer beschreibt Daten und Ziel
- Prompt-Generator: Erzeugt kontextuellen Prompt mit GRIP-Wissen
- Copy-to-Clipboard für ChatGPT, Claude, etc.
- Optionale Beispiel-Konversationen als Referenz

Das LLM bleibt das Werkzeug des Nutzers, nicht eine Black-Box hinter GRIP.

---

## Technische Schulden

Priorisiert nach Dringlichkeit:

**Hoch (vor Phase 5):**
- [ ] JavaScript-Modularisierung: ES6-Module statt globaler Klassen. Ohne diese Refaktorierung wird jede neue Funktionalität die Codebasis fragmentieren. Voraussetzung für Phase 5.

**Mittel:**
- [ ] CSS-Variablen konsolidieren (Duplikate in Archetyp-Stylesheets)
- [ ] Responsive Design für mobile Geräte verbessern

**Niedrig:**
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

Revidierte Reihenfolge nach strategischer Analyse:

| Priorität | Phase | Begründung |
|-----------|-------|------------|
| 1 | System Prompt verfeinern | Das Kernprodukt. Alle anderen Phasen hängen davon ab, dass die Entscheidungslogik robust ist. |
| 2 | Spezialisierungen | Nur sinnvoll mit operationalisierten Unterschieden, nicht als Labels. |
| 3 | Workflow-Visualisierung | Macht Prozess-Perspektive greifbar. |
| 4 | Weitere Datensätze | Demonstriert Breite der Anwendung. |
| 5 | JS-Modularisierung | Technische Voraussetzung für Configurator. |
| 6 | GRIP-Configurator | Ermöglicht echte Nutzung mit eigenen Daten. |
| 7 | Prompt-Generator | Skaliert GRIP-Wissen ohne Backend-Komplexität. |

---

## Metriken für Erfolg

1. **5-Minuten-Test**: Ein Besucher kann nach 5 Minuten erklären, was die Archetypen sind und wie die Matrix funktioniert.

2. **Workflow-Klarheit**: Ein Forscher kann seinen Projekttyp identifizieren und den empfohlenen Workflow nachvollziehen.

3. **Datensatz-Fit**: Nutzer mit eigenem Datensatz können den passenden Archetyp und die passende Spezialisierung finden.

4. **LLM-Konsistenz**: Der System Prompt führt zuverlässig zur richtigen Archetyp-Empfehlung.
