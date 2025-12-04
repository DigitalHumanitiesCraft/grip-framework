# Recherche-Plan: Forschungsprozesse pro Spezialisierung

Ziel: Jede der 12 Spezialisierungen mit validierten Epics und User Stories unterlegen.

---

## Recherche-Methodik

### Primärquellen pro Spezialisierung

| Typ | Beschreibung | Beispiel |
|-----|--------------|----------|
| **Methodenhandbuch** | Kanonische Fachliteratur | Schnell/Hill/Esser für Survey |
| **Standard-Dokumentation** | Technische Spezifikation | TEI Guidelines für Edition |
| **Referenz-Software** | Etablierte Tools der Domäne | MAXQDA für Transcript |
| **Open-Data-Projekt** | Öffentliche Forschungsdaten | OpenCitations für Citation |
| **Community-Forum** | Praxisprobleme der Nutzer | DHd-Forum für Edition |

### Recherche-Fragen pro Spezialisierung

1. **Wer** arbeitet mit diesen Daten? (Rolle, Institution, Karrierestufe)
2. **Was** ist das typische Projektformat? (Dissertation, Drittmittel, Langzeit)
3. **Wie** sieht der Workflow aus? (Phasen, Tools, Übergaben)
4. **Wo** scheitern existierende Lösungen? (Schmerzpunkte, Workarounds)
5. **Woran** wird Qualität gemessen? (Standards, Peer-Review, Nachnutzbarkeit)

---

## Spezialisierung 1: Edition (Reader)

### Domäne
Editionswissenschaft, Digitale Philologie, Textkritik

### Primärquellen

**Methodenhandbücher:**
- Plachta, Bodo: Editionswissenschaft (Reclam, 2020)
- Sahle, Patrick: Digitale Editionsformen (Diss., 2013) - online verfügbar
- Driscoll/Pierazzo: Digital Scholarly Editing (Open Book, 2016)

**Standard:**
- TEI P5 Guidelines, Kapitel 12: Critical Apparatus
- https://tei-c.org/release/doc/tei-p5-doc/en/html/TC.html

**Referenz-Software:**
- Classical Text Editor (CTE)
- CollateX (Kollationierung)
- EVT (Edition Visualization Technology)

**Open-Data-Projekte:**
- Faustedition (faustedition.net) - TEI-Quelldaten auf GitHub
- Briefedition Alfred Escher (briefedition.alfred-escher.ch)
- Deutsches Textarchiv (deutschestextarchiv.de)

**Community:**
- DHd-Mailingliste, Jahrestagungen
- RIDE (Review Journal for Digital Editions)
- Institut für Dokumentologie und Editorik (IDE)

### Recherche-Aufgaben

- [ ] Sahle (2013) Kapitel 2-3 lesen: Editionstypen und Workflows
- [ ] TEI Critical Apparatus Module durcharbeiten
- [ ] Faustedition GitHub-Issues analysieren: Welche Probleme wurden gelöst?
- [ ] RIDE-Rezensionen lesen: Welche Kriterien werden angelegt?
- [ ] 2-3 CollateX-Tutorials durcharbeiten: Kollationierungs-Workflow verstehen

---

## Spezialisierung 2: Protokoll (Reader)

### Domäne
Parlamentsdokumentation, Gremienwesen, Verwaltung

### Primärquellen

**Standard:**
- Akoma Ntoso (OASIS Standard für legislative Dokumente)
- https://docs.oasis-open.org/legaldocml/akn-core/v1.0/akn-core-v1.0.html

**Open-Data-Projekte:**
- Open Legal Data (openlegaldata.io)
- Bundestag Open Data (bundestag.de/services/opendata)
- OffenesParlament.de

**Referenz-Software:**
- AT4AM (Amendment Editor der EU)
- LegisPro

**Community:**
- Legal XML Community
- Parlamentsarchive

### Recherche-Aufgaben

- [ ] Akoma Ntoso Primer lesen
- [ ] Bundestags-XML-Schema analysieren
- [ ] OffenesParlament-Datenstruktur verstehen
- [ ] Workflow eines Parlamentsstenografen recherchieren

---

## Spezialisierung 3: Transcript (Reader)

### Domäne
Gesprächsforschung, Qualitative Sozialforschung, Oral History

### Primärquellen

**Methodenhandbücher:**
- Deppermann, Arnulf: Gespräche analysieren (VS Verlag, 2008)
- Selting et al.: GAT 2 (Gesprächsforschung, 2009)

**Standard:**
- EXMARaLDA (Hamburger Zentrum für Sprachkorpora)
- FOLKER Transkriptionseditor

**Referenz-Software:**
- MAXQDA (Qualitative Datenanalyse)
- f4transkript / f4analyse
- ELAN (Max Planck Institute)

**Open-Data-Projekte:**
- FOLK (Forschungs- und Lehrkorpus Gesprochenes Deutsch)
- DGD (Datenbank für Gesprochenes Deutsch)
- Oral History Archive

**Community:**
- Verein für Gesprächsforschung
- CLARIN-D

### Recherche-Aufgaben

- [ ] GAT 2 Konventionen lernen
- [ ] EXMARaLDA-Datenmodell verstehen
- [ ] MAXQDA-Workflow für Codierung nachvollziehen
- [ ] Interview-Transkriptions-Workflow dokumentieren

---

## Spezialisierung 4: Survey (Scope)

### Domäne
Umfrageforschung, Empirische Sozialforschung

### Primärquellen

**Methodenhandbücher:**
- Schnell/Hill/Esser: Methoden der empirischen Sozialforschung
- Porst: Fragebogen (Springer VS)
- Diekmann: Empirische Sozialforschung

**Standard:**
- DDI (Data Documentation Initiative)
- DDI-Codebook (DDI-C) für einfache Umfragen
- DDI-Lifecycle für komplexe Studien

**Referenz-Software:**
- SPSS / STATA / R
- SoSci Survey (Erhebung)
- Questback / LimeSurvey

**Open-Data-Projekte:**
- GESIS Datenbestandskatalog
- ALLBUS (Allgemeine Bevölkerungsumfrage)
- European Social Survey (ESS)

**Community:**
- GESIS Methodenberatung
- DDI Alliance
- Arbeitskreis Deutscher Marktforschungsinstitute (ADM)

### Recherche-Aufgaben

- [ ] DDI-Codebook Spezifikation lesen
- [ ] ALLBUS-Codebook als Referenz analysieren
- [ ] GESIS-Methodenberichte zu Datenqualität lesen
- [ ] Survey-Workflow von Fragebogendesign bis Analyse dokumentieren

---

## Spezialisierung 5: Monitor (Scope)

### Domäne
Sensorik, IoT, Umweltmonitoring, Prozessüberwachung

### Primärquellen

**Standard:**
- OGC SensorThings API
- https://www.ogc.org/standard/sensorthings/

**Referenz-Software:**
- FROST-Server (Open-Source SensorThings)
- Grafana (Dashboarding)
- InfluxDB (Zeitreihendatenbank)

**Open-Data-Projekte:**
- Luftdaten.info / sensor.community
- Pegelonline (Wasserstandsdaten)
- DWD Open Data (Wetterdaten)

**Community:**
- OGC SensorThings Working Group
- Citizen Science Netzwerke

### Recherche-Aufgaben

- [ ] SensorThings API Spec lesen
- [ ] FROST-Server Tutorial durcharbeiten
- [ ] Luftdaten.info Datenstruktur analysieren
- [ ] Anomalie-Erkennung in Zeitreihen recherchieren

---

## Spezialisierung 6: Matrix (Scope)

### Domäne
Statistik, Kreuztabellenanalyse, Kategoriale Daten

### Primärquellen

**Methodenhandbücher:**
- Agresti: Categorical Data Analysis
- Bortz/Schuster: Statistik für Human- und Sozialwissenschaftler

**Standard:**
- SDMX (Statistical Data and Metadata eXchange)
- SDMX-JSON für Web-APIs

**Referenz-Software:**
- SPSS (Kreuztabellen)
- R (vcd, ggplot2)
- Excel PivotTables

**Open-Data-Projekte:**
- Eurostat (SDMX-API)
- OECD.Stat
- Statistisches Bundesamt (GENESIS)

**Community:**
- SDMX Technical Working Group
- R-Statistik-Community

### Recherche-Aufgaben

- [ ] SDMX-JSON Spezifikation lesen
- [ ] Eurostat-API testen
- [ ] Chi-Quadrat und Residuen-Analyse verstehen
- [ ] Heatmap-Visualisierung für Kreuztabellen recherchieren

---

## Spezialisierung 7: Citation (Navigator)

### Domäne
Bibliometrie, Wissenschaftsforschung, Literaturrecherche

### Primärquellen

**Methodenhandbücher:**
- Garfield: Citation Indexing (klassisch)
- Moed: Citation Analysis in Research Evaluation

**Standard:**
- MODS (Metadata Object Description Schema)
- BibTeX / CSL-JSON

**Referenz-Software:**
- VOSviewer (Netzwerk-Visualisierung)
- Gephi
- CitNetExplorer

**Open-Data-Projekte:**
- OpenCitations (opencitations.net)
- Semantic Scholar API
- OpenAlex

**Community:**
- ISSI (International Society for Scientometrics)
- OpenCitations Community

### Recherche-Aufgaben

- [ ] OpenCitations COCI-Datensatz erkunden
- [ ] VOSviewer-Tutorial durcharbeiten
- [ ] Co-Citation-Analyse verstehen (Small 1973)
- [ ] Bibliometrie-Workflow dokumentieren

---

## Spezialisierung 8: Genealogy (Navigator)

### Domäne
Historische Demografie, Familienforschung, Prosopografie

### Primärquellen

**Standard:**
- GEDCOM (Genealogical Data Communication)
- GEDCOM X (JSON-basierte Erweiterung)
- https://github.com/FamilySearch/gedcomx

**Referenz-Software:**
- Gramps (Open Source)
- Ancestry / MyHeritage (kommerziell)
- webtrees

**Open-Data-Projekte:**
- FamilySearch (familysearch.org)
- Matricula Online (Kirchenbücher)
- Archion

**Community:**
- FamilySearch Developer Community
- CompGen (Verein für Computergenealogie)

### Recherche-Aufgaben

- [ ] GEDCOM X Spezifikation lesen
- [ ] Gramps-Datenmodell verstehen
- [ ] Ahnentafel vs. Stammbaum-Darstellung recherchieren
- [ ] Prosopografie-Methodik (Historische Forschung) verstehen

---

## Spezialisierung 9: Concept (Navigator)

### Domäne
Wissensorganisation, Ontologie-Engineering, Thesaurus-Management

### Primärquellen

**Methodenhandbücher:**
- Hjørland: Foundations of Library and Information Science
- Aitchison et al.: Thesaurus Construction

**Standard:**
- SKOS (Simple Knowledge Organization System)
- https://www.w3.org/TR/skos-reference/

**Referenz-Software:**
- Protégé (Ontologie-Editor)
- PoolParty (Thesaurus-Management)
- Skosmos

**Open-Data-Projekte:**
- GND (Gemeinsame Normdatei)
- Wikidata
- Getty Vocabularies (AAT, TGN, ULAN)

**Community:**
- NKOS (Networked Knowledge Organization Systems)
- Dublin Core Metadata Initiative

### Recherche-Aufgaben

- [ ] SKOS Primer lesen
- [ ] Skosmos-Demo testen
- [ ] Getty AAT-Struktur analysieren
- [ ] Ontologie-Engineering-Workflow verstehen

---

## Spezialisierung 10: Registry (Workbench)

### Domäne
Sammlungsmanagement, Museumsdokumentation, GLAM

### Primärquellen

**Methodenhandbücher:**
- Regeln für die Katalogisierung (RAK)
- SPECTRUM (UK Museum Documentation Standard)

**Standard:**
- LIDO (Lightweight Information Describing Objects)
- https://lido-schema.org/

**Referenz-Software:**
- MuseumPlus
- CollectiveAccess (Open Source)
- Axiell Collections

**Open-Data-Projekte:**
- Europeana
- Deutsche Digitale Bibliothek
- museum-digital

**Community:**
- ICOM CIDOC
- AG Sammlungsmanagement (DMB)

### Recherche-Aufgaben

- [ ] LIDO-Handbuch lesen
- [ ] SPECTRUM-Prozeduren verstehen
- [ ] museum-digital Datenstruktur analysieren
- [ ] Inventarisierungs-Workflow dokumentieren

---

## Spezialisierung 11: Codebook (Workbench)

### Domäne
Datendokumentation, Forschungsdatenmanagement

### Primärquellen

**Standard:**
- DDI-Lifecycle
- https://ddialliance.org/Specification/DDI-Lifecycle/

**Referenz-Software:**
- Colectica (DDI-Editor)
- Dataverse
- NESSTAR Publisher

**Open-Data-Projekte:**
- ICPSR (Inter-university Consortium for Political and Social Research)
- GESIS Datenarchiv
- UK Data Service

**Community:**
- DDI Alliance
- Research Data Alliance (RDA)

### Recherche-Aufgaben

- [ ] DDI-Lifecycle Spezifikation lesen
- [ ] ICPSR-Codebook-Beispiele analysieren
- [ ] Variablendokumentation Best Practices recherchieren
- [ ] Datendokumentations-Workflow verstehen

---

## Spezialisierung 12: Schema (Workbench)

### Domäne
Datenmodellierung, API-Design, Validierung

### Primärquellen

**Standard:**
- JSON Schema (draft-07 und neuer)
- https://json-schema.org/

**Referenz-Software:**
- VS Code (JSON Schema IntelliSense)
- Stoplight Studio
- Swagger/OpenAPI

**Open-Data-Projekte:**
- Schema.org
- JSON Schema Store

**Community:**
- JSON Schema Slack/Discord
- OpenAPI Initiative

### Recherche-Aufgaben

- [ ] JSON Schema Understanding Validation lesen
- [ ] OpenAPI 3.0 Spezifikation verstehen
- [ ] Schema-Evolution und Versionierung recherchieren
- [ ] Validierungs-Workflow dokumentieren

---

## Priorisierung

### Phase 1: Tiefe vor Breite (je 1 pro Archetyp)

| Archetyp | Spezialisierung | Begründung |
|----------|-----------------|------------|
| Reader | **Edition** | Beste Dokumentation (DH-Community), klare Standards |
| Scope | **Survey** | Etablierte Methodik, öffentliche Daten |
| Navigator | **Citation** | Quantifizierbare Metriken, OpenCitations |
| Workbench | **Registry** | GLAM-Sektor gut dokumentiert, LIDO-Standard |

### Phase 2: Erweiterung

Remaining 8 Spezialisierungen nach Validierung der Phase-1-Ergebnisse.

---

## Output pro Spezialisierung

Nach Abschluss der Recherche entsteht pro Spezialisierung:

1. **EPICS.md** - 3-5 Epics mit User Stories
2. **WORKFLOW.md** - Phasen, Tools, Übergaben
3. **ACCEPTANCE.md** - Qualitätskriterien, Testfälle
4. **DATA-SAMPLE.json** - Realistischer Testdatensatz

Diese Dokumente fließen in:
- Verbesserte Demo-Implementierung
- System-Prompt-Erweiterung
- Wissensbasis-Vertiefung
