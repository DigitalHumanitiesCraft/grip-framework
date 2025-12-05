/**
 * Concept Definition Mode
 * Karteikarten-Ansicht für SKOS-Konzept-Definitionen
 */

class ConceptDefinition {
    constructor() {
        this.data = null;
        this.concepts = [];
        this.currentIndex = 0;
        this.searchQuery = '';
        this.viewMode = 'cards'; // 'cards' or 'list'
    }

    async init() {
        try {
            const response = await fetch('../data/navigator-concept.json');
            this.data = await response.json();
            this.concepts = this.data.concepts || [];
            this.render();
            this.bindEvents();
            this.bindKeyboard();
            this.updateStats();
        } catch (error) {
            console.error('Fehler beim Laden der Konzept-Daten:', error);
        }
    }

    render() {
        if (this.viewMode === 'cards') {
            this.renderCards();
        } else {
            this.renderList();
        }
    }

    renderCards() {
        const container = document.getElementById('definition-container');
        if (!container) return;

        const filtered = this.getFilteredConcepts();
        if (filtered.length === 0) {
            container.innerHTML = '<p class="no-results">Keine Konzepte gefunden.</p>';
            return;
        }

        container.innerHTML = `
            <div class="card-navigation">
                <button class="nav-btn prev" id="prev-card" ${this.currentIndex === 0 ? 'disabled' : ''}>
                    ← Zurück
                </button>
                <span class="card-counter">${this.currentIndex + 1} / ${filtered.length}</span>
                <button class="nav-btn next" id="next-card" ${this.currentIndex >= filtered.length - 1 ? 'disabled' : ''}>
                    Weiter →
                </button>
            </div>
            <div class="concept-card-large">
                ${this.renderConceptCard(filtered[this.currentIndex])}
            </div>
            <div class="card-thumbnails">
                ${filtered.slice(Math.max(0, this.currentIndex - 2), this.currentIndex + 3).map((c, i) => `
                    <button class="thumbnail ${i + Math.max(0, this.currentIndex - 2) === this.currentIndex ? 'active' : ''}"
                            data-index="${i + Math.max(0, this.currentIndex - 2)}">
                        ${this.truncate(c.prefLabel?.de || c.prefLabel?.en || c.id, 15)}
                    </button>
                `).join('')}
            </div>
        `;
    }

    renderConceptCard(concept) {
        if (!concept) return '';

        const prefLabel = concept.prefLabel?.de || concept.prefLabel?.en || concept.id;
        const altLabels = concept.altLabel?.de || concept.altLabel?.en || [];
        const definition = concept.definition?.de || concept.definition?.en || '';
        const scopeNote = concept.scopeNote?.de || concept.scopeNote?.en || '';
        const example = concept.example?.de || concept.example?.en || '';

        return `
            <header class="card-header">
                <h2 class="concept-term">${prefLabel}</h2>
                ${altLabels.length > 0 ? `
                    <p class="alt-labels">Auch: ${altLabels.join(', ')}</p>
                ` : ''}
            </header>

            <section class="card-body">
                <div class="definition-section">
                    <h3>Definition</h3>
                    <p class="definition-text">${definition || '<em>Keine Definition verfügbar</em>'}</p>
                </div>

                ${scopeNote ? `
                    <div class="scope-note-section">
                        <h3>Anmerkung</h3>
                        <p>${scopeNote}</p>
                    </div>
                ` : ''}

                ${example ? `
                    <div class="example-section">
                        <h3>Beispiel</h3>
                        <p class="example-text">${example}</p>
                    </div>
                ` : ''}
            </section>

            <footer class="card-footer">
                <div class="relations">
                    ${concept.broader?.length ? `
                        <div class="relation-group">
                            <span class="relation-label">Oberbegriff:</span>
                            ${concept.broader.map(id => `
                                <a href="#" class="relation-link" data-id="${id}">
                                    ${this.getConceptLabel(id)}
                                </a>
                            `).join(', ')}
                        </div>
                    ` : ''}
                    ${concept.narrower?.length ? `
                        <div class="relation-group">
                            <span class="relation-label">Unterbegriffe:</span>
                            ${concept.narrower.map(id => `
                                <a href="#" class="relation-link" data-id="${id}">
                                    ${this.getConceptLabel(id)}
                                </a>
                            `).join(', ')}
                        </div>
                    ` : ''}
                    ${concept.related?.length ? `
                        <div class="relation-group">
                            <span class="relation-label">Verwandt:</span>
                            ${concept.related.map(id => `
                                <a href="#" class="relation-link" data-id="${id}">
                                    ${this.getConceptLabel(id)}
                                </a>
                            `).join(', ')}
                        </div>
                    ` : ''}
                </div>
                <div class="uri">
                    <a href="${concept.id}" target="_blank" class="uri-link">${concept.id}</a>
                </div>
            </footer>
        `;
    }

    renderList() {
        const container = document.getElementById('definition-container');
        if (!container) return;

        const filtered = this.getFilteredConcepts();

        container.innerHTML = `
            <div class="definition-list">
                ${filtered.map((concept, index) => `
                    <article class="definition-item ${index === this.currentIndex ? 'selected' : ''}"
                             data-index="${index}">
                        <h3 class="item-term">${concept.prefLabel?.de || concept.prefLabel?.en || concept.id}</h3>
                        <p class="item-definition">${this.truncate(concept.definition?.de || concept.definition?.en || '', 150)}</p>
                    </article>
                `).join('')}
            </div>
        `;
    }

    getFilteredConcepts() {
        if (!this.searchQuery) return this.concepts;

        const query = this.searchQuery.toLowerCase();
        return this.concepts.filter(c => {
            const label = (c.prefLabel?.de || c.prefLabel?.en || '').toLowerCase();
            const def = (c.definition?.de || c.definition?.en || '').toLowerCase();
            const altLabels = (c.altLabel?.de || c.altLabel?.en || []).join(' ').toLowerCase();
            return label.includes(query) || def.includes(query) || altLabels.includes(query);
        });
    }

    getConceptLabel(id) {
        const concept = this.concepts.find(c => c.id === id);
        return concept?.prefLabel?.de || concept?.prefLabel?.en || id;
    }

    truncate(text, maxLength) {
        if (!text || text.length <= maxLength) return text || '';
        return text.substring(0, maxLength - 1) + '…';
    }

    bindEvents() {
        // Navigation buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('#prev-card')) {
                this.navigate(-1);
            }
            if (e.target.closest('#next-card')) {
                this.navigate(1);
            }

            // Thumbnail click
            const thumbnail = e.target.closest('.thumbnail');
            if (thumbnail) {
                this.currentIndex = parseInt(thumbnail.dataset.index);
                this.render();
            }

            // List item click
            const listItem = e.target.closest('.definition-item');
            if (listItem) {
                this.currentIndex = parseInt(listItem.dataset.index);
                this.viewMode = 'cards';
                this.render();
                this.updateViewToggle();
            }

            // Relation link click
            const relationLink = e.target.closest('.relation-link');
            if (relationLink) {
                e.preventDefault();
                const conceptId = relationLink.dataset.id;
                const index = this.concepts.findIndex(c => c.id === conceptId);
                if (index !== -1) {
                    this.currentIndex = index;
                    this.render();
                }
            }
        });

        // Search
        document.getElementById('concept-search')?.addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.currentIndex = 0;
            this.render();
            this.updateStats();
        });

        // View mode toggle
        document.querySelectorAll('.view-toggle button').forEach(btn => {
            btn.addEventListener('click', () => {
                this.viewMode = btn.dataset.view;
                this.render();
                this.updateViewToggle();
            });
        });
    }

    navigate(direction) {
        const filtered = this.getFilteredConcepts();
        this.currentIndex = Math.max(0, Math.min(filtered.length - 1, this.currentIndex + direction));
        this.render();
    }

    updateViewToggle() {
        document.querySelectorAll('.view-toggle button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === this.viewMode);
        });
    }

    updateStats() {
        const filtered = this.getFilteredConcepts();
        document.getElementById('stat-total').textContent = this.concepts.length;
        document.getElementById('stat-filtered').textContent = filtered.length;

        // Count concepts with definitions
        const withDef = this.concepts.filter(c => c.definition?.de || c.definition?.en).length;
        document.getElementById('stat-defined').textContent = withDef;
    }

    bindKeyboard() {
        document.addEventListener('keydown', (e) => {
            // Mode switching: Cmd/Ctrl + 1-4
            if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '4') {
                e.preventDefault();
                const modes = ['hierarchie', 'graph', 'definition', 'mapping'];
                window.location.href = `${modes[parseInt(e.key) - 1]}.html`;
            }

            // Navigation: Arrow keys
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.navigate(-1);
            }
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.navigate(1);
            }

            // Toggle view: V
            if (e.key === 'v' && !e.metaKey && !e.ctrlKey) {
                this.viewMode = this.viewMode === 'cards' ? 'list' : 'cards';
                this.render();
                this.updateViewToggle();
            }

            // Focus search: /
            if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
                e.preventDefault();
                document.getElementById('concept-search')?.focus();
            }
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const app = new ConceptDefinition();
    app.init();
});

export default ConceptDefinition;
