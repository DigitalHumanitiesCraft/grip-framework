/**
 * Concept Mapping Mode
 * Zwei-Spalten-Ansicht für Vokabular-Alignments
 */

class ConceptMapping {
    constructor() {
        this.data = null;
        this.mappings = [];
        this.selectedMapping = null;
        this.activeTypes = {
            exactMatch: true,
            closeMatch: true,
            broadMatch: true,
            narrowMatch: true,
            relatedMatch: true
        };
    }

    async init() {
        try {
            const response = await fetch('../data/navigator-concept.json');
            this.data = await response.json();
            this.extractMappings();
            this.render();
            this.bindEvents();
            this.bindKeyboard();
            this.updateStats();
        } catch (error) {
            console.error('Fehler beim Laden der Konzept-Daten:', error);
        }
    }

    extractMappings() {
        if (!this.data?.concepts) return;

        this.mappings = [];
        const matchTypes = ['exactMatch', 'closeMatch', 'broadMatch', 'narrowMatch', 'relatedMatch'];

        this.data.concepts.forEach(concept => {
            matchTypes.forEach(matchType => {
                const matches = concept[matchType] || [];
                matches.forEach(targetUri => {
                    this.mappings.push({
                        source: {
                            uri: concept.id,
                            label: concept.prefLabel?.de || concept.prefLabel?.en || concept.id
                        },
                        target: {
                            uri: targetUri,
                            label: this.extractLabelFromUri(targetUri)
                        },
                        type: matchType,
                        confidence: this.getConfidenceForType(matchType)
                    });
                });
            });
        });

        // Group by vocabulary for display
        this.sourceVocab = this.data.metadata?.title || 'Quell-Vokabular';
        this.targetVocabs = this.extractTargetVocabularies();
    }

    extractLabelFromUri(uri) {
        // Extract readable label from URI
        const parts = uri.split(/[#\/]/);
        const lastPart = parts[parts.length - 1];
        // Convert camelCase/underscore to spaces
        return lastPart
            .replace(/_/g, ' ')
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/\b\w/g, l => l.toUpperCase());
    }

    extractTargetVocabularies() {
        const vocabs = new Set();
        this.mappings.forEach(m => {
            try {
                const url = new URL(m.target.uri);
                vocabs.add(url.hostname);
            } catch {
                vocabs.add('Extern');
            }
        });
        return Array.from(vocabs);
    }

    getConfidenceForType(type) {
        const confidences = {
            exactMatch: 1.0,
            closeMatch: 0.8,
            broadMatch: 0.6,
            narrowMatch: 0.6,
            relatedMatch: 0.4
        };
        return confidences[type] || 0.5;
    }

    render() {
        this.renderHeader();
        this.renderMappings();
    }

    renderHeader() {
        document.getElementById('source-vocab-name').textContent = this.sourceVocab;
        document.getElementById('target-vocab-name').textContent =
            this.targetVocabs.length > 1
                ? `${this.targetVocabs.length} Vokabulare`
                : this.targetVocabs[0] || 'Ziel-Vokabular';
    }

    renderMappings() {
        const container = document.getElementById('mapping-container');
        if (!container) return;

        const filteredMappings = this.mappings.filter(m => this.activeTypes[m.type]);

        if (filteredMappings.length === 0) {
            container.innerHTML = '<p class="no-mappings">Keine Mappings für die ausgewählten Typen.</p>';
            return;
        }

        // Group by source concept
        const grouped = {};
        filteredMappings.forEach(m => {
            if (!grouped[m.source.uri]) {
                grouped[m.source.uri] = {
                    source: m.source,
                    mappings: []
                };
            }
            grouped[m.source.uri].mappings.push(m);
        });

        container.innerHTML = `
            <div class="mapping-rows">
                ${Object.values(grouped).map(group => `
                    <div class="mapping-row">
                        <div class="source-concept">
                            <span class="concept-label">${group.source.label}</span>
                        </div>
                        <div class="mapping-lines">
                            ${group.mappings.map(m => `
                                <div class="mapping-line ${m.type} ${this.selectedMapping === m ? 'selected' : ''}"
                                     data-source="${m.source.uri}" data-target="${m.target.uri}">
                                    <span class="match-type-badge ${m.type}">${this.getTypeLabel(m.type)}</span>
                                </div>
                            `).join('')}
                        </div>
                        <div class="target-concepts">
                            ${group.mappings.map(m => `
                                <div class="target-concept ${m.type}"
                                     data-source="${m.source.uri}" data-target="${m.target.uri}">
                                    <span class="concept-label">${m.target.label}</span>
                                    <span class="vocab-badge">${this.getVocabBadge(m.target.uri)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Draw SVG lines
        this.drawConnectionLines();
    }

    getTypeLabel(type) {
        const labels = {
            exactMatch: '≡',
            closeMatch: '≈',
            broadMatch: '⊃',
            narrowMatch: '⊂',
            relatedMatch: '~'
        };
        return labels[type] || '?';
    }

    getVocabBadge(uri) {
        try {
            const url = new URL(uri);
            return url.hostname.split('.')[0];
        } catch {
            return 'ext';
        }
    }

    drawConnectionLines() {
        // Remove existing SVG
        const container = document.getElementById('mapping-container');
        const existingSvg = container.querySelector('.connection-svg');
        if (existingSvg) existingSvg.remove();

        // Create SVG overlay
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.classList.add('connection-svg');
        svg.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;';

        const rows = container.querySelectorAll('.mapping-row');
        rows.forEach(row => {
            const sourceEl = row.querySelector('.source-concept');
            const targets = row.querySelectorAll('.target-concept');

            if (!sourceEl) return;

            const sourceRect = sourceEl.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();

            targets.forEach((targetEl, i) => {
                const targetRect = targetEl.getBoundingClientRect();
                const mappingLine = row.querySelectorAll('.mapping-line')[i];
                const type = mappingLine?.classList.contains('exactMatch') ? 'exact' :
                            mappingLine?.classList.contains('closeMatch') ? 'close' :
                            mappingLine?.classList.contains('broadMatch') ? 'broad' :
                            mappingLine?.classList.contains('narrowMatch') ? 'narrow' : 'related';

                const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const x1 = sourceRect.right - containerRect.left;
                const y1 = sourceRect.top + sourceRect.height / 2 - containerRect.top;
                const x2 = targetRect.left - containerRect.left;
                const y2 = targetRect.top + targetRect.height / 2 - containerRect.top;

                // Bezier curve
                const midX = (x1 + x2) / 2;
                line.setAttribute('d', `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`);
                line.classList.add('connection-line', type);

                svg.appendChild(line);
            });
        });

        container.style.position = 'relative';
        container.appendChild(svg);
    }

    bindEvents() {
        // Filter checkboxes
        document.querySelectorAll('.mapping-filter input').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.activeTypes[e.target.dataset.type] = e.target.checked;
                this.render();
                this.updateStats();
            });
        });

        // Mapping selection
        document.getElementById('mapping-container')?.addEventListener('click', (e) => {
            const mappingLine = e.target.closest('.mapping-line');
            const targetConcept = e.target.closest('.target-concept');

            const element = mappingLine || targetConcept;
            if (element) {
                const sourceUri = element.dataset.source;
                const targetUri = element.dataset.target;
                this.selectMapping(sourceUri, targetUri);
            }
        });

        // Resize handler for redrawing lines
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => this.drawConnectionLines(), 100);
        });
    }

    selectMapping(sourceUri, targetUri) {
        const mapping = this.mappings.find(m =>
            m.source.uri === sourceUri && m.target.uri === targetUri
        );

        if (!mapping) return;

        this.selectedMapping = mapping;

        // Update UI
        document.querySelectorAll('.mapping-line, .target-concept').forEach(el => {
            el.classList.toggle('selected',
                el.dataset.source === sourceUri && el.dataset.target === targetUri
            );
        });

        this.showMappingDetail(mapping);
    }

    showMappingDetail(mapping) {
        const detailSection = document.getElementById('mapping-detail');
        if (!detailSection) return;

        detailSection.classList.remove('hidden');

        document.getElementById('detail-source').textContent = mapping.source.label;
        document.getElementById('detail-target').textContent = mapping.target.label;
        document.getElementById('detail-type').textContent = this.getTypeFullLabel(mapping.type);
        document.getElementById('detail-confidence').textContent =
            `${Math.round(mapping.confidence * 100)}%`;
    }

    getTypeFullLabel(type) {
        const labels = {
            exactMatch: 'Exact Match (≡)',
            closeMatch: 'Close Match (≈)',
            broadMatch: 'Broad Match (⊃)',
            narrowMatch: 'Narrow Match (⊂)',
            relatedMatch: 'Related Match (~)'
        };
        return labels[type] || type;
    }

    updateStats() {
        const filtered = this.mappings.filter(m => this.activeTypes[m.type]);

        document.getElementById('stat-mappings').textContent = filtered.length;
        document.getElementById('stat-exact').textContent =
            filtered.filter(m => m.type === 'exactMatch').length;
        document.getElementById('stat-close').textContent =
            filtered.filter(m => m.type === 'closeMatch').length;
    }

    bindKeyboard() {
        document.addEventListener('keydown', (e) => {
            // Mode switching: Cmd/Ctrl + 1-4
            if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '4') {
                e.preventDefault();
                const modes = ['hierarchie', 'graph', 'definition', 'mapping'];
                window.location.href = `${modes[parseInt(e.key) - 1]}.html`;
            }

            // Toggle all filters: A
            if (e.key === 'a' && !e.metaKey && !e.ctrlKey) {
                const allActive = Object.values(this.activeTypes).every(v => v);
                Object.keys(this.activeTypes).forEach(type => {
                    this.activeTypes[type] = !allActive;
                    const checkbox = document.querySelector(`input[data-type="${type}"]`);
                    if (checkbox) checkbox.checked = !allActive;
                });
                this.render();
                this.updateStats();
            }
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const app = new ConceptMapping();
    app.init();
});

export default ConceptMapping;
