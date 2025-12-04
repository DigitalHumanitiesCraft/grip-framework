# Beispiel: Publikationsdatenbank

Dieses Dokument demonstriert die Anwendung des GRIP-Frameworks an einem konkreten Fall. Es zeigt den vollständigen Workflow von der Datenanalyse bis zur UI-Spezifikation.

Abhängigkeiten: [[00-PROJEKTAUFTRAG]], [[02-MAPPINGS]], [[05-ARCHETYPEN]]

---

## Ausgangssituation

Die Eingangsdaten bestehen aus einer JSON-Datei mit 5000 wissenschaftlichen Publikationen. Jeder Eintrag enthält Titel, Abstract, Autorenliste, Publikationsjahr und eine Liste von Zitationen zu anderen Einträgen im Datensatz.

Die Forschungsfrage lautet: Welche Forschungscluster gibt es und wie entwickeln sie sich über die Zeit?

---

## Phase 1: Topologie-Analyse

Die Daten werden auf ihre Topologie untersucht.

Die Grundstruktur ist multidimensional, da jede Publikation einen Datensatz mit mehreren Attributen bildet. Die Zitationen machen die Daten zusätzlich vernetzt, da Publikationen aufeinander verweisen. Das Jahresfeld macht sie sequenziell in der Zeitdimension.

Die Daten sind hybrid: Sie kombinieren vernetzte und sequenzielle Aspekte.

---

## Phase 2: Intentions-Analyse

Die Forschungsfrage wird analysiert.

Die Frage nach Clustern zielt auf Rekonstruktion von Zusammenhängen. Der Forschende will verstehen, welche Publikationen thematisch zusammengehören und wie sie verbunden sind.

Die Frage nach der zeitlichen Entwicklung zielt auf Vergleich. Der Forschende will Muster über die Zeit erkennen.

Die Intention ist hybrid: Rekonstruktion (primär) und Vergleich (sekundär).

---

## Phase 3: Archetyp-Auswahl

Die Mapping-Logik wird angewendet.

Vernetzte Daten mit Rekonstruktions-Intention führen zum Navigator. Die Zitationsbeziehungen sollen als Graph sichtbar werden.

Sequenzielle Daten mit Vergleichs-Intention führen zum Scope. Die zeitliche Entwicklung soll als Timeline sichtbar werden.

Da beide Aspekte für die Forschungsfrage relevant sind, wird eine Kombination gewählt: Navigator als primärer Archetyp, Scope als sekundäre Ansicht. Die Kombination erfolgt in einem Split-View mit verknüpfter Interaktion.

---

## Phase 4: UI-Spezifikation

Die Spezifikation beschreibt einen Workspace mit folgender Struktur:

Die linke Seite zeigt den Navigator. Ein Node-Link-Diagramm visualisiert das Zitationsnetzwerk. Knoten repräsentieren Publikationen, Kanten Zitationen. Cluster werden durch Farben unterschieden. Zoom und Pan ermöglichen Navigation. Ein Knoten-Inspektor zeigt Details bei Selektion.

Die rechte Seite zeigt den Scope. Ein Timeline-Slider ermöglicht die Filterung nach Zeitraum. Ein Line-Chart zeigt die Publikationshäufigkeit über die Zeit. Darunter eine scrollbare Liste von Publikations-Cards.

Die Toolbar oben enthält eine Volltextsuche über Titel und Abstract, Filter-Dropdowns für Jahr und Autor sowie einen Cluster-Filter.

Die Interaktionen verknüpfen die Ansichten. Ein Klick auf einen Knoten im Navigator filtert Timeline und Liste auf die entsprechende Publikation und ihre Nachbarn. Eine Zeitraum-Selektion im Scope hebt die entsprechenden Knoten im Navigator hervor.

---

## Begründung der Entscheidungen

Die Wahl des Navigators als primärer Archetyp folgt aus der Forschungsfrage. Cluster sind ein strukturelles Phänomen, das nur in einer Graph-Ansicht erkennbar wird. Eine Tabelle oder Liste würde die Beziehungsinformation verbergen.

Die Ergänzung durch den Scope folgt aus dem zeitlichen Aspekt der Frage. Die Entwicklung von Clustern über die Zeit erfordert eine Visualisierung, die Veränderungen sichtbar macht.

Die Kombination in einem Split-View statt einer einzigen überladenen Ansicht folgt dem Prinzip der progressiven Disclosure. Der Nutzer kann sich auf einen Aspekt konzentrieren und bei Bedarf den anderen hinzuziehen.

---

## Verknüpfungen

- [[02-MAPPINGS]] erklärt die angewendeten Zuordnungsregeln
- [[05-ARCHETYPEN]] beschreibt Navigator und Scope im Detail
- [[06-DIALOG]] zeigt, welche Rückfragen bei diesem Fall gestellt werden könnten
