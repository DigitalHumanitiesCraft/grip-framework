# Mappings: Daten und Fragen zu Interface-Patterns

Dieses Dokument definiert die zentralen Zuordnungsregeln des GRIP-Frameworks. Es beschreibt, wie Datenstrukturen und Forschungsintentionen auf Archetypen abgebildet werden. Die Regeln sind als Wenn-Dann-Heuristiken formuliert, die ein LLM deterministisch anwenden kann.

Abhängigkeiten: [[00-PROJEKTAUFTRAG]], [[01-ARCHITEKTUR]], [[05-ARCHETYPEN]]

---

## Die Mapping-Matrix

Die Zuordnung erfolgt durch Kombination von Daten-Topologie und epistemischer Intention. Beide Dimensionen müssen identifiziert werden, bevor ein Archetyp gewählt wird.

---

## Daten-Topologien

### Sequenziell

Erkennungsmerkmale: Daten haben eine inhärente Reihenfolge. Zeitstempel, Zeilennummern, Kapitelstrukturen. Das Vertauschen der Reihenfolge würde die Bedeutung verändern.

Typische Formate: Textdateien, Transkripte, Logs, Zeitreihen-CSV, FASTA-Sequenzen.

Leitfrage zur Erkennung: Ist die Reihenfolge der Einträge bedeutungstragend?

### Multidimensional

Erkennungsmerkmale: Daten bilden eine Matrix mit Zeilen und Spalten. Jede Zeile ist eine Beobachtung, jede Spalte ein Attribut. Aggregationen sind sinnvoll.

Typische Formate: CSV, Excel, Parquet, SQL-Tabellen, HDF5, NetCDF.

Leitfrage zur Erkennung: Kann man sinnvoll Durchschnitte oder Summen über die Daten bilden?

### Vernetzt

Erkennungsmerkmale: Daten enthalten explizite oder implizite Verweise zwischen Einträgen. Fremdschlüssel, Zitationen, Hyperlinks, Beziehungstabellen.

Typische Formate: Kantenlisten (CSV mit Source/Target), JSON mit Referenzen, RDF/Turtle, GraphML.

Leitfrage zur Erkennung: Verweisen Einträge aufeinander?

### Hierarchisch

Erkennungsmerkmale: Daten haben Eltern-Kind-Beziehungen. Verschachtelung, Baumstrukturen, Kategoriesysteme.

Typische Formate: Nested JSON, XML, Dateisysteme, Taxonomien.

Leitfrage zur Erkennung: Gibt es eine natürliche Ober-/Unterordnung?

---

## Epistemische Intentionen

### Vertieftes Verstehen

Der Forschende will einzelne Einheiten im Detail erfassen. Kontext ist wichtig. Die Frage ist qualitativ.

Schlüsselwörter: lesen, verstehen, interpretieren, nachvollziehen, kontextualisieren.

### Vergleich und Mustererkennung

Der Forschende will Unterschiede, Trends oder Anomalien identifizieren. Die Frage ist komparativ oder aggregativ.

Schlüsselwörter: vergleichen, Trend, Muster, Abweichung, Verteilung, Korrelation.

### Rekonstruktion von Zusammenhängen

Der Forschende will Verbindungen, Pfade oder Einflüsse nachzeichnen. Die Frage ist relational oder kausal.

Schlüsselwörter: verbunden, Einfluss, Pfad, Netzwerk, Beziehung, Abhängigkeit.

### Organisation und Kuratierung

Der Forschende will Daten sichten, bereinigen, strukturieren oder annotieren. Die Frage ist operativ.

Schlüsselwörter: sortieren, bereinigen, taggen, kategorisieren, korrigieren, exportieren.

---

## Die Entscheidungslogik

### Primäre Regeln

IF Daten = Sequenziell AND Intention = Vertieftes Verstehen THEN The Reader.
Begründung: Sequenzdaten erfordern Linearität. Immersion erfordert Fokus.

IF Daten = Multidimensional AND Intention = Vergleich/Mustererkennung THEN The Scope.
Begründung: Hohe Datendichte benötigt visuelle Abstraktion durch Charts.

IF Daten = Vernetzt AND Intention = Rekonstruktion THEN The Navigator.
Begründung: Relationale Komplexität lässt sich nur topologisch abbilden.

IF Daten = Hierarchisch AND Intention = Kuratierung THEN The Workbench.
Begründung: Manipulation erfordert atomare Sicht auf Datenelemente.

### Sekundäre Regeln

IF Daten = Sequenziell AND Intention = Vergleich THEN The Scope.
Beispiel: Mehrere Zeitreihen überlagern und Trends vergleichen.

IF Daten = Multidimensional AND Intention = Kuratierung THEN The Workbench.
Beispiel: Fehlerhafte Tabelleneinträge korrigieren.

IF Daten = Vernetzt AND Intention = Vertieftes Verstehen THEN The Reader mit Verlinkung.
Beispiel: Korrespondenz lesen, aber Verweise auf andere Briefe sichtbar machen.

### Fallback-Regel

IF Intention unklar OR Daten heterogen THEN The Scope.
Begründung: Die Vogelperspektive (Dashboard) ist der sicherste Startpunkt. Von dort kann der Nutzer in Detailansichten abspringen. Scope ermöglicht Exploration ohne Festlegung.

---

## Technische Erkennungsheuristik

Das Dateiformat liefert eine erste Hypothese, die durch Inhaltsanalyse geprüft werden muss.

CSV oder Parquet: Wahrscheinlich Scope (Tabelle) oder Navigator (Kantenliste). Prüfen, ob Source/Target-Spalten existieren.

JSON oder XML: Wahrscheinlich Workbench (Baum) oder Navigator (Graph). Prüfen, ob Verschachtelungstiefe hoch ist oder Referenzen existieren.

TXT oder FASTA: Wahrscheinlich Reader. Prüfen, ob lineares Lesen sinnvoll ist.

HDF5 oder NetCDF: Wahrscheinlich Scope. Wissenschaftliche Messdaten sind typischerweise multidimensional.

---

## Kombinationslogik

Reale Daten sind oft hybrid. Die folgenden Regeln gelten für Kombinationen.

### Wann kombinieren

Kombination ist sinnvoll, wenn beide Aspekte für die Forschungsfrage relevant sind und die Komplexität handhabbar bleibt.

Beispiel: Zitationsnetzwerk mit Zeitdimension. Navigator und Scope in Split-View. Selektion im Graph filtert die Timeline.

### Wann nicht kombinieren

Kombination ist nicht sinnvoll, wenn sie die primäre kognitive Aufgabe stört oder die UI überfrachtet.

Beispiel: Reader mit eingebettetem Netzwerkgraph. Die Linearität des Lesens wird durch die Graph-Visualisierung unterbrochen.

### Progressive Disclosure

Bei hoher Komplexität: Der Nutzer beginnt mit einem Archetyp und kann weitere Ansichten hinzuschalten. Die Standardansicht bleibt fokussiert.

---

## Verknüpfungen

- [[05-ARCHETYPEN]] beschreibt die vier Archetypen im Detail
- [[06-DIALOG]] dokumentiert die Rückfragen zur Klärung von Topologie und Intention
- [[03-BEISPIEL]] zeigt die Anwendung dieser Mappings an einem konkreten Fall
