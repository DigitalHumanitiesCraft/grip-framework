/**
 * Edition Synopse-Modus
 *
 * Parallele Darstellung von Textzeugen mit Lock-Scroll
 *
 * Benötigte Daten: witnesses[], text_flow[]
 * Wissensbasis: 15-MODI#Edition-Synopse, 14-EPICS#Edition, 12-STANDARDS#TEI-P5
 */

class EditionSynopse {
    constructor(containerId, dataPath) {
        this.container = document.getElementById(containerId);
        this.dataPath = dataPath || '../../examples/data/reader-edition.json';
        this.data = null;
        this.activeWitnesses = new Set();
        this.lockScroll = true;
        this.highlightDiff = true;

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

        this.renderHeader();
        this.renderWitnessCheckboxes();
        this.renderColumns();
        this.updateStats();
    }

    renderHeader() {
        const title = document.getElementById('text-title');
        const section = document.getElementById('text-section');

        if (title) title.textContent = this.data.meta?.title || 'Edition';
        if (section) section.textContent = this.data.meta?.section || '';
    }

    renderWitnessCheckboxes() {
        const container = document.getElementById('witness-checkboxes');
        if (!container || !this.data.witnesses) return;

        container.innerHTML = this.data.witnesses.map(w => `
            <label class="checkbox-label">
                <input type="checkbox"
                       data-witness="${w.siglum}"
                       ${this.activeWitnesses.has(w.siglum) ? 'checked' : ''}>
                <span class="siglum">${w.siglum}</span>
                <span class="witness-name">${w.name || ''}</span>
            </label>
        `).join('');

        // Erste zwei Zeugen standardmäßig aktivieren
        if (this.activeWitnesses.size === 0 && this.data.witnesses.length >= 2) {
            this.activeWitnesses.add(this.data.witnesses[0].siglum);
            this.activeWitnesses.add(this.data.witnesses[1].siglum);
            this.renderWitnessCheckboxes();
        }
    }

    renderColumns() {
        const container = document.getElementById('synopse-columns');
        if (!container) return;

        const activeWitnesses = this.data.witnesses?.filter(w =>
            this.activeWitnesses.has(w.siglum)
        ) || [];

        if (activeWitnesses.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Wählen Sie mindestens einen Textzeugen aus.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = activeWitnesses.map(witness => `
            <div class="witness-column" data-witness="${witness.siglum}">
                <div class="column-header">
                    <span class="siglum">${witness.siglum}</span>
                    <span class="witness-name">${witness.name || witness.repository || ''}</span>
                </div>
                ${this.renderWitnessText(witness)}
            </div>
        `).join('');

        if (this.highlightDiff) {
            this.calculateDiffs();
        }
    }

    renderWitnessText(witness) {
        const textFlow = this.data.text_flow || [];

        return textFlow.map((line, index) => {
            // Hole Text für diesen Zeugen (oder Basis-Text)
            const text = this.getWitnessText(witness.siglum, line);
            return `
                <div class="column-text" data-line="${index + 1}">
                    ${text}
                </div>
            `;
        }).join('');
    }

    getWitnessText(siglum, line) {
        // Prüfe auf Varianten für diesen Zeugen
        const apparatus = this.data.apparatus || [];
        let text = line.content || line.text || '';

        apparatus.forEach(app => {
            if (app.anchor_id === line.id) {
                const reading = app.readings?.find(r => r.witness === `#${siglum}`);
                if (reading) {
                    text = text.replace(app.lemma,
                        `<span class="diff-marker" data-app="${app.anchor_id}">${reading.text}</span>`
                    );
                }
            }
        });

        return text;
    }

    calculateDiffs() {
        // Vergleiche aktive Spalten und markiere Unterschiede
        const columns = document.querySelectorAll('.witness-column');
        if (columns.length < 2) return;

        const lineCount = columns[0].querySelectorAll('.column-text').length;
        let diffCount = 0;

        for (let i = 0; i < lineCount; i++) {
            const texts = Array.from(columns).map(col =>
                col.querySelectorAll('.column-text')[i]?.textContent.trim()
            );

            const hasVariant = !texts.every(t => t === texts[0]);
            if (hasVariant) {
                diffCount++;
                columns.forEach(col => {
                    const line = col.querySelectorAll('.column-text')[i];
                    if (line) line.classList.add('has-diff');
                });
            }
        }

        const statDiff = document.getElementById('stat-diff');
        if (statDiff) statDiff.textContent = diffCount;
    }

    updateStats() {
        const statActive = document.getElementById('stat-active');
        if (statActive) statActive.textContent = this.activeWitnesses.size;
    }

    bindEvents() {
        // Checkbox-Änderungen
        document.getElementById('witness-checkboxes')?.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                const siglum = e.target.dataset.witness;
                if (e.target.checked) {
                    this.activeWitnesses.add(siglum);
                } else {
                    this.activeWitnesses.delete(siglum);
                }
                this.renderColumns();
                this.updateStats();
            }
        });

        // Alle auswählen
        document.getElementById('select-all')?.addEventListener('click', () => {
            this.data.witnesses?.forEach(w => this.activeWitnesses.add(w.siglum));
            this.renderWitnessCheckboxes();
            this.renderColumns();
            this.updateStats();
        });

        // Lock-Scroll Toggle
        document.getElementById('lock-scroll')?.addEventListener('change', (e) => {
            this.lockScroll = e.target.checked;
        });

        // Highlight-Diff Toggle
        document.getElementById('highlight-diff')?.addEventListener('change', (e) => {
            this.highlightDiff = e.target.checked;
            this.renderColumns();
        });

        // Lock-Scroll Implementation
        document.getElementById('synopse-columns')?.addEventListener('scroll', (e) => {
            if (!this.lockScroll) return;

            const columns = document.querySelectorAll('.witness-column');
            columns.forEach(col => {
                if (col !== e.target) {
                    col.scrollTop = e.target.scrollTop;
                }
            });
        });

        // Diff-Klick
        document.getElementById('synopse-columns')?.addEventListener('click', (e) => {
            const marker = e.target.closest('.diff-marker');
            if (marker) {
                this.showDiffDetail(marker.dataset.app);
            }

            const line = e.target.closest('.column-text');
            if (line) {
                this.highlightLine(line.dataset.line);
            }
        });
    }

    highlightLine(lineNumber) {
        // Alle Zeilen mit dieser Nummer hervorheben
        document.querySelectorAll('.column-text').forEach(el => {
            el.classList.remove('highlighted');
            if (el.dataset.line === lineNumber) {
                el.classList.add('highlighted');
            }
        });
    }

    showDiffDetail(appId) {
        const diffInfo = document.getElementById('diff-info');
        const diffPrompt = document.getElementById('diff-prompt');
        const app = this.data.apparatus?.find(a => a.anchor_id == appId);

        if (!app || !diffInfo) return;

        diffPrompt?.classList.add('hidden');
        diffInfo.classList.remove('hidden');

        document.getElementById('diff-line').textContent = appId;

        const variantsContainer = document.getElementById('diff-variants');
        if (variantsContainer) {
            variantsContainer.innerHTML = `
                <div class="diff-variant lemma-variant">
                    <span class="siglum">Lemma</span>
                    <span class="text">${app.lemma}</span>
                </div>
                ${app.readings?.map(r => `
                    <div class="diff-variant">
                        <span class="siglum">${r.witness?.replace('#', '')}</span>
                        <span class="text">${r.text}</span>
                    </div>
                `).join('') || ''}
            `;
        }
    }

    bindKeyboard() {
        document.addEventListener('keydown', (e) => {
            // Cmd/Ctrl + 1-4 für Modi-Wechsel
            if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '4') {
                e.preventDefault();
                const modes = ['synopse', 'apparat', 'genetik', 'faksimile'];
                const index = parseInt(e.key) - 1;
                if (modes[index]) {
                    window.location.href = `${modes[index]}.html`;
                }
            }

            // Pfeiltasten für Navigation
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                // Zeilen-Navigation
            }
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                // Abweichungs-Navigation
            }
        });
    }

    renderError() {
        const container = document.getElementById('synopse-columns');
        if (container) {
            container.innerHTML = `
                <div class="error-state">
                    <p>Daten konnten nicht geladen werden.</p>
                    <p>Pfad: ${this.dataPath}</p>
                </div>
            `;
        }
    }
}

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    new EditionSynopse('synopse-columns');
});

export default EditionSynopse;
