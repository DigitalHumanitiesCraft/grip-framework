# Standards: Daten-Formate und Ingest-Logik

Dieses Dokument definiert die Mapping-Logik zwischen GRIP-Archetypen und wissenschaftlichen Metadaten-Standards. Es dient als Referenz für LLMs und Parser-Module zur Datenerkennung und -konvertierung.

Abhängigkeiten: [[10-SPEZIALISIERUNGEN]], [[05-ARCHETYPEN]], [[14-EPICS]]

---

## Grundprinzip

GRIP-Interfaces erwarten JSON-Daten in einem definierten Schema. Reale Forschungsdaten liegen jedoch in verschiedenen Formaten vor. Die Ingest-Logik übersetzt Standardformate in das GRIP-Schema. Dabei gilt:

1. Container-Erkennung: Dateiendung und MIME-Type identifizieren
2. Inhalts-Scanning: XML-Tags oder JSON-Keys prüfen
3. Standard-Mapping: Format in GRIP-Schema konvertieren
4. Spezialisierung zuweisen: Erkennungsheuristik aus 10-SPEZIALISIERUNGEN anwenden

---

## Container-Erkennung

| Container | Endung | Erwarteter Standard | Ziel-Archetyp | Erkennungs-Trigger |
|-----------|--------|---------------------|---------------|-------------------|
| XML | .xml | TEI P5 | Reader (Edition) | Root `<TEI>` oder Namespace `http://www.tei-c.org/ns/1.0` |
| XML | .xml | Akoma Ntoso | Reader (Protokoll) | Root `<akomaNtoso>` |
| XML | .xml | DDI Codebook | Scope (Survey) | Root `<codeBook>` oder `<stdyDscr>` |
| XML | .xml | MODS | Navigator (Citation) | Tag `<mods>` oder `<relatedItem>` |
| JSON | .json | SDMX-JSON | Scope (Matrix) | Key `structure.dimensions` vorhanden |
| JSON | .json | SensorThings | Scope (Monitor) | Keys `Datastreams` und `Observations` |
| JSON | .json | GEDCOM X | Navigator (Genealogy) | Keys `persons` und `relationships` |
| JSON | .json | JSON Schema | Workbench (Schema) | Key `$schema` vorhanden |
| CSV | .csv, .txt | Ad-hoc | Scope (Basis) | Trennzeichen erkannt, Header-Zeile |
| HDF5/NetCDF | .h5, .nc | CF Conventions | Scope (Monitor) | Attribute `lat`, `lon`, `time` |
| FASTQ/FASTA | .fq, .fa | Bio-Sequencing | Reader (Sequence) | Zeilen beginnen mit `>` oder `@` |

---

## Reader-Standards

### TEI P5 (Edition)

Textcodierung für philologische Editionen.

Dokumentation: https://tei-c.org/release/doc/tei-p5-doc/en/html/TC.html

Mapping:
- TEI `<app>` → GRIP `apparatus`
- TEI `<lem>` → GRIP `lemma`
- TEI `<rdg>` → GRIP `reading`
- TEI `<wit>` → GRIP `witness`

```json
{
  "type": "reader_edition",
  "meta": { "standard": "TEI P5" },
  "text_flow": [
    { "id": 1, "content": "Originaltext" }
  ],
  "apparatus": [
    {
      "anchor_id": 1,
      "lemma": "Originaltext",
      "readings": [
        { "text": "Variante", "witness": "#Wit_A", "type": "substantive" }
      ]
    }
  ]
}
```

### Akoma Ntoso (Protokoll)

LegalDocML für parlamentarische Dokumente.

Dokumentation: http://docs.oasis-open.org/legaldocml/akn-core/v1.0/

Mapping:
- AN `speech` → GRIP `speech_segment`
- AN `scene` → GRIP `narrative_segment`

```json
{
  "type": "reader_protocol",
  "meta": { "standard": "Akoma Ntoso" },
  "segments": [
    { "type": "speech", "speaker_id": "#M_Name", "text": "..." },
    { "type": "narrative", "content": "Beifall." },
    { "type": "resolution", "status": "accepted", "text": "..." }
  ]
}
```

### EXMARaLDA (Transcript)

Gesprächskorpus-Format.

Dokumentation: https://exmaralda.org/en/formats/

Mapping:
- Timeline → GRIP `time_anchors`
- Events → GRIP `turns`

```json
{
  "type": "reader_transcript",
  "meta": { "standard": "EXMARaLDA" },
  "timeline": { "t1": 0.5, "t2": 2.4 },
  "turns": [
    { "speaker": "I", "start": "t1", "end": "t2", "text": "..." }
  ]
}
```

---

## Scope-Standards

### DDI Codebook (Survey)

Variablendokumentation für Umfragen.

Dokumentation: https://ddialliance.org/Specification/DDI-Codebook/2.5/

Mapping:
- DDI `var` → GRIP `variable`
- DDI `catgry` → GRIP `scale_items`

```json
{
  "type": "scope_survey",
  "meta": { "standard": "DDI-C" },
  "variables": [
    {
      "id": "V1",
      "question": "Wie zufrieden sind Sie?",
      "type": "likert_5",
      "categories": [
        { "value": 1, "label": "Sehr unzufrieden" },
        { "value": 5, "label": "Sehr zufrieden" }
      ]
    }
  ]
}
```

### OGC SensorThings (Monitor)

IoT-Zeitreihendaten.

Dokumentation: https://www.ogc.org/standard/sensorthings/

Mapping:
- OGC `Datastream` → GRIP `metric_stream`
- OGC `Observation` → GRIP `reading`

```json
{
  "type": "scope_monitor",
  "meta": { "standard": "OGC SensorThings" },
  "datastreams": [
    {
      "id": "DS_Temp",
      "unit": "Celsius",
      "thresholds": { "max": 80.0 },
      "observations": [
        { "time": "2024-12-04T10:00:00Z", "result": 45.2 }
      ]
    }
  ]
}
```

### SDMX-JSON (Matrix)

Statistische Datenwürfel.

Dokumentation: https://github.com/sdmx-twg/sdmx-json

Mapping:
- SDMX `Dimension` → GRIP `axis`
- SDMX `Observation` → GRIP `cell`

```json
{
  "type": "scope_matrix",
  "meta": { "standard": "SDMX" },
  "structure": {
    "dimensions": ["Region", "Year"],
    "measures": ["Value"]
  },
  "cells": [
    { "Region": "EU", "Year": "2023", "value": 6.5 }
  ]
}
```

---

## Navigator-Standards

### MODS (Citation)

Bibliografische Metadaten.

Dokumentation: https://www.loc.gov/standards/mods/

Mapping:
- MODS `<titleInfo>` → GRIP `node.label`
- MODS `<relatedItem type="references">` → GRIP `edge.citation`

```json
{
  "type": "navigator_citation",
  "meta": { "standard": "MODS" },
  "nodes": [
    { "id": "pub1", "title": "Titel", "year": 2020 }
  ],
  "edges": [
    { "source": "pub2", "target": "pub1", "rel_type": "references" }
  ]
}
```

### GEDCOM X (Genealogy)

Familiendaten.

Dokumentation: https://github.com/FamilySearch/gedcomx

Mapping:
- GED `person` → GRIP `node.person`
- GED `relationship` → GRIP `edge`

```json
{
  "type": "navigator_genealogy",
  "meta": { "standard": "GEDCOM X" },
  "persons": [
    { "id": "P1", "name": "Name" }
  ],
  "relationships": [
    { "type": "ParentChild", "person1": "P1", "person2": "P2" }
  ]
}
```

### SKOS (Concept)

Wissensorganisation.

Dokumentation: https://www.w3.org/TR/skos-primer/

Mapping:
- SKOS `Concept` → GRIP `node.concept`
- SKOS `broader/narrower` → GRIP `edge.hierarchical`

```json
{
  "type": "navigator_concept",
  "meta": { "standard": "SKOS" },
  "concepts": [
    { "id": "c1", "label": "Oberbegriff" },
    { "id": "c2", "label": "Unterbegriff" }
  ],
  "relations": [
    { "source": "c2", "target": "c1", "type": "skos:broader" }
  ]
}
```

---

## Workbench-Standards

### LIDO (Registry)

Objektbeschreibung für Sammlungen.

Dokumentation: https://lido-schema.org/

Mapping:
- LIDO `objectWorkType` → GRIP `classification`
- LIDO `repositorySet` → GRIP `location`

```json
{
  "type": "workbench_registry",
  "meta": { "standard": "LIDO" },
  "objects": [
    {
      "inv_no": "INV-001",
      "classification": "Painting",
      "location": { "institution": "Museum", "shelf": "A1" },
      "condition": "good"
    }
  ]
}
```

### DDI Lifecycle (Codebook)

Variablen-Editor.

Dokumentation: https://ddialliance.org/Specification/DDI-Lifecycle/3.3/

Mapping:
- DDI `Variable` → GRIP `editable_variable`
- DDI `Label` → GRIP `editable_label`

```json
{
  "type": "workbench_codebook",
  "meta": { "standard": "DDI-Lifecycle" },
  "variables": [
    {
      "id": "var1",
      "label": "Variablenname",
      "is_editable": true,
      "version": "1.0"
    }
  ]
}
```

### JSON Schema (Schema)

Strukturvalidierung.

Dokumentation: https://json-schema.org/specification

```json
{
  "type": "workbench_schema",
  "meta": { "standard": "JSON Schema 2020-12" },
  "schema_definition": {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "type": "object",
    "properties": {
      "field": { "type": "string" }
    },
    "required": ["field"]
  }
}
```

---

## Parser-Architektur

Das System benötigt Parser-Module, die Standardformate in GRIP-JSON konvertieren:

```
Input-Datei
    ↓
Container-Erkennung (Endung/MIME)
    ↓
Inhalts-Scanning (Tags/Keys)
    ↓
Standard-Parser auswählen
    ↓
GRIP-JSON erzeugen
    ↓
Spezialisierung erkennen (10-SPEZIALISIERUNGEN)
    ↓
Interface laden
```

Geplante Parser-Module:
- tei-parser.js (TEI P5 → reader_edition)
- akoma-parser.js (Akoma Ntoso → reader_protocol)
- exmaralda-parser.js (EXMARaLDA → reader_transcript)
- ddi-parser.js (DDI → scope_survey | workbench_codebook)
- sdmx-parser.js (SDMX → scope_matrix)
- sensorthings-parser.js (OGC → scope_monitor)
- mods-parser.js (MODS → navigator_citation)
- gedcom-parser.js (GEDCOM X → navigator_genealogy)
- skos-parser.js (SKOS → navigator_concept)
- lido-parser.js (LIDO → workbench_registry)

---

## XML-Erkennungs-Trigger (Detail)

### TEI P5

```xml
<!-- Root-Element -->
<TEI xmlns="http://www.tei-c.org/ns/1.0">

<!-- Oder: Namespace-Deklaration -->
xmlns:tei="http://www.tei-c.org/ns/1.0"

<!-- Critical Apparatus Module erkennbar durch: -->
<app>, <lem>, <rdg>, <wit>
```

### Akoma Ntoso

```xml
<!-- Root-Element -->
<akomaNtoso xmlns="http://docs.oasis-open.org/legaldocml/ns/akn/3.0">

<!-- Charakteristische Elemente: -->
<debate>, <speech>, <scene>, <vote>
```

### DDI Codebook

```xml
<!-- Root-Elemente (alternativ): -->
<codeBook xmlns="ddi:codebook:2_5">
<stdyDscr>

<!-- Charakteristische Elemente: -->
<var>, <catgry>, <varGrp>
```

### MODS

```xml
<!-- Root-Element oder Container: -->
<mods xmlns="http://www.loc.gov/mods/v3">
<modsCollection>

<!-- Zitationsbeziehungen: -->
<relatedItem type="references">
```

### LIDO

```xml
<!-- Root-Element: -->
<lido xmlns="http://www.lido-schema.org">

<!-- Charakteristische Elemente: -->
<objectWorkType>, <repositorySet>, <eventSet>
```

---

## JSON-Erkennungs-Trigger (Detail)

### SDMX-JSON

```json
{
  "structure": {
    "dimensions": { ... }
  },
  "dataSets": [ ... ]
}
```

Trigger-Keys: `structure.dimensions`, `dataSets`

### OGC SensorThings

```json
{
  "Datastreams": [ ... ],
  "Observations": [ ... ]
}
```

Trigger-Keys: `Datastreams`, `Observations`, `@iot.id`

### GEDCOM X

```json
{
  "persons": [ ... ],
  "relationships": [ ... ]
}
```

Trigger-Keys: `persons`, `relationships`, `type: "ParentChild"`

### JSON Schema

```json
{
  "$schema": "https://json-schema.org/...",
  "type": "object",
  "properties": { ... }
}
```

Trigger-Keys: `$schema`, `properties`, `required`, `$ref`

---

## Verknüpfungen

- [[10-SPEZIALISIERUNGEN]] enthält das vollständige Erkennungsprotokoll
- [[14-EPICS]] dokumentiert Datenfelder und JSON-Schemata pro Spezialisierung
- [[05-ARCHETYPEN]] beschreibt die Basis-Archetypen
- [[11-CODE-MAP]] dokumentiert die technische Implementierung
