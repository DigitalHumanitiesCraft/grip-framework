# Workflows: Pfade durch die Archetypen

Archetypen sind Momentaufnahmen einer Forschungsphase. Forschung selbst ist ein Prozess, der mehrere Phasen durchläuft. Dieses Dokument beschreibt typische Pfade durch die vier Archetypen.

---

## Konzept

Die Matrix (Topologie × Intention → Archetyp) beantwortet: "Welches Interface brauche ich jetzt?"

Workflows beantworten: "In welcher Reihenfolge durchlaufe ich Interfaces für mein Forschungsziel?"

Ein Workflow besteht aus:
- **Einstiegspunkt**: Welcher Archetyp zuerst?
- **Übergänge**: Wann und warum wechseln?
- **Iterationen**: Wo sind Rücksprünge üblich?
- **Abschluss**: Welcher Archetyp produziert das Endergebnis?

---

## Workflow 1: Qualitative Analyse

Grounded Theory, thematische Analyse, interpretative Phänomenologie.

```
┌─────────┐    ┌───────────┐    ┌───────────┐    ┌─────────┐
│ Reader  │───▶│ Workbench │───▶│ Navigator │───▶│  Scope  │
│(Lesen)  │    │(Codieren) │    │(Vernetzen)│    │(Prüfen) │
└─────────┘    └───────────┘    └───────────┘    └─────────┘
     ▲              │                 │
     └──────────────┴─────────────────┘
              (Iteration)
```

### Phasen

**Phase 1: Reader (Verstehen)**
- Material: Interview-Transkripte, Feldnotizen
- Aufgabe: Text sequenziell lesen, erste Eindrücke notieren
- Übergang zu Workbench: "Ich sehe wiederkehrende Muster"

**Phase 2: Workbench (Kuratieren)**
- Material: Text + emergente Codes
- Aufgabe: Codes anlegen, Textstellen zuweisen, Definitionen schreiben
- Übergang zu Navigator: "Codes verdichten sich zu Kategorien"
- Rücksprung zu Reader: "Neuer Fall erfordert offenes Lesen"

**Phase 3: Navigator (Rekonstruieren)**
- Material: Code-System als Netzwerk
- Aufgabe: Beziehungen zwischen Codes visualisieren, Kernkategorien identifizieren
- Übergang zu Scope: "Theorie ist stabil, Fallvergleich möglich"
- Rücksprung zu Workbench: "Neue Subcodes nötig"

**Phase 4: Scope (Vergleichen)**
- Material: Fälle × Kategorien Matrix
- Aufgabe: Systematischer Fallvergleich, Typenbildung
- Abschluss: Theoretische Sättigung erreicht

### User Story

Als qualitative Forscherin möchte ich Interview-Material systematisch analysieren, indem ich iterativ zwischen Lesen, Codieren, Vernetzen und Vergleichen wechsle, um eine datengestützte Theorie zu entwickeln.

---

## Workflow 2: Systematisches Literaturreview

Scoping Review, Meta-Analyse, Forschungsstand-Erhebung.

```
┌───────────┐    ┌─────────┐    ┌───────────┐    ┌─────────┐
│ Navigator │───▶│ Reader  │───▶│ Workbench │───▶│  Scope  │
│(Mapping)  │    │(Lesen)  │    │(Exzerpte) │    │(Synthese│
└───────────┘    └─────────┘    └───────────┘    └─────────┘
      ▲               │
      └───────────────┘
        (Nachrecherche)
```

### Phasen

**Phase 1: Navigator (Rekonstruieren)**
- Material: Zitationsdatenbank, Suchergebnisse
- Aufgabe: Literaturlandschaft kartieren, Cluster identifizieren, Schlüsseltexte finden
- Übergang zu Reader: "Relevante Texte identifiziert"

**Phase 2: Reader (Verstehen)**
- Material: Ausgewählte Publikationen
- Aufgabe: Volltexte lesen, Argumente nachvollziehen
- Übergang zu Workbench: "Informationen extrahieren"
- Rücksprung zu Navigator: "Referenzen führen zu neuen Quellen"

**Phase 3: Workbench (Kuratieren)**
- Material: Exzerpte, Zitate, Bewertungen
- Aufgabe: Strukturierte Datenextraktion, Qualitätsbewertung
- Übergang zu Scope: "Datenextraktion abgeschlossen"

**Phase 4: Scope (Vergleichen)**
- Material: Extrahierte Daten aller Studien
- Aufgabe: Studien vergleichen, Evidenz synthesieren, Lücken identifizieren
- Abschluss: Synthesebericht oder Meta-Analyse

### User Story

Als Wissenschaftlerin möchte ich den Forschungsstand zu einem Thema systematisch aufarbeiten, indem ich erst die Literaturlandschaft kartiere, dann gezielt lese und extrahiere, um eine fundierte Synthese zu erstellen.

---

## Workflow 3: Datenbereinigung und Migration

ETL-Prozesse, Systemwechsel, Qualitätssicherung.

```
┌─────────┐    ┌───────────┐    ┌─────────┐
│  Scope  │───▶│ Workbench │───▶│  Scope  │
│(Analyse)│    │(Bereinig.)│    │(Validier)│
└─────────┘    └───────────┘    └─────────┘
                    │                 │
                    └────────◀────────┘
                       (Iteration)
```

### Phasen

**Phase 1: Scope (Vergleichen)**
- Material: Rohdaten-Export
- Aufgabe: Datenqualität analysieren, Fehlertypen identifizieren, Umfang abschätzen
- Übergang zu Workbench: "Fehlermuster verstanden"

**Phase 2: Workbench (Kuratieren)**
- Material: Daten + Validierungsregeln
- Aufgabe: Fehler korrigieren, Formate normalisieren, Duplikate entfernen
- Übergang zu Scope: "Bereinigung durchgeführt"
- Iteration: Neue Fehlertypen entdeckt → zurück zu Workbench

**Phase 3: Scope (Vergleichen)**
- Material: Bereinigte Daten
- Aufgabe: Validierung gegen Zielschema, Vollständigkeitsprüfung
- Abschluss: Daten bereit für Import

### User Story

Als Datenmanagerin möchte ich einen Datenexport für die Migration vorbereiten, indem ich erst die Qualität analysiere, dann systematisch bereinige und abschließend validiere, um einen fehlerfreien Import zu gewährleisten.

---

## Workflow 4: Digitale Edition

Kritische Editionen, Briefwechsel, historische Quellen.

```
┌─────────┐    ┌───────────┐    ┌───────────┐    ┌─────────┐
│ Reader  │───▶│ Workbench │───▶│ Navigator │───▶│ Reader  │
│(Transkr)│    │(Normalis.)│    │(Verweise) │    │(Publikat)│
└─────────┘    └───────────┘    └───────────┘    └─────────┘
     ▲              │
     └──────────────┘
      (Korrekturen)
```

### Phasen

**Phase 1: Reader (Verstehen)**
- Material: Faksimiles, Handschriften
- Aufgabe: Transkription erstellen, Lesarten notieren
- Übergang zu Workbench: "Rohtranskription fertig"

**Phase 2: Workbench (Kuratieren)**
- Material: Transkriptionen + Editionsrichtlinien
- Aufgabe: Normalisierung, TEI-Auszeichnung, Sachkommentare
- Übergang zu Navigator: "Texte ausgezeichnet"
- Rücksprung zu Reader: "Lesung unklar, Faksimile prüfen"

**Phase 3: Navigator (Rekonstruieren)**
- Material: Annotierte Texte
- Aufgabe: Querverweise erstellen, Personen/Orte/Werke verknüpfen
- Übergang zu Reader (Publikation): "Verknüpfungen vollständig"

**Phase 4: Reader (Verstehen) – Publikationsansicht**
- Material: Fertige Edition
- Aufgabe: Leseumgebung für Nutzer*innen
- Abschluss: Publizierte digitale Edition

### User Story

Als Editorin möchte ich einen historischen Briefwechsel digital edieren, indem ich transkribiere, normalisiere, verknüpfe und publiziere, um die Quellen für die Forschung zugänglich zu machen.

---

## Workflow 5: Survey-Forschung

Fragebogenentwicklung, Datenerhebung, Auswertung.

```
┌───────────┐    ┌─────────┐    ┌───────────┐
│ Workbench │───▶│  Scope  │───▶│ Navigator │
│(Codebook) │    │(Auswert)│    │(Zusammenh)│
└───────────┘    └─────────┘    └───────────┘
                      │
                      ▼
                ┌─────────┐
                │ Reader  │
                │(Bericht)│
                └─────────┘
```

### Phasen

**Phase 1: Workbench (Kuratieren)**
- Material: Fragebogen-Items, Skalendefinitionen
- Aufgabe: Codebook erstellen, Variablen definieren, Wertelabels vergeben
- Übergang zu Scope: "Datenerhebung abgeschlossen"

**Phase 2: Scope (Vergleichen)**
- Material: Erhobene Rohdaten
- Aufgabe: Deskriptive Statistik, Gruppenvergleiche, Filteranalysen
- Übergang zu Navigator: "Zusammenhänge untersuchen"

**Phase 3: Navigator (Rekonstruieren)**
- Material: Korrelationen, Faktorladungen
- Aufgabe: Zusammenhangsstrukturen visualisieren, Modelle prüfen
- Übergang zu Reader: "Ergebnisse interpretieren"

**Phase 4: Reader (Verstehen)**
- Material: Analyseergebnisse + Interpretation
- Aufgabe: Ergebnisbericht verfassen, Limitationen diskutieren
- Abschluss: Publikationsreifer Bericht

### User Story

Als empirische Sozialforscherin möchte ich Survey-Daten auswerten, indem ich vom strukturierten Codebook über deskriptive Analysen zu Zusammenhangsanalysen fortschreite, um fundierte Aussagen über die Population zu treffen.

---

## Workflow-Auswahl

| Wenn du... | ...dann starte mit | Workflow |
|------------|-------------------|----------|
| Interviews auswerten willst | Reader | Qualitative Analyse |
| Literatur systematisch aufarbeiten willst | Navigator | Literaturreview |
| Daten migrieren musst | Scope | Datenbereinigung |
| historische Quellen edieren willst | Reader | Digitale Edition |
| Umfragedaten auswerten willst | Workbench | Survey-Forschung |

---

## Iteration und Flexibilität

Workflows sind keine starren Abläufe. Typische Abweichungen:

**Rücksprünge**: Fast jeder Workflow enthält Iterationsschleifen. Neue Erkenntnisse in späteren Phasen erfordern Anpassungen in früheren.

**Parallele Nutzung**: Manchmal braucht man zwei Archetypen gleichzeitig (z.B. Reader für Einzeltext + Navigator für Überblick).

**Verkürzte Workflows**: Nicht jedes Projekt durchläuft alle Phasen. Eine schnelle Datenprüfung braucht nur Scope → Workbench.

**Erweiterte Workflows**: Komplexe Projekte kombinieren mehrere Basis-Workflows.

---

## Verbindung zur Matrix

Die Workflows ändern nichts an der Matrix-Logik. Sie zeigen nur, dass:

1. Die **Topologie** sich im Projektverlauf ändern kann (Rohdaten → strukturierte Daten)
2. Die **Intention** sich im Projektverlauf ändert (Verstehen → Kuratieren → Vergleichen)
3. Jeder Phasenwechsel eine neue Matrix-Abfrage auslöst

Die Matrix bleibt das Instrument für die Momentaufnahme. Workflows beschreiben typische Sequenzen solcher Momentaufnahmen.
