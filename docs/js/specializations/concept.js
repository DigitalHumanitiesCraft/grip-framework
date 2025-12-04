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
            const response = await fetch('../examples/data/navigator-concept.json');
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

    renderOntologyMeta() {}
    renderRelationTypes() {}
    renderGraph() {}
    renderTreeView() {}
    renderListView() {}
    renderConceptDetail() {}
    renderRelations() {}

    searchConcepts(query) {}

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
