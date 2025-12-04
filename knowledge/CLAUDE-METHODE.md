# Claude-Methode: Wissensmodellierung

Dieses Dokument beschreibt die methodische Arbeitsweise zur Wissensmodellierung und Informations-Destillation in diesem Vault.

---

## Grundprinzip

Die Methode versteht sich als Knowledge Engineering. Das Ziel ist nicht Konversation, sondern die Erzeugung strukturierter Wissensartefakte. Jedes Dokument soll als eigenständige Einheit in einer Wissensdatenbank funktionieren.

---

## Ontologische Präzision

Jedes Thema beginnt mit einer scharfen Definition. Diese Definition grenzt den Gegenstand klar ab und ordnet ihn in eine Klasse ein. Die Definition beantwortet zwei Fragen: Was ist der Gegenstand? Wozu dient er?

Begriffe werden konsistent verwendet. Synonyme werden vermieden oder explizit als solche gekennzeichnet. Mehrdeutige Terme werden durch Kontext disambiguiert.

---

## Signal-over-Noise

Der Text enthält nur informationstragende Aussagen. Entfernt werden Füllwörter, Meta-Kommentare über den Text selbst, Höflichkeitsfloskeln, redundante Einleitungen und zusammenfassende Wiederholungen.

Jeder Satz trägt neue Information bei. Wenn ein Satz gestrichen werden kann, ohne dass Information verloren geht, wird er gestrichen.

---

## Semantische Struktur

Die Struktur folgt der Semantik des Inhalts, nicht stilistischen Konventionen.

Überschriften gliedern nach inhaltlichen Einheiten, nicht nach formalen Kategorien. Die Hierarchie der Überschriften spiegelt die Hierarchie der Konzepte.

Fließtext eignet sich für Erklärungen, Zusammenhänge und Argumentationen. Listen eignen sich für Aufzählungen gleichwertiger Elemente. Tabellen eignen sich für strukturierte Vergleiche und Mappings. Die Form folgt dem Inhalt.

---

## Neutralität

Der Stil ist wissenschaftlich-objektiv. Aussagen werden als Fakten oder als explizit gekennzeichnete Hypothesen formuliert. Wertungen erfolgen nur auf Basis nachvollziehbarer Kriterien.

Meinungen, Präferenzen und subjektive Einschätzungen haben in Wissensdokumenten keinen Platz. Wo Unsicherheit besteht, wird diese benannt.

---

## Relationalität

Wissen existiert nicht isoliert. Jedes Dokument wird durch Verknüpfungen in den Kontext des Gesamtvaults eingebettet. Diese Verknüpfungen machen Abhängigkeiten, Voraussetzungen und verwandte Konzepte explizit.

Wikilinks in doppelten eckigen Klammern verbinden Dokumente. Die Verknüpfung ist keine Dekoration, sondern trägt semantische Information.

---

## Iterative Verfeinerung

Wissensmodellierung ist ein iterativer Prozess. Ein Dokument entsteht zunächst als Entwurf und wird durch Überarbeitung präzisiert. Neue Erkenntnisse führen zu Aktualisierungen.

Die Struktur eines Dokuments kann sich ändern, wenn das Verständnis des Gegenstands wächst. Rigide Vorlagen werden vermieden, wo sie die Darstellung einschränken.

---

## Selbstbeschreibung

Diese Methode ist selbst Teil des Vaults. Sie dokumentiert, wie Wissen in diesem System modelliert wird. Die Regeln in CLAUDE.md sind die operationalisierte Form dieser Methode.

---

## Verknüpfungen

- [[CLAUDE.md]] enthält die konkreten Formatierungsregeln
- [[00-PROJEKTAUFTRAG]] wendet diese Methode auf das Interface-Repo-Projekt an
