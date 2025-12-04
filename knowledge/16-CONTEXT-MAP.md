# Context-Map: Dateien und Wissensbedarf

Dieses Dokument definiert, welche Wissensbasis-Dokumente für welche Implementierungsdateien relevant sind. Es dient als Referenz für LLMs bei der Code-Generierung.

Abhängigkeiten: [[15-MODI]], [[14-EPICS]], [[12-STANDARDS]], [[11-CODE-MAP]]

---

## Dateistruktur

### Hierarchie

```
docs/examples/
  {archetyp}.html                    # Basis-Demo (4 Dateien)
  {archetyp}-{spezialisierung}.html  # Spezialisierung (12 Dateien)
  {spezialisierung}/                 # Modus-Verzeichnis (12 Verzeichnisse)
    {modus}.html                     # Modus-View (48 Dateien)

docs/js/
  archetypes/
    {archetyp}.js                    # Basis-Klasse (4 Dateien)
  specializations/
    {spezialisierung}.js             # Spezialisierungs-Klasse (12 Dateien)
  modes/
    {spezialisierung}-{modus}.js     # Modus-Modul (48 Dateien)

docs/css/
  archetypes/
    {archetyp}.css                   # Basis-Styles (4 Dateien)
  specializations/
    {spezialisierung}.css            # Spezialisierungs-Styles (12 Dateien)
  modes/
    {spezialisierung}-{modus}.css    # Modus-Styles (48 Dateien)

docs/examples/data/
  {spezialisierung}-{modus}.json     # Modus-spezifische Testdaten (48 Dateien)
```

---

## Context-Map nach Spezialisierung

### Edition (Reader)

| Modus | HTML | JS | CSS | JSON | Wissensbasis |
|-------|------|----|----|------|--------------|
| Synopse | edition/synopse.html | edition-synopse.js | edition-synopse.css | edition-synopse.json | 15-MODI#Edition-Synopse, 14-EPICS#Edition, 12-STANDARDS#TEI-P5 |
| Apparat | edition/apparat.html | edition-apparat.js | edition-apparat.css | edition-apparat.json | 15-MODI#Edition-Apparat, 14-EPICS#Edition, 12-STANDARDS#TEI-P5 |
| Genetik | edition/genetik.html | edition-genetik.js | edition-genetik.css | edition-genetik.json | 15-MODI#Edition-Genetik, 14-EPICS#Edition |
| Faksimile | edition/faksimile.html | edition-faksimile.js | edition-faksimile.css | edition-faksimile.json | 15-MODI#Edition-Faksimile, 14-EPICS#Edition |

**Geteilte Datenfelder:** `witnesses[]`, `text_flow[]`, `apparatus[]`
**Geteiltes CSS:** Typografie für Lesetext, Siglen-Styling, Apparat-Layout

### Protokoll (Reader)

| Modus | HTML | JS | CSS | JSON | Wissensbasis |
|-------|------|----|----|------|--------------|
| Chronologie | protokoll/chronologie.html | protokoll-chronologie.js | protokoll-chronologie.css | protokoll-chronologie.json | 15-MODI#Protokoll-Chronologie, 12-STANDARDS#Akoma-Ntoso |
| Sprecher | protokoll/sprecher.html | protokoll-sprecher.js | protokoll-sprecher.css | protokoll-sprecher.json | 15-MODI#Protokoll-Sprecher |
| Abstimmung | protokoll/abstimmung.html | protokoll-abstimmung.js | protokoll-abstimmung.css | protokoll-abstimmung.json | 15-MODI#Protokoll-Abstimmung |
| Agenda | protokoll/agenda.html | protokoll-agenda.js | protokoll-agenda.css | protokoll-agenda.json | 15-MODI#Protokoll-Agenda |

**Geteilte Datenfelder:** `segments[]`, `speakers[]`, `agenda_items[]`, `votes[]`

### Transcript (Reader)

| Modus | HTML | JS | CSS | JSON | Wissensbasis |
|-------|------|----|----|------|--------------|
| Partitur | transcript/partitur.html | transcript-partitur.js | transcript-partitur.css | transcript-partitur.json | 15-MODI#Transcript-Partitur, 12-STANDARDS#EXMARaLDA |
| Fließtext | transcript/fliesstext.html | transcript-fliesstext.js | transcript-fliesstext.css | transcript-fliesstext.json | 15-MODI#Transcript-Fließtext |
| Codierung | transcript/codierung.html | transcript-codierung.js | transcript-codierung.css | transcript-codierung.json | 15-MODI#Transcript-Codierung |
| Audio-Sync | transcript/audiosync.html | transcript-audiosync.js | transcript-audiosync.css | transcript-audiosync.json | 15-MODI#Transcript-Audio-Sync |

**Geteilte Datenfelder:** `turns[]`, `timeline`, `codes[]`, `codebook`

### Survey (Scope)

| Modus | HTML | JS | CSS | JSON | Wissensbasis |
|-------|------|----|----|------|--------------|
| Fragebogen | survey/fragebogen.html | survey-fragebogen.js | survey-fragebogen.css | survey-fragebogen.json | 15-MODI#Survey-Fragebogen, 14-EPICS#Survey, 12-STANDARDS#DDI |
| Verteilung | survey/verteilung.html | survey-verteilung.js | survey-verteilung.css | survey-verteilung.json | 15-MODI#Survey-Verteilung, 14-EPICS#Survey |
| Skalen | survey/skalen.html | survey-skalen.js | survey-skalen.css | survey-skalen.json | 15-MODI#Survey-Skalen, 14-EPICS#Survey |
| Codebook | survey/codebook.html | survey-codebook.js | survey-codebook.css | survey-codebook.json | 15-MODI#Survey-Codebook, 14-EPICS#Survey |

**Geteilte Datenfelder:** `items[]`, `scales[]`, `responses[]`, `variables[]`

### Monitor (Scope)

| Modus | HTML | JS | CSS | JSON | Wissensbasis |
|-------|------|----|----|------|--------------|
| Dashboard | monitor/dashboard.html | monitor-dashboard.js | monitor-dashboard.css | monitor-dashboard.json | 15-MODI#Monitor-Dashboard, 12-STANDARDS#SensorThings |
| Timeline | monitor/timeline.html | monitor-timeline.js | monitor-timeline.css | monitor-timeline.json | 15-MODI#Monitor-Timeline |
| Anomalie | monitor/anomalie.html | monitor-anomalie.js | monitor-anomalie.css | monitor-anomalie.json | 15-MODI#Monitor-Anomalie |
| Korrelation | monitor/korrelation.html | monitor-korrelation.js | monitor-korrelation.css | monitor-korrelation.json | 15-MODI#Monitor-Korrelation |

**Geteilte Datenfelder:** `datastreams[]`, `observations[]`, `thresholds`, `alerts[]`

### Matrix (Scope)

| Modus | HTML | JS | CSS | JSON | Wissensbasis |
|-------|------|----|----|------|--------------|
| Tabelle | matrix/tabelle.html | matrix-tabelle.js | matrix-tabelle.css | matrix-tabelle.json | 15-MODI#Matrix-Tabelle, 12-STANDARDS#SDMX |
| Heatmap | matrix/heatmap.html | matrix-heatmap.js | matrix-heatmap.css | matrix-heatmap.json | 15-MODI#Matrix-Heatmap |
| Residuen | matrix/residuen.html | matrix-residuen.js | matrix-residuen.css | matrix-residuen.json | 15-MODI#Matrix-Residuen |
| Pivot | matrix/pivot.html | matrix-pivot.js | matrix-pivot.css | matrix-pivot.json | 15-MODI#Matrix-Pivot |

**Geteilte Datenfelder:** `dimensions`, `cells[]`, `measures[]`

### Citation (Navigator)

| Modus | HTML | JS | CSS | JSON | Wissensbasis |
|-------|------|----|----|------|--------------|
| Netzwerk | citation/netzwerk.html | citation-netzwerk.js | citation-netzwerk.css | citation-netzwerk.json | 15-MODI#Citation-Netzwerk, 14-EPICS#Citation, 12-STANDARDS#MODS |
| Timeline | citation/timeline.html | citation-timeline.js | citation-timeline.css | citation-timeline.json | 15-MODI#Citation-Timeline, 14-EPICS#Citation |
| Bibliometrie | citation/bibliometrie.html | citation-bibliometrie.js | citation-bibliometrie.css | citation-bibliometrie.json | 15-MODI#Citation-Bibliometrie, 14-EPICS#Citation |
| Ego-Netzwerk | citation/ego.html | citation-ego.js | citation-ego.css | citation-ego.json | 15-MODI#Citation-Ego-Netzwerk, 14-EPICS#Citation |

**Geteilte Datenfelder:** `publications[]`, `citations[]`, `clusters[]`

### Genealogy (Navigator)

| Modus | HTML | JS | CSS | JSON | Wissensbasis |
|-------|------|----|----|------|--------------|
| Stammbaum | genealogy/stammbaum.html | genealogy-stammbaum.js | genealogy-stammbaum.css | genealogy-stammbaum.json | 15-MODI#Genealogy-Stammbaum, 12-STANDARDS#GEDCOM-X |
| Ahnentafel | genealogy/ahnentafel.html | genealogy-ahnentafel.js | genealogy-ahnentafel.css | genealogy-ahnentafel.json | 15-MODI#Genealogy-Ahnentafel |
| Familienblatt | genealogy/familienblatt.html | genealogy-familienblatt.js | genealogy-familienblatt.css | genealogy-familienblatt.json | 15-MODI#Genealogy-Familienblatt |
| Zeitstrahl | genealogy/zeitstrahl.html | genealogy-zeitstrahl.js | genealogy-zeitstrahl.css | genealogy-zeitstrahl.json | 15-MODI#Genealogy-Zeitstrahl |

**Geteilte Datenfelder:** `persons[]`, `relationships[]`, `events[]`

### Concept (Navigator)

| Modus | HTML | JS | CSS | JSON | Wissensbasis |
|-------|------|----|----|------|--------------|
| Hierarchie | concept/hierarchie.html | concept-hierarchie.js | concept-hierarchie.css | concept-hierarchie.json | 15-MODI#Concept-Hierarchie, 12-STANDARDS#SKOS |
| Graph | concept/graph.html | concept-graph.js | concept-graph.css | concept-graph.json | 15-MODI#Concept-Graph |
| Definition | concept/definition.html | concept-definition.js | concept-definition.css | concept-definition.json | 15-MODI#Concept-Definition |
| Mapping | concept/mapping.html | concept-mapping.js | concept-mapping.css | concept-mapping.json | 15-MODI#Concept-Mapping |

**Geteilte Datenfelder:** `concepts[]`, `relations[]`, `mappings[]`

### Registry (Workbench)

| Modus | HTML | JS | CSS | JSON | Wissensbasis |
|-------|------|----|----|------|--------------|
| Liste | registry/liste.html | registry-liste.js | registry-liste.css | registry-liste.json | 15-MODI#Registry-Liste, 14-EPICS#Registry, 12-STANDARDS#LIDO |
| Karteikarte | registry/karteikarte.html | registry-karteikarte.js | registry-karteikarte.css | registry-karteikarte.json | 15-MODI#Registry-Karteikarte, 14-EPICS#Registry |
| Standort | registry/standort.html | registry-standort.js | registry-standort.css | registry-standort.json | 15-MODI#Registry-Standort, 14-EPICS#Registry |
| Zustand | registry/zustand.html | registry-zustand.js | registry-zustand.css | registry-zustand.json | 15-MODI#Registry-Zustand, 14-EPICS#Registry |

**Geteilte Datenfelder:** `objects[]`, `locations`, `controlled_vocabularies`

### Codebook (Workbench)

| Modus | HTML | JS | CSS | JSON | Wissensbasis |
|-------|------|----|----|------|--------------|
| Variablenliste | codebook/variablenliste.html | codebook-variablenliste.js | codebook-variablenliste.css | codebook-variablenliste.json | 15-MODI#Codebook-Variablenliste, 12-STANDARDS#DDI-Lifecycle |
| Variablendetail | codebook/variablendetail.html | codebook-variablendetail.js | codebook-variablendetail.css | codebook-variablendetail.json | 15-MODI#Codebook-Variablendetail |
| Validierung | codebook/validierung.html | codebook-validierung.js | codebook-validierung.css | codebook-validierung.json | 15-MODI#Codebook-Validierung |
| Export | codebook/export.html | codebook-export.js | codebook-export.css | codebook-export.json | 15-MODI#Codebook-Export |

**Geteilte Datenfelder:** `variables[]`, `valid_values`, `missing_values`, `validation_rules`

### Schema (Workbench)

| Modus | HTML | JS | CSS | JSON | Wissensbasis |
|-------|------|----|----|------|--------------|
| Struktur | schema/struktur.html | schema-struktur.js | schema-struktur.css | schema-struktur.json | 15-MODI#Schema-Struktur, 12-STANDARDS#JSON-Schema |
| Editor | schema/editor.html | schema-editor.js | schema-editor.css | schema-editor.json | 15-MODI#Schema-Editor |
| Validator | schema/validator.html | schema-validator.js | schema-validator.css | schema-validator.json | 15-MODI#Schema-Validator |
| Diff | schema/diff.html | schema-diff.js | schema-diff.css | schema-diff.json | 15-MODI#Schema-Diff |

**Geteilte Datenfelder:** `schema_definition`, `$schema`, `properties`, `required`

---

## Vererbungs-Hierarchie

### CSS-Vererbung

```
style.css (Basis)
  └── archetypes/{archetyp}.css
        └── specializations/{spezialisierung}.css
              └── modes/{spezialisierung}-{modus}.css
```

Jede Ebene importiert die Vorgänger-Styles.

### JS-Vererbung

```
BaseInterface (abstrakt)
  └── Adaptive{Archetyp} (reader.js, scope.js, etc.)
        └── {Spezialisierung}Interface (edition.js, survey.js, etc.)
              └── {Spezialisierung}{Modus}Mode (edition-synopse.js, etc.)
```

Modi sind keine vollständigen Klassen, sondern Render-Module, die in die Spezialisierungs-Klasse eingehängt werden.

---

## Modus-Wechsel-Architektur

### URL-Schema

```
/examples/{spezialisierung}/{modus}.html?data={datensatz}

Beispiele:
/examples/edition/synopse.html?data=faust
/examples/citation/ego.html?focus=doi:10.1234/xyz
/examples/registry/karteikarte.html?inv=INV-001
```

### Shared State

Modi einer Spezialisierung teilen:
- Geladene Daten (JSON)
- Aktuelle Selektion (selectedId)
- Filter-Einstellungen
- Scroll-Position (wo sinnvoll)

Der State wird im localStorage oder URL-Hash persistiert.

### Tab-Navigation

```html
<nav class="mode-tabs" role="tablist">
  <a href="synopse.html" role="tab" aria-selected="true">Synopse</a>
  <a href="apparat.html" role="tab">Apparat</a>
  <a href="genetik.html" role="tab">Genetik</a>
  <a href="faksimile.html" role="tab">Faksimile</a>
</nav>
```

Tastenkürzel: Cmd/Ctrl + 1-4 für Modi 1-4.

---

## Implementierungs-Reihenfolge

### Phase 1: Edition (vollständig)

1. edition/synopse.html - Lock-Scroll für Textzeugen
2. edition/apparat.html - Klassisches Apparat-Layout
3. edition/genetik.html - Schichten-Filterung
4. edition/faksimile.html - Text-Bild-Mapping

### Phase 2: Survey (vollständig)

5. survey/fragebogen.html - Interaktiver Prototyp
6. survey/verteilung.html - Histogramme
7. survey/skalen.html - Reliabilitätsanalyse
8. survey/codebook.html - Variablen-Browser

### Phase 3: Citation (vollständig)

9. citation/netzwerk.html - Force-Layout (existiert teilweise)
10. citation/timeline.html - Chronologische Ansicht
11. citation/bibliometrie.html - Metriken-Tabelle
12. citation/ego.html - Ego-Netzwerk

### Phase 4: Registry (vollständig)

13. registry/liste.html - Objekt-Tabelle
14. registry/karteikarte.html - Einzelobjekt-Formular
15. registry/standort.html - Raum-Hierarchie
16. registry/zustand.html - Erhaltungs-Dashboard

### Phase 5-7: Remaining Spezialisierungen

Protokoll, Transcript, Monitor, Matrix, Genealogy, Concept, Codebook, Schema

---

## Verknüpfungen

- [[15-MODI]] definiert alle Modi mit Relevanz und Innovation
- [[14-EPICS]] enthält User Stories für Phase-1-Spezialisierungen
- [[12-STANDARDS]] dokumentiert Datenformate
- [[11-CODE-MAP]] beschreibt bestehende JS-Architektur
