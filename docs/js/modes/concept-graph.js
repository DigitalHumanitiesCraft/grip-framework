/**
 * Concept Graph Mode
 * Force-directed Graph für SKOS-Konzepte
 */

class ConceptGraph {
    constructor() {
        this.data = null;
        this.nodes = [];
        this.links = [];
        this.selectedNode = null;
        this.simulation = null;
        this.svg = null;
        this.width = 800;
        this.height = 600;
        this.relationTypes = {
            broader: true,
            narrower: true,
            related: true
        };
    }

    async init() {
        try {
            const response = await fetch('../data/navigator-concept.json');
            this.data = await response.json();
            this.prepareGraphData();
            this.initSVG();
            this.render();
            this.bindEvents();
            this.bindKeyboard();
            this.updateStats();
        } catch (error) {
            console.error('Fehler beim Laden der Konzept-Daten:', error);
        }
    }

    prepareGraphData() {
        if (!this.data?.concepts) return;

        // Create nodes
        this.nodes = this.data.concepts.map(concept => ({
            id: concept.id,
            label: concept.prefLabel?.de || concept.prefLabel?.en || concept.id,
            definition: concept.definition?.de || concept.definition?.en || '',
            broader: concept.broader || [],
            narrower: concept.narrower || [],
            related: concept.related || []
        }));

        // Create links
        this.links = [];
        const nodeIds = new Set(this.nodes.map(n => n.id));

        this.data.concepts.forEach(concept => {
            // Broader relations
            (concept.broader || []).forEach(targetId => {
                if (nodeIds.has(targetId)) {
                    this.links.push({
                        source: concept.id,
                        target: targetId,
                        type: 'broader'
                    });
                }
            });

            // Related relations
            (concept.related || []).forEach(targetId => {
                if (nodeIds.has(targetId)) {
                    // Avoid duplicates for symmetric relation
                    const exists = this.links.some(l =>
                        l.type === 'related' &&
                        ((l.source === concept.id && l.target === targetId) ||
                         (l.source === targetId && l.target === concept.id))
                    );
                    if (!exists) {
                        this.links.push({
                            source: concept.id,
                            target: targetId,
                            type: 'related'
                        });
                    }
                }
            });
        });
    }

    initSVG() {
        const container = document.getElementById('graph-container');
        if (!container) return;

        this.width = container.clientWidth || 800;
        this.height = container.clientHeight || 600;

        container.innerHTML = `
            <svg id="concept-graph" width="${this.width}" height="${this.height}">
                <defs>
                    <marker id="arrow-broader" viewBox="0 -5 10 10" refX="20" refY="0"
                            markerWidth="6" markerHeight="6" orient="auto">
                        <path d="M0,-5L10,0L0,5" fill="#6B7280"/>
                    </marker>
                    <marker id="arrow-related" viewBox="0 -5 10 10" refX="20" refY="0"
                            markerWidth="6" markerHeight="6" orient="auto">
                        <path d="M0,-5L10,0L0,5" fill="#10B981"/>
                    </marker>
                </defs>
                <g class="links"></g>
                <g class="nodes"></g>
            </svg>
        `;

        this.svg = container.querySelector('svg');
    }

    render() {
        if (!this.svg) return;

        // Filter links by active relation types
        const filteredLinks = this.links.filter(l => this.relationTypes[l.type]);

        // Get nodes that are connected
        const connectedNodeIds = new Set();
        filteredLinks.forEach(l => {
            connectedNodeIds.add(typeof l.source === 'object' ? l.source.id : l.source);
            connectedNodeIds.add(typeof l.target === 'object' ? l.target.id : l.target);
        });

        const filteredNodes = this.nodes.filter(n => connectedNodeIds.has(n.id));

        // Create simulation
        this.simulation = this.createSimulation(filteredNodes, filteredLinks);

        // Render links
        const linksGroup = this.svg.querySelector('.links');
        linksGroup.innerHTML = filteredLinks.map(link => `
            <line class="link ${link.type}"
                  data-source="${typeof link.source === 'object' ? link.source.id : link.source}"
                  data-target="${typeof link.target === 'object' ? link.target.id : link.target}"
                  marker-end="url(#arrow-${link.type === 'related' ? 'related' : 'broader'})">
            </line>
        `).join('');

        // Render nodes
        const nodesGroup = this.svg.querySelector('.nodes');
        nodesGroup.innerHTML = filteredNodes.map(node => `
            <g class="node" data-id="${node.id}" transform="translate(${this.width/2},${this.height/2})">
                <circle r="8" class="node-circle"></circle>
                <text dy="20" text-anchor="middle" class="node-label">${this.truncateLabel(node.label)}</text>
            </g>
        `).join('');

        // Start simulation
        this.simulation.on('tick', () => this.tick());
    }

    createSimulation(nodes, links) {
        // Simple force simulation without D3
        const simulation = {
            nodes: nodes.map(n => ({
                ...n,
                x: this.width / 2 + (Math.random() - 0.5) * 200,
                y: this.height / 2 + (Math.random() - 0.5) * 200,
                vx: 0,
                vy: 0
            })),
            links: links.map(l => ({
                ...l,
                source: typeof l.source === 'string' ? l.source : l.source.id,
                target: typeof l.target === 'string' ? l.target : l.target.id
            })),
            alpha: 1,
            listeners: [],
            on: function(event, callback) {
                this.listeners.push({ event, callback });
                return this;
            }
        };

        // Create node map for link resolution
        const nodeMap = {};
        simulation.nodes.forEach(n => nodeMap[n.id] = n);

        // Resolve links to node references
        simulation.links = simulation.links.map(l => ({
            ...l,
            source: nodeMap[l.source] || l.source,
            target: nodeMap[l.target] || l.target
        }));

        // Run simulation
        const iterate = () => {
            if (simulation.alpha < 0.001) return;

            // Apply forces
            this.applyForces(simulation);

            // Decay alpha
            simulation.alpha *= 0.99;

            // Call listeners
            simulation.listeners.forEach(l => {
                if (l.event === 'tick') l.callback();
            });

            requestAnimationFrame(iterate);
        };

        requestAnimationFrame(iterate);
        return simulation;
    }

    applyForces(simulation) {
        const nodes = simulation.nodes;
        const links = simulation.links;

        // Center force
        nodes.forEach(node => {
            node.vx += (this.width / 2 - node.x) * 0.001;
            node.vy += (this.height / 2 - node.y) * 0.001;
        });

        // Repulsion between nodes
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dx = nodes[j].x - nodes[i].x;
                const dy = nodes[j].y - nodes[i].y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const force = 500 / (dist * dist);

                nodes[i].vx -= dx / dist * force;
                nodes[i].vy -= dy / dist * force;
                nodes[j].vx += dx / dist * force;
                nodes[j].vy += dy / dist * force;
            }
        }

        // Link attraction
        links.forEach(link => {
            if (!link.source.x || !link.target.x) return;
            const dx = link.target.x - link.source.x;
            const dy = link.target.y - link.source.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = (dist - 100) * 0.01;

            link.source.vx += dx / dist * force;
            link.source.vy += dy / dist * force;
            link.target.vx -= dx / dist * force;
            link.target.vy -= dy / dist * force;
        });

        // Apply velocity and damping
        nodes.forEach(node => {
            node.vx *= 0.9;
            node.vy *= 0.9;
            node.x += node.vx;
            node.y += node.vy;

            // Boundary constraints
            node.x = Math.max(30, Math.min(this.width - 30, node.x));
            node.y = Math.max(30, Math.min(this.height - 30, node.y));
        });
    }

    tick() {
        if (!this.simulation) return;

        // Update node positions
        this.simulation.nodes.forEach(node => {
            const nodeEl = this.svg.querySelector(`.node[data-id="${node.id}"]`);
            if (nodeEl) {
                nodeEl.setAttribute('transform', `translate(${node.x},${node.y})`);
            }
        });

        // Update link positions
        this.simulation.links.forEach(link => {
            const linkEl = this.svg.querySelector(
                `.link[data-source="${link.source.id}"][data-target="${link.target.id}"]`
            );
            if (linkEl && link.source.x && link.target.x) {
                linkEl.setAttribute('x1', link.source.x);
                linkEl.setAttribute('y1', link.source.y);
                linkEl.setAttribute('x2', link.target.x);
                linkEl.setAttribute('y2', link.target.y);
            }
        });
    }

    truncateLabel(label, maxLength = 20) {
        if (label.length <= maxLength) return label;
        return label.substring(0, maxLength - 1) + '…';
    }

    bindEvents() {
        // Node selection
        this.svg?.addEventListener('click', (e) => {
            const nodeEl = e.target.closest('.node');
            if (nodeEl) {
                this.selectNode(nodeEl.dataset.id);
            }
        });

        // Relation type toggles
        document.querySelectorAll('.relation-filter input').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.relationTypes[e.target.dataset.type] = e.target.checked;
                this.render();
            });
        });

        // Zoom controls
        document.getElementById('zoom-in')?.addEventListener('click', () => this.zoom(1.2));
        document.getElementById('zoom-out')?.addEventListener('click', () => this.zoom(0.8));
        document.getElementById('zoom-reset')?.addEventListener('click', () => this.resetZoom());
    }

    selectNode(nodeId) {
        this.selectedNode = nodeId;

        // Highlight node
        this.svg.querySelectorAll('.node').forEach(n => {
            n.classList.toggle('selected', n.dataset.id === nodeId);
        });

        // Show detail
        const node = this.nodes.find(n => n.id === nodeId);
        if (node) {
            this.showNodeDetail(node);
        }
    }

    showNodeDetail(node) {
        const detailSection = document.getElementById('node-detail');
        if (!detailSection) return;

        detailSection.classList.remove('hidden');

        document.getElementById('detail-label').textContent = node.label;
        document.getElementById('detail-uri').textContent = node.id;
        document.getElementById('detail-uri').href = node.id;
        document.getElementById('detail-definition').textContent = node.definition || '–';

        // Relations
        const broader = node.broader.map(id => {
            const n = this.nodes.find(x => x.id === id);
            return n?.label || id;
        }).join(', ');

        const related = node.related.map(id => {
            const n = this.nodes.find(x => x.id === id);
            return n?.label || id;
        }).join(', ');

        document.getElementById('detail-broader').textContent = broader || '–';
        document.getElementById('detail-related').textContent = related || '–';
    }

    zoom(factor) {
        const viewBox = this.svg.getAttribute('viewBox');
        if (!viewBox) {
            this.svg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
        }

        const [x, y, w, h] = (this.svg.getAttribute('viewBox') || `0 0 ${this.width} ${this.height}`)
            .split(' ').map(Number);

        const newW = w / factor;
        const newH = h / factor;
        const newX = x + (w - newW) / 2;
        const newY = y + (h - newH) / 2;

        this.svg.setAttribute('viewBox', `${newX} ${newY} ${newW} ${newH}`);
    }

    resetZoom() {
        this.svg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
    }

    updateStats() {
        document.getElementById('stat-nodes').textContent = this.nodes.length;
        document.getElementById('stat-edges').textContent = this.links.length;

        const broaderCount = this.links.filter(l => l.type === 'broader').length;
        const relatedCount = this.links.filter(l => l.type === 'related').length;
        document.getElementById('stat-broader').textContent = broaderCount;
        document.getElementById('stat-related').textContent = relatedCount;
    }

    bindKeyboard() {
        document.addEventListener('keydown', (e) => {
            // Mode switching: Cmd/Ctrl + 1-4
            if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '4') {
                e.preventDefault();
                const modes = ['hierarchie', 'graph', 'definition', 'mapping'];
                window.location.href = `${modes[parseInt(e.key) - 1]}.html`;
            }

            // Zoom: + / -
            if (e.key === '+' || e.key === '=') {
                e.preventDefault();
                this.zoom(1.2);
            }
            if (e.key === '-') {
                e.preventDefault();
                this.zoom(0.8);
            }

            // Reset zoom: 0
            if (e.key === '0') {
                e.preventDefault();
                this.resetZoom();
            }
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const app = new ConceptGraph();
    app.init();
});

export default ConceptGraph;
