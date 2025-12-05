# Spezialisierungen: Katalog und Spezifikation

Dieses Dokument spezifiziert alle 12 Spezialisierungen vollständig. Es definiert Erkennungsheuristiken, kognitive Werkzeuge, UI-Elemente und JSON-Datenstrukturen.

Abhängigkeiten: [[05-ARCHETYPEN]], [[02-MAPPINGS]], [[12-STANDARDS]]

---

## Grundprinzip

Spezialisierungen sind domänenspezifische Ausprägungen der vier Basis-Archetypen. Jede Spezialisierung hat:

1. Einen Leit-Standard (TEI, DDI, LIDO, etc.)
2. Kritische Datenfelder zur Erkennung
3. Kognitive Werkzeuge (UI-Implikationen)
4. JSON-Schema für Datenaustausch

---

## Erkennungsprotokoll

Das LLM prüft folgende Felder in der angegebenen Reihenfolge. Spezifischere Matches haben Vorrang.

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

## Reader-Spezialisierungen

### Edition

**Domäne:** Digitale Philologie
**Leit-Standard:** TEI P5 (Critical Apparatus)

Das Interface muss die **Multivalenz des Textes** sichtbar machen. Es darf keine "eine Wahrheit" suggerieren, sondern muss Varianz als Normalzustand behandeln.

**Kognitive Werkzeuge:**
- **Synopse-Linse:** Parallele Anzeige von Textzeugen mit Lock-Scroll
- **Apparat-Fokus:** Varianten bei Klick auf Lemma, nicht im Fußnotenkeller
- **Genetische Filter:** Schichten der Textentstehung ein-/ausblenden

**UI-Elemente:** Variantenapparat, Zeilensynopse, Siglenliste, Lemma-Markierungen mit Hover-Expansion

```json
{
  "witnesses": [
    { "siglum": "A", "description": "Autograph, 1789", "repository": "..." }
  ],
  "apparatus": [
    {
      "lemma": "Wort",
      "start": 145,
      "end": 149,
      "readings": [
        { "witness": "A", "text": "Wort" },
        { "witness": "B", "text": "Worte", "note": "Druckfehler?" }
      ]
    }
  ]
}
```

**Akzeptanzkriterien:** ≥3 Textzeugen parallel, TEI P5 Critical Apparatus Module, genetische Schichten filterbar

---

### Protokoll

**Domäne:** Parlamentsdokumentation
**Leit-Standard:** Akoma Ntoso

Das Interface muss **Entscheidungsprozesse** nachvollziehbar machen. Der Nutzer rekonstruiert, wie eine Gruppe zu Beschlüssen kam.

**Kognitive Werkzeuge:**
- **Agenda-Navigation:** Sprung zu Tagesordnungspunkten
- **Sprecher-Index:** Wer hat was gesagt? Filterbar nach Person
- **Abstimmungs-Tracker:** Alle Beschlüsse auf einen Blick

**UI-Elemente:** Tagesordnung als Navigation, Sprecher-Sidebar, Abstimmungsergebnisse, Segment-Typen (Statement, Resolution)

```json
{
  "session": { "date": "1923-05-15", "number": 42, "chair": "Dr. Müller" },
  "agenda": [
    { "number": 1, "title": "Genehmigung des Protokolls", "start_segment": 0 }
  ],
  "segments": [
    { "speaker": "Dr. Müller", "text": "Ich eröffne die Sitzung.", "type": "statement" },
    { "speaker": null, "text": "Der Antrag wird angenommen.", "type": "resolution", "vote": "unanimous" }
  ]
}
```

---

### Transcript

**Domäne:** Gesprächsforschung, Oral History
**Leit-Standard:** EXMARaLDA

Das Interface muss **qualitative Analyse** ermöglichen. Der Nutzer codiert, annotiert und vergleicht Äußerungen.

**Kognitive Werkzeuge:**
- **Partitur-Ansicht:** Mehrspurige Darstellung mit Zeitachse
- **Code-Sidebar:** Qualitative Codes zuweisen und filtern
- **Audio-Sync:** Text springt bei Wiedergabe mit

**UI-Elemente:** Turn-basierte Darstellung, Zeitmarken, Paralinguistische Annotationen, Codebook-Anbindung

```json
{
  "interview": { "id": "INT-2024-017", "duration_seconds": 3420 },
  "turns": [
    {
      "speaker": "P1",
      "start_ms": 4800,
      "end_ms": 15200,
      "text": "Also, das war so (.) äh, ich war damals noch in der Schule.",
      "paralinguistics": [{ "type": "pause", "position": 18 }],
      "codes": ["biography", "education"]
    }
  ],
  "codebook": [{ "code": "biography", "definition": "Aussagen über Lebensgeschichte" }]
}
```

---

## Scope-Spezialisierungen

### Survey

**Domäne:** Empirische Sozialforschung
**Leit-Standard:** DDI-Lifecycle

Das Interface muss den **Kontextverlust** verhindern. Rohdaten und Metadaten (Codebook) müssen verschmelzen.

**Kognitive Werkzeuge:**
- **Codebook-Link:** Hover zeigt Fragetext und Skalendefinition
- **Missing-Scanner:** Semantische Unterscheidung (verweigert vs. nicht erhoben)
- **Subgruppen-Lupe:** Split-View nach Demografie

**UI-Elemente:** Demografische Filter, Likert-Scale-Visualisierung (Diverging Stacked Bar), Signifikanzindikatoren, Korrelationsmatrix

```json
{
  "scales": [
    { "id": "satisfaction", "items": ["sat_1", "sat_2"], "cronbach_alpha": 0.87 }
  ],
  "items": [
    { "id": "sat_1", "text": "Ich bin zufrieden.", "type": "likert", "scale": { "min": 1, "max": 5 } }
  ],
  "respondents": [
    { "id": 1, "age_group": "<30", "sat_1": 4, "sat_2": 5 }
  ]
}
```

**Akzeptanzkriterien:** Vollständige Codebook-Integration, Missing Values semantisch differenziert, Gewichtung optional

---

### Monitor

**Domäne:** Sensorik, IoT, Prozessüberwachung
**Leit-Standard:** OGC SensorThings

Das Interface muss **Anomalien** erkennen. Der Nutzer identifiziert Abweichungen vom Normalzustand.

**Kognitive Werkzeuge:**
- **Schwellwert-Overlay:** Kritische Bereiche visuell markiert
- **Anomalie-Score:** Algorithmus-basierte Ausreißererkennung
- **Korrelations-Lag:** Zeitversetzte Zusammenhänge finden

**UI-Elemente:** Dashboard mit KPIs, Timeline mit Threshold-Linien, Alert-Liste, Korrelationsmatrix

```json
{
  "metrics": [
    { "id": "temperature", "label": "Temperatur", "unit": "°C",
      "thresholds": { "warning_high": 35, "critical_high": 40 } }
  ],
  "readings": [
    { "timestamp": "2024-03-15T14:30:00Z", "temperature": 32.5, "anomaly_score": 0.72 }
  ],
  "alerts": [
    { "timestamp": "...", "metric": "temperature", "type": "threshold_exceeded" }
  ]
}
```

---

### Matrix

**Domäne:** Statistische Kreuztabellenanalyse
**Leit-Standard:** SDMX-JSON

Das Interface muss **Zellmuster** erkennen. Der Nutzer sucht Über- und Unterrepräsentationen.

**Kognitive Werkzeuge:**
- **Heatmap:** Farbkodierung nach Häufigkeit
- **Residuen-Ansicht:** Abweichungen vom Erwartungswert
- **Pivot:** Dimensionen tauschen

**UI-Elemente:** Kreuztabelle, Chi-Quadrat-Statistik, Cramér's V, Residuen-Farbkodierung

```json
{
  "dimensions": {
    "rows": { "id": "subject", "values": ["Informatik", "Germanistik"] },
    "columns": { "id": "gender", "values": ["männlich", "weiblich"] }
  },
  "cells": [
    { "row": "Informatik", "column": "männlich", "count": 12450, "expected": 8900, "residual": 3.2 }
  ],
  "statistics": { "chi_square": 234.5, "p_value": 0.0001, "cramers_v": 0.32 }
}
```

---

## Navigator-Spezialisierungen

### Citation

**Domäne:** Bibliometrie & Wissenschaftsgeschichte
**Leit-Standard:** OpenCitations / MODS

Das Interface muss **Beziehungsqualität** über Quantität stellen. Es zeigt, *wie* Wissenschaft aufeinander aufbaut.

**Kognitive Werkzeuge:**
- **Sektions-Filter:** Kanten nach Zitationsort filtern (Methodik vs. Name-Dropping)
- **Zeit-Achse:** Chronologische y-Achse macht Genealogien sichtbar
- **Cluster-Semantik:** Automatische Cluster manuell benennbar

**UI-Elemente:** Publikationsjahr als y-Achse, Impact-Knotengröße, Cluster-Färbung, Co-Citation-Hervorhebung

```json
{
  "publications": [
    { "id": "kuhn1962", "authors": ["Kuhn, Thomas S."], "title": "...", "year": 1962, "citations_received": 89420 }
  ],
  "citations": [
    { "source": "latour1987", "target": "kuhn1962", "context": "direct", "section": "introduction" }
  ],
  "clusters": [
    { "id": "philosophy_of_science", "label": "Wissenschaftstheorie", "color": "#7B68A6" }
  ]
}
```

**Akzeptanzkriterien:** Zeitachsen-Layout als Default (>20 Publikationen), ≥3 Kontext-Kategorien, Co-Citation-Berechnung

---

### Genealogy

**Domäne:** Historische Demografie, Familienforschung
**Leit-Standard:** GEDCOM X

Das Interface muss **Linien und Verzweigungen** rekonstruieren. Der Nutzer navigiert vertikal (Generationen) und horizontal (Geschwister).

**Kognitive Werkzeuge:**
- **Stammbaum:** Absteigende Linie vom Stammvater
- **Ahnentafel:** Aufsteigende Linie einer Person
- **Zeitstrahl:** Lebensspannen überlappend

**UI-Elemente:** Generationen-Ebenen, Partner-Verknüpfungen, Lebensevents, Linien-Hervorhebung

```json
{
  "persons": [
    { "id": "P1", "name": "Johann Sebastian Bach", "gender": "male",
      "birth": { "date": "1685-03-21", "place": "Eisenach" },
      "death": { "date": "1750-07-28", "place": "Leipzig" }, "generation": 0 }
  ],
  "relations": [
    { "type": "parent_child", "parent": "P0", "child": "P1" },
    { "type": "spouse", "person1": "P1", "person2": "P2", "marriage_date": "1707-10-17" }
  ]
}
```

---

### Concept

**Domäne:** Wissensorganisation, Ontologie-Engineering
**Leit-Standard:** SKOS

Das Interface muss **Begriffshierarchien** explorierbar machen. Der Nutzer versteht, wie Konzepte zueinander stehen.

**Kognitive Werkzeuge:**
- **Hierarchie-Baum:** Broader/Narrower als Expand/Collapse
- **Graph-Ansicht:** Assoziative Querverbindungen
- **Mapping:** Konzepte zwischen Vokabularen verknüpfen

**UI-Elemente:** Tree-View, Definition-Panel, Synonym-Liste, Related-Links

```json
{
  "concepts": [
    { "id": "D001921", "label": "Brain", "definition": "...", "synonyms": ["Encephalon"], "broader": ["D002490"] }
  ],
  "relations": [
    { "source": "D001921", "target": "D002490", "type": "broader" },
    { "source": "D001921", "target": "D009474", "type": "related" }
  ]
}
```

---

## Workbench-Spezialisierungen

### Registry

**Domäne:** Sammlungsmanagement (GLAM)
**Leit-Standard:** LIDO / Spectrum

Das Interface ist eine **Waschstraße für Daten**. Es führt vom Ist-Zustand (Chaos) zum Soll-Zustand (Standard).

**Kognitive Werkzeuge:**
- **Normdaten-Abgleich:** Live-Suche gegen GND, Getty AAT, Wikidata
- **Vollständigkeits-Radar:** Anzeige erfüllter Pflichtfelder
- **Batch-Korrektur:** Suchen & Ersetzen auf strukturierten Feldern

**UI-Elemente:** Inventarnummer-Suche, Standort-Hierarchie, Zustandsfelder, Vollständigkeitsanzeige

```json
{
  "schema": {
    "required_fields": ["inventory_number", "title", "location"],
    "controlled_vocabularies": { "condition": ["excellent", "good", "fair", "poor"] }
  },
  "objects": [
    { "inventory_number": "GM-2024-0042", "title": "Landschaft mit Fluss",
      "location": { "building": "Haupthaus", "room": "Depot 3" },
      "condition": "good", "completeness_score": 0.75 }
  ]
}
```

**Akzeptanzkriterien:** LIDO-Pflichtfelder-Berechnung, Normdaten-Lookup (≥1 Quelle), Batch-Operationen mit Vorschau

---

### Codebook

**Domäne:** Datendokumentation, Forschungsdatenmanagement
**Leit-Standard:** DDI-Lifecycle

Das Interface muss **konsistente Definitionen** ermöglichen. Der Nutzer dokumentiert Variablen und Werte.

**Kognitive Werkzeuge:**
- **Variablen-Browser:** Alle Variablen mit Filter und Suche
- **Detail-Ansicht:** Vollständige Variable mit allen Attributen
- **Validierungsregeln:** Konsistenzprüfung definieren

**UI-Elemente:** Variablenliste, Wertelabels, Missing-Value-Definitionen, Validierungsreport

```json
{
  "variables": [
    { "name": "v1", "label": "Geschlecht", "type": "categorical",
      "valid_values": [{ "value": 1, "label": "männlich" }, { "value": 2, "label": "weiblich" }],
      "missing_values": [{ "value": -1, "label": "keine Angabe" }],
      "question_text": "Welches Geschlecht haben Sie?" }
  ],
  "validation_rules": [
    { "id": "R1", "expression": "v2 > 0 OR v2 IN (-1, -9)", "affected_variables": ["v2"] }
  ]
}
```

---

### Schema

**Domäne:** Datenmodellierung, API-Design
**Leit-Standard:** JSON Schema

Das Interface muss **Datenstrukturen** definieren und validieren. Der Nutzer spezifiziert erlaubte Formate.

**Kognitive Werkzeuge:**
- **Struktur-Baum:** Verschachtelte Properties visualisiert
- **Live-Validator:** Daten gegen Schema prüfen
- **Diff-Ansicht:** Änderungen zwischen Schema-Versionen

**UI-Elemente:** Tree-Editor, Constraint-Anzeige, Validation-Errors, Schema-Diff

```json
{
  "schema_meta": { "title": "Publication Record", "$schema": "http://json-schema.org/draft-07/schema#" },
  "schema": {
    "type": "object",
    "required": ["id", "title"],
    "properties": {
      "id": { "type": "string", "pattern": "^PUB-[0-9]{4}-[0-9]{4}$" },
      "title": { "type": "string", "minLength": 1 }
    }
  },
  "test_data": [
    { "data": { "id": "PUB-2024-0001", "title": "Test" }, "valid": true }
  ]
}
```

---

## Kern-Einsichten

1. **Edition:** Multivalenz ermöglichen, nicht Eindeutigkeit erzwingen
2. **Survey:** Keine Zahl ohne ihre Frage. Codebook und Daten sind untrennbar
3. **Citation:** Qualität der Rezeption (wo, wie) wichtiger als Quantität (wie oft)
4. **Registry:** Das Interface ist eine Werkstatt, kein Showroom

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

Details zur Ingest-Logik in [[12-STANDARDS]].

---

## Verknüpfungen

- [[05-ARCHETYPEN]] definiert die vier Basis-Archetypen
- [[02-MAPPINGS]] beschreibt die Topologie-Intention-Matrix
- [[12-STANDARDS]] dokumentiert Formate und Ingest-Logik
- [[15-MODI]] spezifiziert die 48 Modi (4 pro Spezialisierung)
