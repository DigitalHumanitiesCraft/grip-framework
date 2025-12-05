# JOURNAL: Entwicklungschronik

Dieses Dokument protokolliert Entscheidungen und deren Begründungen. Für Dateistrukturen siehe [[11-CODE-MAP]].

---

## 2025-12-04: Projektstart

Das Repository enthielt fünf Konzeptdokumente ohne lauffähige Software.

**Erkenntnis:** GRIP ist primär eine Wissensbasis für LLM-gestützte Entwicklung, kein klassisches Software-Projekt. Das eigentliche Produkt ist der System-Prompt und das mentale Modell.

**Entscheidung:** Praxistest vor weiterer Dokumentation. Master System Prompt als erste Implementierung.

---

## 2025-12-04: Wissensbasis-Konsolidierung

Vier Archetypen (Reader, Scope, Navigator, Workbench) mit klaren Grenzen definiert. Alte Terminologie (sechs Module, Datentypen) durch neue ersetzt (vier Archetypen, vier Topologien).

**Entscheidungen:**
- 4×4-Matrix als Kernstruktur: 4 primäre, 8 sekundäre, 4 ambige Zuordnungen
- Ambige Fälle erfordern Dialog statt automatischer Zuweisung
- Spezialisierungen müssen operationalisiert sein (UI-Elemente, Datenfelder, Heuristiken)

**Dokumente:** 00-PROJEKTAUFTRAG bis 06-DIALOG, später 10-SPEZIALISIERUNGEN

---

## 2025-12-04: Design-System "Organic Academic"

**Entscheidungen:**
- Paper Sand (#FDFBF7) statt hartem Weiß (reduziert Augenbelastung)
- Lora Serif für Lesetexte, Inter Sans für UI (Lesbarkeit vs. Kompaktheit)
- Terracotta (#C4705A) für Dialog-Zellen statt Warn-Gelb (semantisch korrekt)
- Asymmetrische Border-Radii für organischen Charakter

**Kognitive Prinzipien pro Archetyp:**
- Reader: Zeilenlänge 60-75 Zeichen, keine Unterstreichungen
- Scope: Small Multiples, prä-attentive Farbkodierung
- Navigator: Filterpflicht ab 50 Knoten, Progressive Disclosure
- Workbench: Mode Awareness, sofortiges Validierungs-Feedback

---

## 2025-12-04: Adaptive Interfaces

Statische Demo-Seiten zu dynamischen, JSON-basierten Interfaces umgebaut.

**Entscheidungen:**
- ES6-Module ohne Build-Tooling (Einfachheit > Optimierung)
- Fetch-Pfade relativ zur HTML-Datei, nicht zur JS-Datei
- Jede Klasse: init() → render() → bindEvents() → bindKeyboard()
- Keyboard-Navigation: Cmd/Ctrl + 1-4 für Moduswechsel

**Technische Lösungen:**
- Force-Directed Layout ohne D3-Dependency (AdaptiveNavigator)
- Pearson-Korrelation client-side (AdaptiveScope)
- Undo/Redo mit Stack (AdaptiveWorkbench)

---

## 2025-12-04: 12 Spezialisierungen

Skeleton-Implementierung für alle 12 Spezialisierungen (3 pro Archetyp).

**Entscheidung:** Jede Spezialisierung orientiert sich an wissenschaftlichen Standards:

| Spezialisierung | Standard | Erkennungsfelder |
|-----------------|----------|------------------|
| Edition | TEI P5 | witnesses, apparatus, siglum |
| Protokoll | Akoma Ntoso | session, agenda, speaker |
| Transcript | EXMARaLDA | turns, start_ms, codes |
| Survey | DDI-C | scales, items, likert |
| Monitor | SensorThings | thresholds, alerts, readings |
| Matrix | SDMX-JSON | dimensions.rows, cells |
| Citation | MODS | publications, citations |
| Genealogy | GEDCOM X | persons, parent_child |
| Concept | SKOS | concepts, broader, narrower |
| Registry | LIDO | inventory_number, location |
| Codebook | DDI-Lifecycle | variables, valid_values |
| Schema | JSON Schema | $schema, properties |

---

## 2025-12-04: Modi-Taxonomie

Die dritte Ebene der Interface-Hierarchie wurde definiert: Archetyp → Spezialisierung → Modus.

**Entscheidung:** 4 Modi pro Spezialisierung = 48 Modi total. Ein Modus ist eine Perspektive auf denselben Datensatz. Der Modus ändert die Darstellung, nicht die Daten.

**UI-Pattern:** Tab-Leiste, Cmd/Ctrl + 1-4, State-Erhaltung beim Wechsel.

---

## 2025-12-05: Modi-Implementierung

24 von 48 Modi implementiert (50%).

### Phase 1: Edition, Survey, Citation

**Technische Lösungen:**
- Survey-Skalen: Cronbach's Alpha mit Varianz-Kovarianz-Methode
- Citation-Netzwerk: Force-Directed mit Repulsion/Attraktion, SVG-basiert
- Citation-Ego: BFS für Nachbarschaftsberechnung, radiale Positionierung

### Phase 2: Protokoll, Transcript, Monitor

**Entscheidungen:**
- Transcript-Partitur: Mehrspurige Darstellung statt Tabelle (bessere Zeitachsen-Lesbarkeit)
- Monitor-Korrelation: Lag-Slider statt fester Offset (flexiblere Analyse)
- Monitor-Dashboard: Auto-Refresh konfigurierbar (60s Default)

**Technische Lösungen:**
- SVG-Charts statt Canvas (bessere CSS-Integration)
- Anomalie-Score als Bar-Chart mit Threshold-Linie

---

## Learnings

1. **Fetch-Pfade:** Relativ zur HTML-Datei, nicht zur JS-Datei
2. **ID-Konsistenz:** Nach HTML-Refactoring alle JS-Referenzen prüfen
3. **ES6-Module:** Nach Migration alte Standalone-Versionen löschen
4. **Kommunikation:** Sachlich und präzise, keine Marketing-Sprache

---

## Aktueller Stand (2025-12-05)

### Wissensbasis
17 Markdown-Dokumente: 4 Archetypen, 12 Spezialisierungen, 48 Modi

### Modi-Implementierung

| Spezialisierung | Status | | Spezialisierung | Status |
|-----------------|--------|-|-----------------|--------|
| Edition | ✅ 4/4 | | Matrix | ⏳ 0/4 |
| Survey | ✅ 4/4 | | Genealogy | ⏳ 0/4 |
| Citation | ✅ 4/4 | | Concept | ⏳ 0/4 |
| Protokoll | ✅ 4/4 | | Registry | ⏳ 0/4 |
| Transcript | ✅ 4/4 | | | |
| Monitor | ✅ 4/4 | | | |

**Fortschritt: 24/48 Modi (50%)**

### Nächste Schritte

1. Matrix-Modi (Tabelle, Heatmap, Residuen, Pivot)
2. Genealogy-Modi (Stammbaum, Ahnentafel, Familienblatt, Zeitstrahl)
3. Concept-Modi (Hierarchie, Graph, Definition, Mapping)
4. Registry-Modi (Liste, Karteikarte, Standort, Zustand)
