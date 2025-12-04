# Spezialisierungen: Operationalisierte Archetyp-Varianten

Dieses Dokument definiert drei Spezialisierungen pro Archetyp. Jede Spezialisierung ist vollständig operationalisiert mit unterscheidenden UI-Elementen, spezifischen Datenfeldern und eigenen Erkennungsheuristiken.

Abhängigkeiten: [[05-ARCHETYPEN]], [[02-MAPPINGS]], [[DESIGN]]

---

## Grundprinzip

Spezialisierungen sind keine bloßen Labels. Sie müssen drei Fragen beantworten:

1. Welche UI-Elemente unterscheiden diese Spezialisierung vom Basis-Archetyp?
2. Welche JSON-Felder sind spezifisch für diese Spezialisierung?
3. Welche Heuristiken erkennen diese Spezialisierung im Datensatz?

Ohne diese Operationalisierung ist eine Spezialisierung Taxonomie-Dekoration ohne praktischen Wert.

---

## Reader-Spezialisierungen

### Edition

Die Edition ist für kritische Textausgaben mit Apparaten, Varianten und Kommentaren.

#### Kognitive Aufgabe

Vergleichendes Lesen mit Bewusstsein für Textgeschichte. Der Nutzer muss Varianten, Emendationen und editorische Eingriffe nachvollziehen.

#### Unterscheidende UI-Elemente

Variantenapparat unterhalb oder neben dem Haupttext. Zeilensynopse für parallele Textversionen. Siglenliste für Handschriften und Drucke. Lemma-Markierungen im Text mit Hover-Expansion. Kritischer Apparat mit normierten Abkürzungen.

#### Spezifische Datenfelder

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
  ],
  "editorial_notes": [
    { "position": 200, "type": "conjecture", "text": "..." }
  ]
}
```

#### Erkennungsheuristiken

Datensatz enthält Felder wie "witnesses", "siglum", "apparatus", "readings", "lemma". Mehrere Textversionen desselben Werks. Strukturierte Varianten mit Zuordnung zu Textzeugen. Editorische Anmerkungen mit Kategorisierung (Konjektur, Emendation, Crux).

---

### Protokoll

Das Protokoll ist für Sitzungsmitschriften, Verhandlungen und formalisierte Gesprächsdokumentation.

#### Kognitive Aufgabe

Nachvollziehen von Entscheidungsprozessen. Der Nutzer rekonstruiert, wie eine Gruppe zu Beschlüssen kam.

#### Unterscheidende UI-Elemente

Sprecherwechsel-Markierungen mit Sprecher-Farbkodierung. Beschluss-Highlighting mit separater Beschlussliste. Tagesordnungspunkt-Navigation. Anwesenheitsliste mit Filtermöglichkeit. Verweis auf frühere Sitzungen.

#### Spezifische Datenfelder

```json
{
  "session": {
    "date": "1923-05-15",
    "number": 42,
    "location": "Rathaus, Saal 3",
    "chair": "Dr. Müller"
  },
  "attendance": [
    { "name": "Schmidt", "role": "Mitglied", "present": true },
    { "name": "Weber", "role": "Gast", "present": true }
  ],
  "agenda": [
    { "number": 1, "title": "Genehmigung des Protokolls", "start_segment": 0 }
  ],
  "segments": [
    {
      "speaker": "Dr. Müller",
      "text": "Ich eröffne die Sitzung.",
      "type": "statement"
    },
    {
      "speaker": null,
      "text": "Der Antrag wird einstimmig angenommen.",
      "type": "resolution",
      "resolution_id": "R-42-1"
    }
  ],
  "resolutions": [
    { "id": "R-42-1", "text": "...", "vote": "unanimous" }
  ]
}
```

#### Erkennungsheuristiken

Datensatz enthält Felder wie "session", "attendance", "agenda", "speaker", "resolution". Strukturierte Sprecherbeiträge mit Sprecherzuordnung. Explizite Beschlüsse oder Abstimmungsergebnisse. Tagesordnungsstruktur.

---

### Transcript

Das Transcript ist für Interviewtranskripte und Gesprächsanalysen.

#### Kognitive Aufgabe

Qualitative Analyse von Gesprochenem. Der Nutzer codiert, annotiert und vergleicht Äußerungen.

#### Unterscheidende UI-Elemente

Turn-Taking-Visualisierung mit Überlappungen. Code-Margin für qualitative Codes. Timestamp-Syncing mit Audio/Video. Parasprachliche Markierungen (Pausen, Betonungen). Code-Häufigkeitsanzeige am Rand.

#### Spezifische Datenfelder

```json
{
  "interview": {
    "id": "INT-2024-017",
    "date": "2024-03-15",
    "duration_seconds": 3420,
    "participants": [
      { "id": "I", "role": "interviewer", "pseudonym": "Interviewer" },
      { "id": "P1", "role": "interviewee", "pseudonym": "Anna" }
    ]
  },
  "turns": [
    {
      "speaker": "I",
      "start_ms": 0,
      "end_ms": 4500,
      "text": "Können Sie mir erzählen, wie das angefangen hat?",
      "codes": []
    },
    {
      "speaker": "P1",
      "start_ms": 4800,
      "end_ms": 15200,
      "text": "Also, das war so (.) äh, ich war damals noch in der Schule.",
      "paralinguistics": [
        { "type": "pause", "position": 18, "duration": "short" },
        { "type": "hesitation", "position": 22 }
      ],
      "codes": ["biography", "education"]
    }
  ],
  "codebook": [
    { "code": "biography", "definition": "Aussagen über Lebensgeschichte" },
    { "code": "education", "definition": "Aussagen über Bildung" }
  ]
}
```

#### Erkennungsheuristiken

Datensatz enthält Felder wie "turns", "speaker", "start_ms", "end_ms", "codes", "paralinguistics". Zeitstempel für Äußerungen. Transkriptionskonventionen (Pausen, Überlappungen). Qualitative Codes.

---

## Scope-Spezialisierungen

### Survey

Survey ist für Umfragedaten mit Likert-Skalen, demografischen Variablen und Fragebogenstruktur.

#### Kognitive Aufgabe

Identifikation von Gruppenunterschieden und Korrelationen. Der Nutzer vergleicht Subgruppen und sucht Zusammenhänge.

#### Unterscheidende UI-Elemente

Demografische Filter-Sidebar (Alter, Geschlecht, Bildung). Likert-Scale-Visualisierung (Diverging Stacked Bar). Signifikanzindikatoren bei Gruppenvergleichen. Fragebogen-Struktur als Navigation. Korrelationsmatrix mit Heatmap.

#### Spezifische Datenfelder

```json
{
  "survey_meta": {
    "title": "Mitarbeiterbefragung 2024",
    "n": 847,
    "response_rate": 0.72,
    "collection_period": { "start": "2024-01", "end": "2024-02" }
  },
  "scales": [
    {
      "id": "satisfaction",
      "label": "Arbeitszufriedenheit",
      "items": ["sat_1", "sat_2", "sat_3"],
      "cronbach_alpha": 0.87
    }
  ],
  "items": [
    {
      "id": "sat_1",
      "text": "Ich bin mit meiner Arbeit zufrieden.",
      "type": "likert",
      "scale": { "min": 1, "max": 5, "labels": ["stimme nicht zu", "...", "stimme zu"] }
    }
  ],
  "demographics": [
    { "id": "age_group", "type": "categorical", "values": ["<30", "30-50", ">50"] },
    { "id": "department", "type": "categorical", "values": ["IT", "HR", "Sales"] }
  ],
  "respondents": [
    { "id": 1, "age_group": "<30", "department": "IT", "sat_1": 4, "sat_2": 5, "sat_3": 4 }
  ]
}
```

#### Erkennungsheuristiken

Datensatz enthält Felder wie "scales", "items", "likert", "demographics", "response_rate", "cronbach_alpha". Numerische Werte in begrenztem Bereich (1-5, 1-7). Demografische Gruppierungsvariablen. Fragebogenstruktur mit Items und Skalen.

---

### Monitor

Monitor ist für Echtzeit- oder Zeitreihendaten mit Schwellwerten und Anomalieerkennung.

#### Kognitive Aufgabe

Zustandsüberwachung und Ausreißererkennung. Der Nutzer identifiziert Abweichungen vom Normalzustand.

#### Unterscheidende UI-Elemente

Ampel-Indikatoren für Schwellwerte. Sparklines für schnellen Trendüberblick. Anomalie-Highlighting in Zeitreihen. Threshold-Linien in Charts. Alert-Log mit Zeitstempeln. Auto-Refresh-Indikator.

#### Spezifische Datenfelder

```json
{
  "system": {
    "name": "Produktionsanlage A",
    "location": "Halle 3"
  },
  "metrics": [
    {
      "id": "temperature",
      "label": "Temperatur",
      "unit": "°C",
      "thresholds": {
        "warning_low": 15,
        "critical_low": 10,
        "warning_high": 35,
        "critical_high": 40
      },
      "normal_range": { "min": 18, "max": 28 }
    }
  ],
  "readings": [
    {
      "timestamp": "2024-03-15T14:30:00Z",
      "temperature": 32.5,
      "status": "warning",
      "anomaly_score": 0.72
    }
  ],
  "alerts": [
    {
      "timestamp": "2024-03-15T14:30:00Z",
      "metric": "temperature",
      "type": "threshold_exceeded",
      "value": 32.5,
      "threshold": 30,
      "acknowledged": false
    }
  ]
}
```

#### Erkennungsheuristiken

Datensatz enthält Felder wie "thresholds", "alerts", "anomaly_score", "status", "readings" mit Timestamps. Definierte Normalwerte oder Grenzwerte. Statusfelder (ok, warning, critical). Hohe zeitliche Auflösung der Daten.

---

### Matrix

Matrix ist für Kreuzvergleiche und mehrdimensionale Häufigkeitsanalysen.

#### Kognitive Aufgabe

Identifikation von Zellmustern in zweidimensionalen Tabellen. Der Nutzer sucht Über- und Unterrepräsentationen.

#### Unterscheidende UI-Elemente

Heatmap-Färbung nach Zellwerten. Zeilen- und Spalten-Marginalen. Residuen-Anzeige (beobachtet vs. erwartet). Chi-Quadrat-Indikator. Sortierbare Achsen. Highlight bei Klick auf Zeile/Spalte.

#### Spezifische Datenfelder

```json
{
  "matrix_meta": {
    "title": "Studienfachwahl nach Geschlecht",
    "source": "Statistisches Bundesamt 2023"
  },
  "dimensions": {
    "rows": {
      "id": "subject",
      "label": "Studienfach",
      "values": ["Informatik", "Germanistik", "Medizin", "Jura"]
    },
    "columns": {
      "id": "gender",
      "label": "Geschlecht",
      "values": ["männlich", "weiblich", "divers"]
    }
  },
  "cells": [
    { "row": "Informatik", "column": "männlich", "count": 12450, "expected": 8900, "residual": 3.2 },
    { "row": "Informatik", "column": "weiblich", "count": 3200, "expected": 6750, "residual": -2.8 }
  ],
  "totals": {
    "row_totals": { "Informatik": 15800, "Germanistik": 8200 },
    "column_totals": { "männlich": 45000, "weiblich": 52000 },
    "grand_total": 98000
  },
  "statistics": {
    "chi_square": 234.5,
    "p_value": 0.0001,
    "cramers_v": 0.32
  }
}
```

#### Erkennungsheuristiken

Datensatz enthält Felder wie "dimensions", "cells", "row", "column", "count", "expected", "residual", "chi_square". Kreuztabellenstruktur mit Zeilen- und Spaltendimensionen. Aggregierte Zählungen pro Zelle. Statistische Kennwerte für Zusammenhänge.

---

## Navigator-Spezialisierungen

### Citation

Citation ist für bibliometrische Netzwerke und wissenschaftliche Referenzsysteme.

#### Kognitive Aufgabe

Rekonstruktion intellektueller Genealogien. Der Nutzer identifiziert einflussreiche Werke und Zitationsmuster.

#### Unterscheidende UI-Elemente

Publikationsjahr als vertikale Achse (Zeitfluss von oben nach unten). Impact-Indikator (Knotengröße nach Zitationszahl). Cluster-Färbung nach Forschungsfeld. Bibliografische Details im Node-Inspector. Co-Citation-Hervorhebung.

#### Spezifische Datenfelder

```json
{
  "publications": [
    {
      "id": "kuhn1962",
      "authors": ["Kuhn, Thomas S."],
      "title": "The Structure of Scientific Revolutions",
      "year": 1962,
      "venue": "University of Chicago Press",
      "type": "book",
      "citations_received": 89420,
      "cluster": "philosophy_of_science",
      "doi": "..."
    }
  ],
  "citations": [
    {
      "source": "latour1987",
      "target": "kuhn1962",
      "context": "direct",
      "section": "introduction"
    }
  ],
  "clusters": [
    {
      "id": "philosophy_of_science",
      "label": "Wissenschaftstheorie",
      "color": "#7B68A6"
    }
  ],
  "metrics": {
    "nodes": 450,
    "edges": 2340,
    "density": 0.023,
    "avg_citations": 12.4
  }
}
```

#### Erkennungsheuristiken

Datensatz enthält Felder wie "publications", "citations", "authors", "year", "venue", "doi", "citations_received". Gerichtete Kanten von zitierendem zu zitiertem Werk. Zeitliche Ordnung (ältere Werke werden zitiert, nicht umgekehrt). Bibliografische Metadaten.

---

### Genealogy

Genealogy ist für Verwandtschafts-, Abstammungs- und Nachfolgebeziehungen.

#### Kognitive Aufgabe

Rekonstruktion von Linien und Verzweigungen. Der Nutzer navigiert vertikal (Generationen) und horizontal (Geschwister, Partner).

#### Unterscheidende UI-Elemente

Generationen-Layout (horizontal geschichtet). Geschlechts-Symbole oder Farbkodierung. Partner-Verbindungen (horizontal) vs. Abstammung (vertikal). Ahnentafel-Ansicht (aufsteigend) und Nachkommentafel (absteigend). Lebensdaten-Timeline.

#### Spezifische Datenfelder

```json
{
  "persons": [
    {
      "id": "P1",
      "name": "Johann Sebastian Bach",
      "gender": "male",
      "birth": { "date": "1685-03-21", "place": "Eisenach" },
      "death": { "date": "1750-07-28", "place": "Leipzig" },
      "generation": 0
    }
  ],
  "relations": [
    {
      "type": "parent_child",
      "parent": "P0",
      "child": "P1"
    },
    {
      "type": "spouse",
      "person1": "P1",
      "person2": "P2",
      "marriage_date": "1707-10-17"
    }
  ],
  "lineages": [
    {
      "id": "L1",
      "name": "Bach-Musiker",
      "members": ["P0", "P1", "P3", "P4"]
    }
  ]
}
```

#### Erkennungsheuristiken

Datensatz enthält Felder wie "persons", "parent", "child", "spouse", "generation", "birth", "death", "gender". Eltern-Kind-Beziehungen. Generationszuordnung. Lebensdaten. Familienbeziehungen (Ehe, Partnerschaft).

---

### Concept

Concept ist für Wissensstrukturen, Ontologien und semantische Netze.

#### Kognitive Aufgabe

Exploration von Begriffshierarchien und Querverbindungen. Der Nutzer versteh,t wie Konzepte zueinander stehen.

#### Unterscheidende UI-Elemente

Hierarchische Baumansicht für Taxonomien. Kantentyp-Legende (is-a, part-of, related-to). Konzept-Definition im Node-Inspector. Pfad-Hervorhebung zwischen Konzepten. Expansions-Kontrolle für Teilbäume.

#### Spezifische Datenfelder

```json
{
  "ontology_meta": {
    "name": "Medical Subject Headings",
    "version": "2024",
    "namespace": "http://..."
  },
  "concepts": [
    {
      "id": "D001921",
      "label": "Brain",
      "definition": "The part of the central nervous system...",
      "synonyms": ["Encephalon", "Cerebrum"],
      "broader": ["D002490"]
    }
  ],
  "relations": [
    {
      "source": "D001921",
      "target": "D002490",
      "type": "broader",
      "label": "is narrower than"
    },
    {
      "source": "D001921",
      "target": "D009474",
      "type": "related",
      "label": "related to"
    }
  ],
  "relation_types": [
    { "id": "broader", "label": "Oberbegriff", "transitive": true },
    { "id": "narrower", "label": "Unterbegriff", "transitive": true },
    { "id": "related", "label": "Verwandt", "transitive": false }
  ]
}
```

#### Erkennungsheuristiken

Datensatz enthält Felder wie "concepts", "broader", "narrower", "definition", "synonyms", "relation_types". Explizite Relationstypen (is-a, part-of, broader-than). Konzeptdefinitionen. Hierarchische Struktur mit Mehrfachvererbung möglich.

---

## Workbench-Spezialisierungen

### Registry

Registry ist für Sammlungsinventare, Objektkataloge und Bestandsverwaltung.

#### Kognitive Aufgabe

Sichten und Korrigieren von Bestandsdaten. Der Nutzer identifiziert Lücken, Duplikate und Inkonsistenzen.

#### Unterscheidende UI-Elemente

Inventarnummer-Suche. Standort-Hierarchie (Gebäude > Raum > Regal). Zustandsfelder mit kontrollierten Vokabularen. Duplikat-Warnung. Vollständigkeitsanzeige pro Datensatz. Batch-Standort-Änderung.

#### Spezifische Datenfelder

```json
{
  "collection_meta": {
    "name": "Gemäldesammlung",
    "institution": "Städtisches Museum",
    "total_objects": 2847
  },
  "schema": {
    "required_fields": ["inventory_number", "title", "location"],
    "controlled_vocabularies": {
      "condition": ["excellent", "good", "fair", "poor", "unknown"],
      "category": ["painting", "sculpture", "print", "drawing"]
    }
  },
  "objects": [
    {
      "inventory_number": "GM-2024-0042",
      "title": "Landschaft mit Fluss",
      "creator": "Unbekannt",
      "date": { "text": "um 1850", "earliest": 1840, "latest": 1860 },
      "dimensions": { "height_cm": 45, "width_cm": 60 },
      "category": "painting",
      "condition": "good",
      "location": {
        "building": "Haupthaus",
        "room": "Depot 3",
        "position": "Regal A-12"
      },
      "provenance": [],
      "completeness_score": 0.75,
      "validation_errors": ["missing_provenance"]
    }
  ],
  "locations": [
    {
      "id": "L1",
      "building": "Haupthaus",
      "rooms": ["Depot 1", "Depot 2", "Depot 3", "Ausstellung"]
    }
  ]
}
```

#### Erkennungsheuristiken

Datensatz enthält Felder wie "inventory_number", "location", "condition", "provenance", "controlled_vocabularies". Eindeutige Identifikatoren (Inventarnummern). Standortfelder mit Hierarchie. Zustandsbeschreibungen. Kontrollierte Vokabulare.

---

### Codebook

Codebook ist für Variablendefinitionen, Datenmodell-Dokumentation und Metadaten-Schemata.

#### Kognitive Aufgabe

Definieren und Dokumentieren von Datenstrukturen. Der Nutzer erstellt konsistente Definitionen für Variablen und Werte.

#### Unterscheidende UI-Elemente

Variable-Liste mit Typ-Icons. Werte-Tabelle mit Labels und Missings. Validierungsregeln-Editor. Abhängigkeits-Anzeige zwischen Variablen. Import von bestehenden Schemata. Export als DDI, SPSS-Syntax oder JSON-Schema.

#### Spezifische Datenfelder

```json
{
  "codebook_meta": {
    "title": "ALLBUS 2022 Codebook",
    "version": "1.0",
    "doi": "...",
    "last_modified": "2024-01-15"
  },
  "variables": [
    {
      "name": "v1",
      "label": "Geschlecht",
      "type": "categorical",
      "measurement_level": "nominal",
      "valid_values": [
        { "value": 1, "label": "männlich" },
        { "value": 2, "label": "weiblich" },
        { "value": 3, "label": "divers" }
      ],
      "missing_values": [
        { "value": -1, "label": "keine Angabe" },
        { "value": -9, "label": "nicht erhoben" }
      ],
      "question_text": "Welches Geschlecht haben Sie?",
      "source_questionnaire": "Hauptfragebogen, S. 2"
    }
  ],
  "variable_groups": [
    {
      "id": "demographics",
      "label": "Soziodemografie",
      "variables": ["v1", "v2", "v3"]
    }
  ],
  "validation_rules": [
    {
      "id": "R1",
      "description": "Alter muss positiv sein",
      "expression": "v2 > 0 OR v2 IN (-1, -9)",
      "affected_variables": ["v2"]
    }
  ]
}
```

#### Erkennungsheuristiken

Datensatz enthält Felder wie "variables", "valid_values", "missing_values", "measurement_level", "question_text", "validation_rules". Variablenbeschreibungen mit Wertelabels. Missing-Value-Definitionen. Messniveau-Angaben. Fragetexte.

---

### Schema

Schema ist für Datenstruktur-Validierung, JSON-Schema-Editierung und API-Spezifikationen.

#### Kognitive Aufgabe

Definieren und Validieren von Datenstrukturen. Der Nutzer spezifiziert erlaubte Formate und prüft Daten gegen diese.

#### Unterscheidende UI-Elemente

Schema-Tree mit Typ-Annotationen. Live-Validierung von Beispieldaten. Fehler-Highlighting mit JSON-Pointer. Type-Dropdown (string, number, array, object). Required-Toggle pro Feld. Regex-Editor für Pattern-Constraints.

#### Spezifische Datenfelder

```json
{
  "schema_meta": {
    "title": "Publication Record",
    "version": "2.0",
    "$schema": "http://json-schema.org/draft-07/schema#"
  },
  "schema": {
    "type": "object",
    "required": ["id", "title", "authors"],
    "properties": {
      "id": {
        "type": "string",
        "pattern": "^PUB-[0-9]{4}-[0-9]{4}$",
        "description": "Unique publication identifier"
      },
      "title": {
        "type": "string",
        "minLength": 1,
        "maxLength": 500
      },
      "authors": {
        "type": "array",
        "minItems": 1,
        "items": {
          "$ref": "#/definitions/author"
        }
      }
    },
    "definitions": {
      "author": {
        "type": "object",
        "required": ["name"],
        "properties": {
          "name": { "type": "string" },
          "orcid": { "type": "string", "pattern": "^[0-9]{4}-..." }
        }
      }
    }
  },
  "test_data": [
    {
      "data": { "id": "PUB-2024-0001", "title": "Test", "authors": [{"name": "A"}] },
      "valid": true
    },
    {
      "data": { "id": "invalid", "title": "" },
      "valid": false,
      "errors": ["id pattern mismatch", "title too short", "authors missing"]
    }
  ]
}
```

#### Erkennungsheuristiken

Datensatz enthält Felder wie "$schema", "properties", "required", "type", "pattern", "definitions", "$ref". JSON-Schema-Struktur. Typ-Definitionen mit Constraints. Referenzen auf Subdefinitionen. Testdaten mit Validierungsergebnissen.

---

## Erkennungsprotokoll für System Prompt

Das LLM prüft folgende Felder in der angegebenen Reihenfolge:

### Reader-Erkennung

```
IF "apparatus" OR "witnesses" OR "siglum" → Edition
IF "session" AND "agenda" AND "speaker" → Protokoll
IF "turns" AND ("start_ms" OR "codes" OR "paralinguistics") → Transcript
ELSE → Basis-Reader
```

### Scope-Erkennung

```
IF "scales" AND "items" AND "likert" → Survey
IF "thresholds" AND ("alerts" OR "anomaly_score") → Monitor
IF "dimensions.rows" AND "dimensions.columns" AND "cells" → Matrix
ELSE → Basis-Scope
```

### Navigator-Erkennung

```
IF "publications" AND "citations" AND "year" → Citation
IF "persons" AND ("parent_child" OR "spouse" OR "generation") → Genealogy
IF "concepts" AND ("broader" OR "narrower" OR "relation_types") → Concept
ELSE → Basis-Navigator
```

### Workbench-Erkennung

```
IF "inventory_number" AND "location" AND "condition" → Registry
IF "variables" AND "valid_values" AND "missing_values" → Codebook
IF "$schema" AND "properties" AND "required" → Schema
ELSE → Basis-Workbench
```

---

## Verknüpfungen

- [[05-ARCHETYPEN]] definiert die Basis-Archetypen, von denen die Spezialisierungen abgeleitet sind
- [[02-MAPPINGS]] beschreibt die grundlegende Entscheidungslogik
- [[DESIGN]] liefert kognitive Begründungen, die auch für Spezialisierungen gelten
- [[04-SYSTEM-PROMPT]] wird um die Erkennungsheuristiken erweitert
