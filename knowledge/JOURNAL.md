# JOURNAL: Arbeitstagebuch

Dieses Dokument protokolliert die Entwicklung des GRIP-Frameworks in chronologischer Reihenfolge. Jeder Eintrag beschreibt einen Meilenstein, die durchgeführten Arbeiten und deren Begründung.

---

## 2025-12-04: Projektinitialisierung und Konzeptphase

### Ausgangslage

Das Repository enthielt fünf Konzeptdokumente: Projektauftrag, Architektur, Mappings, ein Beispiel und Stilrichtlinien. Es existierte kein Code, keine implementierten Module, keine lauffähige Software. Die Dokumente beschrieben eine Vision, aber keine operationalisierbaren Anweisungen.

### Durchgeführte Analyse

Die Lücke zwischen Konzept und Realität wurde identifiziert. Das Framework beschreibt sechs Module (Analyzers, Patterns, Components, Layouts, Interactions, Adapters), aber keines davon war ausgearbeitet. Die zentrale Erkenntnis: GRIP ist primär eine Wissensbasis für LLM-gestützte Entwicklung, kein klassisches Software-Projekt.

### Erarbeitete Kernfragen

Ein Katalog von Fragen wurde erstellt, die beantwortet werden müssen, um das Framework operationalisierbar zu machen. Die Fragen gliedern sich in Bereiche: Archetypen, Datentypen, Forschungsintentionen, Komponenten, Layouts und Workflow.

### Beantwortung der Kernfragen

Drei zentrale Bereiche wurden durch den Projektverantwortlichen spezifiziert:

Erstens die vier Archetypen mit klaren Grenzen. The Reader für sequenzielle Daten und Immersion. The Scope für multidimensionale Daten und Mustererkennung. The Navigator für vernetzte Daten und Strukturanalyse. The Workbench für hierarchische Daten und Kuratierung. Für jeden Archetyp wurde definiert, was hineingehört und was nicht.

Zweitens die Mapping-Logik als Wenn-Dann-Heuristik. Die Zuordnung von Datentyp und Intention zum Archetyp wurde als deterministischer Algorithmus formuliert. Eine Fallback-Regel wurde etabliert: Bei Unklarheit beginnt man mit The Scope.

Drittens das Dialog-Protokoll. Drei Kategorien von Rückfragen wurden definiert: Auflösung der Daten-Topologie, Klärung der epistemischen Intention, Festlegung der Interaktionstiefe. Konkrete Beispielfragen wurden formuliert.

### Entscheidung für Praxistest

Zwei Optionen wurden diskutiert: Dokumentation zuerst oder Praxistest zuerst. Die Entscheidung fiel auf den Praxistest, da theoretische Perfektion ohne Validierung wertlos ist. Um den Test zu ermöglichen, wurde ein Master System Prompt erstellt, der das bisherige Wissen kondensiert.

### Aktuelle Aufgabe

Vor dem Praxistest wird das gesamte erarbeitete Wissen strukturiert im Repository dokumentiert. Diese Dokumentation dient als Referenz für zukünftige Iterationen und macht den Wissensstand nachvollziehbar.

### Begründung

Die Dokumentation vor dem Test hat zwei Funktionen. Sie zwingt zur Präzisierung vager Konzepte. Sie schafft eine Baseline, gegen die Testergebnisse verglichen werden können. Ohne dokumentierten Ausgangszustand ist Wissensrückfluss nicht möglich.

---

## 2025-12-04: Wissensbasis-Dokumentation abgeschlossen

### Durchgeführte Arbeiten

Vier neue Dokumente wurden erstellt und ein bestehendes erweitert:

Das Dokument 04-SYSTEM-PROMPT.md enthält den Master System Prompt v1.0. Dieser Prompt kondensiert das methodische Wissen in eine Form, die direkt an ein Frontier-Modell übergeben werden kann. Er definiert Mission, Archetypen, Erkennungsheuristik, Fallback-Regel und das vierphasige Protokoll.

Das Dokument 05-ARCHETYPEN.md spezifiziert die vier Archetypen im Detail. Für jeden Archetyp (Reader, Scope, Navigator, Workbench) wurden definiert: kognitive Aufgabe, geeignete Daten, obligatorische und optionale UI-Elemente, Ausschlüsse mit Begründung. Diese Präzision verhindert Feature Creep.

Das Dokument 02-MAPPINGS.md wurde vollständig überarbeitet. Es enthält nun die vier Daten-Topologien (sequenziell, multidimensional, vernetzt, hierarchisch) mit Erkennungsmerkmalen und Leitfragen. Die vier epistemischen Intentionen wurden operationalisiert. Die Entscheidungslogik wurde als Wenn-Dann-Regeln formuliert, inklusive Fallback.

Das Dokument 06-DIALOG.md dokumentiert das Rückfrage-Protokoll. Vier Kategorien von Rückfragen wurden spezifiziert: Topologie-Klärung, Intentions-Klärung, Interaktionstiefe und Hybridfall-Priorisierung. Für jede Kategorie wurden konkrete Szenarien und Beispielfragen formuliert.

### Aktueller Stand der Wissensbasis

Das Repository enthält nun neun Dokumente im knowledge-Ordner:

00-PROJEKTAUFTRAG.md definiert Vision und Workflow.
01-ARCHITEKTUR.md beschreibt die Modulstruktur.
02-MAPPINGS.md enthält die operationalisierte Entscheidungslogik.
03-BEISPIEL.md zeigt einen durchgespielten Anwendungsfall.
04-SYSTEM-PROMPT.md enthält den LLM-Prompt v1.0.
05-ARCHETYPEN.md spezifiziert die vier Interface-Grundformen.
06-DIALOG.md dokumentiert das Rückfrage-Protokoll.
CLAUDE.md und CLAUDE-METHODE.md definieren Stilrichtlinien.

### Begründung

Die strukturierte Dokumentation vor dem Praxistest erfüllt drei Funktionen. Erstens macht sie das implizite Wissen explizit und überprüfbar. Zweitens schafft sie eine Baseline für den Vergleich mit Testergebnissen. Drittens ermöglicht sie die Versionierung des Methodenwissens, sodass Änderungen nach dem Test nachvollziehbar bleiben.

### Nächster Schritt

Die Wissensbasis ist dokumentiert. Der nächste Schritt ist die Vorbereitung eines Testdatensatzes und die Durchführung des Praxistests mit dem System Prompt v1.0.

---

## 2025-12-04: Terminologie-Harmonisierung

### Problem

Bei der Redundanzprüfung wurde festgestellt, dass die ursprünglichen Dokumente (00-PROJEKTAUFTRAG, 01-ARCHITEKTUR, 03-BEISPIEL) eine andere Terminologie verwendeten als die neu erstellten Dokumente.

Die alte Terminologie sprach von sechs Modulen (Analyzers, Patterns, Components, Layouts, Interactions, Adapters) und Datentypen wie tabellarisch, hierarchisch, relational. Die neue Terminologie verwendet vier Archetypen (Reader, Scope, Navigator, Workbench) und vier Topologien (sequenziell, multidimensional, vernetzt, hierarchisch).

Diese Inkonsistenz hätte zu Verwirrung geführt, wenn ein LLM alle Dokumente gleichzeitig liest.

### Durchgeführte Arbeiten

Drei Dokumente wurden aktualisiert:

00-PROJEKTAUFTRAG.md wurde auf die Archetypen-Terminologie umgestellt. Die sechs Module wurden entfernt, die vier Archetypen eingeführt. Die Verknüpfungen wurden aktualisiert.

01-ARCHITEKTUR.md wurde von einer Modul-Beschreibung zu einer Beschreibung der Dokumentstruktur umgewandelt. Die Hierarchie der Wissensbasis-Dokumente wird nun explizit dargestellt.

03-BEISPIEL.md wurde auf die neue Terminologie aktualisiert. Statt Graph-Pattern und Timeline-Pattern werden nun Navigator und Scope verwendet. Die Begründungen folgen der Mapping-Logik.

### Ergebnis

Alle zehn Dokumente im knowledge-Ordner verwenden nun konsistente Terminologie. Die vier Archetypen und vier Topologien sind durchgängig benannt. Die Verknüpfungen zwischen Dokumenten sind aktualisiert.

### Begründung

Konsistente Terminologie ist für ein LLM-lesbares Repository essentiell. Synonyme und wechselnde Begriffe erzeugen Ambiguität. Die Harmonisierung stellt sicher, dass das Framework als kohärentes Ganzes interpretiert werden kann.

---

## 2025-12-04: Design-System dokumentiert und implementiert

### Durchgeführte Arbeiten

Das Design-System "Organic Academic" wurde dokumentiert und auf der Website implementiert.

Das Dokument DESIGN.md wurde im knowledge-Ordner erstellt. Es definiert die visuelle Identität des Frameworks mit folgenden Elementen:

Farbpalette: Paper Sand (#FDFBF7) als warmer Hintergrund statt hartem Weiß. Ink Black (#1A1A1A) für Text. Terracotta (#C4705A) als organischer Akzent. Archetypen-Farben für visuelle Kodierung.

Typografie: Lora (Serif) für emotionale Headlines mit akademischem Charakter. Inter (Sans-Serif) für funktionale UI-Elemente. JetBrains Mono für Code und technische Bezeichner.

Die Website wurde entsprechend aktualisiert. Das CSS verwendet nun CSS Custom Properties für konsistente Anwendung des Design-Systems.

### Begründung

Das Design kommuniziert die Werte des Frameworks: Ruhe, Wärme, Substanz. Die organische Ästhetik grenzt sich bewusst von aggressiver Technologie-Optik ab. Die Dokumentation ermöglicht konsistente Anwendung bei zukünftigen UI-Generierungen durch LLMs.

---

## 2025-12-04: Vollständige Entscheidungsmatrix und Website-Prototyp

### Durchgeführte Arbeiten

Die Entscheidungsmatrix wurde vervollständigt und auf zwei Ebenen implementiert.

Erstens wurde die Wissensbasis erweitert. Das Dokument 02-MAPPINGS.md enthält nun die vollständige 4x4-Matrix mit allen 16 Feldern. Die Matrix unterscheidet primäre Zuordnungen (4), sekundäre Zuordnungen (8) und ambige Fälle (4). Jeder Fall ist begründet. Die ambigen Fälle sind mit konkreten Rückfragen dokumentiert.

Zweitens wurde ein Website-Prototyp im docs-Ordner erstellt. Die Seite zeigt die Matrix als interaktives Element. Bei Klick auf eine Zelle erscheint der empfohlene Archetyp mit Begründung. Ambige Zellen zeigen die erforderliche Rückfrage. Die Archetypen-Cards wurden um konkrete Beispieldaten ergänzt.

### Struktur des Prototyps

Der docs-Ordner enthält index.html als Hauptseite, css/style.css mit Dark Theme und Matrix-Styling sowie js/main.js mit der Interaktionslogik für die Matrix.

### Die vollständige Matrix

Die Diagonale bildet den harten Kern: Sequenziell+Verstehen führt zu Reader, Multidimensional+Vergleich zu Scope, Vernetzt+Rekonstruktion zu Navigator, Hierarchisch+Kuratierung zu Workbench.

Acht Sekundärfälle sind eindeutig ableitbar. Sie führen meist zu Scope (für Vergleiche) oder Workbench (für Kuratierung).

Vier Fälle sind ambig und erfordern Rückfragen: Sequenziell+Rekonstruktion, Vernetzt+Verstehen, Vernetzt+Vergleich, Hierarchisch+Verstehen. Diese Fälle machen 25% der Matrix aus und rechtfertigen das Dialog-Protokoll.

### Begründung

Die vollständige Matrix macht das Framework deterministischer. Ein LLM kann nun für jede Kombination von Topologie und Intention eine begründete Entscheidung treffen oder wissen, dass es fragen muss. Die interaktive Visualisierung macht die Logik für menschliche Nutzer nachvollziehbar.

---
