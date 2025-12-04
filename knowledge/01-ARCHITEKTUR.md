# Architektur: Interface-Repo

Dieses Dokument beschreibt die technische Struktur des Interface-Repos. Es definiert die Module, ihre Beziehungen und das einheitliche Dateiformat.

Abhängigkeit: [[00-PROJEKTAUFTRAG]]

---

## Systemübersicht

Das Interface-Repo besteht aus sechs Modulen, die in einer Pipeline zusammenwirken.

Die Analyzers nehmen Rohdaten entgegen und produzieren eine Klassifikation nach Schema und Datentyp. Diese Klassifikation fließt in die Patterns, die basierend auf Datentyp und Fragetyp ein geeignetes UI-Pattern auswählen. Die Components stellen die konkreten UI-Bausteine bereit, die das Pattern benötigt. Die Layouts definieren die räumliche Anordnung dieser Bausteine. Die Interactions legen fest, wie Nutzer mit den Komponenten interagieren. Die Adapters behandeln Sonderfälle wie Binärdaten oder unstrukturierte Eingaben.

---

## Verzeichnisstruktur

Das Repository gliedert sich in sechs Hauptverzeichnisse entsprechend den Modulen.

Das Verzeichnis analyzers enthält Regeln für Schema-Inference, Typ-Klassifikation und Komplexitätsbewertung. Das Verzeichnis patterns dokumentiert die verfügbaren UI-Patterns wie Tabelle, Graph, Timeline und Karte sowie Regeln für deren Kombination. Das Verzeichnis components beschreibt wiederverwendbare Bausteine wie Suchfeld, Filter, Ergebniskarte und Detailansicht. Das Verzeichnis layouts definiert Templates wie Master-Detail, Dashboard und Workspace. Das Verzeichnis interactions spezifiziert Muster für Navigation, Selektion und Annotation. Das Verzeichnis adapters behandelt Spezialfälle für Binärdaten, unstrukturierte Daten und Streaming.

Jedes Verzeichnis enthält eine index-Datei mit Übersicht und Auswahlregeln.

---

## Modul: Analyzers

Die Analyzers transformieren Rohdaten in eine strukturierte Beschreibung. Der Schema-Detector inferiert das Datenschema aus Beispieldaten. Der Type-Classifier ordnet das Schema einer Taxonomie zu. Der Complexity-Scorer bewertet die Komplexität für die spätere Layout-Entscheidung.

Die Datentyp-Taxonomie unterscheidet strukturierte Daten (tabellarisch, hierarchisch, relational), semi-strukturierte Daten (dokumentbasiert, Key-Value), unstrukturierte Daten (Freitext, binär) sowie temporale und spatiale Daten.

---

## Modul: Patterns

Die Patterns bilden Datentypen und Fragetypen auf UI-Strukturen ab.

Für tabellarische Daten eignet sich bei explorativen Fragen eine sortierbare Tabelle, bei komparativen Fragen eine Side-by-Side-Ansicht, bei aggregativen Fragen ein Dashboard. Hierarchische Daten werden durch Tree-Ansichten, relationale durch Graphen, temporale durch Timelines und geospatiale durch Karten dargestellt. Dokumentbasierte Daten erfordern einen Reader mit Annotationsfunktionen.

Das Composite-Pattern beschreibt Regeln für die Kombination mehrerer Patterns, etwa Graph und Timeline für zeitlich-relationale Daten.

---

## Modul: Components

Die Components sind abstrakte UI-Bausteine mit definierten Varianten und Zuständen.

Jede Komponente wird beschrieben durch ihre Funktion, verfügbare Varianten für unterschiedliche Kontexte, konfigurierbare Eigenschaften und mögliche Zustände wie Default, Hover, Active, Loading, Error und Empty.

Kernkomponenten sind Search für Volltextsuche, Filter für Facettierung, Card für Ergebnisdarstellung, Detail-Panel für erweiterte Ansichten, Toolbar für Aktionen und Pagination für Navigation durch Ergebnismengen.

---

## Modul: Layouts

Die Layouts bestimmen die räumliche Anordnung der Komponenten.

Master-Detail eignet sich für einstufige Daten mit Liste und Detailansicht. Dashboard kombiniert mehrere unabhängige Widgets. Workspace bietet einen Vollbild-Arbeitsbereich für komplexe Aufgaben. Split-View ermöglicht parallele Ansichten für Vergleiche.

Die Auswahl folgt Heuristiken: Bei einer Datenebene Master-Detail, bei mehreren Ebenen Workspace, bei unabhängigen Perspektiven Dashboard, bei Vergleichsaufgaben Split-View.

---

## Modul: Interactions

Die Interactions definieren eine einheitliche Grammatik für Nutzerinteraktionen.

Navigation erfolgt per Tastatur durch Pfeiltasten oder vim-Bindings, per Maus durch Scrollen, per Touch durch Wischen. Selektion unterscheidet Einzelauswahl, Mehrfachauswahl und Bereichsauswahl mit jeweils spezifischen Eingabemethoden. Annotation umfasst Markieren, Kommentieren und Taggen. Batch-Operationen erlauben Aktionen auf mehreren Elementen gleichzeitig.

---

## Modul: Adapters

Die Adapters behandeln Daten, die nicht direkt in die Standard-Pipeline passen.

Der Binary-Adapter extrahiert Metadaten und generiert Previews für Bilder, Audio und Video. Der Unstructured-Adapter nutzt AI-Parsing, um aus Freitext oder Logs ein Schema abzuleiten. Der Streaming-Adapter implementiert Pufferung und inkrementelle Updates für Echtzeitdaten.

---

## Dateiformat

Jede Markdown-Datei im Repo folgt einem einheitlichen Schema.

Sie beginnt mit Titel und einer kurzen Einordnung des Dokumenttyps sowie Abhängigkeiten zu anderen Dateien. Es folgt eine präzise Definition des beschriebenen Elements. Die Anwendungsbedingungen formulieren Heuristiken in Wenn-Dann-Form. Die Spezifikation enthält Details, Tabellen und Beispiele. Die Kombinationsregeln beschreiben Interaktionen mit anderen Elementen. Abschließend listen Verknüpfungen verwandte Dokumente auf.

---

## Verknüpfungen

- [[00-PROJEKTAUFTRAG]] beschreibt Ziel und Kontext des Systems
