/**
 * Concept Hierarchie Mode
 * SKOS-basierte Konzept-Hierarchie als expandierbarer Baum
 */

class ConceptHierarchie {
    constructor() {
        this.data = null;
        this.expandedNodes = new Set();
        this.selectedConcept = null;
    }

    async init() {
        try {
            const response = await fetch('../data/navigator-concept.json');
            this.data = await response.json();
            this.buildHierarchy();
            this.render();
            this.bindEvents();
            this.bindKeyboard();
            this.updateStats();
        } catch (error) {
            console.error('Fehler beim Laden der Konzept-Daten:', error);
        }
    }

    buildHierarchy() {
        // Build parent-child relationships from broader/narrower
        this.hierarchy = {};
        this.roots = [];

        if (!this.data?.concepts) return;

        // Find all concepts and their children
        this.data.concepts.forEach(concept => {
            this.hierarchy[concept.id] = {
                ...concept,
                children: []
            };
        });

        // Link children to parents
        this.data.concepts.forEach(concept => {
            if (concept.broader && concept.broader.length > 0) {
                concept.broader.forEach(parentId => {
                    if (this.hierarchy[parentId]) {
                        this.hierarchy[parentId].children.push(concept.id);
                    }
                });
            } else {
                this.roots.push(concept.id);
            }
        });
    }

    render() {
        const container = document.getElementById('hierarchy-tree');
        if (!container) return;

        container.innerHTML = this.renderNodes(this.roots, 0);
    }

    renderNodes(nodeIds, level) {
        if (!nodeIds || nodeIds.length === 0) return '';

        return nodeIds.map(nodeId => {
            const node = this.hierarchy[nodeId];
            if (!node) return '';

            const hasChildren = node.children && node.children.length > 0;
            const isExpanded = this.expandedNodes.has(nodeId);
            const isSelected = this.selectedConcept === nodeId;

            return `
                <div class="tree-item" data-id="${nodeId}" data-level="${level}">
                    <div class="tree-node ${isSelected ? 'selected' : ''}" style="padding-left: ${level * 20 + 8}px">
                        ${hasChildren ? `
                            <button class="expand-btn ${isExpanded ? 'expanded' : ''}" data-id="${nodeId}">
                                <span class="expand-icon">${isExpanded ? '▼' : '▶'}</span>
                            </button>
                        ` : '<span class="expand-placeholder"></span>'}
                        <span class="concept-label" data-id="${nodeId}">${node.prefLabel?.de || node.prefLabel?.en || nodeId}</span>
                        ${hasChildren ? `<span class="child-count">(${node.children.length})</span>` : ''}
                    </div>
                    ${hasChildren && isExpanded ? `
                        <div class="tree-children">
                            ${this.renderNodes(node.children, level + 1)}
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    bindEvents() {
        const container = document.getElementById('hierarchy-tree');
        if (!container) return;

        // Expand/Collapse
        container.addEventListener('click', (e) => {
            const expandBtn = e.target.closest('.expand-btn');
            if (expandBtn) {
                const nodeId = expandBtn.dataset.id;
                this.toggleNode(nodeId);
                return;
            }

            const label = e.target.closest('.concept-label');
            if (label) {
                this.selectConcept(label.dataset.id);
            }
        });

        // Expand all / Collapse all buttons
        document.getElementById('expand-all')?.addEventListener('click', () => {
            Object.keys(this.hierarchy).forEach(id => this.expandedNodes.add(id));
            this.render();
        });

        document.getElementById('collapse-all')?.addEventListener('click', () => {
            this.expandedNodes.clear();
            this.render();
        });

        // Search
        document.getElementById('concept-search')?.addEventListener('input', (e) => {
            this.filterTree(e.target.value);
        });
    }

    toggleNode(nodeId) {
        if (this.expandedNodes.has(nodeId)) {
            this.expandedNodes.delete(nodeId);
        } else {
            this.expandedNodes.add(nodeId);
        }
        this.render();
    }

    selectConcept(conceptId) {
        this.selectedConcept = conceptId;
        this.render();
        this.showConceptDetail(conceptId);
    }

    showConceptDetail(conceptId) {
        const concept = this.hierarchy[conceptId];
        if (!concept) return;

        const detailSection = document.getElementById('concept-detail');
        if (!detailSection) return;

        detailSection.classList.remove('hidden');

        document.getElementById('detail-label').textContent =
            concept.prefLabel?.de || concept.prefLabel?.en || conceptId;

        document.getElementById('detail-uri').textContent = concept.id;
        document.getElementById('detail-uri').href = concept.id;

        document.getElementById('detail-definition').textContent =
            concept.definition?.de || concept.definition?.en || '–';

        // Alt labels
        const altLabels = concept.altLabel?.de || concept.altLabel?.en || [];
        document.getElementById('detail-altlabels').textContent =
            altLabels.length > 0 ? altLabels.join(', ') : '–';

        // Broader concepts
        const broader = (concept.broader || [])
            .map(id => this.hierarchy[id]?.prefLabel?.de || id)
            .join(', ');
        document.getElementById('detail-broader').textContent = broader || '–';

        // Narrower concepts
        const narrower = (concept.children || [])
            .map(id => this.hierarchy[id]?.prefLabel?.de || id)
            .join(', ');
        document.getElementById('detail-narrower').textContent = narrower || '–';
    }

    filterTree(query) {
        if (!query) {
            this.render();
            return;
        }

        const lowerQuery = query.toLowerCase();
        const matchingIds = new Set();

        // Find matching concepts and their ancestors
        Object.values(this.hierarchy).forEach(concept => {
            const label = concept.prefLabel?.de || concept.prefLabel?.en || '';
            if (label.toLowerCase().includes(lowerQuery)) {
                matchingIds.add(concept.id);
                // Expand ancestors
                this.expandAncestors(concept.id);
            }
        });

        this.render();
        this.highlightMatches(query);
    }

    expandAncestors(conceptId) {
        const concept = this.hierarchy[conceptId];
        if (!concept?.broader) return;

        concept.broader.forEach(parentId => {
            this.expandedNodes.add(parentId);
            this.expandAncestors(parentId);
        });
    }

    highlightMatches(query) {
        if (!query) return;

        const labels = document.querySelectorAll('.concept-label');
        const lowerQuery = query.toLowerCase();

        labels.forEach(label => {
            const text = label.textContent;
            if (text.toLowerCase().includes(lowerQuery)) {
                const regex = new RegExp(`(${query})`, 'gi');
                label.innerHTML = text.replace(regex, '<mark>$1</mark>');
            }
        });
    }

    updateStats() {
        const totalConcepts = Object.keys(this.hierarchy).length;
        const rootCount = this.roots.length;
        const maxDepth = this.calculateMaxDepth();

        document.getElementById('stat-concepts').textContent = totalConcepts;
        document.getElementById('stat-roots').textContent = rootCount;
        document.getElementById('stat-depth').textContent = maxDepth;
    }

    calculateMaxDepth() {
        let maxDepth = 0;

        const traverse = (nodeId, depth) => {
            maxDepth = Math.max(maxDepth, depth);
            const node = this.hierarchy[nodeId];
            if (node?.children) {
                node.children.forEach(childId => traverse(childId, depth + 1));
            }
        };

        this.roots.forEach(rootId => traverse(rootId, 1));
        return maxDepth;
    }

    bindKeyboard() {
        document.addEventListener('keydown', (e) => {
            // Mode switching: Cmd/Ctrl + 1-4
            if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '4') {
                e.preventDefault();
                const modes = ['hierarchie', 'graph', 'definition', 'mapping'];
                window.location.href = `${modes[parseInt(e.key) - 1]}.html`;
            }

            // Expand all: Cmd/Ctrl + E
            if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
                e.preventDefault();
                Object.keys(this.hierarchy).forEach(id => this.expandedNodes.add(id));
                this.render();
            }

            // Collapse all: Cmd/Ctrl + W
            if ((e.metaKey || e.ctrlKey) && e.key === 'w') {
                e.preventDefault();
                this.expandedNodes.clear();
                this.render();
            }
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const app = new ConceptHierarchie();
    app.init();
});

export default ConceptHierarchie;
