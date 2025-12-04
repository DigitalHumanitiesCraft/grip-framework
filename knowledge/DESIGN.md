# Design: Visuelle Identität

Dieses Dokument definiert die visuelle Sprache für GRIP-Interfaces und die Framework-Website. Es dient als Referenz für konsistentes Design und kann von einem LLM bei der UI-Generierung herangezogen werden.

Abhängigkeiten: [[00-PROJEKTAUFTRAG]], [[05-ARCHETYPEN]], [[08-DESIGN-RATIONALE]]

---

## Design-Philosophie: Organic Academic

Das Design kommuniziert Sicherheit, Substanz und Menschlichkeit. Es vermeidet aggressive Technologie-Ästhetik und orientiert sich an klassischem Editorial Design, kombiniert mit organischen Elementen.

### Kernwerte

Ruhe: Keine überladenen Interfaces, großzügiger Weißraum.

Wärme: Verzicht auf klinisches Weiß zugunsten von Erdtönen.

Substanz: Typografie steht im Vordergrund, Bilder sind metaphorisch, nicht dekorativ.

---

## Farbpalette

Die Farbgebung ist warm, gedämpft und augenfreundlich. Sie wirkt wie Papier, nicht wie ein Bildschirm.

### Primärfarben

Paper Sand ist der Hintergrund. Ein sehr helles, warmes Beige oder Creme. Vermeidet hartes Weiß. Hexadezimal etwa FDFBF7 oder F5F1EB.

Ink Black ist die Textfarbe. Ein tiefes Anthrazit oder Off-Black. Starker Kontrast, aber weicher als reines Schwarz. Hexadezimal etwa 1A1A1A oder 2D2D2D.

### Akzentfarben

Terracotta ist die Highlight-Farbe. Ein erdiger, rötlich-orangefarbener Ton. Symbolisiert organisches Wachstum. Hexadezimal etwa C4705A oder D4826A.

Slate ist die Farbe für dunkle Elemente. Ein dunkles Grau für Modals oder Footer. Hexadezimal etwa 1E1E1E oder 252525.

### Archetypen-Farben

Reader: Grün (7EE787) für Wachstum und Lesen.
Scope: Rot-Orange (FF7B72) für Analyse und Aufmerksamkeit.
Navigator: Violett (D2A8FF) für Verbindungen und Exploration.
Workbench: Orange (FFA657) für Arbeit und Manipulation.

---

## Typografie

Die Typografie trennt emotionale Ansprache von funktionaler Information.

### Headlines

Stil: Klassische Serifen-Schrift (Serif).

Anmutung: Editorial, literarisch, akademisch. Erinnert an Buchdruck.

Verwendung: Große Überschriften und Titel. Die Serifen vermitteln Tradition und Vertrauenswürdigkeit.

Empfohlene Schriften: Lora, Merriweather, Source Serif Pro, Playfair Display.

### UI und Body

Stil: Moderne Grotesk-Schrift (Sans-Serif).

Anmutung: Neutral, geometrisch, gut lesbar.

Verwendung: Navigation, Buttons, Fließtext und funktionale UI-Elemente. Schafft klaren Kontrast zur emotionalen Headline.

Empfohlene Schriften: Inter, Source Sans Pro, IBM Plex Sans.

### Monospace

Stil: Technische Monospace-Schrift für Code und Daten.

Verwendung: Codeblöcke, Dateinamen, technische Bezeichner.

Empfohlene Schriften: JetBrains Mono, Fira Code, SF Mono.

---

## Ikonografie und Illustration

Die Bildsprache ist abstrakt und metaphorisch.

### Illustrationsstil

Die Illustrationen wirken wie Linolschnitte, Scherenschnitte oder Pinselzeichnungen.

Die Linienführung ist unperfekt mit organischen Kanten. Ungleichmäßige Strichstärken suggerieren Menschlichkeit.

Die Formen sind organische Strukturen, die Pflanzen oder neuronalen Netzen ähneln, aber weich und natürlich wirken.

### Icons

Stil: Feine Line-Art, reduziert auf das Wesentliche.

Strichstärke: Konsistent, etwa 1.5 bis 2 Pixel.

Komplexität: Minimal, sofort erkennbar.

---

## Layout

### Whitespace

Extrem großzügiger Einsatz von Negativraum. Das Layout atmet. Inhalte sind oft linksbündig mit viel Platz rechts.

### Struktur

Klare Zweiteilung zwischen Textbereich (rational) und Bildbereich (emotional) wo anwendbar.

Maximale Inhaltsbreite: 1200 Pixel für Lesbarkeit.

### Grid

Flexibles Grid mit 12 Spalten für komplexe Layouts, 8 Spalten für fokussierte Inhalte.

---

## UI-Komponenten

### Buttons

Form: Solide Rechtecke mit leicht abgerundeten Ecken (4-8 Pixel Radius). Nicht pillenförmig, nicht scharfkantig.

Primär: Dunkler Hintergrund, helle Schrift.

Sekundär: Transparenter Hintergrund, dunkle Schrift, dünner Rahmen.

### Cards

Hintergrund: Subtil abgesetzt vom Seitenhintergrund (etwa 2-3% dunkler oder heller).

Rahmen: Kein harter Rahmen, nur Hintergrundfarbe zur Abgrenzung.

Akzent: Farbige linke Bordüre für Kategorisierung (etwa bei Archetypen).

### Modals

Overlay: Dunkler Hintergrund mit hoher Opazität (etwa 0.8).

Inhalt: Fokussiert, minimalistisch, keine Dekoration.

### Tabellen und Matrizen

Rahmen: Subtile Linien in Grau, nicht dominant.

Hover: Leichte Hervorhebung der Zeile oder Zelle.

Interaktive Zellen: Cursor-Änderung und visuelle Rückmeldung.

---

## Responsive Design

### Breakpoints

Klein: bis 600 Pixel (Mobile).
Mittel: 601 bis 900 Pixel (Tablet).
Groß: ab 901 Pixel (Desktop).

### Anpassungen

Mobile: Einspaltiges Layout, reduzierte Typografie-Größen, Touch-optimierte Interaktionen.

Desktop: Mehrspaltiges Layout, volle typografische Hierarchie.

---

## Anwendung auf Archetypen

Die Design-Sprache passt zur kognitiven Aufgabe jedes Archetyps.

Reader: Maximaler Fokus auf Text. Warme Hintergrundfarbe reduziert Augenermüdung. Serifen-Schrift für längere Lesepassagen.

Scope: Klare visuelle Hierarchie für Dashboards. Charts nutzen die Akzentfarben sparsam. Viel Weißraum zwischen Widgets.

Navigator: Zurückhaltender Hintergrund, damit Graph-Visualisierungen hervortreten. Knoten nutzen Archetyp-Farben.

Workbench: Funktionale Ästhetik. Monospace für Datenwerte. Klare Abgrenzung editierbarer Bereiche.

---

## Design Tokens

Die folgenden CSS-Variablen erzwingen Konsistenz und ermöglichen LLMs, das Design-System maschinenlesbar zu nutzen.

### Farben

```css
/* Basis */
--color-paper: #FDFBF7;
--color-paper-dark: #F5F1EB;
--color-ink: #1A1A1A;
--color-ink-light: #6B6B6B;
--color-ink-muted: #9A9A9A;

/* Akzent */
--color-terracotta: #C4705A;
--color-terracotta-light: #D4826A;
--color-slate: #1E1E1E;

/* Archetypen */
--color-archetype-reader: #4A7C59;
--color-archetype-scope: #B85450;
--color-archetype-navigator: #7B68A6;
--color-archetype-workbench: #C4875A;
```

### Typografie

```css
/* Semantische Fonts */
--font-serif: 'Lora', Georgia, serif;          /* Emotional: Inhalte, Headlines */
--font-sans: 'Inter', system-ui, sans-serif;   /* Funktional: UI, Navigation */
--font-mono: 'JetBrains Mono', monospace;      /* Technisch: Daten, Code */
```

### Spacing

```css
--space-xs: 0.25rem;
--space-sm: 0.5rem;
--space-md: 1rem;
--space-lg: 1.5rem;
--space-xl: 2rem;
--space-2xl: 3rem;
```

---

## Verknüpfungen

- [[05-ARCHETYPEN]] definiert die kognitiven Aufgaben, die das Design unterstützen muss
- [[00-PROJEKTAUFTRAG]] beschreibt den akademischen Kontext des Frameworks
- [[08-DESIGN-RATIONALE]] liefert die wissenschaftlichen Begründungen
