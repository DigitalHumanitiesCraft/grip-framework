# Design Rationale: Kognitive Begründungen

Dieses Dokument liefert die wissenschaftlichen Begründungen für Interface-Entscheidungen in GRIP. Es basiert auf Erkenntnissen der Human-Computer Interaction (HCI) und kognitiven Ergonomie.

Abhängigkeiten: [[05-ARCHETYPEN]], [[DESIGN]]

---

## Grundprinzip

Interface-Design ist keine Geschmacksfrage. Jede Entscheidung lässt sich aus der kognitiven Aufgabe ableiten. Ein LLM, das diese Begründungen kennt, kann bei Edge-Cases selbst ableiten.

---

## The Reader: Minimierung kognitiver Last beim Deep Reading

### Kognitive Aufgabe

Immersives Lesen erfordert ungestörten Textfluss. Das Auge bewegt sich in Sakkaden (Sprüngen) und Return-Sweeps (Rücksprung zum Zeilenanfang).

### Anforderungen

**Zeilenlänge (Measure):** 60-75 Zeichen (ca. 700px bei 16px Font).
Begründung: Zu lange Zeilen erschweren den Return-Sweep. Zu kurze Zeilen fragmentieren Sinneinheiten.

**Zeilenhöhe (Leading):** Mindestens 1.6em.
Begründung: Unterstützt das Auge beim Finden der nächsten Zeile.

**Keine Unterstreichungen im Fließtext.**
Begründung: Unterstreichungen zerstören Wortbilder und verlangsamen das Lesen. Stattdessen: Hinterlegung oder Farbe für Annotationen.

**Ablenkungsfreie Umgebung.**
Begründung: Charts, Sidebars und interaktive Elemente konkurrieren um Aufmerksamkeit. Reader priorisiert Inhalt vor Dekoration.

### Was Reader nicht kann

Aggregation über viele Texte. Massenverarbeitung. Vergleich von Textvarianten nebeneinander.

---

## The Scope: Prä-attentive Wahrnehmung für Mustererkennung

### Kognitive Aufgabe

Mustererkennung nutzt prä-attentive Verarbeitung: Das visuelle System erkennt Abweichungen vor dem bewussten Denken.

### Anforderungen

**Small Multiples statt interaktiver Einzel-Charts.**
Begründung: Nebeneinanderliegende Grafiken ermöglichen direkten Vergleich ohne Gedächtnisbelastung. Ein einzelner Chart mit Dropdown zwingt zum Memorieren.

**Semantische Farbkodierung für Abweichungen.**
Begründung: Positive/negative Änderungen müssen ohne Legende erkennbar sein. Rot-Grün-Blindheit beachten (zusätzlich Form oder Position nutzen).

**Filter-Sidebar statt sequenzieller Dialoge.**
Begründung: Facettierte Suche zeigt alle Dimensionen gleichzeitig. Pop-up-Dialoge verstecken Kontext.

**KPI-Cards mit Änderungsindikator.**
Begründung: Absolute Werte ohne Kontext sind bedeutungslos. Trend-Pfeile oder Sparklines liefern sofort Orientierung.

### Was Scope nicht kann

Einzelfallvertiefung. Qualitative Interpretation. Datenmanipulation.

---

## The Navigator: Vermeidung des Hairball-Problems

### Kognitive Aufgabe

Netzwerkvisualisierung muss Struktur sichtbar machen, ohne in visuellem Rauschen zu ertrinken (Hairball).

### Anforderungen

**Filtermechanismen bei mehr als 50 Knoten.**
Begründung: Ungefiltertes Force-Directed Layout wird bei Größe unlesbar. Cluster-Filter, Zeitfilter oder Degree-Schwellwerte sind Pflicht.

**Progressive Disclosure für Kanten und Labels.**
Begründung: Alle Labels gleichzeitig anzeigen erzeugt Überlappung. Labels erscheinen bei Hover/Fokus.

**Mehrere Layout-Modi.**
Begründung: Force-Directed ist Standardfall. Radial-Layout für hierarchische Strukturen. Cluster-Layout für Gruppenvergleich.

**Netzwerk-Metriken im Panel.**
Begründung: Cognitive Offloading. Statt mentale Berechnung (Wer hat die meisten Verbindungen?) zeigt das Interface Degree, Zentralität, Dichte.

### Was Navigator nicht kann

Lineare Narrative. Datenbereinigung. Quantitativer Vergleich ohne Graph-Struktur.

---

## The Workbench: Mode Awareness bei Datenmanipulation

### Kognitive Aufgabe

Kuratierung erfordert klare Unterscheidung zwischen Betrachten und Editieren. Versehentliche Änderungen müssen verhindert werden.

### Anforderungen

**Visuell abgegrenzte Editier-Modi.**
Begründung: Mode Awareness verhindert versehentliche Änderungen. Editierbare Zellen haben Rahmen, Hintergrund oder Icon.

**Sofortiges Validierungs-Feedback.**
Begründung: Gamification der Bereinigung. Fehleranzahl sinkt sichtbar. Fortschrittsbalken motiviert.

**Undo/Redo mit Ctrl+Z/Y.**
Begründung: Fehler beim Editieren sind unvermeidlich. Rückgängig-Funktion reduziert Angst vor Änderungen.

**Batch-Operationen für gleichartige Fehler.**
Begründung: Effizienz. Wenn 50 Datumsformate falsch sind, will niemand 50 Einzelkorrekturen.

**Multi-Export (JSON, CSV, Report).**
Begründung: Kuratierte Daten müssen das System verlassen können. Verschiedene Zielformate für verschiedene Downstream-Systeme.

### Was Workbench nicht kann

Exploration ohne Ziel. Visualisierung zur Präsentation. Aggregierte Analysen.

---

## Organic Academic: Reduktion von Screen Fatigue

### Kognitive Aufgabe

Wissenschaftliche Arbeit erfordert lange Bildschirmzeiten. Das Design muss Ermüdung reduzieren.

### Anforderungen

**Warme Hintergrundfarbe (Paper Sand #FDFBF7).**
Begründung: Simuliert Papier. Reduziert Blaulicht-Anteil gegenüber reinem Weiß (#FFFFFF).

**Weiches Schwarz (Ink Black #1A1A1A) statt hartem Schwarz.**
Begründung: Reduziert Kontrast-Stress bei langen Lesesitzungen.

**Serif-Fonts für Forschungsinhalte.**
Begründung: Humanistische Wirkung. Traditionelle Assoziation mit gedruckten Büchern und Zeitschriften.

**Sans-Serif für UI-Elemente.**
Begründung: Neutrale, technische Wirkung. Klare Unterscheidung von Inhalt und Interface.

**Asymmetrische Border-Radii.**
Begründung: Organischer Charakter. Vermeidet den kalten Eindruck von perfekten Geometrien.

---

## Design Constraints für LLM-Codegenerierung

Wenn ein LLM Code für GRIP generiert, gelten folgende harte Regeln:

1. Niemals #FFFFFF oder #000000 verwenden. Immer --color-paper und --color-ink nutzen.

2. Lesetexte zwingend in Serif-Font (--font-serif: Lora).

3. UI-Kontrollen zwingend in Sans-Serif-Font (--font-sans: Inter).

4. Zeilenlänge im Reader maximal 75 Zeichen.

5. Bei Netzwerken über 50 Knoten: Filtermechanismus implementieren.

6. Editierbare Felder visuell abgrenzen (Rahmen oder Hintergrund).

7. Alle Farbkodierungen müssen barrierefrei sein (nicht nur Rot/Grün).

---

## Verknüpfungen

- [[05-ARCHETYPEN]] definiert die kognitiven Aufgaben pro Archetyp
- [[DESIGN]] spezifiziert die konkreten Design Tokens
- [[04-SYSTEM-PROMPT]] nutzt diese Begründungen für Empfehlungen
