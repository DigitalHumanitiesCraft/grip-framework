/**
 * Citation Module
 * Navigator-Spezialisierung für bibliometrische Netzwerke
 *
 * Kognitive Aufgabe: Rekonstruktion intellektueller Genealogien
 *
 * UI-Elemente:
 * - Publikationsjahr als vertikale Achse
 * - Impact-Indikator (Knotengröße nach Zitationszahl)
 * - Cluster-Färbung nach Forschungsfeld
 * - Bibliografische Details im Node-Inspector
 * - Co-Citation-Hervorhebung
 */

export class Citation {
    constructor() {
        this.data = null;
        this.nodes = [];
        this.edges = [];
        this.visibleClusters = new Set();
        this.layoutMode = 'force';
        this.selectedNode = null;
    }

    async init() {
        try {
            const response = await fetch('data/navigator-citations.json');
            this.data = await response.json();

            this.processData();
            this.setupEventListeners();
            this.render();

            console.log('Citation module initialized');
        } catch (error) {
            console.error('Error initializing Citation:', error);
        }
    }

    processData() {
        this.nodes = this.data.publications || [];
        this.edges = this.data.citations || [];

        if (this.data.clusters) {
            this.data.clusters.forEach(c => this.visibleClusters.add(c.id));
        }
    }

    setupEventListeners() {
        document.getElementById('layout-mode')?.addEventListener('change', (e) => {
            this.setLayoutMode(e.target.value);
        });

        document.getElementById('node-size-by')?.addEventListener('change', (e) => {
            this.setNodeSizing(e.target.value);
        });

        document.getElementById('citation-threshold')?.addEventListener('input', (e) => {
            this.filterByCitations(parseInt(e.target.value));
        });

        document.getElementById('reset-view')?.addEventListener('click', () => {
            this.resetView();
        });

        // Cluster toggles
        document.getElementById('cluster-list')?.addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                this.toggleCluster(e.target.value, e.target.checked);
            }
        });
    }

    render() {
        this.renderNetworkMeta();
        this.renderTimeFilter();
        this.renderClusterFilter();
        this.renderTypeFilter();
        this.renderNetwork();
    }

    renderNetworkMeta() {
        const meta = this.data?.metadata;
        const metrics = this.data?.metrics;
        if (!meta) return;

        const titleEl = document.getElementById('network-title');
        if (titleEl) titleEl.textContent = meta.title || 'Zitationsnetzwerk';

        const statsEl = document.getElementById('network-stats');
        if (statsEl && metrics) {
            statsEl.innerHTML = `
                <span>${metrics.nodes} Publikationen</span>
                <span>${metrics.edges} Zitationen</span>
                <span>Dichte: ${(metrics.density * 100).toFixed(1)}%</span>
            `;
        }
    }

    renderTimeFilter() {
        const container = document.getElementById('time-filter');
        if (!container || !this.nodes.length) return;

        const years = this.nodes.map(n => n.year);
        const minYear = Math.min(...years);
        const maxYear = Math.max(...years);

        container.innerHTML = `
            <label>Zeitraum: <span id="year-range-label">${minYear} – ${maxYear}</span></label>
            <div class="year-range">
                <input type="range" id="year-min" min="${minYear}" max="${maxYear}" value="${minYear}">
                <input type="range" id="year-max" min="${minYear}" max="${maxYear}" value="${maxYear}">
            </div>
        `;

        container.querySelectorAll('input[type="range"]').forEach(input => {
            input.addEventListener('input', () => {
                const min = parseInt(document.getElementById('year-min').value);
                const max = parseInt(document.getElementById('year-max').value);
                document.getElementById('year-range-label').textContent = `${min} – ${max}`;
                this.filterByYear(min, max);
            });
        });
    }

    renderClusterFilter() {
        const container = document.getElementById('cluster-list');
        if (!container || !this.data?.clusters) return;

        container.innerHTML = this.data.clusters.map(cluster => `
            <label class="cluster-toggle">
                <input type="checkbox" value="${cluster.id}" ${this.visibleClusters.has(cluster.id) ? 'checked' : ''}>
                <span class="cluster-color" style="background: ${cluster.color}"></span>
                ${cluster.label}
            </label>
        `).join('');
    }

    renderTypeFilter() {
        const container = document.getElementById('type-filter');
        if (!container || !this.nodes.length) return;

        const types = [...new Set(this.nodes.map(n => n.type))];

        container.innerHTML = types.map(type => `
            <label class="type-toggle">
                <input type="checkbox" value="${type}" checked>
                ${type}
            </label>
        `).join('');

        container.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', () => this.renderNetwork());
        });
    }

    renderNetwork() {
        const container = document.getElementById('network-canvas');
        if (!container) return;

        // Filter nodes
        const visibleTypes = [...document.querySelectorAll('#type-filter input:checked')].map(i => i.value);
        const visibleNodes = this.nodes.filter(n =>
            this.visibleClusters.has(n.cluster) &&
            (visibleTypes.length === 0 || visibleTypes.includes(n.type))
        );

        // Calculate positions based on layout mode
        const width = container.clientWidth || 800;
        const height = container.clientHeight || 500;

        // Group by year for timeline layout
        const years = [...new Set(visibleNodes.map(n => n.year))].sort();
        const yearScale = (year) => {
            const idx = years.indexOf(year);
            return 50 + (idx / (years.length - 1)) * (height - 100);
        };

        // Position nodes
        const nodePositions = new Map();
        const yearCounts = {};
        visibleNodes.forEach(node => {
            const y = this.layoutMode === 'timeline' ? yearScale(node.year) : 50 + Math.random() * (height - 100);
            yearCounts[node.year] = (yearCounts[node.year] || 0) + 1;
            const x = this.layoutMode === 'timeline'
                ? 100 + yearCounts[node.year] * 120
                : 50 + Math.random() * (width - 100);
            nodePositions.set(node.id, { x, y });
        });

        // Calculate node sizes based on citations
        const maxCitations = Math.max(...visibleNodes.map(n => n.citations_received));
        const nodeSize = (citations) => 8 + (citations / maxCitations) * 25;

        // Draw edges
        const edgesHtml = this.edges
            .filter(e => nodePositions.has(e.source) && nodePositions.has(e.target))
            .map(edge => {
                const source = nodePositions.get(edge.source);
                const target = nodePositions.get(edge.target);
                return `<line class="edge" x1="${source.x}" y1="${source.y}" x2="${target.x}" y2="${target.y}" stroke="#ccc" stroke-width="1"/>`;
            }).join('');

        // Draw nodes
        const nodesHtml = visibleNodes.map(node => {
            const pos = nodePositions.get(node.id);
            const cluster = this.data.clusters.find(c => c.id === node.cluster);
            const size = nodeSize(node.citations_received);
            const isSelected = this.selectedNode?.id === node.id;

            return `
                <g class="node ${isSelected ? 'selected' : ''}" data-id="${node.id}" transform="translate(${pos.x},${pos.y})">
                    <circle r="${size}" fill="${cluster?.color || '#888'}" stroke="${isSelected ? '#333' : 'none'}" stroke-width="2"/>
                    <text dy="4" text-anchor="middle" font-size="10">${node.id.slice(0, 8)}</text>
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
        container.querySelectorAll('.node').forEach(node => {
            node.addEventListener('click', () => {
                this.selectNode(node.dataset.id);
            });
        });
    }

    renderPublicationDetail() {
        const panel = document.getElementById('publication-detail');
        if (!panel || !this.selectedNode) return;

        const pub = this.selectedNode;
        const cluster = this.data.clusters.find(c => c.id === pub.cluster);

        // Count citing and cited
        const citing = this.edges.filter(e => e.source === pub.id).length;
        const cited = this.edges.filter(e => e.target === pub.id).length;

        panel.classList.remove('hidden');
        panel.innerHTML = `
            <h3>${pub.title}</h3>
            <p class="pub-authors">${pub.authors.join(', ')}</p>
            <dl class="pub-meta">
                <dt>Jahr</dt><dd>${pub.year}</dd>
                <dt>Typ</dt><dd>${pub.type}</dd>
                <dt>Venue</dt><dd>${pub.venue}</dd>
                <dt>Cluster</dt><dd><span class="cluster-badge" style="background: ${cluster?.color}">${cluster?.label}</span></dd>
                <dt>Zitationen</dt><dd>${pub.citations_received.toLocaleString()}</dd>
                <dt>Zitiert (im Netzwerk)</dt><dd>${citing}</dd>
                <dt>Wird zitiert</dt><dd>${cited}</dd>
            </dl>
            <p class="pub-abstract">${pub.abstract}</p>
            <div class="pub-actions">
                <button class="btn-citing" id="show-citing">Zeige Zitierende (${cited})</button>
                <button class="btn-cited" id="show-cited">Zeige Zitierte (${citing})</button>
            </div>
        `;

        document.getElementById('show-citing')?.addEventListener('click', () => this.showCiting());
        document.getElementById('show-cited')?.addEventListener('click', () => this.showCited());
    }

    setLayoutMode(mode) {
        this.layoutMode = mode;
        this.renderNetwork();
    }

    setNodeSizing(mode) {
        this.nodeSizing = mode;
        this.renderNetwork();
    }

    filterByCitations(min) {
        this.citationThreshold = min;
        this.renderNetwork();
    }

    filterByYear(min, max) {
        this.yearRange = { min, max };
        this.renderNetwork();
    }

    toggleCluster(clusterId, visible) {
        if (visible) {
            this.visibleClusters.add(clusterId);
        } else {
            this.visibleClusters.delete(clusterId);
        }
        this.renderNetwork();
    }

    resetView() {
        this.selectedNode = null;
        this.data.clusters.forEach(c => this.visibleClusters.add(c.id));
        this.renderClusterFilter();
        this.renderNetwork();
        document.getElementById('publication-detail')?.classList.add('hidden');
    }

    selectNode(nodeId) {
        this.selectedNode = this.nodes.find(n => n.id === nodeId);
        this.renderNetwork();
        this.renderPublicationDetail();
    }

    showCiting() {
        if (!this.selectedNode) return;
        const citingIds = this.edges.filter(e => e.target === this.selectedNode.id).map(e => e.source);
        alert(`Zitierende: ${citingIds.join(', ')}`);
    }

    showCited() {
        if (!this.selectedNode) return;
        const citedIds = this.edges.filter(e => e.source === this.selectedNode.id).map(e => e.target);
        alert(`Zitiert: ${citedIds.join(', ')}`);
    }
}
