# GRIP Framework

**Generative Research Interface Protocol** - Ein methodisches Framework für die LLM-gestützte Entwicklung von Forschungsinterfaces.

## Was ist GRIP?

GRIP kodifiziert das Wissen darüber, welche Interface-Archetypen für welche Datenstrukturen und Forschungsintentionen geeignet sind. Das Framework hilft Sprachmodellen (wie Claude oder ChatGPT), passende Interface-Empfehlungen für Forschungsdaten zu generieren.

**Kernidee:** Das eigentliche Produkt ist der System-Prompt und das mentale Modell. Die Website beweist, dass das Modell funktioniert.

## Die 4×4 Entscheidungsmatrix

GRIP basiert auf zwei Dimensionen:

| | Verstehen | Vergleich | Rekonstruktion | Kuratierung |
|---|---|---|---|---|
| **Sequenziell** | Reader | Scope | Dialog | Workbench |
| **Multidimensional** | Scope | Scope | Navigator | Workbench |
| **Vernetzt** | Dialog | Dialog | Navigator | Workbench |
| **Hierarchisch** | Dialog | Scope | Navigator | Workbench |

## Die 4 Archetypen

### Reader
**Sequenz + Verstehen** - Interface für lineare Daten mit Fokus auf Immersion und vertieftes Lesen.

**Spezialisierungen:**
- **Edition** - Kritische Textausgaben mit Variantenapparat
- **Protokoll** - Sitzungsmitschriften mit Sprecherwechsel
- **Transcript** - Interviewtranskripte mit qualitativen Codes

### Scope
**Matrix + Vergleich** - Analytisches Dashboard für multidimensionale Daten und Mustererkennung.

**Spezialisierungen:**
- **Survey** - Umfragedaten mit Likert-Skalen
- **Monitor** - Zeitreihen mit Schwellwerten und Anomalien
- **Matrix** - Kreuztabellen mit Chi-Quadrat-Statistik

### Navigator
**Netzwerk + Rekonstruktion** - Topologische Ansicht für vernetzte Daten und Beziehungsstrukturen.

**Spezialisierungen:**
- **Citation** - Bibliometrische Zitationsnetzwerke
- **Genealogy** - Stammbäume und Verwandtschaftsbeziehungen
- **Concept** - Ontologien und semantische Netze

### Workbench
**Hierarchie + Kuratierung** - Arbeitsumgebung für Datenbereinigung und -strukturierung.

**Spezialisierungen:**
- **Registry** - Sammlungsinventare und Objektkataloge
- **Codebook** - Variablendefinitionen und Metadaten-Schemata
- **Schema** - JSON-Schema-Validierung und -Editierung

## Projektstruktur

```
grip-framework/
├── knowledge/              # Wissensbasis (16 Markdown-Dokumente)
│   ├── 00-PROJEKTAUFTRAG.md
│   ├── 02-MAPPINGS.md      # Entscheidungslogik
│   ├── 04-SYSTEM-PROMPT.md # LLM-Prompt
│   ├── 05-ARCHETYPEN.md    # Archetyp-Spezifikationen
│   └── 10-SPEZIALISIERUNGEN.md
│
└── docs/                   # Website-Prototyp
    ├── index.html          # Interaktive Entscheidungsmatrix
    ├── css/                # Design-System (Organic Academic)
    ├── js/
    │   ├── archetypes/     # 4 Basis-Archetypen
    │   └── specializations/# 12 Spezialisierungen
    └── examples/
        ├── *.html          # 16 Demo-Seiten
        └── data/           # 13 JSON-Testdatensätze
```

## Quick Start

### Live-Demo starten
```bash
cd docs
python -m http.server 8000
# Öffne http://localhost:8000
```

### Oder mit VS Code Live Server
Öffne `docs/index.html` und starte Live Server.

## Datei-Übersicht

| Typ | Anzahl | Beschreibung |
|-----|--------|--------------|
| HTML | 17 | Landing Page + 16 Demo-Seiten |
| JavaScript | 35 | Module, Archetypen, Spezialisierungen |
| CSS | 17 | Design-System + Archetyp-Styles |
| JSON | 13 | Demo-Datensätze |
| Markdown | 16 | Wissensbasis |

## Technologie

- **Vanilla JavaScript (ES6+)** - Keine Framework-Abhängigkeiten
- **CSS Custom Properties** - Flexibles Design-System
- **Statische Website** - Deploybar auf GitHub Pages
- **Client-Side Rendering** - Kein Backend erforderlich

## Standards

GRIP orientiert sich an wissenschaftlichen Datenstandards:

| Spezialisierung | Standard |
|-----------------|----------|
| Edition | TEI P5 |
| Protokoll | Akoma Ntoso |
| Transcript | EXMARaLDA |
| Survey | DDI-C |
| Monitor | SensorThings API |
| Citation | MODS |
| Genealogy | GEDCOM X |
| Concept | SKOS |
| Registry | LIDO |
| Codebook | DDI-Lifecycle |
| Schema | JSON Schema |

## Design-Prinzipien

**Organic Academic** - Ein Design-System für wissenschaftliche Interfaces:

- **Paper Sand** (#FDFBF7) statt hartem Weiß
- **Lora Serif** für Lesetexte, **Inter Sans** für UI
- **Terracotta** (#C4705A) als organischer Akzent
- Archetyp-spezifische Farbkodierung

## Kognitive Grundlagen

Jeder Archetyp basiert auf spezifischen kognitiven Prinzipien:

- **Reader**: Tiefes Lesen erfordert ununterbrochenen Textfluss
- **Scope**: Präattentive Wahrnehmung erkennt Muster vor bewusstem Denken
- **Navigator**: Knotenposition (Zentralität, Cluster) oft wichtiger als Inhalt
- **Workbench**: Direkte Datensicht ohne visuelle Abstraktionen

## Für LLM-Entwickler

Die Wissensbasis in `knowledge/` ist für System-Prompts optimiert:

1. `04-SYSTEM-PROMPT.md` - Kondensierter Prompt
2. `02-MAPPINGS.md` - Wenn-Dann-Logik
3. `05-ARCHETYPEN.md` - Detaillierte Spezifikationen
4. `10-SPEZIALISIERUNGEN.md` - Erkennungsheuristiken

## Lizenz

MIT

## Autor

Entwickelt als Context Engineering Experiment für Frontier-LLMs.
