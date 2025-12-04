# GRIP: Generative Research Interface Protocol

Dieses Dokument definiert Ziel, Scope und Grundannahmen des GRIP-Frameworks.

---

## Definition

GRIP ist ein methodisches Framework für die LLM-gestützte Entwicklung von Forschungsinterfaces. Es funktioniert als Context Engineering Artefakt, das einem Frontier-Modell das nötige Domänenwissen bereitstellt, um gemeinsam mit Forschenden maßgeschneiderte Dateninterfaces zu konzipieren. Das Repository speichert akkumuliertes Methodenwissen darüber, welche Interface-Archetypen für welche Datenstrukturen und Forschungsintentionen geeignet sind.

---

## Grundannahme

Die Wahl eines Forschungstools ist keine Geschmacksfrage, sondern folgt aus zwei Faktoren. Erstens der Daten-Topologie, also wie die Daten strukturiert vorliegen (sequenziell, multidimensional, vernetzt, hierarchisch). Zweitens der epistemischen Intention, also was der Forschende wissen will (Verstehen, Vergleichen, Rekonstruieren, Kuratieren). GRIP kodifiziert das Wissen über diese Zusammenhänge und macht es für LLM-gestützte Entwicklung nutzbar.

---

## Die vier Archetypen

Das Framework definiert vier Interface-Grundformen, die als Denkwerkzeuge dienen:

The Reader für sequenzielle Daten und vertieftes Verstehen. Ein Interface für lineare Daten, bei denen Kontext und narrative Abfolge im Vordergrund stehen.

The Scope für multidimensionale Daten und Vergleich. Ein analytisches Dashboard für Mustererkennung, Trends und Korrelationen.

The Navigator für vernetzte Daten und Rekonstruktion. Eine topologische Ansicht für Daten, deren Wert in den Beziehungen der Elemente liegt.

The Workbench für hierarchische Daten und Kuratierung. Eine Arbeitsumgebung für Manipulation, Bereinigung und Strukturierung.

Die Zuordnung von Topologie und Intention zum Archetyp erfolgt durch dokumentierte Wenn-Dann-Heuristiken.

---

## Scope

Das Framework behandelt strukturierte Daten wie JSON, CSV und XML, relationale Daten in Form von Graphen und Netzwerken, Dokumentenkorpora aus PDFs und Texten, temporale Daten als Zeitreihen sowie geospatiale Daten mit Koordinaten.

Nicht im initialen Scope sind Echtzeit-Streaming, kollaborative Multi-User-Features und die konkrete Code-Implementierung. GRIP liefert Archetyp-Empfehlungen und UI-Spezifikationen, keine lauffähige Software.

---

## Der kollaborative Workflow

Phase 1 ist die Kontextualisierung. Das LLM erhält Zugriff auf das GRIP-Repository und internalisiert die darin enthaltenen Archetypen, Mappings und Designentscheidungen.

Phase 2 ist die Datenanalyse. Der Forschende speist die Daten ein. Das LLM analysiert das Schema und identifiziert die Topologie. Bei Ambiguitäten stellt es Rückfragen.

Phase 3 ist der Dialog. Das LLM stellt präzise Fragen zur epistemischen Intention und schlägt einen Archetyp vor. Der Forschende kann Einwände formulieren und Prioritäten setzen.

Phase 4 ist die Spezifikation. Nach Zustimmung generiert das LLM eine UI-Spezifikation mit Komponenten, Layout und Interaktionsmustern.

Phase 5 ist der Wissensrückfluss. Neue Erkenntnisse und gelungene Lösungen fließen zurück ins Repository.

---

## Was GRIP ist und was nicht

GRIP ist eine strukturierte Ausgangsbasis für LLM-gestützte Interface-Konzeption. Es liefert dem Modell die epistemische Grundlage für informierte Vorschläge. Es kodifiziert Erfahrungswissen. Es ermöglicht schnellere Iterationen.

GRIP ist kein vollautomatischer Generator. Die Zuordnung von Daten zu Interfaces bleibt ein interpretativer Akt, der menschliche Urteilskraft erfordert. Das Framework unterstützt diesen Prozess, es ersetzt ihn nicht.

---

## Verknüpfungen

- [[05-ARCHETYPEN]] spezifiziert die vier Interface-Grundformen im Detail
- [[02-MAPPINGS]] beschreibt die Zuordnungslogik
- [[06-DIALOG]] dokumentiert das Rückfrage-Protokoll
- [[04-SYSTEM-PROMPT]] enthält den kondensierten Prompt für LLM-Nutzung
