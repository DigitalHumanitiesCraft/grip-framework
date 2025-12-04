# Projektauftrag: Interface-Repo

Dieses Dokument beschreibt Ziel, Scope und Deliverables des Interface-Repo-Projekts.

---

## Kernformel

Die zentrale Idee lässt sich als Transformation formulieren:

Forschungsdaten + Forschungsfrage + Interface-Repo = Domänenspezifisches Tool

Das Interface-Repo fungiert als Wissensspeicher, der die Regeln für diese Transformation kodifiziert.

---

## Problemstellung

Forschungsprojekte benötigen häufig maßgeschneiderte Interfaces zur Datenexploration. Dieses Wissen wird aktuell implizit angewendet oder jedes Mal neu erarbeitet. Es fehlt ein kodifiziertes System, das Datenstrukturen erkennt, Forschungsfragen interpretiert, daraus optimale UI-Patterns ableitet und über Domänen hinweg wiederverwendbar ist.

---

## Lösungsansatz

Ein selbstbeschreibendes Repository kodifiziert Methodenwissen in strukturierten Markdown-Dateien. Ein LLM kann dieses Repo lesen und daraus kontextspezifische UI-Spezifikationen generieren. Die Instructions im Repo sind zugleich die Dokumentation.

Das Repository ist maschinenlesbar durch strukturierte Heuristiken, erweiterbar durch modularen Aufbau und domänenagnostisch durch Abstraktion von konkreten Datentypen.

---

## Scope

Das Projekt umfasst strukturierte Daten wie JSON, CSV und XML, relationale Daten in Form von Graphen und Netzwerken, Dokumentenkorpora aus PDFs und Texten, temporale Daten als Zeitreihen, geospatiale Daten mit Koordinaten sowie binäre und unstrukturierte Daten, die via AI-Vorverarbeitung strukturiert werden.

Nicht im initialen Scope sind Echtzeit-Streaming, kollaborative Multi-User-Features und die konkrete Code-Implementierung. Das Projekt liefert Spezifikationen, keine Software.

---

## Deliverables

Das Projekt liefert fünf Artefakte:

Das Analyzer-Modul enthält Regeln zur Datenstruktur-Erkennung und Klassifikation. Der Pattern-Katalog dokumentiert UI-Patterns mit ihren Anwendungsbedingungen. Die Komponenten-Bibliothek beschreibt abstrakte UI-Bausteine und ihre Varianten. Die Layout-Templates definieren modulare Raster-Systeme für unterschiedliche Anwendungsfälle. Die Interaktions-Grammatik standardisiert Interaktionsmuster für Navigation, Selektion und Annotation.

---

## Workflow

Der Nutzungsworkflow gliedert sich in vier Phasen. Zunächst analysiert das System die Eingangsdaten und erkennt deren Schema und Typ. Dann wird basierend auf Datentyp und Forschungsfrage ein passendes UI-Pattern ausgewählt. Anschließend werden die benötigten Komponenten und ein geeignetes Layout zusammengestellt. Zuletzt generiert das System eine UI-Spezifikation oder optional ausführbaren Code.

---

## Erfolgskriterien

Das System gilt als erfolgreich, wenn alle gängigen Forschungsdatentypen abgedeckt sind, gleiche Inputs zu gleichen Outputs führen, jede Designentscheidung durch Repo-Regeln begründbar ist, neue Patterns mit geringem Aufwand hinzugefügt werden können und ein LLM das Repo vollständig interpretieren kann.

---

## Verknüpfungen

- [[01-ARCHITEKTUR]] beschreibt die technische Struktur des Repos
