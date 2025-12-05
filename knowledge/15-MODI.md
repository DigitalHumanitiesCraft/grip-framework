# Modi: Dritte Ebene der Interface-Taxonomie

Dieses Dokument definiert die Modi für alle 12 Spezialisierungen. Ein Modus ist eine Perspektive auf denselben Datensatz innerhalb einer Spezialisierung.

Abhängigkeiten: [[05-ARCHETYPEN]], [[10-SPEZIALISIERUNGEN]]

---

## Terminologie

| Ebene | Begriff | Beispiel | Wechsel-Logik |
|-------|---------|----------|---------------|
| 1 | Archetyp | Reader | Datentypwechsel |
| 2 | Spezialisierung | Edition | Domänenwechsel |
| 3 | Modus | Synopse | Perspektivwechsel |

Ein Modus ändert die Darstellung, nicht die Daten. Nutzende wechseln zwischen Modi über Tabs, Toggles oder Tastenkürzel.

---

## Reader-Modi

### Edition

| Modus | Relevanz | Benötigte Daten | Innovation |
|-------|----------|-----------------|------------|
| **Synopse** | Textzeugenvergleich ist Kernaufgabe der Textkritik. Parallele Darstellung zeigt Abweichungen sofort. | `witnesses[]`, `text_flow`, Alignierung zwischen Zeugen | Lock-Scroll synchronisiert beliebig viele Spalten. Diff-Highlighting berechnet Abweichungen on-the-fly statt statischer Markierung. |
| **Apparat** | Klassische Editionsform. Lesetext oben, Varianten unten. Für lineare Lektüre mit optionalem Detailzugriff. | `text_flow`, `apparatus[]` mit `lemma`, `readings`, `witness` | Hover-Preview zeigt Varianten inline ohne Scrollsprung. Variantenfilter nach Zeugengruppen reduziert Komplexität. |
| **Genetik** | Entstehungsprozess eines Textes nachvollziehen. Relevant für Autorschaftsforschung und Werkgenese. | `layers[]` mit `hand`, `phase`, `corrections` | Zeitstrahl-Slider blendet Schichten ein/aus. Farbcodierung unterscheidet Hände visuell. |
| **Faksimile** | Verbindung von Transkription und Bildquelle. Verifizierung am Original. | `facsimile_url`, `zone_coordinates`, Text-Bild-Mapping | Klick auf Text scrollt zum Bildausschnitt. Transparenz-Overlay legt Transkription über Scan. |

### Protokoll

| Modus | Relevanz | Benötigte Daten | Innovation |
|-------|----------|-----------------|------------|
| **Chronologie** | Sitzungsverlauf in Echtzeit-Abfolge. Für Prozessanalyse und Narrativ. | `segments[]` mit `timestamp`, `speaker`, `type` | Timeline-Scrubber springt zu Zeitpunkten. Redezeitbalken zeigt Sprechanteile. |
| **Sprecher** | Wer sagt was? Für Akteuranalyse und Positionsvergleich. | `speakers[]`, Zuordnung `segment.speaker_id` | Sprecher-Filter isoliert einzelne Stimmen. Sprechernetzwerk zeigt Interaktionsmuster. |
| **Abstimmung** | Entscheidungsfindung nachvollziehen. Für Politikanalyse. | `votes[]` mit `motion`, `result`, `breakdown` | Abstimmungsmatrix zeigt Fraktionsverhalten. Vergleich über Sitzungen hinweg. |
| **Agenda** | Strukturierter Zugang über Tagesordnung. Für gezielte Recherche. | `agenda_items[]`, Verlinkung zu `segments` | Klick auf TOP springt zum Segment. Fortschrittsanzeige zeigt Sitzungsstand. |

### Transcript

| Modus | Relevanz | Benötigte Daten | Innovation |
|-------|----------|-----------------|------------|
| **Partitur** | Überlappende Rede darstellen. Standard in Gesprächsforschung. | `turns[]` mit `start_ms`, `end_ms`, Sprecher-Tracks | Mehrspur-Darstellung wie Notensystem. Zoom auf Millisekunden-Ebene. |
| **Fließtext** | Lesbare Darstellung für Inhaltsanalyse. Weniger technisch. | `turns[]`, optional `codes[]` | Sprecherwechsel-Markierung. Codierungen als Marginalien. |
| **Codierung** | Qualitative Analyse mit Kategorien. Für Grounded Theory. | `codes[]`, `codebook`, Segment-Code-Zuordnung | Drag-and-Drop-Codierung. Code-Co-Occurence-Matrix. Codebook-Editor integriert. |
| **Audio-Sync** | Transkript mit Audioquelle verbinden. Für Verifikation. | `audio_url`, `time_anchors` | Klick auf Text spielt Audio ab. Karaoke-Highlighting während Wiedergabe. |

---

## Scope-Modi

### Survey

| Modus | Relevanz | Benötigte Daten | Innovation |
|-------|----------|-----------------|------------|
| **Fragebogen** | Instrument nachvollziehen. Für Methodendokumentation. | `items[]`, `scales[]`, `routing_logic` | Interaktiver Fragebogen-Prototyp. Filterführung visualisiert. |
| **Verteilung** | Antwortverteilungen explorieren. Für deskriptive Statistik. | `responses[]`, `variable_stats` | Histogramme mit Vergleichsgruppen. Schieberegler für Subgruppen. |
| **Skalen** | Skalenkonstruktion prüfen. Für Reliabilitätsanalyse. | `scales[]`, `items[]`, `cronbach_alpha`, `factor_loadings` | Item-Korrelationsmatrix. Cronbach-Alpha live bei Item-Ausschluss. |
| **Codebook** | Variablendokumentation lesen. Für Sekundäranalyse. | `variables[]`, `value_labels`, `missing_definitions` | Such- und Filterbare Variablenliste. SPSS/Stata-Export. |

### Monitor

| Modus | Relevanz | Benötigte Daten | Innovation |
|-------|----------|-----------------|------------|
| **Dashboard** | Echtzeit-Überblick. Für Betriebsmonitoring. | `datastreams[]`, `current_values`, `thresholds` | Ampel-Kacheln für Status. Auto-Refresh konfigurierbar. |
| **Timeline** | Zeitreihenanalyse. Für Trendidentifikation. | `observations[]` mit Zeitstempel und Wert | Zoom/Pan auf Zeitachse. Mehrere Streams überlagern. Annotations für Events. |
| **Anomalie** | Ausreißer identifizieren. Für Qualitätskontrolle. | `anomaly_scores[]`, `normal_range`, `alerts[]` | Automatische Markierung. Schwellwert-Editor. Alert-Historie. |
| **Korrelation** | Zusammenhänge zwischen Streams. Für Ursachenanalyse. | Mindestens 2 `datastreams[]` mit überlappenden Zeiträumen | Scatter-Plot mit Zeitfärbung. Lag-Korrelation berechnen. |

### Matrix

| Modus | Relevanz | Benötigte Daten | Innovation |
|-------|----------|-----------------|------------|
| **Tabelle** | Klassische Kreuztabelle. Für exakte Werte. | `dimensions`, `cells[]` mit `row`, `column`, `value` | Sortierbar nach jeder Dimension. Summenzeilen/-spalten. |
| **Heatmap** | Muster visuell erkennen. Für große Matrizen. | `cells[]` mit numerischen Werten | Farbskala konfigurierbar. Hover zeigt Wert. Zeilen/Spalten clustern. |
| **Residuen** | Statistische Abweichungen. Für Signifikanzanalyse. | `cells[]` mit `expected`, `residual`, `chi_contribution` | Färbung nach Residuengröße. Chi-Quadrat-Zerlegung visualisiert. |
| **Pivot** | Dimensionen umordnen. Für explorative Analyse. | `dimensions[]`, `measures[]`, `cells[]` | Drag-and-Drop Dimensionen. Aggregationsfunktion wählbar. |

---

## Navigator-Modi

### Citation

| Modus | Relevanz | Benötigte Daten | Innovation |
|-------|----------|-----------------|------------|
| **Netzwerk** | Zitationsbeziehungen als Graph. Für Überblick. | `nodes[]` (Publikationen), `edges[]` (Zitationen) | Force-Layout. Cluster-Erkennung. Zoom auf Subgraph. |
| **Timeline** | Publikationen chronologisch. Für Entwicklungslinien. | `nodes[]` mit `year`, `edges[]` | Zeitleiste mit Verbindungslinien. Filtert nach Zeitraum. |
| **Bibliometrie** | Metriken und Rankings. Für Evaluation. | `nodes[]` mit `citations_received`, `h_index`, `cluster` | Sortierbare Tabelle. Vergleich zwischen Entitäten. Trendkurven. |
| **Ego-Netzwerk** | Eine Publikation im Zentrum. Für tiefe Analyse. | Fokus-Node, 1-2 Grad Nachbarn | Radiales Layout. Zitiert-von vs. zitiert Trennung. Co-Citation-Cluster. |

### Genealogy

| Modus | Relevanz | Benötigte Daten | Innovation |
|-------|----------|-----------------|------------|
| **Stammbaum** | Deszendenz einer Person. Für Nachkommenforschung. | `persons[]`, `relationships[]` mit `type: ParentChild` | Expandierbarer Baum. Generationen-Ebenen. Partner einblendbar. |
| **Ahnentafel** | Vorfahren einer Person. Für Ahnenforschung. | `persons[]`, `relationships[]` aufwärts | Fächerdiagramm oder Tabelle. Ahnenverlust markiert. |
| **Familienblatt** | Einzelperson mit Kontext. Für Detailarbeit. | `person` mit `events[]`, `sources[]`, `notes` | Lebenslauf-Timeline. Quellenverweise. Editierbar. |
| **Zeitstrahl** | Lebensspannen parallel. Für Generationenvergleich. | `persons[]` mit `birth`, `death` | Gantt-artige Darstellung. Überlappungen sichtbar. Events markiert. |

### Concept

| Modus | Relevanz | Benötigte Daten | Innovation |
|-------|----------|-----------------|------------|
| **Hierarchie** | Taxonomie als Baum. Für Navigation. | `concepts[]`, `relations[]` mit `broader/narrower` | Expandierbarer Baum. Breadcrumb-Navigation. Multi-Hierarchie-Support. |
| **Graph** | Alle Relationstypen. Für Komplexität. | `concepts[]`, `relations[]` inkl. `related`, `seeAlso` | Force-Layout. Kantentypen farbcodiert. |
| **Definition** | Ein Begriff im Detail. Für Verständnis. | `concept` mit `definition`, `scope_notes`, `examples` | Kartenansicht. Verwandte Begriffe als Links. Mehrsprachigkeit. |
| **Mapping** | Brücken zwischen Vokabularen. Für Interoperabilität. | `concepts[]`, `mappings[]` mit `exactMatch`, `closeMatch` | Zwei-Spalten-Ansicht. Match-Typen visualisiert. |

---

## Workbench-Modi

### Registry

| Modus | Relevanz | Benötigte Daten | Innovation |
|-------|----------|-----------------|------------|
| **Liste** | Objektübersicht. Für Bestandsmanagement. | `objects[]` mit Kerndaten | Filterbar, sortierbar. Bulk-Aktionen. Spalten konfigurierbar. |
| **Karteikarte** | Einzelobjekt bearbeiten. Für Dokumentation. | `object` mit allen Feldern, `controlled_vocabularies` | Formular mit Validierung. Vokabular-Autocomplete. Änderungshistorie. |
| **Standort** | Physische Verortung. Für Logistik. | `objects[]` mit `location`, optional Raumplan | Baumansicht (Gebäude/Raum/Regal). Drag-and-Drop Umlagerung. |
| **Zustand** | Erhaltungsstatus. Für Konservierung. | `objects[]` mit `condition`, `condition_notes`, `assessments[]` | Ampelsystem. Restaurierungspriorität. Fotodokumentation. |

### Codebook

| Modus | Relevanz | Benötigte Daten | Innovation |
|-------|----------|-----------------|------------|
| **Variablenliste** | Überblick aller Variablen. Für Navigation. | `variables[]` mit Basisdaten | Such- und filterbar. Gruppierung. Sortierung. |
| **Variablendetail** | Eine Variable bearbeiten. Für Dokumentation. | `variable` mit `valid_values`, `missing_values`, `question_text` | Inline-Editing. Wertelabel-Editor. Fragetextzuordnung. |
| **Validierung** | Datenqualität prüfen. Für QA. | `variables[]` mit `validation_rules`, `error_counts` | Regeleditor. Fehlerprotokoll. Batch-Korrektur. |
| **Export** | Maschinenlesbare Ausgabe. Für Nachnutzung. | Alle Variablen | DDI-XML, SPSS-Syntax, Stata-Do-File. Vorschau und Download. |

### Schema

| Modus | Relevanz | Benötigte Daten | Innovation |
|-------|----------|-----------------|------------|
| **Struktur** | Schema als Baum. Für Überblick. | `schema_definition` mit `properties`, `$defs` | Expandierbare Hierarchie. Typen farbcodiert. Required markiert. |
| **Editor** | Schema bearbeiten. Für Entwicklung. | `schema_definition` | JSON-Editor mit IntelliSense. Drag-and-Drop Properties. Visual Builder. |
| **Validator** | Daten gegen Schema prüfen. Für Test. | `schema_definition`, Test-Input | Live-Validierung. Fehler inline markiert. Beispieldaten generieren. |
| **Diff** | Schemaversionen vergleichen. Für Evolution. | Zwei `schema_definition` Versionen | Side-by-Side. Breaking Changes markiert. Migration-Hints. |

---

## Modus-Wechsel im Interface

### UI-Pattern

Der Moduswechsel erfolgt über:

1. **Tab-Leiste**: Horizontal unter dem Spezialisierungs-Header
2. **Tastenkürzel**: Cmd/Ctrl + 1-4 für Modi 1-4
3. **Kontextmenü**: Rechtsklick auf Datenelement bietet relevante Modi an

### State-Erhaltung

Beim Moduswechsel bleiben erhalten:
- Aktuelle Selektion (z.B. fokussierter Textzeuge)
- Scroll-Position wo sinnvoll
- Filter- und Sortiereinstellungen

### Deep Links

URLs codieren Spezialisierung und Modus:
```
/edition/synopse?witnesses=A,B,C
/citation/network?focus=doi:10.1234/xyz
/registry/karteikarte?inv=INV-001
```

---

## Zusammenfassung

| Spezialisierung | Modi |
|-----------------|------|
| Edition | Synopse, Apparat, Genetik, Faksimile |
| Protokoll | Chronologie, Sprecher, Abstimmung, Agenda |
| Transcript | Partitur, Fließtext, Codierung, Audio-Sync |
| Survey | Fragebogen, Verteilung, Skalen, Codebook |
| Monitor | Dashboard, Timeline, Anomalie, Korrelation |
| Matrix | Tabelle, Heatmap, Residuen, Pivot |
| Citation | Netzwerk, Timeline, Bibliometrie, Ego-Netzwerk |
| Genealogy | Stammbaum, Ahnentafel, Familienblatt, Zeitstrahl |
| Concept | Hierarchie, Graph, Definition, Mapping |
| Registry | Liste, Karteikarte, Standort, Zustand |
| Codebook | Variablenliste, Variablendetail, Validierung, Export |
| Schema | Struktur, Editor, Validator, Diff |

Gesamt: 12 Spezialisierungen × 4 Modi = 48 Modi

---

## Verknüpfungen

- [[05-ARCHETYPEN]] definiert die vier Basis-Archetypen
- [[10-SPEZIALISIERUNGEN]] spezifiziert alle 12 Spezialisierungen mit JSON-Schemata
- [[12-STANDARDS]] dokumentiert Datenformate für Modi-spezifische Felder
- [[11-CODE-MAP]] dokumentiert die technische Implementierung
