/**
 * Genealogy Module
 * Navigator-Spezialisierung für Verwandtschaftsnetzwerke
 *
 * Kognitive Aufgabe: Rekonstruktion von Linien und Verzweigungen
 *
 * UI-Elemente:
 * - Generationen-Layout (horizontal geschichtet)
 * - Geschlechts-Symbole oder Farbkodierung
 * - Partner-Verbindungen (horizontal) vs. Abstammung (vertikal)
 * - Ahnentafel-Ansicht (aufsteigend) und Nachkommentafel (absteigend)
 * - Lebensdaten-Timeline
 */

export class Genealogy {
    constructor() {
        this.data = null;
        this.persons = [];
        this.relations = [];
        this.viewMode = 'tree'; // tree, ancestors, descendants
        this.selectedPerson = null;
        this.generationDepth = 3;
    }

    async init() {
        try {
            const response = await fetch('../examples/data/navigator-genealogy.json');
            this.data = await response.json();

            this.persons = this.data.persons || [];
            this.relations = this.data.relations || [];

            this.setupEventListeners();
            this.render();

            console.log('Genealogy module initialized');
        } catch (error) {
            console.error('Error initializing Genealogy:', error);
        }
    }

    setupEventListeners() {
        document.getElementById('person-search')?.addEventListener('input', (e) => {
            this.searchPersons(e.target.value);
        });

        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setViewMode(e.target.dataset.view);
            });
        });

        document.getElementById('generation-depth')?.addEventListener('input', (e) => {
            this.generationDepth = parseInt(e.target.value);
            document.getElementById('generation-depth-value').textContent = this.generationDepth;
            this.renderTree();
        });

        // Zoom controls
        document.getElementById('zoom-in')?.addEventListener('click', () => this.zoom(1.2));
        document.getElementById('zoom-out')?.addEventListener('click', () => this.zoom(0.8));
        document.getElementById('fit-view')?.addEventListener('click', () => this.fitView());
        document.getElementById('center-root')?.addEventListener('click', () => this.centerRoot());
    }

    render() {
        this.renderSearchResults();
        this.renderLineages();
        this.renderTree();
        this.renderTimeline();
        this.renderStats();
    }

    renderSearchResults() {}
    renderLineages() {}
    renderTree() {}
    renderTimeline() {}
    renderStats() {}
    renderPersonDetail() {}
    renderRelations() {}

    searchPersons(query) {}
    setViewMode(mode) {
        this.viewMode = mode;
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === mode);
        });
        this.renderTree();
    }

    selectPerson(personId) {
        this.selectedPerson = this.persons.find(p => p.id === personId);
        this.renderPersonDetail();
        this.renderRelations();
    }

    zoom(factor) {}
    fitView() {}
    centerRoot() {}

    getParents(personId) {
        return this.relations
            .filter(r => r.type === 'parent_child' && r.child === personId)
            .map(r => this.persons.find(p => p.id === r.parent));
    }

    getChildren(personId) {
        return this.relations
            .filter(r => r.type === 'parent_child' && r.parent === personId)
            .map(r => this.persons.find(p => p.id === r.child));
    }

    getSpouses(personId) {
        return this.relations
            .filter(r => r.type === 'spouse' && (r.person1 === personId || r.person2 === personId))
            .map(r => {
                const spouseId = r.person1 === personId ? r.person2 : r.person1;
                return this.persons.find(p => p.id === spouseId);
            });
    }

    getSiblings(personId) {
        const parents = this.getParents(personId);
        if (parents.length === 0) return [];

        const siblings = new Set();
        parents.forEach(parent => {
            this.getChildren(parent.id).forEach(child => {
                if (child.id !== personId) siblings.add(child);
            });
        });
        return [...siblings];
    }
}
