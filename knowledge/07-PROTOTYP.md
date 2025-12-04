# Prototyp-Auftrag: Selbstreferenzielles GRIP-Interface

Dieses Dokument beauftragt die Entwicklung eines Prototypen, der das GRIP-Framework nicht nur dokumentiert, sondern auf sich selbst anwendet.

Abhängigkeiten: [[00-PROJEKTAUFTRAG]], [[05-ARCHETYPEN]], [[02-MAPPINGS]]

---

## Kernidee

Der Prototyp erklärt GRIP, indem er GRIP ist. Die Wissensbasis des Frameworks (Archetypen, Mappings, Matrix, Dialog-Protokoll) bildet den Datensatz. Der Prototyp visualisiert diesen Datensatz nach den eigenen Prinzipien. Erklärung und Anwendung fallen zusammen.

---

## Analyse nach GRIP

Die Topologie der Wissensbasis ist hybrid. Die Dokumente sind vernetzt durch Wikilinks und Abhängigkeiten. Sie sind hierarchisch durch die Ableitungsstruktur (Projektauftrag → Archetypen → Mappings → Dialog). Das Journal enthält sequenzielle Elemente.

Die Intention des Besuchers ist Verstehen. Er will die Struktur des Frameworks erfassen und einzelne Konzepte im Detail begreifen.

Nach der Matrix (Vernetzt × Verstehen) ist der Fall ambig. Die Rückfrage lautet, ob lokales oder globales Verstehen gemeint ist. Die Antwort ist beides. Daraus folgt eine Kombination aus Navigator für die Gesamtstruktur und Reader für die Detailansicht.

---

## Spezifikation

Der Prototyp besteht aus drei Komponenten.

Die erste Komponente ist der Navigator. Die Hauptansicht zeigt einen Wissensgraph. Knoten repräsentieren Dokumente und Konzepte (Archetypen, Topologien, Intentionen). Kanten repräsentieren Abhängigkeiten und Verknüpfungen. Die Struktur des Frameworks wird auf einen Blick erfassbar. Zoom und Pan ermöglichen Navigation.

Die zweite Komponente ist der Reader. Ein Klick auf einen Knoten öffnet das zugehörige Dokument in einer Leseansicht. Der Fokus liegt auf dem Inhalt, aber Querverweise bleiben als anklickbare Links sichtbar. Die Ansicht kann als Panel neben dem Graph erscheinen oder diesen temporär ersetzen.

Die dritte Komponente ist der Scope. Die 4×4-Matrix erscheint als interaktives Element. Klick auf eine Zelle zeigt den resultierenden Archetyp mit Begründung. Ambige Zellen zeigen die Rückfrage aus dem Dialog-Protokoll. Die Matrix demonstriert die Entscheidungslogik.

---

## Interaktion

Die Komponenten sind verknüpft. Ein Klick im Graph öffnet den Reader. Ein Klick auf einen Archetyp in der Matrix hebt die entsprechenden Knoten im Graph hervor. Die Navigation zwischen den Ansichten folgt dem Prinzip der progressiven Disclosure.

---

## Begründung

Die Selbstreferenz ist methodisch konsequent. Wenn GRIP ein Framework für Forschungsinterfaces ist, muss es auf seine eigene Dokumentation anwendbar sein. Der Prototyp ist der Beweis, dass die Methode funktioniert.

Der Besucher erfährt GRIP durch Benutzung. Er sieht nicht nur die Theorie, sondern erlebt die Anwendung. Das ist stärker als jede textuelle Erklärung.

---

## Abgrenzung

Der Prototyp ist eine statische Demonstration, kein generativer Generator. Er nimmt keine Benutzerdaten entgegen und erzeugt keine neuen Interfaces. Diese Erweiterung wäre ein späterer Schritt.

Der Prototyp läuft als Static Site auf GitHub Pages. Die Technologie (HTML/CSS/JS, D3 für den Graph) ist sekundär und wird nach Eignung gewählt.

---

## Erfolgskriterien

Der Prototyp ist erfolgreich, wenn ein Besucher ohne Vorwissen nach fünf Minuten Interaktion erklären kann, was die vier Archetypen sind, wie die Mapping-Matrix funktioniert und warum der Prototyp selbst so aufgebaut ist, wie er ist.

---

## Verknüpfungen

- [[00-PROJEKTAUFTRAG]] definiert das GRIP-Framework
- [[05-ARCHETYPEN]] spezifiziert Navigator, Reader und Scope
- [[02-MAPPINGS]] enthält die vollständige Mapping-Logik
- [[01-ARCHITEKTUR]] beschreibt die Struktur der Wissensbasis
- [[DESIGN]] definiert die visuelle Sprache des Prototyps
