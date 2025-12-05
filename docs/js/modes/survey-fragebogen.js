/**
 * Survey Fragebogen-Modus
 *
 * Interaktive Darstellung des Erhebungsinstruments
 *
 * Benötigte Daten: items[], scales[], demographics[]
 * Wissensbasis: 15-MODI#Survey-Fragebogen, 12-STANDARDS#DDI
 */

class SurveyFragebogen {
    constructor(containerId, dataPath) {
        this.container = document.getElementById(containerId);
        this.dataPath = dataPath || '../data/scope-survey.json';
        this.data = null;
        this.currentSection = 0;
        this.selectedItem = null;
        this.showScaleLabels = true;
        this.showItemIds = false;
        this.interactiveMode = true;
        this.responses = {};

        this.init();
    }

    async init() {
        try {
            const response = await fetch(this.dataPath);
            this.data = await response.json();
            this.render();
            this.bindEvents();
            this.bindKeyboard();
        } catch (error) {
            console.error('Fehler beim Laden der Daten:', error);
            this.renderError();
        }
    }

    render() {
        if (!this.data) return;

        this.renderMeta();
        this.renderSectionNav();
        this.renderItems();
    }

    renderMeta() {
        const meta = this.data.survey_meta || this.data.metadata || {};

        document.getElementById('survey-title').textContent =
            meta.title || this.data.metadata?.title || 'Umfrage';

        document.getElementById('meta-n').textContent =
            meta.n || this.data.respondents?.length || '-';

        document.getElementById('meta-response-rate').textContent =
            meta.response_rate ? `${(meta.response_rate * 100).toFixed(0)}%` : '-';

        document.getElementById('meta-period').textContent =
            meta.collection_period
                ? `${meta.collection_period.start} bis ${meta.collection_period.end}`
                : '-';
    }

    renderSectionNav() {
        const list = document.getElementById('section-list');
        if (!list) return;

        // Gruppiere Items nach Typ oder erstelle Pseudo-Sektionen
        const sections = this.getSections();

        list.innerHTML = sections.map((section, index) => `
            <li>
                <button class="section-btn ${index === this.currentSection ? 'active' : ''}"
                        data-section="${index}">
                    ${section.label}
                    <span class="item-count">${section.items.length}</span>
                </button>
            </li>
        `).join('');
    }

    getSections() {
        const items = this.data.items || [];
        const demographics = this.data.demographics || [];

        const sections = [
            {
                label: 'Hauptbefragung',
                items: items
            }
        ];

        if (demographics.length > 0) {
            sections.push({
                label: 'Demografie',
                items: demographics.map(d => ({
                    id: d.id,
                    text: d.description || d.id,
                    type: d.type,
                    values: d.values
                }))
            });
        }

        return sections;
    }

    renderItems() {
        const container = document.getElementById('fragebogen-items');
        if (!container) return;

        const sections = this.getSections();
        const currentItems = sections[this.currentSection]?.items || [];

        container.innerHTML = currentItems.map((item, index) =>
            this.renderItem(item, index)
        ).join('');

        // Pagination aktualisieren
        this.updatePagination(sections);
    }

    renderItem(item, index) {
        const itemId = this.showItemIds ? `<code class="item-id">${item.id}</code>` : '';
        const isSelected = this.selectedItem === item.id;

        let inputHtml = '';

        switch (item.type) {
            case 'likert':
                inputHtml = this.renderLikertScale(item);
                break;
            case 'numeric':
                inputHtml = this.renderNumericInput(item);
                break;
            case 'binary':
                inputHtml = this.renderBinaryChoice(item);
                break;
            case 'categorical':
                inputHtml = this.renderCategoricalChoice(item);
                break;
            default:
                inputHtml = this.renderLikertScale(item);
        }

        return `
            <div class="fragebogen-item ${isSelected ? 'selected' : ''}"
                 data-item="${item.id}">
                <div class="item-header">
                    <span class="item-number">${index + 1}.</span>
                    ${itemId}
                </div>
                <p class="item-text">${item.text}</p>
                <div class="item-input ${this.interactiveMode ? 'interactive' : 'readonly'}">
                    ${inputHtml}
                </div>
            </div>
        `;
    }

    renderLikertScale(item) {
        const scale = item.scale || { min: 1, max: 5, labels: [] };
        const points = [];

        for (let i = scale.min; i <= scale.max; i++) {
            const label = this.showScaleLabels && scale.labels?.[i - scale.min]
                ? `<span class="scale-label">${scale.labels[i - scale.min]}</span>`
                : '';
            const checked = this.responses[item.id] === i ? 'checked' : '';

            points.push(`
                <label class="likert-point">
                    <input type="radio" name="${item.id}" value="${i}" ${checked}>
                    <span class="point-value">${i}</span>
                    ${label}
                </label>
            `);
        }

        return `<div class="likert-scale">${points.join('')}</div>`;
    }

    renderNumericInput(item) {
        const scale = item.scale || { min: 0, max: 100 };
        const value = this.responses[item.id] || '';

        return `
            <div class="numeric-input">
                <input type="number"
                       name="${item.id}"
                       min="${scale.min}"
                       max="${scale.max}"
                       value="${value}"
                       placeholder="${scale.min}-${scale.max}">
            </div>
        `;
    }

    renderBinaryChoice(item) {
        const values = item.values || ['ja', 'nein'];
        const selected = this.responses[item.id];

        return `
            <div class="binary-choice">
                ${values.map(v => `
                    <label class="choice-option">
                        <input type="radio" name="${item.id}" value="${v}"
                               ${selected === v ? 'checked' : ''}>
                        <span>${v}</span>
                    </label>
                `).join('')}
            </div>
        `;
    }

    renderCategoricalChoice(item) {
        const values = item.values || [];
        const selected = this.responses[item.id];

        return `
            <div class="categorical-choice">
                <select name="${item.id}">
                    <option value="">Bitte wählen...</option>
                    ${values.map(v => `
                        <option value="${v}" ${selected === v ? 'selected' : ''}>${v}</option>
                    `).join('')}
                </select>
            </div>
        `;
    }

    updatePagination(sections) {
        const prev = document.getElementById('prev-section');
        const next = document.getElementById('next-section');
        const indicator = document.getElementById('section-indicator');

        if (prev) prev.disabled = this.currentSection === 0;
        if (next) next.disabled = this.currentSection === sections.length - 1;
        if (indicator) indicator.textContent = `Abschnitt ${this.currentSection + 1} von ${sections.length}`;
    }

    selectItem(itemId) {
        this.selectedItem = itemId;

        // UI aktualisieren
        document.querySelectorAll('.fragebogen-item').forEach(el => {
            el.classList.toggle('selected', el.dataset.item === itemId);
        });

        // Detail-Panel aktualisieren
        this.showItemDetail(itemId);
    }

    showItemDetail(itemId) {
        const allItems = [...(this.data.items || []), ...(this.data.demographics || [])];
        const item = allItems.find(i => i.id === itemId);

        if (!item) return;

        const prompt = document.getElementById('detail-prompt');
        const info = document.getElementById('detail-info');

        prompt?.classList.add('hidden');
        info?.classList.remove('hidden');

        document.getElementById('detail-id').textContent = item.id;
        document.getElementById('detail-type').textContent = this.getTypeLabel(item.type);

        const scaleInfo = item.scale
            ? `${item.scale.min}-${item.scale.max}`
            : item.values?.join(', ') || '-';
        document.getElementById('detail-scale').textContent = scaleInfo;

        // Prüfe, zu welcher Skala das Item gehört
        const parentScale = this.data.scales?.find(s => s.items?.includes(item.id));
        document.getElementById('detail-parent-scale').textContent =
            parentScale?.label || 'Einzelitem';

        // Mini-Histogramm
        this.renderMiniHistogram(itemId);
    }

    getTypeLabel(type) {
        const labels = {
            'likert': 'Likert-Skala',
            'numeric': 'Numerisch',
            'binary': 'Binär',
            'categorical': 'Kategorial',
            'ordinal': 'Ordinal'
        };
        return labels[type] || type || 'Unbekannt';
    }

    renderMiniHistogram(itemId) {
        const container = document.getElementById('mini-histogram');
        if (!container || !this.data.respondents) return;

        const values = this.data.respondents
            .map(r => r[itemId])
            .filter(v => v !== undefined && v !== null);

        if (values.length === 0) {
            container.innerHTML = '<p class="no-data">Keine Daten</p>';
            return;
        }

        // Frequenzen berechnen
        const freq = {};
        values.forEach(v => {
            freq[v] = (freq[v] || 0) + 1;
        });

        const maxFreq = Math.max(...Object.values(freq));
        const item = this.data.items?.find(i => i.id === itemId);
        const scale = item?.scale || { min: 1, max: 5 };

        let bars = '';
        for (let i = scale.min; i <= scale.max; i++) {
            const count = freq[i] || 0;
            const height = maxFreq > 0 ? (count / maxFreq) * 100 : 0;
            bars += `
                <div class="mini-bar" style="height: ${height}%">
                    <span class="bar-label">${i}</span>
                </div>
            `;
        }

        container.innerHTML = `<div class="mini-bars">${bars}</div>`;
    }

    bindEvents() {
        // Sections wechseln
        document.getElementById('section-list')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.section-btn');
            if (btn) {
                this.currentSection = parseInt(btn.dataset.section);
                this.renderSectionNav();
                this.renderItems();
            }
        });

        // Pagination
        document.getElementById('prev-section')?.addEventListener('click', () => {
            if (this.currentSection > 0) {
                this.currentSection--;
                this.renderSectionNav();
                this.renderItems();
            }
        });

        document.getElementById('next-section')?.addEventListener('click', () => {
            const sections = this.getSections();
            if (this.currentSection < sections.length - 1) {
                this.currentSection++;
                this.renderSectionNav();
                this.renderItems();
            }
        });

        // Optionen
        document.getElementById('show-scale-labels')?.addEventListener('change', (e) => {
            this.showScaleLabels = e.target.checked;
            this.renderItems();
        });

        document.getElementById('show-item-ids')?.addEventListener('change', (e) => {
            this.showItemIds = e.target.checked;
            this.renderItems();
        });

        document.getElementById('interactive-mode')?.addEventListener('change', (e) => {
            this.interactiveMode = e.target.checked;
            this.renderItems();
        });

        // Item-Klick
        document.getElementById('fragebogen-items')?.addEventListener('click', (e) => {
            const item = e.target.closest('.fragebogen-item');
            if (item) {
                this.selectItem(item.dataset.item);
            }
        });

        // Antwort-Eingaben (interaktiver Modus)
        document.getElementById('fragebogen-items')?.addEventListener('change', (e) => {
            if (!this.interactiveMode) return;

            const input = e.target;
            const itemId = input.name;
            const value = input.type === 'radio' || input.type === 'checkbox'
                ? (input.type === 'radio' ? parseInt(input.value) || input.value : input.checked)
                : input.value;

            this.responses[itemId] = value;
        });
    }

    bindKeyboard() {
        document.addEventListener('keydown', (e) => {
            // Modi-Wechsel
            if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '4') {
                e.preventDefault();
                const modes = ['fragebogen', 'verteilung', 'skalen', 'codebook'];
                window.location.href = `${modes[parseInt(e.key) - 1]}.html`;
            }

            // Item-Navigation
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateItems(e.key === 'ArrowDown' ? 1 : -1);
            }
        });
    }

    navigateItems(direction) {
        const items = document.querySelectorAll('.fragebogen-item');
        const currentIndex = Array.from(items).findIndex(i =>
            i.classList.contains('selected')
        );

        let newIndex = currentIndex + direction;
        if (newIndex < 0) newIndex = items.length - 1;
        if (newIndex >= items.length) newIndex = 0;

        const newItem = items[newIndex];
        if (newItem) {
            this.selectItem(newItem.dataset.item);
            newItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    renderError() {
        const container = document.getElementById('fragebogen-items');
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <p>Daten konnten nicht geladen werden.</p>
                </div>
            `;
        }
    }
}

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    new SurveyFragebogen('fragebogen-items');
});

export default SurveyFragebogen;
