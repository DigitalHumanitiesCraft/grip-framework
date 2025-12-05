/**
 * Citation Netzwerk-Modus
 *
 * Force-directed Graph für Zitationsbeziehungen
 *
 * Benötigte Daten: publications[], citations[], clusters[]
 * Wissensbasis: 15-MODI#Citation-Netzwerk
 */

class CitationNetzwerk {
    constructor(containerId, dataPath) {
        this.container = document.getElementById(containerId);
        this.dataPath = dataPath || '../data/navigator-citations.json';
        this.data = null;
        this.nodes = [];
        this.edges = [];
        this.selectedNode = null;
        this.layoutMode = 'force';
        this.showLabels = true;
        this.showArrows = true;
        this.scaleByCitations = false;
        this.zoom = 1;
        this.simulation = null;

        this.init();
    }

    async init() {
        try {
            const response = await fetch(this.dataPath);
            this.data = await response.json();
            this.prepareGraph();
            this.render();
            this.bindEvents();
            this.bindKeyboard();
            this.startSimulation();
        } catch (error) {
            console.error('Fehler beim Laden der Daten:', error);
        }
    }

    prepareGraph() {
        // Nodes aus Publikationen
        this.nodes = (this.data.publications || []).map(pub => ({
            id: pub.id,
            title: pub.title,
            authors: pub.authors,
            year: pub.year,
            venue: pub.venue,
            citations: pub.citations_received,
            cluster: pub.cluster,
            abstract: pub.abstract,
            x: Math.random() * 600 + 100,
            y: Math.random() * 400 + 100,
            vx: 0,
            vy: 0
        }));

        // Edges aus Zitationen
        this.edges = (this.data.citations || []).map(cit => ({
            source: cit.source,
            target: cit.target,
            context: cit.context
        }));

        // Degree berechnen
        this.nodes.forEach(node => {
            node.inDegree = this.edges.filter(e => e.target === node.id).length;
            node.outDegree = this.edges.filter(e => e.source === node.id).length;
        });
    }

    render() {
        if (!this.data) return;

        this.renderClusterLegend();
        this.renderGraph();
        this.updateStats();
    }

    renderClusterLegend() {
        const list = document.getElementById('cluster-list');
        if (!list) return;

        list.innerHTML = (this.data.clusters || []).map(cluster => `
            <li class="cluster-item" data-cluster="${cluster.id}">
                <span class="cluster-color" style="background: ${cluster.color}"></span>
                <span class="cluster-label">${cluster.label}</span>
                <span class="cluster-count">${this.nodes.filter(n => n.cluster === cluster.id).length}</span>
            </li>
        `).join('');
    }

    renderGraph() {
        const svg = document.getElementById('citation-graph');
        if (!svg) return;

        const container = document.getElementById('graph-container');
        const width = container?.clientWidth || 800;
        const height = container?.clientHeight || 600;

        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

        // Cluster-Farben
        const clusterColors = {};
        (this.data.clusters || []).forEach(c => {
            clusterColors[c.id] = c.color;
        });

        // Kanten zeichnen
        const edgesHtml = this.edges.map(edge => {
            const source = this.nodes.find(n => n.id === edge.source);
            const target = this.nodes.find(n => n.id === edge.target);
            if (!source || !target) return '';

            const markerId = this.showArrows ? 'url(#arrowhead)' : '';

            return `
                <line class="edge"
                      data-source="${edge.source}"
                      data-target="${edge.target}"
                      x1="${source.x}" y1="${source.y}"
                      x2="${target.x}" y2="${target.y}"
                      marker-end="${markerId}"/>
            `;
        }).join('');

        // Knoten zeichnen
        const nodesHtml = this.nodes.map(node => {
            const color = clusterColors[node.cluster] || '#888';
            const radius = this.scaleByCitations
                ? Math.max(8, Math.log(node.citations + 1) * 3)
                : 12;
            const isSelected = this.selectedNode === node.id;

            return `
                <g class="node ${isSelected ? 'selected' : ''}"
                   data-node="${node.id}"
                   transform="translate(${node.x}, ${node.y})">
                    <circle r="${radius}" fill="${color}"/>
                    ${this.showLabels ? `
                        <text dy="20" text-anchor="middle" class="node-label">
                            ${this.truncate(node.title, 20)}
                        </text>
                    ` : ''}
                </g>
            `;
        }).join('');

        svg.innerHTML = `
            <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7"
                        refX="20" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#999"/>
                </marker>
            </defs>
            <g class="edges">${edgesHtml}</g>
            <g class="nodes">${nodesHtml}</g>
        `;

        this.bindDrag();
    }

    startSimulation() {
        if (this.layoutMode !== 'force') return;

        const width = 800;
        const height = 600;
        const alpha = 1;
        let iterations = 0;
        const maxIterations = 300;

        const tick = () => {
            if (iterations >= maxIterations) return;
            iterations++;

            // Force-Berechnung
            this.nodes.forEach(node => {
                node.vx = 0;
                node.vy = 0;
            });

            // Repulsion zwischen Knoten
            for (let i = 0; i < this.nodes.length; i++) {
                for (let j = i + 1; j < this.nodes.length; j++) {
                    const a = this.nodes[i];
                    const b = this.nodes[j];
                    const dx = b.x - a.x;
                    const dy = b.y - a.y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    const force = 1000 / (dist * dist);

                    a.vx -= (dx / dist) * force;
                    a.vy -= (dy / dist) * force;
                    b.vx += (dx / dist) * force;
                    b.vy += (dy / dist) * force;
                }
            }

            // Attraktion durch Kanten
            this.edges.forEach(edge => {
                const source = this.nodes.find(n => n.id === edge.source);
                const target = this.nodes.find(n => n.id === edge.target);
                if (!source || !target) return;

                const dx = target.x - source.x;
                const dy = target.y - source.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const force = dist * 0.01;

                source.vx += (dx / dist) * force;
                source.vy += (dy / dist) * force;
                target.vx -= (dx / dist) * force;
                target.vy -= (dy / dist) * force;
            });

            // Zentrierung
            this.nodes.forEach(node => {
                node.vx += (width / 2 - node.x) * 0.001;
                node.vy += (height / 2 - node.y) * 0.001;
            });

            // Position aktualisieren
            const decay = 1 - iterations / maxIterations;
            this.nodes.forEach(node => {
                node.x += node.vx * decay;
                node.y += node.vy * decay;

                // Grenzen
                node.x = Math.max(50, Math.min(width - 50, node.x));
                node.y = Math.max(50, Math.min(height - 50, node.y));
            });

            this.updatePositions();

            if (iterations < maxIterations) {
                requestAnimationFrame(tick);
            }
        };

        tick();
    }

    updatePositions() {
        const svg = document.getElementById('citation-graph');
        if (!svg) return;

        // Knoten-Positionen
        this.nodes.forEach(node => {
            const el = svg.querySelector(`g[data-node="${node.id}"]`);
            if (el) {
                el.setAttribute('transform', `translate(${node.x}, ${node.y})`);
            }
        });

        // Kanten-Positionen
        this.edges.forEach(edge => {
            const source = this.nodes.find(n => n.id === edge.source);
            const target = this.nodes.find(n => n.id === edge.target);
            const line = svg.querySelector(`line[data-source="${edge.source}"][data-target="${edge.target}"]`);

            if (source && target && line) {
                line.setAttribute('x1', source.x);
                line.setAttribute('y1', source.y);
                line.setAttribute('x2', target.x);
                line.setAttribute('y2', target.y);
            }
        });
    }

    bindDrag() {
        const svg = document.getElementById('citation-graph');
        if (!svg) return;

        let dragNode = null;
        let offsetX = 0;
        let offsetY = 0;

        svg.addEventListener('mousedown', (e) => {
            const nodeEl = e.target.closest('.node');
            if (nodeEl) {
                dragNode = this.nodes.find(n => n.id === nodeEl.dataset.node);
                if (dragNode) {
                    const rect = svg.getBoundingClientRect();
                    const viewBox = svg.viewBox.baseVal;
                    const scaleX = viewBox.width / rect.width;
                    const scaleY = viewBox.height / rect.height;

                    offsetX = (e.clientX - rect.left) * scaleX - dragNode.x;
                    offsetY = (e.clientY - rect.top) * scaleY - dragNode.y;
                }
            }
        });

        svg.addEventListener('mousemove', (e) => {
            if (!dragNode) return;

            const rect = svg.getBoundingClientRect();
            const viewBox = svg.viewBox.baseVal;
            const scaleX = viewBox.width / rect.width;
            const scaleY = viewBox.height / rect.height;

            dragNode.x = (e.clientX - rect.left) * scaleX - offsetX;
            dragNode.y = (e.clientY - rect.top) * scaleY - offsetY;

            this.updatePositions();
        });

        svg.addEventListener('mouseup', () => {
            dragNode = null;
        });

        svg.addEventListener('mouseleave', () => {
            dragNode = null;
        });
    }

    updateStats() {
        document.getElementById('stat-nodes').textContent = this.nodes.length;
        document.getElementById('stat-edges').textContent = this.edges.length;

        const maxEdges = this.nodes.length * (this.nodes.length - 1);
        const density = maxEdges > 0 ? (this.edges.length / maxEdges).toFixed(3) : 0;
        document.getElementById('stat-density').textContent = density;
    }

    selectNode(nodeId) {
        this.selectedNode = nodeId;
        this.renderGraph();
        this.startSimulation();
        this.showNodeDetail(nodeId);
    }

    showNodeDetail(nodeId) {
        const node = this.nodes.find(n => n.id === nodeId);
        if (!node) return;

        const prompt = document.getElementById('node-prompt');
        const info = document.getElementById('node-info');

        prompt?.classList.add('hidden');
        info?.classList.remove('hidden');

        document.getElementById('node-title').textContent = node.title;
        document.getElementById('node-authors').textContent = node.authors?.join(', ') || '-';
        document.getElementById('node-venue').textContent = node.venue || '-';
        document.getElementById('node-year').textContent = node.year;
        document.getElementById('node-citations').textContent = node.citations?.toLocaleString() || '-';

        const cluster = this.data.clusters?.find(c => c.id === node.cluster);
        document.getElementById('node-cluster').textContent = cluster?.label || node.cluster;

        // Zitiert
        const cites = this.edges.filter(e => e.source === nodeId);
        const citesList = document.getElementById('cites-list');
        if (citesList) {
            citesList.innerHTML = cites.map(e => {
                const target = this.nodes.find(n => n.id === e.target);
                return `<li data-node="${e.target}">${this.truncate(target?.title || e.target, 40)}</li>`;
            }).join('') || '<li>Keine</li>';
        }

        // Zitiert von
        const citedBy = this.edges.filter(e => e.target === nodeId);
        const citedByList = document.getElementById('cited-by-list');
        if (citedByList) {
            citedByList.innerHTML = citedBy.map(e => {
                const source = this.nodes.find(n => n.id === e.source);
                return `<li data-node="${e.source}">${this.truncate(source?.title || e.source, 40)}</li>`;
            }).join('') || '<li>Keine</li>';
        }
    }

    truncate(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    setZoom(delta) {
        this.zoom = Math.max(0.5, Math.min(2, this.zoom + delta));
        const container = document.getElementById('graph-container');
        const svg = document.getElementById('citation-graph');
        if (container && svg) {
            svg.style.transform = `scale(${this.zoom})`;
        }
        document.getElementById('zoom-level').textContent = `${Math.round(this.zoom * 100)}%`;
    }

    bindEvents() {
        // Layout-Modus
        document.getElementById('layout-mode')?.addEventListener('change', (e) => {
            this.layoutMode = e.target.value;
            if (this.layoutMode === 'force') {
                this.startSimulation();
            } else {
                this.applyLayout();
            }
        });

        // Anzeige-Optionen
        document.getElementById('show-labels')?.addEventListener('change', (e) => {
            this.showLabels = e.target.checked;
            this.renderGraph();
        });

        document.getElementById('show-arrows')?.addEventListener('change', (e) => {
            this.showArrows = e.target.checked;
            this.renderGraph();
        });

        document.getElementById('scale-by-citations')?.addEventListener('change', (e) => {
            this.scaleByCitations = e.target.checked;
            this.renderGraph();
        });

        // Zoom
        document.getElementById('zoom-in')?.addEventListener('click', () => this.setZoom(0.1));
        document.getElementById('zoom-out')?.addEventListener('click', () => this.setZoom(-0.1));
        document.getElementById('zoom-reset')?.addEventListener('click', () => {
            this.zoom = 1;
            document.getElementById('citation-graph').style.transform = 'scale(1)';
            document.getElementById('zoom-level').textContent = '100%';
        });

        // Node-Klick
        document.getElementById('citation-graph')?.addEventListener('click', (e) => {
            const nodeEl = e.target.closest('.node');
            if (nodeEl) {
                this.selectNode(nodeEl.dataset.node);
            }
        });

        // Verbindungs-Listen
        document.getElementById('cites-list')?.addEventListener('click', (e) => {
            const li = e.target.closest('li[data-node]');
            if (li) this.selectNode(li.dataset.node);
        });

        document.getElementById('cited-by-list')?.addEventListener('click', (e) => {
            const li = e.target.closest('li[data-node]');
            if (li) this.selectNode(li.dataset.node);
        });
    }

    applyLayout() {
        const width = 800;
        const height = 600;

        if (this.layoutMode === 'radial') {
            const center = { x: width / 2, y: height / 2 };
            const radius = Math.min(width, height) / 3;

            this.nodes.forEach((node, i) => {
                const angle = (2 * Math.PI * i) / this.nodes.length;
                node.x = center.x + radius * Math.cos(angle);
                node.y = center.y + radius * Math.sin(angle);
            });
        } else if (this.layoutMode === 'cluster') {
            const clusters = [...new Set(this.nodes.map(n => n.cluster))];
            const clusterCenters = {};

            clusters.forEach((cluster, i) => {
                const angle = (2 * Math.PI * i) / clusters.length;
                clusterCenters[cluster] = {
                    x: width / 2 + (width / 4) * Math.cos(angle),
                    y: height / 2 + (height / 4) * Math.sin(angle)
                };
            });

            this.nodes.forEach(node => {
                const center = clusterCenters[node.cluster] || { x: width / 2, y: height / 2 };
                node.x = center.x + (Math.random() - 0.5) * 100;
                node.y = center.y + (Math.random() - 0.5) * 100;
            });
        }

        this.updatePositions();
    }

    bindKeyboard() {
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '4') {
                e.preventDefault();
                const modes = ['netzwerk', 'timeline', 'bibliometrie', 'ego'];
                window.location.href = `${modes[parseInt(e.key) - 1]}.html`;
            }

            if (e.key === '+' || e.key === '=') this.setZoom(0.1);
            if (e.key === '-') this.setZoom(-0.1);
        });
    }
}

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    new CitationNetzwerk('graph-container');
});

export default CitationNetzwerk;
