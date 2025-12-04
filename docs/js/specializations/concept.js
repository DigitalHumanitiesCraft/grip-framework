/**
 * Concept Module
 * Navigator-Spezialisierung für Ontologien
 *
 * Kognitive Aufgabe: Exploration von Begriffshierarchien und Querverbindungen
 *
 * UI-Elemente:
 * - Hierarchische Baumansicht für Taxonomien
 * - Kantentyp-Legende (is-a, part-of, related-to)
 * - Konzept-Definition im Node-Inspector
 * - Pfad-Hervorhebung zwischen Konzepten
 * - Expansions-Kontrolle für Teilbäume
 */

export class Concept {
    constructor() {
        this.data = null;
        this.concepts = [];
        this.relationTypes = [];
        this.viewMode = 'graph'; // graph, tree, list
        this.selectedConcept = null;
        this.hierarchyDepth = 2;
        this.hierarchyDirection = 'down';
    }

    async init() {
        try {
            const response = await fetch('data/navigator-concept.json');
            this.data = await response.json();

            this.concepts = this.data.concepts || [];
            this.relationTypes = this.data.relation_types || [];

            this.setupEventListeners();
            this.render();

            console.log('Concept module initialized');
        } catch (error) {
            console.error('Error initializing Concept:', error);
        }
    }

    setupEventListeners() {
        document.getElementById('concept-search')?.addEventListener('input', (e) => {
            this.searchConcepts(e.target.value);
        });

        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setViewMode(e.target.dataset.view);
            });
        });

        document.getElementById('hierarchy-depth')?.addEventListener('input', (e) => {
            this.hierarchyDepth = parseInt(e.target.value);
            document.getElementById('hierarchy-depth-value').textContent = this.hierarchyDepth;
            this.renderGraph();
        });

        document.getElementById('hierarchy-direction')?.addEventListener('change', (e) => {
            this.hierarchyDirection = e.target.value;
            this.renderGraph();
        });

        document.getElementById('find-path')?.addEventListener('click', () => {
            const from = document.getElementById('path-from').value;
            const to = document.getElementById('path-to').value;
            this.findPath(from, to);
        });

        document.getElementById('expand-all')?.addEventListener('click', () => this.expandAll());
        document.getElementById('collapse-all')?.addEventListener('click', () => this.collapseAll());
        document.getElementById('reset-view')?.addEventListener('click', () => this.resetView());
    }

    render() {
        this.renderOntologyMeta();
        this.renderRelationTypes();
        this.renderGraph();
        this.renderTreeView();
        this.renderListView();
    }

    renderOntologyMeta() {
        const meta = this.data?.ontology_meta;
        if (!meta) return;

        const titleEl = document.getElementById('ontology-title');
        if (titleEl) titleEl.textContent = meta.name || 'Ontologie';

        const descEl = document.getElementById('ontology-description');
        if (descEl) descEl.textContent = meta.description || '';

        const statsEl = document.getElementById('ontology-stats');
        if (statsEl) {
            statsEl.innerHTML = `
                <dt>Konzepte</dt><dd>${this.concepts.length}</dd>
                <dt>Version</dt><dd>${meta.version || '?'}</dd>
            `;
        }
    }

    renderRelationTypes() {
        const container = document.getElementById('relation-legend');
        if (!container || !this.relationTypes.length) return;

        container.innerHTML = this.relationTypes.map(rt => `
            <div class="relation-type">
                <span class="relation-line" style="background: ${rt.color}"></span>
                <span class="relation-label">${rt.label}</span>
            </div>
        `).join('');
    }

    renderGraph() {
        const container = document.getElementById('concept-graph');
        if (!container) return;

        const width = container.clientWidth || 800;
        const height = container.clientHeight || 500;

        // Simple hierarchical layout
        const rootConcepts = this.concepts.filter(c => !c.broader || c.broader.length === 0);

        // BFS to assign levels
        const levels = new Map();
        const queue = rootConcepts.map(c => ({ concept: c, level: 0 }));
        while (queue.length > 0) {
            const { concept, level } = queue.shift();
            if (levels.has(concept.id)) continue;
            levels.set(concept.id, level);

            const narrower = this.getNarrower(concept.id);
            narrower.forEach(n => {
                if (!levels.has(n.id)) {
                    queue.push({ concept: n, level: level + 1 });
                }
            });
        }

        // Group by level
        const levelGroups = {};
        levels.forEach((level, id) => {
            if (!levelGroups[level]) levelGroups[level] = [];
            levelGroups[level].push(this.concepts.find(c => c.id === id));
        });

        const maxLevel = Math.max(...levels.values());
        const levelHeight = height / (maxLevel + 2);

        // Position concepts
        const positions = new Map();
        Object.entries(levelGroups).forEach(([level, concepts]) => {
            const y = (parseInt(level) + 1) * levelHeight;
            const spacing = width / (concepts.length + 1);
            concepts.forEach((c, idx) => {
                positions.set(c.id, { x: (idx + 1) * spacing, y });
            });
        });

        // Draw edges
        const edgesHtml = this.concepts.flatMap(concept => {
            const pos1 = positions.get(concept.id);
            if (!pos1) return [];

            const broaderEdges = (concept.broader || []).map(bid => {
                const pos2 = positions.get(bid);
                if (!pos2) return '';
                return `<line class="edge broader-edge" x1="${pos1.x}" y1="${pos1.y - 15}" x2="${pos2.x}" y2="${pos2.y + 15}" stroke="#4A7C59" stroke-width="2"/>`;
            });

            const relatedEdges = (concept.related || []).map(rid => {
                const pos2 = positions.get(rid);
                if (!pos2) return '';
                return `<line class="edge related-edge" x1="${pos1.x}" y1="${pos1.y}" x2="${pos2.x}" y2="${pos2.y}" stroke="#C4875A" stroke-width="1.5" stroke-dasharray="4,2"/>`;
            });

            return [...broaderEdges, ...relatedEdges];
        }).join('');

        // Draw nodes
        const nodesHtml = this.concepts.map(concept => {
            const pos = positions.get(concept.id);
            if (!pos) return '';

            const isSelected = this.selectedConcept?.id === concept.id;
            const level = levels.get(concept.id);
            const colorIntensity = 0.3 + (level / (maxLevel + 1)) * 0.5;

            return `
                <g class="concept-node ${isSelected ? 'selected' : ''}" data-id="${concept.id}" transform="translate(${pos.x},${pos.y})">
                    <rect x="-55" y="-15" width="110" height="30" rx="4"
                          fill="${isSelected ? 'var(--terracotta)' : '#fff'}"
                          stroke="var(--terracotta)" stroke-width="${isSelected ? 2 : 1}"/>
                    <text dy="5" text-anchor="middle" font-size="10" fill="${isSelected ? '#fff' : '#333'}">
                        ${concept.prefLabel.slice(0, 18)}${concept.prefLabel.length > 18 ? '…' : ''}
                    </text>
                </g>
            `;
        }).join('');

        container.innerHTML = `
            <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}">
                <g class="edges">${edgesHtml}</g>
                <g class="nodes">${nodesHtml}</g>
            </svg>
        `;

        // Add click handlers
        container.querySelectorAll('.concept-node').forEach(node => {
            node.addEventListener('click', () => this.selectConcept(node.dataset.id));
        });
    }

    renderTreeView() {
        const container = document.getElementById('tree-view');
        if (!container) return;

        const buildTree = (concept, depth = 0) => {
            const narrower = this.getNarrower(concept.id);
            const hasChildren = narrower.length > 0;
            const isSelected = this.selectedConcept?.id === concept.id;

            return `
                <li class="tree-item ${isSelected ? 'selected' : ''}" data-id="${concept.id}">
                    <span class="tree-toggle ${hasChildren ? 'has-children' : ''}">${hasChildren ? '▸' : '•'}</span>
                    <span class="tree-label">${concept.prefLabel}</span>
                    ${hasChildren ? `<ul class="tree-children collapsed">${narrower.map(n => buildTree(n, depth + 1)).join('')}</ul>` : ''}
                </li>
            `;
        };

        const rootConcepts = this.concepts.filter(c => !c.broader || c.broader.length === 0);
        container.innerHTML = `<ul class="concept-tree">${rootConcepts.map(c => buildTree(c)).join('')}</ul>`;

        // Add event listeners
        container.querySelectorAll('.tree-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const children = toggle.parentElement.querySelector('.tree-children');
                if (children) {
                    children.classList.toggle('collapsed');
                    toggle.textContent = children.classList.contains('collapsed') ? '▸' : '▾';
                }
            });
        });

        container.querySelectorAll('.tree-label').forEach(label => {
            label.addEventListener('click', () => {
                this.selectConcept(label.parentElement.dataset.id);
            });
        });
    }

    renderListView() {
        const container = document.getElementById('list-view');
        if (!container) return;

        const sortedConcepts = [...this.concepts].sort((a, b) =>
            a.prefLabel.localeCompare(b.prefLabel, 'de')
        );

        container.innerHTML = `
            <table class="concept-list-table">
                <thead>
                    <tr>
                        <th>Begriff</th>
                        <th>Oberbegriffe</th>
                        <th>Unterbegriffe</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedConcepts.map(c => `
                        <tr class="concept-row ${this.selectedConcept?.id === c.id ? 'selected' : ''}" data-id="${c.id}">
                            <td class="concept-label">${c.prefLabel}</td>
                            <td class="concept-broader">${(c.broader || []).map(id => this.concepts.find(x => x.id === id)?.prefLabel || id).join(', ') || '—'}</td>
                            <td class="concept-narrower">${(c.narrower || []).length || 0}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        container.querySelectorAll('.concept-row').forEach(row => {
            row.addEventListener('click', () => this.selectConcept(row.dataset.id));
        });
    }

    renderConceptDetail() {
        const panel = document.getElementById('concept-detail');
        if (!panel || !this.selectedConcept) return;

        const c = this.selectedConcept;

        panel.classList.remove('hidden');
        panel.innerHTML = `
            <h3>${c.prefLabel}</h3>
            <p class="concept-definition">${c.definition || 'Keine Definition vorhanden'}</p>
            <dl class="concept-meta">
                <dt>ID</dt><dd>${c.id}</dd>
                ${c.synonyms?.length ? `<dt>Synonyme</dt><dd>${c.synonyms.join(', ')}</dd>` : ''}
                ${c.altLabel?.length ? `<dt>Alternative Labels</dt><dd>${c.altLabel.join(', ')}</dd>` : ''}
            </dl>
        `;

        this.renderRelations();
    }

    renderRelations() {
        const container = document.getElementById('concept-relations');
        if (!container || !this.selectedConcept) return;

        const broader = this.getBroader(this.selectedConcept.id);
        const narrower = this.getNarrower(this.selectedConcept.id);
        const related = this.getRelated(this.selectedConcept.id);

        container.innerHTML = `
            ${broader.length ? `
                <div class="relation-group">
                    <h4>Oberbegriffe</h4>
                    <ul>${broader.map(c => `<li class="relation-item" data-id="${c.id}">${c.prefLabel}</li>`).join('')}</ul>
                </div>
            ` : ''}
            ${narrower.length ? `
                <div class="relation-group">
                    <h4>Unterbegriffe</h4>
                    <ul>${narrower.map(c => `<li class="relation-item" data-id="${c.id}">${c.prefLabel}</li>`).join('')}</ul>
                </div>
            ` : ''}
            ${related.length ? `
                <div class="relation-group">
                    <h4>Verwandte Begriffe</h4>
                    <ul>${related.map(c => `<li class="relation-item related" data-id="${c.id}">${c.prefLabel}</li>`).join('')}</ul>
                </div>
            ` : ''}
        `;

        container.querySelectorAll('.relation-item').forEach(item => {
            item.addEventListener('click', () => this.selectConcept(item.dataset.id));
        });
    }

    searchConcepts(query) {
        const container = document.getElementById('search-results');
        if (!container) return;

        const lowerQuery = query.toLowerCase();
        const results = this.concepts.filter(c =>
            c.prefLabel.toLowerCase().includes(lowerQuery) ||
            c.definition?.toLowerCase().includes(lowerQuery) ||
            c.synonyms?.some(s => s.toLowerCase().includes(lowerQuery))
        );

        container.innerHTML = results.slice(0, 10).map(c => `
            <li class="search-result" data-id="${c.id}">
                <span class="result-label">${c.prefLabel}</span>
            </li>
        `).join('');

        container.querySelectorAll('.search-result').forEach(li => {
            li.addEventListener('click', () => this.selectConcept(li.dataset.id));
        });
    }

    setViewMode(mode) {
        this.viewMode = mode;
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === mode);
        });
        document.getElementById('graph-container')?.classList.toggle('hidden', mode !== 'graph');
        document.getElementById('tree-view')?.classList.toggle('hidden', mode !== 'tree');
        document.getElementById('list-view')?.classList.toggle('hidden', mode !== 'list');
    }

    selectConcept(conceptId) {
        this.selectedConcept = this.concepts.find(c => c.id === conceptId);
        this.renderConceptDetail();
        this.renderRelations();
    }

    getBroader(conceptId) {
        const concept = this.concepts.find(c => c.id === conceptId);
        if (!concept?.broader) return [];
        return concept.broader.map(id => this.concepts.find(c => c.id === id)).filter(Boolean);
    }

    getNarrower(conceptId) {
        const concept = this.concepts.find(c => c.id === conceptId);
        if (!concept?.narrower) return [];
        return concept.narrower.map(id => this.concepts.find(c => c.id === id)).filter(Boolean);
    }

    getRelated(conceptId) {
        const concept = this.concepts.find(c => c.id === conceptId);
        if (!concept?.related) return [];
        return concept.related.map(id => this.concepts.find(c => c.id === id)).filter(Boolean);
    }

    findPath(fromLabel, toLabel) {
        // TODO: Implement BFS path finding
    }

    expandAll() {}
    collapseAll() {}
    resetView() {}
}
