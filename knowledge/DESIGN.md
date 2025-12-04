# Design: Visuelle Identität und Kognitive Begründungen

Dieses Dokument definiert die visuelle Sprache für GRIP-Interfaces und liefert die wissenschaftlichen Begründungen für Interface-Entscheidungen. Es dient als Referenz für konsistentes Design und kann von einem LLM bei der UI-Generierung herangezogen werden.

Abhängigkeiten: [[00-PROJEKTAUFTRAG]], [[05-ARCHETYPEN]]

---

## Design-Philosophie: Organic Academic

Das Design kommuniziert Sicherheit, Substanz und Menschlichkeit. Es vermeidet aggressive Technologie-Ästhetik und orientiert sich an klassischem Editorial Design, kombiniert mit organischen Elementen.

Ruhe: Keine überladenen Interfaces, großzügiger Weißraum.

Wärme: Verzicht auf klinisches Weiß zugunsten von Erdtönen.

Substanz: Typografie steht im Vordergrund, Bilder sind metaphorisch, nicht dekorativ.

Wissenschaftliche Arbeit erfordert lange Bildschirmzeiten. Das Design muss Ermüdung reduzieren. Warme Hintergrundfarbe (Paper Sand #FDFBF7) simuliert Papier und reduziert Blaulicht-Anteil. Weiches Schwarz (#1A1A1A) statt hartem Schwarz reduziert Kontrast-Stress.

---

## Farbpalette

Die Farbgebung ist warm, gedämpft und augenfreundlich.

Paper Sand ist der Hintergrund (#FDFBF7). Ink Black ist die Textfarbe (#1A1A1A). Terracotta ist die Highlight-Farbe (#C4705A). Slate ist für dunkle Elemente (#1E1E1E).

Archetypen-Farben: Reader grün (#4A7C59), Scope rot (#B85450), Navigator violett (#7B68A6), Workbench orange (#C4875A).

---

## Typografie

Serif-Fonts (Lora) für Forschungsinhalte und Headlines. Humanistische Wirkung, traditionelle Assoziation mit gedruckten Büchern.

Sans-Serif (Inter) für UI-Elemente. Neutrale, technische Wirkung. Klare Unterscheidung von Inhalt und Interface.

Monospace (JetBrains Mono) für Code und Daten.

---

## Kognitive Anforderungen pro Archetyp

### Reader: Deep Reading

Immersives Lesen erfordert ungestörten Textfluss. Das Auge bewegt sich in Sakkaden und Return-Sweeps.

Zeilenlänge: 60-75 Zeichen (ca. 700px bei 16px Font). Zu lange Zeilen erschweren den Return-Sweep.

Zeilenhöhe: Mindestens 1.6em. Unterstützt das Auge beim Finden der nächsten Zeile.

Keine Unterstreichungen im Fließtext. Unterstreichungen zerstören Wortbilder und verlangsamen das Lesen.

Ablenkungsfreie Umgebung. Charts und Sidebars konkurrieren um Aufmerksamkeit.

### Scope: Prä-attentive Wahrnehmung

Mustererkennung nutzt prä-attentive Verarbeitung: Das visuelle System erkennt Abweichungen vor dem bewussten Denken.

Small Multiples statt interaktiver Einzel-Charts. Nebeneinanderliegende Grafiken ermöglichen direkten Vergleich ohne Gedächtnisbelastung.

Semantische Farbkodierung für Abweichungen. Positive/negative Änderungen müssen ohne Legende erkennbar sein.

Filter-Sidebar statt sequenzieller Dialoge. Facettierte Suche zeigt alle Dimensionen gleichzeitig.

KPI-Cards mit Änderungsindikator. Trend-Pfeile oder Sparklines liefern sofort Orientierung.

### Navigator: Hairball-Vermeidung

Netzwerkvisualisierung muss Struktur sichtbar machen, ohne in visuellem Rauschen zu ertrinken.

Filtermechanismen bei mehr als 50 Knoten. Ungefiltertes Force-Directed Layout wird bei Größe unlesbar.

Progressive Disclosure für Kanten und Labels. Labels erscheinen bei Hover/Fokus, nicht alle gleichzeitig.

Mehrere Layout-Modi. Force-Directed für Standardfall, Radial für hierarchische Strukturen, Cluster für Gruppenvergleich.

Netzwerk-Metriken im Panel. Cognitive Offloading statt mentaler Berechnung.

### Workbench: Mode Awareness

Kuratierung erfordert klare Unterscheidung zwischen Betrachten und Editieren.

Visuell abgegrenzte Editier-Modi. Editierbare Zellen haben Rahmen, Hintergrund oder Icon.

Sofortiges Validierungs-Feedback. Gamification der Bereinigung. Fehleranzahl sinkt sichtbar.

Undo/Redo mit Ctrl+Z/Y. Rückgängig-Funktion reduziert Angst vor Änderungen.

Batch-Operationen für gleichartige Fehler. Effizienz bei Massenbereinigung.

---

## UI-Komponenten

Buttons: Solide Rechtecke mit 4-8px Radius. Primär dunkel, Sekundär mit Rahmen.

Cards: Subtil abgesetzt vom Hintergrund. Farbige linke Bordüre für Kategorisierung.

Modals: Dunkles Overlay (0.8 Opazität), fokussierter Inhalt.

Tabellen: Subtile Rahmen, Hover-Hervorhebung, Cursor-Feedback bei interaktiven Zellen.

---

## Design Tokens (CSS)

```css
/* Farben */
--color-paper: #FDFBF7;
--color-paper-dark: #F5F1EB;
--color-ink: #1A1A1A;
--color-ink-light: #6B6B6B;
--color-terracotta: #C4705A;
--color-slate: #1E1E1E;

/* Archetypen */
--color-archetype-reader: #4A7C59;
--color-archetype-scope: #B85450;
--color-archetype-navigator: #7B68A6;
--color-archetype-workbench: #C4875A;

/* Typografie */
--font-serif: 'Lora', Georgia, serif;
--font-sans: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace;

/* Spacing */
--space-xs: 0.25rem;
--space-sm: 0.5rem;
--space-md: 1rem;
--space-lg: 1.5rem;
--space-xl: 2rem;
```

---

## Design Constraints für LLM-Codegenerierung

1. Niemals #FFFFFF oder #000000 verwenden. Immer --color-paper und --color-ink.
2. Lesetexte zwingend in Serif-Font.
3. UI-Kontrollen zwingend in Sans-Serif-Font.
4. Zeilenlänge im Reader maximal 75 Zeichen.
5. Bei Netzwerken über 50 Knoten: Filtermechanismus implementieren.
6. Editierbare Felder visuell abgrenzen.
7. Alle Farbkodierungen müssen barrierefrei sein (nicht nur Rot/Grün).

---

## Verknüpfungen

- [[05-ARCHETYPEN]] definiert die kognitiven Aufgaben pro Archetyp
- [[00-PROJEKTAUFTRAG]] beschreibt den akademischen Kontext
- [[04-SYSTEM-PROMPT]] nutzt diese Begründungen für Empfehlungen
