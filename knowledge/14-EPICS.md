# Spezialisierungen: Detail-Spezifikation (Phase 1)

Dieses Dokument operationalisiert die vier Kern-Spezialisierungen. Es definiert nicht nur, *was* das Interface tut, sondern *warum* es dies tun muss, abgeleitet aus den fachspezifischen Standards und Pain Points.

Abhängigkeiten: [[10-SPEZIALISIERUNGEN]], [[05-ARCHETYPEN]], [[12-STANDARDS]]

---

## Zentrale Erkenntnisse aus der Recherche

| Spezialisierung | Kern-Einsicht | Interface-Implikation |
|-----------------|---------------|----------------------|
| **Edition** | Trennung von Befund und Deutung | Synopse-Ansicht für Textzeugen |
| **Survey** | Unzertrennlichkeit von Codebook und Daten | Kontextualisierung jedes Datenpunkts |
| **Citation** | Qualitativer Kontext statt nur Metriken | Wo wurde zitiert, nicht nur wie oft |
| **Registry** | Der Weg zum Standard, nicht der Standard selbst | Cleaning Station statt Display |

---

## 1. Edition (Reader-Spezialisierung)

**Domäne:** Digitale Philologie
**Leit-Standard:** TEI P5 (Critical Apparatus)

Das Interface muss die **Multivalenz des Textes** sichtbar machen. Es darf keine "eine Wahrheit" suggerieren, sondern muss Varianz als Normalzustand behandeln.

### Kognitive Werkzeuge (UI-Implikationen)

**Die Synopse-Linse:** Parallele Anzeige von Textzeugen. Der Scroll-Fortschritt muss synchronisiert sein ("Lock-Scroll"), um Varianten zeilengetreu vergleichen zu können.

**Der Apparat-Fokus:** Varianten (`<rdg>`) dürfen nicht im Fußnotenkeller versteckt sein. Sie müssen bei Klick auf das Lemma (`<lem>`) direkt im Kontext oder in einer dedizierten Sidebar erscheinen ("Context-Aware Sidebar").

**Genetische Filter:** Nutzer müssen Schichten der Textentstehung ein-/ausblenden können (z.B. "Nur Hand A", "Nur Streichungen"), um den Schreibprozess dynamisch zu rekonstruieren.

### Kritische Datenfelder (Erkennung)

- `witnesses` - Liste der Textzeugen mit Siglen
- `apparatus` - Verknüpfung von Textstellen mit Varianten
- `hand_shifts` - Schreiberwechsel im Manuskript

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

### Kognitive Werkzeuge (UI-Implikationen)

**Der Codebook-Link:** Hover über eine Variable oder einen Wert im Chart zeigt sofort den ursprünglichen Fragetext und die Skalendefinition ("Variable Inspection").

**Der Missing-Scanner:** Visualisierung von Datenlücken. Nicht einfach "leere" Werte, sondern semantische Unterscheidung (z.B. "verweigert" vs. "trifft nicht zu" vs. "technischer Fehler").

**Die Subgruppen-Lupe:** Schnelles Umschalten zwischen dem Gesamtbild und spezifischen Kohorten (Split-View nach Demografie), um Simpsons Paradoxon und versteckte Trends zu erkennen.

### Kritische Datenfelder (Erkennung)

- `question_text` - Der originale Wortlaut der Frage
- `valid_range` vs. `missing_values` - Explizite Definition von Nullwerten
- `weighting` - Gewichtungsfaktoren für repräsentative Aussagen

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

### Kognitive Werkzeuge (UI-Implikationen)

**Der Sektions-Filter:** Kanten im Netzwerk sollten filterbar sein nach dem Ort der Zitation (z.B. "Zeige nur Zitate aus der Methodik-Sektion"). Dies trennt reine "Name-Dropping"-Zitate von methodischer Rezeption.

**Die Zeit-Achse (y-Achse):** Erzwingung einer chronologischen Anordnung (älteste Werke oben/unten). Dies macht "Schulenbildung" und "Genealogien" sofort als Pfade sichtbar.

**Cluster-Semantik:** Automatische Cluster (z.B. durch Co-Citation) müssen manuell benennbar sein ("Labeling Interface"), um maschinelle Struktur mit menschlicher Deutung zu versehen.

### Kritische Datenfelder (Erkennung)

- `citation_context` - In welchem Kapitel/Abschnitt wurde zitiert?
- `publication_date` - Zwingend für die Zeitachse
- `abstract` - Für semantisches Clustering

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

### Kognitive Werkzeuge (UI-Implikationen)

**Der Normdaten-Abgleich:** Eingabefelder für Personen oder Orte müssen eine Live-Suche gegen Normdatenbanken (GND, Getty AAT, Wikidata) bieten ("Reconciliation Widget").

**Der Vollständigkeits-Radar:** Ein Indikator pro Datensatz, der anzeigt, wie viele LIDO-Pflichtfelder erfüllt sind. Gamification der Datenanreicherung.

**Die Batch-Korrektur:** Fehler treten selten allein auf. Wenn "Picasso" einmal falsch geschrieben ist, dann oft hundertfach. Das UI muss "Suchen & Ersetzen" auf strukturierten Feldern erlauben.

### Kritische Datenfelder (Erkennung)

- `inventory_number` - Der primäre Key
- `controlled_vocabulary` - Referenz auf Thesauri
- `completeness_score` - Berechnete Metrik für Datenqualität

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
