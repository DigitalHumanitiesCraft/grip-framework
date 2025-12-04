/**
 * Edition Genetik-Modus
 *
 * Textschichten und Entstehungsprozess visualisieren
 *
 * Benötigte Daten: text_flow[], layers[], corrections[]
 * Wissensbasis: 15-MODI#Edition-Genetik, 14-EPICS#Edition
 */

class EditionGenetik {
    constructor(containerId, dataPath) {
        this.container = document.getElementById(containerId);
        this.dataPath = dataPath || '../../examples/data/reader-edition.json';
        this.data = null;
        this.activeLayers = new Set();
        this.activeHands = new Set();
        this.activeTypes = new Set(['deletion', 'addition', 'substitution']);
        this.timePosition = 100; // 0-100

        this.init();
    }

    async init() {
        try {
            const response = await fetch(this.dataPath);
            this.data = await response.json();
            this.initializeFilters();
            this.render();
            this.bindEvents();
            this.bindKeyboard();
        } catch (error) {
            console.error('Fehler beim Laden der Daten:', error);
        }
    }

    initializeFilters() {
        // Alle Schichten und Hände standardmäßig aktivieren
        this.data.layers?.forEach(l => this.activeLayers.add(l.id));
        this.data.hands?.forEach(h => this.activeHands.add(h.id));
    }

    render() {
        if (!this.data) return;

        this.renderHeader();
        this.renderLayerCheckboxes();
        this.renderHandCheckboxes();
        this.renderGeneticText();
        this.renderLegend();
        this.updateStats();
    }

    renderHeader() {
        const title = document.getElementById('text-title');
        const witness = document.getElementById('text-witness');

        if (title) title.textContent = this.data.meta?.title || 'Edition';
        if (witness) witness.textContent = this.data.witnesses?.[0]?.name || '';
    }

    renderLayerCheckboxes() {
        const container = document.getElementById('layer-checkboxes');
        if (!container) return;

        const layers = this.data.layers || [
            { id: 1, name: 'Grundschicht', color: '#4A90A4' },
            { id: 2, name: 'Erste Revision', color: '#8BAE71' },
            { id: 3, name: 'Endfassung', color: '#C4705A' }
        ];

        container.innerHTML = layers.map(l => `
            <label class="layer-item" style="--layer-color: ${l.color}">
                <input type="checkbox"
                       data-layer="${l.id}"
                       ${this.activeLayers.has(l.id) ? 'checked' : ''}>
                <span class="layer-label">${l.name}</span>
            </label>
        `).join('');
    }

    renderHandCheckboxes() {
        const container = document.getElementById('hand-checkboxes');
        if (!container) return;

        const hands = this.data.hands || [
            { id: 'author', name: 'Autor', color: '#1A1A1A' },
            { id: 'editor', name: 'Redaktor', color: '#4A7C59' }
        ];

        container.innerHTML = hands.map(h => `
            <label class="hand-item" style="--hand-color: ${h.color}">
                <input type="checkbox"
                       data-hand="${h.id}"
                       ${this.activeHands.has(h.id) ? 'checked' : ''}>
                <span class="hand-label">${h.name}</span>
            </label>
        `).join('');
    }

    renderGeneticText() {
        const container = document.getElementById('genetic-text');
        if (!container) return;

        const text = this.data.text_flow?.map(line => {
            let content = line.content || line.text || '';

            // Korrekturen einfügen
            this.data.corrections?.forEach(corr => {
                if (corr.line_id === line.id) {
                    content = this.applyCorrection(content, corr);
                }
            });

            return content;
        }).join(' ') || 'Kein Text verfügbar';

        container.innerHTML = text;
        this.applyFilters();
    }

    applyCorrection(text, correction) {
        const layerVisible = this.activeLayers.has(correction.layer);
        const handVisible = this.activeHands.has(correction.hand);
        const typeVisible = this.activeTypes.has(correction.type);

        const visible = layerVisible && handVisible && typeVisible;
        const hiddenClass = visible ? '' : 'hidden';

        switch (correction.type) {
            case 'deletion':
                return text.replace(correction.original,
                    `<span class="deletion ${hiddenClass}"
                           data-layer="${correction.layer}"
                           data-hand="${correction.hand}"
                           data-type="deletion">${correction.original}</span>`
                );

            case 'addition':
                // Einfügung nach Position
                return text + `<span class="addition ${hiddenClass}"
                                    data-layer="${correction.layer}"
                                    data-hand="${correction.hand}"
                                    data-type="addition">${correction.text}</span>`;

            case 'substitution':
                return text.replace(correction.original,
                    `<span class="substitution ${hiddenClass}"
                           data-layer="${correction.layer}"
                           data-hand="${correction.hand}"
                           data-type="substitution"
                           data-before="${correction.original}">${correction.text}</span>`
                );

            default:
                return text;
        }
    }

    applyFilters() {
        // Schichten filtern
        document.querySelectorAll('[data-layer]').forEach(el => {
            const layer = parseInt(el.dataset.layer);
            const visible = this.activeLayers.has(layer);
            el.classList.toggle('hidden', !visible);
        });

        // Hände filtern
        document.querySelectorAll('[data-hand]').forEach(el => {
            const hand = el.dataset.hand;
            const visible = this.activeHands.has(hand);
            if (!visible) el.classList.add('hidden');
        });

        // Typen filtern
        document.querySelectorAll('[data-type]').forEach(el => {
            const type = el.dataset.type;
            const visible = this.activeTypes.has(type);
            if (!visible) el.classList.add('hidden');
        });

        // Zeit-Slider anwenden
        this.applyTimeFilter();
    }

    applyTimeFilter() {
        const position = this.timePosition;
        const layers = this.data.layers || [];
        const maxLayer = layers.length;

        // Schichten basierend auf Zeitposition ein/ausblenden
        layers.forEach((layer, index) => {
            const threshold = ((index + 1) / maxLayer) * 100;
            const visible = position >= threshold;

            document.querySelectorAll(`[data-layer="${layer.id}"]`).forEach(el => {
                el.style.opacity = visible ? 1 : 0.2;
            });
        });
    }

    renderLegend() {
        const container = document.getElementById('legend-items');
        if (!container) return;

        const items = [
            { type: 'deletion', label: 'Streichung', sample: 'Text' },
            { type: 'addition', label: 'Ergänzung', sample: 'Text' },
            { type: 'substitution', label: 'Ersetzung', sample: 'Text' }
        ].filter(item => this.activeTypes.has(item.type));

        container.innerHTML = items.map(item => `
            <div class="legend-item">
                <span class="sample ${item.type}">${item.sample}</span>
                <span class="label">${item.label}</span>
            </div>
        `).join('');
    }

    updateStats() {
        const layers = this.data.layers?.length || 0;
        const corrections = this.data.corrections?.length || 0;
        const hands = this.data.hands?.length || 0;

        document.getElementById('stat-layers')?.textContent = layers;
        document.getElementById('stat-corrections')?.textContent = corrections;
        document.getElementById('stat-hands')?.textContent = hands;
    }

    bindEvents() {
        // Zeit-Slider
        document.getElementById('time-slider')?.addEventListener('input', (e) => {
            this.timePosition = parseInt(e.target.value);
            this.applyTimeFilter();
        });

        // Schichten-Checkboxen
        document.getElementById('layer-checkboxes')?.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                const layer = parseInt(e.target.dataset.layer);
                if (e.target.checked) {
                    this.activeLayers.add(layer);
                } else {
                    this.activeLayers.delete(layer);
                }
                this.applyFilters();
            }
        });

        // Hände-Checkboxen
        document.getElementById('hand-checkboxes')?.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                const hand = e.target.dataset.hand;
                if (e.target.checked) {
                    this.activeHands.add(hand);
                } else {
                    this.activeHands.delete(hand);
                }
                this.applyFilters();
            }
        });

        // Typ-Checkboxen
        document.getElementById('type-checkboxes')?.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                const type = e.target.dataset.type;
                if (e.target.checked) {
                    this.activeTypes.add(type);
                } else {
                    this.activeTypes.delete(type);
                }
                this.applyFilters();
                this.renderLegend();
            }
        });

        // Korrektur-Klick
        document.getElementById('genetic-text')?.addEventListener('click', (e) => {
            const correction = e.target.closest('[data-type]');
            if (correction) {
                this.showCorrectionDetail(correction);
            }
        });
    }

    showCorrectionDetail(element) {
        const info = document.getElementById('correction-info');
        const prompt = document.getElementById('correction-prompt');

        prompt?.classList.add('hidden');
        info?.classList.remove('hidden');

        document.getElementById('corr-type').textContent =
            element.dataset.type === 'deletion' ? 'Streichung' :
            element.dataset.type === 'addition' ? 'Ergänzung' : 'Ersetzung';

        document.getElementById('corr-layer').textContent = `Schicht ${element.dataset.layer}`;
        document.getElementById('corr-hand').textContent = element.dataset.hand;

        const before = element.dataset.before || element.textContent;
        const after = element.dataset.type === 'deletion' ? '(gelöscht)' : element.textContent;

        document.getElementById('corr-before').textContent = before;
        document.getElementById('corr-after').textContent = after;
    }

    bindKeyboard() {
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '4') {
                e.preventDefault();
                const modes = ['synopse', 'apparat', 'genetik', 'faksimile'];
                window.location.href = `${modes[parseInt(e.key) - 1]}.html`;
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EditionGenetik('genetic-text');
});

export default EditionGenetik;
