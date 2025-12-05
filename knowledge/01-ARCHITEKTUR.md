# Architektur: GRIP-Wissensbasis

Dieses Dokument beschreibt die Struktur der GRIP-Wissensbasis. Es definiert die Dokumenttypen, ihre Beziehungen und das einheitliche Format.

Abhängigkeit: [[00-PROJEKTAUFTRAG]]

---

## Systemübersicht

Die GRIP-Wissensbasis besteht aus Dokumenten, die in einer definierten Hierarchie zusammenwirken.

Der Projektauftrag definiert Vision und Grundannahmen. Die Archetypen-Spezifikation beschreibt die vier Interface-Grundformen. Die Mappings kodifizieren die Zuordnungslogik von Topologie und Intention zu Archetypen. Das Dialog-Protokoll definiert die Rückfragen bei Ambiguitäten. Der System Prompt kondensiert das Wissen für die direkte LLM-Nutzung. Die Beispiele demonstrieren die Anwendung an konkreten Fällen. Die Stilrichtlinien definieren Formatierung und Schreibweise.

---

## Dokumentstruktur

### Kerndokumente

00-PROJEKTAUFTRAG.md ist das Wurzeldokument. Es definiert, was GRIP ist und was nicht.

05-ARCHETYPEN.md spezifiziert die vier Interface-Grundformen (Reader, Scope, Navigator, Workbench) mit kognitiver Aufgabe, geeigneten Daten, UI-Elementen und Ausschlüssen.

02-MAPPINGS.md enthält die Entscheidungslogik. Es definiert Topologien (sequenziell, multidimensional, vernetzt, hierarchisch), Intentionen (Verstehen, Vergleich, Rekonstruktion, Kuratierung) und die Wenn-Dann-Regeln für die Archetyp-Auswahl.

06-DIALOG.md dokumentiert das Rückfrage-Protokoll mit Szenarien und Beispielfragen.

### Operative Dokumente

04-SYSTEM-PROMPT.md enthält den kondensierten Prompt für den direkten Einsatz in LLM-Konversationen.

03-BEISPIEL.md und weitere Beispieldokumente zeigen die Anwendung der Mappings an konkreten Fällen.

07-PROTOTYP.md definiert den Auftrag für den selbstreferenziellen Website-Prototypen.

09-WORKFLOWS.md beschreibt typische Pfade durch die Archetypen für verschiedene Forschungstypen.

10-SPEZIALISIERUNGEN.md spezifiziert alle 12 Spezialisierungen vollständig: Erkennungsheuristiken, kognitive Werkzeuge, UI-Elemente und JSON-Datenstrukturen.

11-CODE-MAP.md dokumentiert die JavaScript-Architektur, Vererbungshierarchien, Modus-Wechsel-Architektur und den Wissensbedarf pro Datei.

15-MODI.md definiert die dritte Taxonomie-Ebene: vier Modi pro Spezialisierung, die verschiedene Perspektiven auf denselben Datensatz ermöglichen.

12-STANDARDS.md dokumentiert die wissenschaftlichen Metadatenstandards (TEI, DDI, LIDO, SKOS) und ihre Zuordnung zu Spezialisierungen.

13-RESEARCH-PLAN.md enthält den Recherche-Plan für alle 12 Spezialisierungen mit Primärquellen, Aufgaben und Priorisierung.

DESIGN.md spezifiziert die visuelle Identität (Organic Academic) und die kognitiven Begründungen für Interface-Entscheidungen.

### Meta-Dokumente

CLAUDE.md definiert Stilrichtlinien und die Knowledge-Engineering-Methode für die Wissensbasis.

JOURNAL.md protokolliert die Entwicklung des Frameworks.

---

## Abhängigkeiten

Die Dokumente bauen aufeinander auf:

Der Projektauftrag ist unabhängig und definiert den Rahmen.

Die Archetypen-Spezifikation setzt den Projektauftrag voraus.

Die Mappings setzen Projektauftrag und Archetypen voraus.

Das Dialog-Protokoll setzt Mappings und Archetypen voraus.

Der System Prompt setzt alle Kerndokumente voraus und kondensiert sie.

Die Beispiele setzen die Mappings voraus und demonstrieren ihre Anwendung.

---

## Dateiformat

Jede Markdown-Datei folgt einem einheitlichen Schema.

Sie beginnt mit Titel und einer kurzen Einordnung des Dokumenttyps sowie Abhängigkeiten zu anderen Dateien in Wikilink-Notation. Es folgt die inhaltliche Ausarbeitung in logischer Gliederung. Abschließend listen Verknüpfungen verwandte Dokumente auf.

Die Formatierung folgt den Regeln in CLAUDE.md: Kein Fettdruck, keine Emojis, sachlicher Fließtext, Listen nur wo nötig.

---

## Erweiterung

Neue Dokumente werden nach dem gleichen Schema erstellt. Sie deklarieren ihre Abhängigkeiten und werden in die Verknüpfungen der referenzierten Dokumente aufgenommen.

Die Versionierung erfolgt über das JOURNAL.md, das jeden Meilenstein dokumentiert.

---

## Verknüpfungen

- [[00-PROJEKTAUFTRAG]] definiert Vision und Grundannahmen
- [[05-ARCHETYPEN]] spezifiziert die Interface-Grundformen
- [[02-MAPPINGS]] enthält die Zuordnungslogik
- [[07-PROTOTYP]] definiert den Website-Prototypen
- [[09-WORKFLOWS]] beschreibt Pfade durch die Archetypen
- [[10-SPEZIALISIERUNGEN]] spezifiziert alle 12 Spezialisierungen vollständig
- [[11-CODE-MAP]] dokumentiert JavaScript-Architektur und Wissensbedarf
- [[12-STANDARDS]] dokumentiert wissenschaftliche Metadatenstandards
- [[13-RESEARCH-PLAN]] enthält Recherche-Plan für Spezialisierungen
- [[15-MODI]] definiert Modi als dritte Taxonomie-Ebene
- [[DESIGN]] spezifiziert visuelle Identität und kognitive Begründungen
- [[CLAUDE]] definiert Stilregeln und Knowledge-Engineering-Methode
