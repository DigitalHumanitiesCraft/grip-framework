# Spezialisierungen: Katalog und Erkennungsprotokoll

Dieses Dokument ist der Index aller 12 Spezialisierungen. Es definiert die Zuordnung zu Archetypen, Leit-Standards und das Erkennungsprotokoll für die automatische Klassifikation.

Abhängigkeiten: [[05-ARCHETYPEN]], [[02-MAPPINGS]]

---

## Grundprinzip

Spezialisierungen sind domänenspezifische Ausprägungen der vier Basis-Archetypen. Jede Spezialisierung hat:

1. Einen Leit-Standard (TEI, DDI, LIDO, etc.)
2. Kritische Datenfelder zur Erkennung
3. Vollständige Spezifikation in [[14-EPICS]] (für Phase-1) oder [[13-RESEARCH-PLAN]] (für Phase-2)

---

## Katalog

### Reader-Spezialisierungen

| Name | Leit-Standard | Domäne | Spezifikation |
|------|---------------|--------|---------------|
| Edition | TEI P5 | Digitale Philologie | [[14-EPICS#Edition]] |
| Protokoll | Akoma Ntoso | Parlamentsdokumentation | [[13-RESEARCH-PLAN#Protokoll]] |
| Transcript | EXMARaLDA | Gesprächsforschung | [[13-RESEARCH-PLAN#Transcript]] |

### Scope-Spezialisierungen

| Name | Leit-Standard | Domäne | Spezifikation |
|------|---------------|--------|---------------|
| Survey | DDI-Codebook | Umfrageforschung | [[14-EPICS#Survey]] |
| Monitor | OGC SensorThings | Zeitreihen/IoT | [[13-RESEARCH-PLAN#Monitor]] |
| Matrix | SDMX-JSON | Statistische Kreuztabellen | [[13-RESEARCH-PLAN#Matrix]] |

### Navigator-Spezialisierungen

| Name | Leit-Standard | Domäne | Spezifikation |
|------|---------------|--------|---------------|
| Citation | MODS / OpenCitations | Bibliometrie | [[14-EPICS#Citation]] |
| Genealogy | GEDCOM X | Familienforschung | [[13-RESEARCH-PLAN#Genealogy]] |
| Concept | SKOS | Wissensorganisation | [[13-RESEARCH-PLAN#Concept]] |

### Workbench-Spezialisierungen

| Name | Leit-Standard | Domäne | Spezifikation |
|------|---------------|--------|---------------|
| Registry | LIDO / Spectrum | Sammlungsmanagement | [[14-EPICS#Registry]] |
| Codebook | DDI-Lifecycle | Datendokumentation | [[13-RESEARCH-PLAN#Codebook]] |
| Schema | JSON Schema | Datenvalidierung | [[13-RESEARCH-PLAN#Schema]] |

---

## Erkennungsprotokoll

Das LLM prüft folgende Felder in der angegebenen Reihenfolge. Die Heuristiken sind priorisiert: spezifischere Matches haben Vorrang.

### Reader-Erkennung

```
IF "apparatus" OR "witnesses" OR "siglum" OR "readings" OR "lemma"
    → Edition

IF "session" AND "agenda" AND "speaker"
    → Protokoll

IF "turns" AND ("start_ms" OR "codes" OR "paralinguistics")
    → Transcript

ELSE → Basis-Reader
```

### Scope-Erkennung

```
IF "scales" AND "items" AND ("likert" OR "cronbach_alpha")
    → Survey

IF "thresholds" AND ("alerts" OR "anomaly_score" OR "readings")
    → Monitor

IF "dimensions.rows" AND "dimensions.columns" AND "cells"
    → Matrix

ELSE → Basis-Scope
```

### Navigator-Erkennung

```
IF "publications" AND "citations" AND "year"
    → Citation

IF "persons" AND ("parent_child" OR "spouse" OR "generation")
    → Genealogy

IF "concepts" AND ("broader" OR "narrower" OR "relation_types")
    → Concept

ELSE → Basis-Navigator
```

### Workbench-Erkennung

```
IF "inventory_number" AND "location" AND ("condition" OR "controlled_vocabularies")
    → Registry

IF "variables" AND "valid_values" AND "missing_values"
    → Codebook

IF "$schema" AND "properties" AND "required"
    → Schema

ELSE → Basis-Workbench
```

---

## Kritische Datenfelder (Kurzreferenz)

Diese Tabelle fasst die wichtigsten Erkennungsfelder zusammen. Vollständige JSON-Schemata finden sich in [[14-EPICS]] und [[12-STANDARDS]].

| Spezialisierung | Primäre Felder | Sekundäre Felder |
|-----------------|----------------|------------------|
| Edition | `witnesses`, `apparatus`, `siglum` | `lemma`, `readings`, `editorial_notes` |
| Protokoll | `session`, `agenda`, `speaker` | `attendance`, `resolutions`, `segments` |
| Transcript | `turns`, `start_ms`, `end_ms` | `codes`, `paralinguistics`, `codebook` |
| Survey | `scales`, `items`, `likert` | `demographics`, `cronbach_alpha`, `response_rate` |
| Monitor | `thresholds`, `alerts`, `readings` | `anomaly_score`, `status`, `normal_range` |
| Matrix | `dimensions`, `cells`, `row`, `column` | `expected`, `residual`, `chi_square` |
| Citation | `publications`, `citations`, `year` | `cluster`, `citations_received`, `doi` |
| Genealogy | `persons`, `parent_child`, `spouse` | `generation`, `birth`, `death`, `lineages` |
| Concept | `concepts`, `broader`, `narrower` | `definition`, `synonyms`, `relation_types` |
| Registry | `inventory_number`, `location`, `condition` | `provenance`, `completeness_score`, `controlled_vocabularies` |
| Codebook | `variables`, `valid_values`, `missing_values` | `measurement_level`, `question_text`, `validation_rules` |
| Schema | `$schema`, `properties`, `required` | `type`, `pattern`, `definitions`, `$ref` |

---

## Container-Erkennung

Vor der Inhaltsanalyse prüft das System den Datei-Container:

| Container | Endung | Erwarteter Standard | Ziel-Spezialisierung |
|-----------|--------|---------------------|----------------------|
| XML | .xml | TEI P5 | Edition |
| XML | .xml | Akoma Ntoso | Protokoll |
| XML | .xml | DDI Codebook | Survey |
| XML | .xml | MODS | Citation |
| JSON | .json | SDMX-JSON | Matrix |
| JSON | .json | SensorThings | Monitor |
| JSON | .json | GEDCOM X | Genealogy |
| JSON | .json | JSON Schema | Schema |

Erkennungs-Trigger für XML: Root-Element oder Namespace.
Erkennungs-Trigger für JSON: Charakteristische Top-Level-Keys.

Details zur Ingest-Logik und Parser-Architektur in [[12-STANDARDS]].

---

## Verknüpfungen

- [[05-ARCHETYPEN]] definiert die vier Basis-Archetypen
- [[02-MAPPINGS]] beschreibt die Topologie-Intention-Matrix
- [[12-STANDARDS]] dokumentiert Formate und Ingest-Logik
- [[13-RESEARCH-PLAN]] enthält Recherche-Aufgaben für Phase-2-Spezialisierungen
- [[14-EPICS]] spezifiziert Phase-1-Spezialisierungen vollständig
