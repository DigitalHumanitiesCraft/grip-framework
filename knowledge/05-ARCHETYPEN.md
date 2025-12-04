# Archetypen: Die vier Interface-Grundformen

Dieses Dokument spezifiziert die vier Archetypen des GRIP-Frameworks. Jeder Archetyp ist eine distinkte Interface-Kategorie mit definierten Grenzen. Die Spezifikation dient dem LLM als Entscheidungsgrundlage.

Abhängigkeiten: [[00-PROJEKTAUFTRAG]], [[02-MAPPINGS]]

---

## Grundprinzip

Die Archetypen sind keine Vorlagen, sondern Denkwerkzeuge. Sie erzwingen eine Entscheidung über die primäre kognitive Aufgabe des Nutzers. Feature Creep entsteht, wenn diese Entscheidung vermieden wird. Die klare Abgrenzung (Was gehört rein, was nicht) verhindert überladene Interfaces.

---

## The Reader

### Definition

Ein Interface für lineare oder quasi-lineare Daten, bei denen der Kontext und die narrative Abfolge im Vordergrund stehen.

### Kognitive Aufgabe

Verstehen durch Immersion. Der Nutzer verarbeitet Information sequenziell. Unterbrechungen erhöhen die kognitive Last.

### Geeignete Daten

Fließtext und Dokumente. Transkripte von Interviews oder Gesprächen. Zeitstrahlen und chronologische Ereignisse. Sequenzdaten wie DNA-Strings oder Logs. Annotierte Quellen.

### Obligatorische UI-Elemente

Ein Fokus-Modus mit reduzierter visueller Ablenkung. Annotationstools für Markierungen und Kommentare. Volltextsuche mit Highlighting. Navigation durch die Sequenz (vor, zurück, springen).

### Optionale UI-Elemente

Synchronisation von Text mit Audio oder Video. Minimap für Orientierung in langen Dokumenten. Export von Annotationen.

### Ausschlüsse

Komplexe statistische Dashboards lenken vom Lesen ab und gehören nicht in den Reader. Netzwerkgraphen brechen die Linearität und sind ungeeignet. Editierfunktionen für Rohdaten gehören in die Workbench.

### Begründung der Ausschlüsse

Die kognitive Aufgabe erfordert kontinuierliche Aufmerksamkeit. Jede visuelle Unterbrechung durch Charts oder komplexe Visualisierungen stört den linearen Verarbeitungsprozess. Der Reader optimiert für Tiefe, nicht für Breite.

---

## The Scope

### Definition

Ein analytisches Dashboard für multidimensionale Daten, das auf Vergleich und Mustererkennung ausgelegt ist.

### Kognitive Aufgabe

Mustererkennung durch visuelle Abstraktion. Der Nutzer erfasst Abweichungen, Trends und Korrelationen schneller durch geometrische Darstellung als durch Zahlen.

### Geeignete Daten

Zeitreihen und Messwerte. Statistische Verteilungen. Kategorische Häufigkeiten. Matrix-Daten und Kreuztabellen. Georeferenzierte Punkte.

### Obligatorische UI-Elemente

Small Multiples für parallelen Vergleich. Interaktive Filter mit Faceted Search. Übersichts-Charts (Line, Bar, Scatter). Aggregationsfunktionen (Summe, Durchschnitt, Verteilung).

### Optionale UI-Elemente

Heatmaps für Dichteinformation. Kartenansicht für Geodaten. Drill-Down in Detailansichten. Export von Filterungen.

### Ausschlüsse

Lange, unstrukturierte Lesetexte gehören in den Reader. Editierfunktionen für Einzelwerte gehören in die Workbench. Netzwerk-Visualisierungen gehören in den Navigator.

### Begründung der Ausschlüsse

The Scope ist ein Analysewerkzeug, kein Schreibwerkzeug. Das menschliche Auge kann Abweichungen in Geometrie (Balkenhöhe, Punktdichte, Farbintensität) schneller erfassen als in Text oder Tabellen. Das UI muss die visuelle Fläche für Charts maximieren.

---

## The Navigator

### Definition

Eine topologische Ansicht für Daten, deren primärer Wert in der Beziehung der Elemente zueinander liegt.

### Kognitive Aufgabe

Strukturanalyse durch Visualisierung von Verbindungen. In Netzwerken ist die Position eines Knotens (Zentralität, Cluster-Zugehörigkeit) oft wichtiger als sein Inhalt.

### Geeignete Daten

Referenzdaten wie Zitationsnetzwerke oder Korrespondenzen. Linked Open Data und Ontologien. Soziale Netzwerke. Abhängigkeitsgraphen in Software. Verwandtschaftsbeziehungen oder Stammbäume.

### Obligatorische UI-Elemente

Node-Link-Diagramm mit interaktiver Navigation. Zoom und Pan für unterschiedliche Detailgrade. Knoten-Inspektor für Details bei Selektion. Pfad-Hervorhebung zwischen Knoten.

### Optionale UI-Elemente

Cluster-Erkennung und Einfärbung. Adjazenzmatrix als alternative Darstellung. Filter nach Knotenattributen. Shortest-Path-Berechnung. Export von Teilgraphen.

### Ausschlüsse

Statische Listen ohne Verlinkung haben keine Netzwerkstruktur. Lose Textsammlungen ohne extrahierte Entitäten sind keine Graphen. Zeitreihen ohne Relationen gehören in den Scope.

### Begründung der Ausschlüsse

Listenansichten verschleiern strukturelle Information. Ein Netzwerk ohne sichtbare Verbindungen ist kein Netzwerk. Der Navigator optimiert für die Darstellung von Beziehungen, nicht von Attributen.

---

## The Workbench

### Definition

Eine Arbeitsumgebung für hierarchische oder rohe Daten, fokussiert auf Manipulation, Bereinigung und Strukturierung.

### Kognitive Aufgabe

Kuratierung durch direkten Datenzugriff. Der Nutzer muss Einzelwerte sehen, verstehen und verändern können. Visuelle Abstraktionen würden die Rohdaten verschleiern.

### Geeignete Daten

Rohe JSON- oder XML-Strukturen. Unbereinigte Tabellen mit Fehlern. Metadaten-Dumps. Hierarchische Dateisysteme oder Kategorien. Daten vor der Transformation.

### Obligatorische UI-Elemente

Spaltenansichten (Miller Columns) oder Tree-View für Hierarchien. Tabellen mit Inline-Editing. Bulk-Actions für Massenbearbeitung. Undo/Redo für Manipulationen.

### Optionale UI-Elemente

Validierungsanzeigen für Datenqualität. Transformations-Log. Diff-Ansicht für Änderungen. Import/Export in verschiedene Formate.

### Ausschlüsse

Präsentationsgrafiken und Hochglanz-Charts gehören in den Scope. Read-only Elemente ohne Bearbeitungsmöglichkeit sind keine Workbench. Narrative Darstellungen gehören in den Reader.

### Begründung der Ausschlüsse

Die kognitive Aufgabe erfordert direkten Zugriff auf die Datenwerte mit geringer Latenz. Visuelle Abstraktionen verstecken die Wahrheit der Rohdaten. Die Workbench optimiert für Manipulation, nicht für Präsentation.

---

## Abgrenzungstabelle

Die folgende Übersicht zeigt die primäre Funktion jedes Archetyps:

Reader: Lesen und Verstehen von Sequenzen.
Scope: Analysieren und Vergleichen von Mustern.
Navigator: Erkunden und Rekonstruieren von Beziehungen.
Workbench: Bearbeiten und Kuratieren von Rohdaten.

---

## Verknüpfungen

- [[02-MAPPINGS]] beschreibt, wie Datentypen und Intentionen auf Archetypen abgebildet werden
- [[06-DIALOG]] dokumentiert die Rückfragen zur Archetyp-Auswahl
- [[04-SYSTEM-PROMPT]] enthält die kondensierte Form für LLM-Nutzung
