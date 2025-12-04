# Beispiel: Publikationsdatenbank

Dieses Dokument demonstriert die Anwendung des Interface-Repos an einem konkreten Fall. Es zeigt den vollständigen Workflow von der Dateneingabe bis zur UI-Spezifikation.

Abhängigkeiten: [[00-PROJEKTAUFTRAG]], [[01-ARCHITEKTUR]], [[02-MAPPINGS]]

---

## Ausgangssituation

Die Eingangsdaten bestehen aus einer JSON-Datei mit 5000 wissenschaftlichen Publikationen. Jeder Eintrag enthält Titel, Abstract, Autorenliste, Publikationsjahr und eine Liste von Zitationen zu anderen Einträgen im Datensatz.

Die Forschungsfrage lautet: Welche Forschungscluster gibt es und wie entwickeln sie sich über die Zeit?

---

## Phase 1: Analyse

Der Schema-Detector inferiert aus den Daten folgende Struktur: Eine Liste von Objekten mit String-Feldern für Titel und Abstract, einem Array für Autoren, einem numerischen Feld für das Jahr und einem Array von Referenzen auf andere Objekte.

Der Type-Classifier ordnet diese Struktur mehreren Kategorien zu. Die Grundstruktur ist tabellarisch, da jede Publikation einen Datensatz bildet. Die Zitationen machen die Daten zusätzlich relational. Das Jahresfeld markiert sie als temporal. Die Textfelder qualifizieren sie als dokumentbasiert.

Der Complexity-Scorer bewertet die Daten als komplex aufgrund der Mehrfachklassifikation und der Datenmenge.

---

## Phase 2: Pattern-Matching

Die Forschungsfrage wird analysiert. Sie enthält drei Komponenten: Die Frage nach Clustern ist explorativ und relational. Die Frage nach der zeitlichen Entwicklung ist temporal.

Aus der Kombination von Datentypen und Fragetypen ergibt sich: Die relationalen Daten mit relationaler Frage führen zum Graph-Pattern. Die temporalen Daten mit temporaler Frage führen zum Timeline-Pattern. Die Komplexität rechtfertigt eine Kombination beider Patterns.

Das Composite-Pattern wird angewendet: Graph und Timeline in einem Split-View mit verknüpfter Interaktion.

---

## Phase 3: Component Assembly

Für das kombinierte Pattern werden folgende Komponenten benötigt:

Eine Search-Komponente ermöglicht Volltextsuche über Titel und Abstract. Eine Filter-Komponente bietet Facetten für Jahr, Autoren und Cluster-Zugehörigkeit. Eine Graph-Canvas-Komponente visualisiert das Zitationsnetzwerk mit Cluster-Coloring. Eine Timeline-Komponente zeigt die zeitliche Verteilung der Publikationen. Eine Card-Komponente stellt einzelne Publikationen in Ergebnislisten dar. Ein Detail-Panel zeigt den vollständigen Abstract und Metadaten einer ausgewählten Publikation.

Das Layout ist ein Workspace mit Split-View: Links der Graph, rechts Timeline und Ergebnisliste.

---

## Phase 4: Interaktionsdesign

Die Interaktionen verknüpfen die Ansichten. Ein Klick auf einen Knoten im Graph filtert die Timeline und Ergebnisliste auf die entsprechende Publikation und ihre Nachbarn. Ein Klick auf einen Zeitabschnitt in der Timeline hebt die entsprechenden Knoten im Graph hervor. Die Suche filtert beide Ansichten simultan.

Navigation erfolgt per Tastatur durch die Ergebnisliste. Zoom und Pan steuern die Graph-Ansicht. Der Timeline-Slider definiert den sichtbaren Zeitraum.

---

## Resultat

Die generierte UI-Spezifikation beschreibt einen Workspace mit folgender Struktur:

Die linke Seite zeigt einen Citation-Graph. Knoten repräsentieren Publikationen, Kanten Zitationen. Cluster werden durch Farben unterschieden. Die rechte Seite enthält oben einen Timeline-Slider und darunter eine scrollbare Liste von Publication-Cards.

Die Toolbar oben bietet Search, Filter-Dropdowns für Jahr und Autor sowie einen Cluster-Filter. Das Detail-Panel erscheint als Overlay bei Selektion einer Publikation.

Diese Spezifikation kann als Grundlage für eine Implementierung in React, Vue oder einem anderen Framework dienen.

---

## Verknüpfungen

- [[02-MAPPINGS]] erklärt die angewendeten Zuordnungsregeln
- [[01-ARCHITEKTUR]] beschreibt die Module, die diesen Workflow ausführen
