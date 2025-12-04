/**
 * Edition Apparat-Modus
 *
 * Klassischer Lesetext mit kritischem Apparat darunter
 *
 * Benötigte Daten: text_flow[], apparatus[], witnesses[]
 * Wissensbasis: 15-MODI#Edition-Apparat, 14-EPICS#Edition, 12-STANDARDS#TEI-P5
 */

class EditionApparat {
    constructor(containerId, dataPath) {
        this.container = document.getElementById(containerId);
        this.dataPath = dataPath || '../../examples/data/reader-edition.json';
        this.data = null;
        this.baseWitness = null;
        this.activeApp = null;
        this.showLineNumbers = true;
        this.showHoverPreview = true;

        this.init();
    }

    async init() {
        try {
            const response = await fetch(this.dataPath);
            this.data = await response.json();
            this.baseWitness = this.data.witnesses?.[0]?.siglum;
            this.render();
            this.bindEvents();
            this.bindKeyboard();
        } catch (error) {
            console.error('Fehler beim Laden der Daten:', error);
        }
    }

    render() {
        if (!this.data) return;

        this.renderHeader();
        this.renderWitnessSelect();
        this.renderSectionNav();
        this.renderSiglenList();
        this.renderReadingText();
        this.renderApparatus();
        this.updateStats();
    }

    renderHeader() {
        const title = document.getElementById('text-title');
        if (title) title.textContent = this.data.meta?.title || 'Edition';
    }

    renderWitnessSelect() {
        const select = document.getElementById('base-witness');
        if (!select || !this.data.witnesses) return;

        select.innerHTML = this.data.witnesses.map(w => `
            <option value="${w.siglum}" ${w.siglum === this.baseWitness ? 'selected' : ''}>
                ${w.siglum} - ${w.name || w.repository}
            </option>
        `).join('');
    }

    renderSectionNav() {
        const nav = document.getElementById('section-nav');
        if (!nav) return;

        // Gruppiere Text nach Abschnitten
        const sections = this.data.sections || [{ id: 1, title: 'Text' }];
        nav.innerHTML = sections.map(s => `
            <a href="#section-${s.id}" class="section-link">${s.title}</a>
        `).join('');
    }

    renderSiglenList() {
        const list = document.getElementById('siglen-list');
        if (!list || !this.data.witnesses) return;

        list.innerHTML = this.data.witnesses.map(w => `
            <dt>${w.siglum}</dt>
            <dd>${w.repository || w.name || ''}</dd>
        `).join('');
    }

    renderReadingText() {
        const container = document.getElementById('reading-text');
        if (!container || !this.data.text_flow) return;

        const lines = this.data.text_flow.map((line, index) => {
            let content = line.content || line.text || '';

            // Markiere Lemma-Stellen
            this.data.apparatus?.forEach(app => {
                if (app.anchor_id === line.id) {
                    content = content.replace(
                        app.lemma,
                        `<span class="lemma" data-app="${app.anchor_id}">${app.lemma}</span>`
                    );
                }
            });

            return `<div class="line" data-line="${index + 1}">${content}</div>`;
        }).join('');

        container.innerHTML = lines;
        container.classList.toggle('with-line-numbers', this.showLineNumbers);
    }

    renderApparatus() {
        const container = document.getElementById('apparatus-entries');
        if (!container || !this.data.apparatus) return;

        container.innerHTML = this.data.apparatus.map(app => {
            const readings = app.readings?.map(r =>
                `${r.text} ${r.witness?.replace('#', '')}`
            ).join('; ') || '';

            return `
                <div class="app-entry" data-app="${app.anchor_id}">
                    <span class="line-ref">${app.anchor_id}</span>
                    <span class="lemma">${app.lemma}</span>
                    <span class="readings">${readings}</span>
                </div>
            `;
        }).join('');
    }

    updateStats() {
        const total = this.data.apparatus?.length || 0;
        const substantive = this.data.apparatus?.filter(a =>
            a.readings?.some(r => r.type === 'substantive')
        ).length || 0;

        document.getElementById('stat-total')?.textContent = total;
        document.getElementById('stat-substantive')?.textContent = substantive;
        document.getElementById('stat-orthographic')?.textContent = total - substantive;
    }

    bindEvents() {
        // Leithandschrift wechseln
        document.getElementById('base-witness')?.addEventListener('change', (e) => {
            this.baseWitness = e.target.value;
            this.renderReadingText();
        });

        // Optionen
        document.getElementById('show-line-numbers')?.addEventListener('change', (e) => {
            this.showLineNumbers = e.target.checked;
            document.getElementById('reading-text')?.classList.toggle('with-line-numbers', this.showLineNumbers);
        });

        document.getElementById('show-hover-preview')?.addEventListener('change', (e) => {
            this.showHoverPreview = e.target.checked;
        });

        // Lemma-Klick im Text
        document.getElementById('reading-text')?.addEventListener('click', (e) => {
            const lemma = e.target.closest('.lemma');
            if (lemma) {
                this.selectApp(lemma.dataset.app);
            }
        });

        // Lemma-Hover im Text
        document.getElementById('reading-text')?.addEventListener('mouseover', (e) => {
            if (!this.showHoverPreview) return;
            const lemma = e.target.closest('.lemma');
            if (lemma) {
                this.showHoverPreviewFor(lemma);
            }
        });

        // Apparat-Eintrag klick
        document.getElementById('apparatus-entries')?.addEventListener('click', (e) => {
            const entry = e.target.closest('.app-entry');
            if (entry) {
                this.selectApp(entry.dataset.app);
                this.scrollToLemma(entry.dataset.app);
            }
        });
    }

    selectApp(appId) {
        // Vorherige Auswahl entfernen
        document.querySelectorAll('.lemma.active, .app-entry.active').forEach(el => {
            el.classList.remove('active');
        });

        // Neue Auswahl markieren
        document.querySelector(`.lemma[data-app="${appId}"]`)?.classList.add('active');
        document.querySelector(`.app-entry[data-app="${appId}"]`)?.classList.add('active');

        // Detail anzeigen
        this.showVariantDetail(appId);
    }

    scrollToLemma(appId) {
        const lemma = document.querySelector(`.lemma[data-app="${appId}"]`);
        lemma?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    showHoverPreviewFor(lemmaElement) {
        // TODO: Tooltip mit Varianten anzeigen
    }

    showVariantDetail(appId) {
        const app = this.data.apparatus?.find(a => a.anchor_id == appId);
        if (!app) return;

        const info = document.getElementById('variant-info');
        const prompt = document.getElementById('variant-prompt');

        prompt?.classList.add('hidden');
        info?.classList.remove('hidden');

        document.getElementById('variant-lemma').textContent = app.lemma;

        const tbody = document.getElementById('readings-body');
        if (tbody) {
            tbody.innerHTML = app.readings?.map(r => `
                <tr>
                    <td>${r.witness?.replace('#', '')}</td>
                    <td>${r.text}</td>
                    <td>${r.type || ''}</td>
                </tr>
            `).join('') || '';
        }

        // Editorial Note wenn vorhanden
        const noteEl = document.getElementById('editorial-note');
        const noteText = document.getElementById('note-text');
        if (app.note && noteEl && noteText) {
            noteEl.classList.remove('hidden');
            noteText.textContent = app.note;
        } else {
            noteEl?.classList.add('hidden');
        }
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
    new EditionApparat('reading-text');
});

export default EditionApparat;
