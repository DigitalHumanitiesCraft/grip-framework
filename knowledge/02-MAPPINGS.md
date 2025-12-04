# Mappings: Daten und Fragen zu Interface-Patterns

Dieses Dokument definiert die zentralen Zuordnungsregeln des Interface-Repos. Es beschreibt, wie Datenstrukturen und Forschungsfragen auf UI-Patterns abgebildet werden.

Abhängigkeiten: [[00-PROJEKTAUFTRAG]], [[01-ARCHITEKTUR]]

---

## Datentyp zu Interface-Pattern

Die Wahl des UI-Patterns folgt primär aus der Struktur der Eingangsdaten. Jeder Datentyp hat charakteristische Erkennungsmerkmale und ein zugehöriges optimales Pattern.

Tabellarische Daten erkennt man an einer Rows-times-Columns-Struktur, typisch für CSV oder Excel. Das optimale Pattern ist eine sortierbare Tabelle mit Facettenfiltern.

Hierarchische Daten zeigen verschachtelte Strukturen wie Nested JSON oder Baumstrukturen. Sie werden durch kollabierbare Trees mit Breadcrumb-Navigation dargestellt.

Relationale Daten enthalten Fremdschlüssel oder explizite Verknüpfungen zwischen Entitäten. Eine Graph-Visualisierung mit Node-Inspector eignet sich hier.

Temporale Daten enthalten Timestamps oder bilden Zeitreihen. Sie erfordern eine Timeline mit Zeitraum-Slider.

Geospatiale Daten enthalten Koordinaten oder GeoJSON-Strukturen. Eine Kartenansicht mit Cluster-Markern ist das passende Pattern.

Dokumentbasierte Daten bestehen aus Volltext oder PDFs mit Metadaten. Ein Reader mit Annotation-Layer ermöglicht die Arbeit mit diesen Daten.

Binäre und mediale Daten wie Bilder, Audio oder Video werden durch ein Preview-Grid mit Metadata-Panel zugänglich gemacht.

Unstrukturierte Daten wie Rohdaten oder Logs durchlaufen zunächst eine AI-gestützte Strukturierung, bevor eines der anderen Patterns angewendet wird.

---

## Forschungsfrage zu Interaktionsmodus

Die Art der Forschungsfrage bestimmt den primären Interaktionsmodus unabhängig vom Datentyp.

Explorative Fragen wie "Was gibt es hier?" erfordern Browse-, Filter- und Cluster-Funktionen. Der Nutzer möchte einen Überblick gewinnen.

Komparative Fragen wie "Wie unterscheiden sich X und Y?" verlangen Side-by-Side- oder Diff-Ansichten. Zwei oder mehr Elemente werden direkt verglichen.

Aggregative Fragen wie "Wie viele? Wie verteilt?" werden durch Charts und Statistik-Dashboards beantwortet. Der Fokus liegt auf Zusammenfassungen.

Kausale Fragen wie "Warum passiert X?" benötigen Drill-Down- und Trace-Ansichten. Der Nutzer verfolgt Ursache-Wirkungs-Ketten.

Temporale Fragen wie "Wie entwickelt sich X über Zeit?" erfordern Timelines, eventuell mit Animation. Veränderungen werden sichtbar.

Relationale Fragen wie "Wer ist mit wem verbunden?" werden durch Graphen und Network-Maps beantwortet. Beziehungen stehen im Fokus.

---

## Kombinationslogik

In der Praxis überlappen sich Datentypen und Fragetypen. Das Composite-Pattern definiert Regeln für solche Fälle.

Wenn Daten sowohl temporal als auch relational sind und die Frage beide Aspekte adressiert, kombiniert man Timeline und Graph in einem Split-View. Die Interaktion verknüpft beide Ansichten: Selektion in einer Ansicht filtert die andere.

Die Komplexitätsbewertung der Analyzers bestimmt, ob eine Kombination sinnvoll ist oder die Darstellung überfrachtet. Bei hoher Komplexität wird eine progressive Disclosure-Strategie gewählt: Der Nutzer beginnt mit einer Ansicht und kann weitere hinzuschalten.

---

## Verknüpfungen

- [[01-ARCHITEKTUR]] beschreibt die Module, die diese Mappings implementieren
- [[03-BEISPIEL]] zeigt die Anwendung dieser Mappings an einem konkreten Fall
