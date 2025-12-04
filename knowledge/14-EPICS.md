# Spezialisierungen: Detail-Spezifikation (Phase 1)

Dieses Dokument operationalisiert die vier Kern-Spezialisierungen. Es definiert nicht nur, *was* das Interface tut, sondern *warum* es dies tun muss, abgeleitet aus den fachspezifischen Standards und Pain Points.

Abhängigkeiten: [[10-SPEZIALISIERUNGEN]], [[05-ARCHETYPEN]], [[12-STANDARDS]]

---

## Zentrale Erkenntnisse aus der Recherche

| Spezialisierung | Kern-Einsicht | Interface-Implikation |
|-----------------|---------------|----------------------|
| Edition | Trennung von Befund und Deutung | Synopse-Ansicht für Textzeugen |
| Survey | Unzertrennlichkeit von Codebook und Daten | Kontextualisierung jedes Datenpunkts |
| Citation | Qualitativer Kontext statt nur Metriken | Wo wurde zitiert, nicht nur wie oft |
| Registry | Der Weg zum Standard, nicht der Standard selbst | Cleaning Station statt Display |

---

## 1. Edition (Reader-Spezialisierung)

**Domäne:** Digitale Philologie
**Leit-Standard:** TEI P5 (Critical Apparatus)

Das Interface muss die **Multivalenz des Textes** sichtbar machen. Es darf keine "eine Wahrheit" suggerieren, sondern muss Varianz als Normalzustand behandeln.

### Kognitive Aufgabe

Vergleichendes Lesen mit Bewusstsein für Textgeschichte. Der Nutzer muss Varianten, Emendationen und editorische Eingriffe nachvollziehen.

### Kognitive Werkzeuge (UI-Implikationen)

**Die Synopse-Linse:** Parallele Anzeige von Textzeugen. Der Scroll-Fortschritt muss synchronisiert sein ("Lock-Scroll"), um Varianten zeilengetreu vergleichen zu können.

**Der Apparat-Fokus:** Varianten (`<rdg>`) dürfen nicht im Fußnotenkeller versteckt sein. Sie müssen bei Klick auf das Lemma (`<lem>`) direkt im Kontext oder in einer dedizierten Sidebar erscheinen ("Context-Aware Sidebar").

**Genetische Filter:** Nutzer müssen Schichten der Textentstehung ein-/ausblenden können (z.B. "Nur Hand A", "Nur Streichungen"), um den Schreibprozess dynamisch zu rekonstruieren.

### Unterscheidende UI-Elemente

Variantenapparat unterhalb oder neben dem Haupttext. Zeilensynopse für parallele Textversionen. Siglenliste für Handschriften und Drucke. Lemma-Markierungen im Text mit Hover-Expansion. Kritischer Apparat mit normierten Abkürzungen.

### Spezifische Datenfelder

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

### Erkennungsheuristiken

Datensatz enthält Felder wie "witnesses", "siglum", "apparatus", "readings", "lemma". Mehrere Textversionen desselben Werks. Strukturierte Varianten mit Zuordnung zu Textzeugen. Editorische Anmerkungen mit Kategorisierung (Konjektur, Emendation, Crux).

### Epic: Kollationierung

Als Editionsphilolog:in möchte ich Textzeugen systematisch vergleichen, um Varianten zu identifizieren und zu dokumentieren.

**User Stories:**
- [ ] Ich kann zwei oder mehr Textzeugen nebeneinander anzeigen
- [ ] Abweichungen werden automatisch hervorgehoben (Diff-Algorithmus)
- [ ] Ich kann Varianten als "signifikant" oder "orthographisch" klassifizieren
- [ ] Der Apparat wird automatisch aus meinen Entscheidungen generiert
- [ ] Scroll-Position ist zwischen Zeugen synchronisiert

### Epic: Apparaterstellung

Als Editionsphilolog:in möchte ich einen kritischen Apparat erstellen, der meine editorischen Entscheidungen transparent dokumentiert.

**User Stories:**
- [ ] Ich kann ein Lemma markieren und Varianten zuweisen
- [ ] Siglen werden automatisch aus der Zeugenliste gezogen
- [ ] Ich kann Apparateinträge mit Anmerkungen versehen
- [ ] Export als TEI-XML validiert gegen das Critical Apparatus Module

### Akzeptanzkriterien

- Mindestens 3 Textzeugen parallel darstellbar
- Apparat entspricht TEI P5 Critical Apparatus Module
- Genetische Schichten filterbar (Hand, Korrekturphase)

---

## 2. Survey (Scope-Spezialisierung)

**Domäne:** Empirische Sozialforschung
**Leit-Standard:** DDI-Lifecycle

Das Interface muss den **Kontextverlust** verhindern. Rohdaten und Metadaten (Codebook) müssen in einer Ansicht verschmelzen.

### Kognitive Aufgabe

Identifikation von Gruppenunterschieden und Korrelationen. Der Nutzer vergleicht Subgruppen und sucht Zusammenhänge.

### Kognitive Werkzeuge (UI-Implikationen)

**Der Codebook-Link:** Hover über eine Variable oder einen Wert im Chart zeigt sofort den ursprünglichen Fragetext und die Skalendefinition ("Variable Inspection").

**Der Missing-Scanner:** Visualisierung von Datenlücken. Nicht einfach "leere" Werte, sondern semantische Unterscheidung (z.B. "verweigert" vs. "trifft nicht zu" vs. "technischer Fehler").

**Die Subgruppen-Lupe:** Schnelles Umschalten zwischen dem Gesamtbild und spezifischen Kohorten (Split-View nach Demografie), um Simpsons Paradoxon und versteckte Trends zu erkennen.

### Unterscheidende UI-Elemente

Demografische Filter-Sidebar (Alter, Geschlecht, Bildung). Likert-Scale-Visualisierung (Diverging Stacked Bar). Signifikanzindikatoren bei Gruppenvergleichen. Fragebogen-Struktur als Navigation. Korrelationsmatrix mit Heatmap.

### Spezifische Datenfelder

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

### Erkennungsheuristiken

Datensatz enthält Felder wie "scales", "items", "likert", "demographics", "response_rate", "cronbach_alpha". Numerische Werte in begrenztem Bereich (1-5, 1-7). Demografische Gruppierungsvariablen. Fragebogenstruktur mit Items und Skalen.

### Epic: Datenexploration mit Kontext

Als empirische Sozialforscher:in möchte ich Umfragedaten explorieren, ohne den Bezug zur ursprünglichen Fragestellung zu verlieren.

**User Stories:**
- [ ] Jede Variable zeigt bei Hover den vollständigen Fragetext
- [ ] Likert-Skalen werden mit ihren Ankerpunkten beschriftet (1="stimme nicht zu", 5="stimme voll zu")
- [ ] Missing Values sind semantisch differenziert (nicht nur "NA")
- [ ] Cronbach's Alpha wird für Skalen automatisch berechnet

### Epic: Subgruppenanalyse

Als empirische Sozialforscher:in möchte ich Unterschiede zwischen demografischen Gruppen identifizieren.

**User Stories:**
- [ ] Ich kann die Gesamtstichprobe nach beliebigen Variablen splitten
- [ ] Signifikanztests (Chi-Quadrat, t-Test) werden automatisch berechnet
- [ ] Effektstärken werden angezeigt, nicht nur p-Werte
- [ ] Split-View erlaubt direkten visuellen Vergleich

### Akzeptanzkriterien

- Vollständige Codebook-Integration (DDI-konform)
- Missing Values werden niemals als "0" dargestellt
- Gewichtung optional zuschaltbar

---

## 3. Citation (Navigator-Spezialisierung)

**Domäne:** Bibliometrie & Wissenschaftsgeschichte
**Leit-Standard:** OpenCitations / MODS

Das Interface muss **Beziehungsqualität** über Quantität stellen. Es muss zeigen, *wie* Wissenschaft aufeinander aufbaut, nicht nur *dass* sie es tut.

### Kognitive Aufgabe

Rekonstruktion intellektueller Genealogien. Der Nutzer identifiziert einflussreiche Werke und Zitationsmuster.

### Kognitive Werkzeuge (UI-Implikationen)

**Der Sektions-Filter:** Kanten im Netzwerk sollten filterbar sein nach dem Ort der Zitation (z.B. "Zeige nur Zitate aus der Methodik-Sektion"). Dies trennt reine "Name-Dropping"-Zitate von methodischer Rezeption.

**Die Zeit-Achse (y-Achse):** Erzwingung einer chronologischen Anordnung (älteste Werke oben/unten). Dies macht "Schulenbildung" und "Genealogien" sofort als Pfade sichtbar.

**Cluster-Semantik:** Automatische Cluster (z.B. durch Co-Citation) müssen manuell benennbar sein ("Labeling Interface"), um maschinelle Struktur mit menschlicher Deutung zu versehen.

### Unterscheidende UI-Elemente

Publikationsjahr als vertikale Achse (Zeitfluss von oben nach unten). Impact-Indikator (Knotengröße nach Zitationszahl). Cluster-Färbung nach Forschungsfeld. Bibliografische Details im Node-Inspector. Co-Citation-Hervorhebung.

### Spezifische Datenfelder

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

### Erkennungsheuristiken

Datensatz enthält Felder wie "publications", "citations", "authors", "year", "venue", "doi", "citations_received". Gerichtete Kanten von zitierendem zu zitiertem Werk. Zeitliche Ordnung (ältere Werke werden zitiert, nicht umgekehrt). Bibliografische Metadaten.

### Epic: Intellektuelle Genealogie rekonstruieren

Als Wissenschaftshistoriker:in möchte ich nachvollziehen, wie Ideen sich über Zitationsketten verbreitet haben.

**User Stories:**
- [ ] Zeitachsen-Layout zeigt chronologische Entwicklung
- [ ] Ich kann einen "Stammbaum" von einer Seed-Publikation aus aufbauen
- [ ] Pfade zwischen zwei Publikationen werden hervorgehoben
- [ ] Cluster zeigen thematische Schulen

### Epic: Qualitative Zitationsanalyse

Als Bibliometriker:in möchte ich verstehen, *warum* Werke zitiert werden, nicht nur wie oft.

**User Stories:**
- [ ] Kanten zeigen den Kontext der Zitation (Methodik, Theorie, Kritik)
- [ ] Filter erlaubt "Nur methodische Rezeption"
- [ ] Unterscheidung zwischen Selbstzitation und Fremdzitation
- [ ] Co-Citation-Paare werden identifiziert und angezeigt

### Akzeptanzkriterien

- Zeitachsen-Layout als Default für mehr als 20 Publikationen
- Mindestens 3 Kontext-Kategorien für Zitationen
- Co-Citation-Berechnung implementiert

---

## 4. Registry (Workbench-Spezialisierung)

**Domäne:** Sammlungsmanagement (GLAM)
**Leit-Standard:** LIDO / Spectrum

Das Interface ist eine **Waschstraße für Daten**. Es muss den Nutzer vom "Ist-Zustand" (Chaos) zum "Soll-Zustand" (Standard) führen.

### Kognitive Aufgabe

Sichten und Korrigieren von Bestandsdaten. Der Nutzer identifiziert Lücken, Duplikate und Inkonsistenzen.

### Kognitive Werkzeuge (UI-Implikationen)

**Der Normdaten-Abgleich:** Eingabefelder für Personen oder Orte müssen eine Live-Suche gegen Normdatenbanken (GND, Getty AAT, Wikidata) bieten ("Reconciliation Widget").

**Der Vollständigkeits-Radar:** Ein Indikator pro Datensatz, der anzeigt, wie viele LIDO-Pflichtfelder erfüllt sind. Gamification der Datenanreicherung.

**Die Batch-Korrektur:** Fehler treten selten allein auf. Wenn "Picasso" einmal falsch geschrieben ist, dann oft hundertfach. Das UI muss "Suchen & Ersetzen" auf strukturierten Feldern erlauben.

### Unterscheidende UI-Elemente

Inventarnummer-Suche. Standort-Hierarchie (Gebäude > Raum > Regal). Zustandsfelder mit kontrollierten Vokabularen. Duplikat-Warnung. Vollständigkeitsanzeige pro Datensatz. Batch-Standort-Änderung.

### Spezifische Datenfelder

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

### Erkennungsheuristiken

Datensatz enthält Felder wie "inventory_number", "location", "condition", "provenance", "controlled_vocabularies". Eindeutige Identifikatoren (Inventarnummern). Standortfelder mit Hierarchie. Zustandsbeschreibungen. Kontrollierte Vokabulare.

### Epic: Datenanreicherung

Als Sammlungsregistrar:in möchte ich unvollständige Datensätze systematisch anreichern.

**User Stories:**
- [ ] Vollständigkeitsindikator zeigt Prozent der Pflichtfelder
- [ ] Sortierung nach "am wenigsten vollständig" priorisiert Arbeit
- [ ] Vorschläge aus Normdatenbanken bei der Eingabe
- [ ] Fortschrittsanzeige über die gesamte Sammlung

### Epic: Datenbereinigung

Als Sammlungsregistrar:in möchte ich inkonsistente Daten korrigieren, ohne jeden Datensatz einzeln zu bearbeiten.

**User Stories:**
- [ ] Duplikat-Erkennung nach konfigurierbaren Feldern
- [ ] Batch-Korrektur: "Ersetze X durch Y in allen Datensätzen"
- [ ] Validierung gegen kontrollierte Vokabulare
- [ ] Undo/Redo für alle Batch-Operationen

### Akzeptanzkriterien

- Vollständigkeitsberechnung nach LIDO-Pflichtfeldern
- Normdaten-Lookup für mindestens eine Quelle (GND oder Wikidata)
- Batch-Operationen mit Vorschau vor Ausführung

---

## Phase-2-Spezialisierungen (Kurzreferenz)

Die folgenden 8 Spezialisierungen werden nach Validierung der Phase-1-Ergebnisse detailliert. Recherche-Aufgaben und Primärquellen finden sich in [[13-RESEARCH-PLAN]].

### Protokoll (Reader)

**Domäne:** Parlamentsdokumentation
**Leit-Standard:** Akoma Ntoso

**Kognitive Aufgabe:** Nachvollziehen von Entscheidungsprozessen. Der Nutzer rekonstruiert, wie eine Gruppe zu Beschlüssen kam.

**Spezifische Datenfelder:**

```json
{
  "session": {
    "date": "1923-05-15",
    "number": 42,
    "location": "Rathaus, Saal 3",
    "chair": "Dr. Müller"
  },
  "attendance": [
    { "name": "Schmidt", "role": "Mitglied", "present": true }
  ],
  "agenda": [
    { "number": 1, "title": "Genehmigung des Protokolls", "start_segment": 0 }
  ],
  "segments": [
    { "speaker": "Dr. Müller", "text": "Ich eröffne die Sitzung.", "type": "statement" },
    { "speaker": null, "text": "Der Antrag wird einstimmig angenommen.", "type": "resolution", "resolution_id": "R-42-1" }
  ],
  "resolutions": [
    { "id": "R-42-1", "text": "...", "vote": "unanimous" }
  ]
}
```

---

### Transcript (Reader)

**Domäne:** Gesprächsforschung, Oral History
**Leit-Standard:** EXMARaLDA

**Kognitive Aufgabe:** Qualitative Analyse von Gesprochenem. Der Nutzer codiert, annotiert und vergleicht Äußerungen.

**Spezifische Datenfelder:**

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
    { "code": "biography", "definition": "Aussagen über Lebensgeschichte" }
  ]
}
```

---

### Monitor (Scope)

**Domäne:** Sensorik, IoT, Prozessüberwachung
**Leit-Standard:** OGC SensorThings

**Kognitive Aufgabe:** Zustandsüberwachung und Ausreißererkennung. Der Nutzer identifiziert Abweichungen vom Normalzustand.

**Spezifische Datenfelder:**

```json
{
  "system": { "name": "Produktionsanlage A", "location": "Halle 3" },
  "metrics": [
    {
      "id": "temperature",
      "label": "Temperatur",
      "unit": "°C",
      "thresholds": { "warning_low": 15, "critical_low": 10, "warning_high": 35, "critical_high": 40 },
      "normal_range": { "min": 18, "max": 28 }
    }
  ],
  "readings": [
    { "timestamp": "2024-03-15T14:30:00Z", "temperature": 32.5, "status": "warning", "anomaly_score": 0.72 }
  ],
  "alerts": [
    { "timestamp": "2024-03-15T14:30:00Z", "metric": "temperature", "type": "threshold_exceeded", "value": 32.5, "threshold": 30, "acknowledged": false }
  ]
}
```

---

### Matrix (Scope)

**Domäne:** Statistische Kreuztabellenanalyse
**Leit-Standard:** SDMX-JSON

**Kognitive Aufgabe:** Identifikation von Zellmustern in zweidimensionalen Tabellen. Der Nutzer sucht Über- und Unterrepräsentationen.

**Spezifische Datenfelder:**

```json
{
  "matrix_meta": { "title": "Studienfachwahl nach Geschlecht", "source": "Statistisches Bundesamt 2023" },
  "dimensions": {
    "rows": { "id": "subject", "label": "Studienfach", "values": ["Informatik", "Germanistik", "Medizin"] },
    "columns": { "id": "gender", "label": "Geschlecht", "values": ["männlich", "weiblich", "divers"] }
  },
  "cells": [
    { "row": "Informatik", "column": "männlich", "count": 12450, "expected": 8900, "residual": 3.2 },
    { "row": "Informatik", "column": "weiblich", "count": 3200, "expected": 6750, "residual": -2.8 }
  ],
  "statistics": { "chi_square": 234.5, "p_value": 0.0001, "cramers_v": 0.32 }
}
```

---

### Genealogy (Navigator)

**Domäne:** Historische Demografie, Familienforschung
**Leit-Standard:** GEDCOM X

**Kognitive Aufgabe:** Rekonstruktion von Linien und Verzweigungen. Der Nutzer navigiert vertikal (Generationen) und horizontal (Geschwister, Partner).

**Spezifische Datenfelder:**

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
    { "type": "parent_child", "parent": "P0", "child": "P1" },
    { "type": "spouse", "person1": "P1", "person2": "P2", "marriage_date": "1707-10-17" }
  ],
  "lineages": [
    { "id": "L1", "name": "Bach-Musiker", "members": ["P0", "P1", "P3", "P4"] }
  ]
}
```

---

### Concept (Navigator)

**Domäne:** Wissensorganisation, Ontologie-Engineering
**Leit-Standard:** SKOS

**Kognitive Aufgabe:** Exploration von Begriffshierarchien und Querverbindungen. Der Nutzer versteht, wie Konzepte zueinander stehen.

**Spezifische Datenfelder:**

```json
{
  "ontology_meta": { "name": "Medical Subject Headings", "version": "2024", "namespace": "http://..." },
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
    { "source": "D001921", "target": "D002490", "type": "broader", "label": "is narrower than" },
    { "source": "D001921", "target": "D009474", "type": "related", "label": "related to" }
  ],
  "relation_types": [
    { "id": "broader", "label": "Oberbegriff", "transitive": true },
    { "id": "narrower", "label": "Unterbegriff", "transitive": true },
    { "id": "related", "label": "Verwandt", "transitive": false }
  ]
}
```

---

### Codebook (Workbench)

**Domäne:** Datendokumentation, Forschungsdatenmanagement
**Leit-Standard:** DDI-Lifecycle

**Kognitive Aufgabe:** Definieren und Dokumentieren von Datenstrukturen. Der Nutzer erstellt konsistente Definitionen für Variablen und Werte.

**Spezifische Datenfelder:**

```json
{
  "codebook_meta": { "title": "ALLBUS 2022 Codebook", "version": "1.0", "doi": "...", "last_modified": "2024-01-15" },
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
    { "id": "demographics", "label": "Soziodemografie", "variables": ["v1", "v2", "v3"] }
  ],
  "validation_rules": [
    { "id": "R1", "description": "Alter muss positiv sein", "expression": "v2 > 0 OR v2 IN (-1, -9)", "affected_variables": ["v2"] }
  ]
}
```

---

### Schema (Workbench)

**Domäne:** Datenmodellierung, API-Design
**Leit-Standard:** JSON Schema

**Kognitive Aufgabe:** Definieren und Validieren von Datenstrukturen. Der Nutzer spezifiziert erlaubte Formate und prüft Daten gegen diese.

**Spezifische Datenfelder:**

```json
{
  "schema_meta": { "title": "Publication Record", "version": "2.0", "$schema": "http://json-schema.org/draft-07/schema#" },
  "schema": {
    "type": "object",
    "required": ["id", "title", "authors"],
    "properties": {
      "id": { "type": "string", "pattern": "^PUB-[0-9]{4}-[0-9]{4}$", "description": "Unique publication identifier" },
      "title": { "type": "string", "minLength": 1, "maxLength": 500 },
      "authors": { "type": "array", "minItems": 1, "items": { "$ref": "#/definitions/author" } }
    },
    "definitions": {
      "author": {
        "type": "object",
        "required": ["name"],
        "properties": { "name": { "type": "string" }, "orcid": { "type": "string", "pattern": "^[0-9]{4}-..." } }
      }
    }
  },
  "test_data": [
    { "data": { "id": "PUB-2024-0001", "title": "Test", "authors": [{"name": "A"}] }, "valid": true },
    { "data": { "id": "invalid", "title": "" }, "valid": false, "errors": ["id pattern mismatch", "title too short", "authors missing"] }
  ]
}
```

---

## Zusammenfassung: Die vier Kern-Einsichten

1. **Edition:** Das Interface muss Multivalenz ermöglichen, nicht Eindeutigkeit erzwingen.

2. **Survey:** Keine Zahl ohne ihre Frage. Codebook und Daten sind untrennbar.

3. **Citation:** Qualität der Rezeption (wo, wie) ist wichtiger als Quantität (wie oft).

4. **Registry:** Das Interface ist eine Werkstatt, kein Showroom. Es hilft beim Aufräumen.

---

## Verknüpfung zur Demo-Implementierung

Diese Spezifikationen fließen in die JavaScript-Module:

| Spezialisierung | Modul | Prioritäre Erweiterung |
|-----------------|-------|------------------------|
| Edition | `docs/js/specializations/edition.js` | Synopse-View, Lock-Scroll |
| Survey | `docs/js/specializations/survey.js` | Codebook-Hover, Missing-Semantik |
| Citation | `docs/js/specializations/citation.js` | Zeitachsen-Layout, Kontext-Filter |
| Registry | `docs/js/specializations/registry.js` | Vollständigkeits-Score, Batch-Fix |

---

## Verknüpfungen

- [[10-SPEZIALISIERUNGEN]] enthält den Katalog und das Erkennungsprotokoll
- [[12-STANDARDS]] dokumentiert Formate und Ingest-Logik
- [[13-RESEARCH-PLAN]] enthält Recherche-Aufgaben für alle 12 Spezialisierungen
- [[05-ARCHETYPEN]] definiert die Basis-Archetypen
