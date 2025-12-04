// Navigator Archetype - Networked data with graph visualization
// GRIP Framework

export class AdaptiveNavigator {
    constructor(dataUrl) {
        this.dataUrl = dataUrl;
        this.data = null;
        this.nodes = [];
        this.edges = [];
        this.simulation = null;
        this.selectedNode = null;
        this.visibleClusters = new Set();
        this.currentLayout = 'force';
        this.isPaused = false;

        this.transform = { x: 0, y: 0, k: 1 };
        this.isDragging = false;
        this.dragNode = null;

        this.svg = null;
        this.graphContent = null;
        this.edgesGroup = null;
        this.nodesGroup = null;

        this.init();
    }

    async init() {
        try {
            const response = await fetch(this.dataUrl);
            this.data = await response.json();
            this.setupDOM();
            this.processData();
            this.renderLegend();
            this.renderClusterToggles();
            this.setupFilters();
            this.createGraph();
            this.startSimulation();
            this.setupInteractions();
            this.updateStats();
        } catch (error) {
            console.error('Error loading navigator data:', error);
        }
    }

    setupDOM() {
        this.svg = document.getElementById('graph-svg');
        this.graphContent = document.getElementById('graph-content');
        this.edgesGroup = document.getElementById('edges-group');
        this.nodesGroup = document.getElementById('nodes-group');

        document.getElementById('network-title').textContent = this.data.metadata.title.split(':')[0];
        document.getElementById('network-description').textContent = this.data.metadata.description;

        const years = this.data.nodes.map(n => n.year);
        const minYear = Math.min(...years);
        const maxYear = Math.max(...years);
        const yearFilter = document.getElementById('year-filter');
        yearFilter.min = minYear;
        yearFilter.max = maxYear;
        yearFilter.value = maxYear;
        document.getElementById('year-min').textContent = minYear;
        document.getElementById('year-value').textContent = maxYear;
    }

    processData() {
        this.nodes = this.data.nodes.map(node => ({
            ...node,
            inDegree: 0,
            outDegree: 0,
            x: Math.random() * 600 + 100,
            y: Math.random() * 400 + 100,
            vx: 0,
            vy: 0,
            visible: true
        }));

        const nodeMap = new Map(this.nodes.map(n => [n.id, n]));

        this.edges = this.data.edges.map(edge => {
            const source = nodeMap.get(edge.source);
            const target = nodeMap.get(edge.target);

            if (source) source.outDegree++;
            if (target) target.inDegree++;

            return {
                source: source,
                target: target,
                type: edge.type,
                visible: true
            };
        }).filter(e => e.source && e.target);

        Object.keys(this.data.clusters).forEach(c => this.visibleClusters.add(c));
    }

    renderLegend() {
        const container = document.getElementById('legend-items');
        container.innerHTML = Object.entries(this.data.clusters).map(([key, cluster]) => `
            <div class="legend-item" data-cluster="${key}">
                <span class="legend-circle" style="border-color: ${cluster.color}"></span>
                <span>${cluster.label}</span>
            </div>
        `).join('');
    }

    renderClusterToggles() {
        const container = document.getElementById('cluster-toggles');
        container.innerHTML = Object.entries(this.data.clusters).map(([key, cluster]) => `
            <button class="cluster-btn active" data-cluster="${key}" style="--cluster-color: ${cluster.color}">
                ${cluster.label}
            </button>
        `).join('');

        container.querySelectorAll('.cluster-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
                const cluster = btn.dataset.cluster;

                if (btn.classList.contains('active')) {
                    this.visibleClusters.add(cluster);
                } else {
                    this.visibleClusters.delete(cluster);
                }

                this.applyFilters();
            });
        });
    }

    setupFilters() {
        document.getElementById('year-filter').addEventListener('input', (e) => {
            document.getElementById('year-value').textContent = e.target.value;
            this.applyFilters();
        });

        document.getElementById('degree-filter').addEventListener('input', (e) => {
            document.getElementById('degree-value').textContent = e.target.value;
            this.applyFilters();
        });

        document.querySelectorAll('.layout-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.layout-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentLayout = btn.dataset.layout;
                this.changeLayout();
            });
        });
    }

    applyFilters() {
        const maxYear = parseInt(document.getElementById('year-filter').value);
        const minDegree = parseInt(document.getElementById('degree-filter').value);

        this.nodes.forEach(node => {
            const yearOk = node.year <= maxYear;
            const clusterOk = this.visibleClusters.has(node.cluster);
            const degreeOk = (node.inDegree + node.outDegree) >= minDegree;
            node.visible = yearOk && clusterOk && degreeOk;
        });

        this.edges.forEach(edge => {
            edge.visible = edge.source.visible && edge.target.visible;
        });

        this.updateGraphVisibility();
        this.updateStats();
    }

    updateGraphVisibility() {
        this.nodesGroup.querySelectorAll('.node').forEach(g => {
            const nodeId = g.dataset.id;
            const node = this.nodes.find(n => n.id === nodeId);
            g.style.display = node && node.visible ? '' : 'none';
        });

        this.edgesGroup.querySelectorAll('.edge').forEach(line => {
            const sourceId = line.dataset.source;
            const targetId = line.dataset.target;
            const edge = this.edges.find(e => e.source.id === sourceId && e.target.id === targetId);
            line.style.display = edge && edge.visible ? '' : 'none';
        });

        const visibleCount = this.nodes.filter(n => n.visible).length;
        document.getElementById('visible-nodes').textContent = visibleCount;
    }

    createGraph() {
        this.edges.forEach(edge => {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.classList.add('edge');
            line.dataset.source = edge.source.id;
            line.dataset.target = edge.target.id;
            line.setAttribute('marker-end', 'url(#arrowhead)');
            this.edgesGroup.appendChild(line);
        });

        this.nodes.forEach(node => {
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.classList.add('node');
            g.dataset.id = node.id;

            const radius = Math.max(8, Math.min(20, 8 + node.inDegree * 2));

            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('r', radius);
            circle.classList.add('node-circle');
            circle.style.stroke = this.data.clusters[node.cluster]?.color || '#888';

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.classList.add('node-label');
            text.setAttribute('y', radius + 12);
            text.textContent = `${node.author.split(',')[0]} ${node.year}`;

            g.appendChild(circle);
            g.appendChild(text);
            this.nodesGroup.appendChild(g);
        });
    }

    startSimulation() {
        const width = this.svg.clientWidth || 800;
        const height = this.svg.clientHeight || 600;
        const centerX = width / 2;
        const centerY = height / 2;

        this.nodes.forEach((node, i) => {
            const angle = (i / this.nodes.length) * 2 * Math.PI;
            node.x = centerX + Math.cos(angle) * 150 + (Math.random() - 0.5) * 50;
            node.y = centerY + Math.sin(angle) * 150 + (Math.random() - 0.5) * 50;
        });

        this.alpha = 1;
        this.alphaDecay = 0.02;
        this.alphaMin = 0.001;

        this.tick();
    }

    tick() {
        if (this.isPaused || this.alpha < this.alphaMin) {
            this.updateAlphaBar();
            if (!this.isPaused && this.alpha >= this.alphaMin) {
                requestAnimationFrame(() => this.tick());
            }
            return;
        }

        const width = this.svg.clientWidth || 800;
        const height = this.svg.clientHeight || 600;

        this.applyForces(width, height);
        this.updatePositions();

        this.alpha *= (1 - this.alphaDecay);
        this.updateAlphaBar();

        requestAnimationFrame(() => this.tick());
    }

    applyForces(width, height) {
        const visibleNodes = this.nodes.filter(n => n.visible);
        const visibleEdges = this.edges.filter(e => e.visible);

        const centerX = width / 2;
        const centerY = height / 2;
        const centerStrength = 0.01;

        visibleNodes.forEach(node => {
            if (node === this.dragNode) return;
            node.vx += (centerX - node.x) * centerStrength * this.alpha;
            node.vy += (centerY - node.y) * centerStrength * this.alpha;
        });

        const repulsionStrength = 500;
        for (let i = 0; i < visibleNodes.length; i++) {
            for (let j = i + 1; j < visibleNodes.length; j++) {
                const nodeA = visibleNodes[i];
                const nodeB = visibleNodes[j];

                if (nodeA === this.dragNode || nodeB === this.dragNode) continue;

                let dx = nodeB.x - nodeA.x;
                let dy = nodeB.y - nodeA.y;
                let dist = Math.sqrt(dx * dx + dy * dy) || 1;

                const samCluster = nodeA.cluster === nodeB.cluster;
                const strength = (repulsionStrength * (samCluster ? 0.8 : 1)) / (dist * dist);

                const fx = (dx / dist) * strength * this.alpha;
                const fy = (dy / dist) * strength * this.alpha;

                nodeA.vx -= fx;
                nodeA.vy -= fy;
                nodeB.vx += fx;
                nodeB.vy += fy;
            }
        }

        const linkStrength = 0.3;
        const linkDistance = 80;

        visibleEdges.forEach(edge => {
            if (edge.source === this.dragNode || edge.target === this.dragNode) return;

            let dx = edge.target.x - edge.source.x;
            let dy = edge.target.y - edge.source.y;
            let dist = Math.sqrt(dx * dx + dy * dy) || 1;

            const force = (dist - linkDistance) * linkStrength * this.alpha;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            edge.source.vx += fx;
            edge.source.vy += fy;
            edge.target.vx -= fx;
            edge.target.vy -= fy;
        });

        if (this.currentLayout === 'cluster') {
            const clusterCenters = {};
            Object.keys(this.data.clusters).forEach((cluster, i) => {
                const angle = (i / Object.keys(this.data.clusters).length) * 2 * Math.PI;
                clusterCenters[cluster] = {
                    x: centerX + Math.cos(angle) * 150,
                    y: centerY + Math.sin(angle) * 150
                };
            });

            visibleNodes.forEach(node => {
                if (node === this.dragNode) return;
                const center = clusterCenters[node.cluster];
                if (center) {
                    node.vx += (center.x - node.x) * 0.05 * this.alpha;
                    node.vy += (center.y - node.y) * 0.05 * this.alpha;
                }
            });
        }

        if (this.currentLayout === 'radial') {
            const centralNode = visibleNodes.reduce((max, node) =>
                (node.inDegree + node.outDegree) > (max.inDegree + max.outDegree) ? node : max
            , visibleNodes[0]);

            visibleNodes.forEach(node => {
                if (node === this.dragNode || node === centralNode) return;

                const connectedToCentral = visibleEdges.some(e =>
                    (e.source === centralNode && e.target === node) ||
                    (e.target === centralNode && e.source === node)
                );

                const targetDist = connectedToCentral ? 100 : 200;
                const dx = node.x - centerX;
                const dy = node.y - centerY;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;

                const force = (dist - targetDist) * 0.05 * this.alpha;
                node.vx -= (dx / dist) * force;
                node.vy -= (dy / dist) * force;
            });

            if (centralNode && centralNode !== this.dragNode) {
                centralNode.vx += (centerX - centralNode.x) * 0.1 * this.alpha;
                centralNode.vy += (centerY - centralNode.y) * 0.1 * this.alpha;
            }
        }

        const damping = 0.6;
        visibleNodes.forEach(node => {
            if (node === this.dragNode) return;

            node.vx *= damping;
            node.vy *= damping;

            node.x += node.vx;
            node.y += node.vy;

            const padding = 50;
            node.x = Math.max(padding, Math.min(width - padding, node.x));
            node.y = Math.max(padding, Math.min(height - padding, node.y));
        });
    }

    updatePositions() {
        this.nodesGroup.querySelectorAll('.node').forEach(g => {
            const nodeId = g.dataset.id;
            const node = this.nodes.find(n => n.id === nodeId);
            if (node) {
                g.setAttribute('transform', `translate(${node.x}, ${node.y})`);
            }
        });

        this.edgesGroup.querySelectorAll('.edge').forEach(line => {
            const sourceId = line.dataset.source;
            const targetId = line.dataset.target;
            const source = this.nodes.find(n => n.id === sourceId);
            const target = this.nodes.find(n => n.id === targetId);

            if (source && target) {
                line.setAttribute('x1', source.x);
                line.setAttribute('y1', source.y);
                line.setAttribute('x2', target.x);
                line.setAttribute('y2', target.y);
            }
        });
    }

    updateAlphaBar() {
        const fill = document.getElementById('alpha-fill');
        if (fill) {
            fill.style.width = `${Math.min(100, this.alpha * 100)}%`;
        }
    }

    changeLayout() {
        this.alpha = 1;
        if (this.isPaused) {
            this.isPaused = false;
            document.getElementById('sim-icon').textContent = '⏸';
            this.tick();
        }
    }

    setupInteractions() {
        this.nodesGroup.addEventListener('click', (e) => {
            const nodeG = e.target.closest('.node');
            if (nodeG) {
                this.selectNode(nodeG.dataset.id);
            }
        });

        this.setupDrag();

        document.getElementById('zoom-in').addEventListener('click', () => this.zoom(1.2));
        document.getElementById('zoom-out').addEventListener('click', () => this.zoom(0.8));
        document.getElementById('reset-view').addEventListener('click', () => this.resetView());
        document.getElementById('fit-view').addEventListener('click', () => this.fitView());

        document.getElementById('sim-play').addEventListener('click', () => {
            this.isPaused = !this.isPaused;
            document.getElementById('sim-icon').textContent = this.isPaused ? '▶' : '⏸';
            if (!this.isPaused) this.tick();
        });

        document.getElementById('sim-reheat').addEventListener('click', () => {
            this.alpha = 1;
            if (this.isPaused) {
                this.isPaused = false;
                document.getElementById('sim-icon').textContent = '⏸';
            }
            this.tick();
        });

        this.setupPan();
    }

    setupDrag() {
        let startX, startY;

        const onMouseDown = (e) => {
            const nodeG = e.target.closest('.node');
            if (!nodeG) return;

            e.preventDefault();
            const nodeId = nodeG.dataset.id;
            this.dragNode = this.nodes.find(n => n.id === nodeId);

            startX = e.clientX;
            startY = e.clientY;

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        };

        const onMouseMove = (e) => {
            if (!this.dragNode) return;

            const dx = (e.clientX - startX) / this.transform.k;
            const dy = (e.clientY - startY) / this.transform.k;

            this.dragNode.x += dx;
            this.dragNode.y += dy;
            this.dragNode.vx = 0;
            this.dragNode.vy = 0;

            startX = e.clientX;
            startY = e.clientY;

            this.updatePositions();

            if (this.alpha < 0.3) this.alpha = 0.3;
        };

        const onMouseUp = () => {
            this.dragNode = null;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        this.nodesGroup.addEventListener('mousedown', onMouseDown);
    }

    setupPan() {
        let isPanning = false;
        let startX, startY;

        this.svg.addEventListener('mousedown', (e) => {
            if (e.target.closest('.node')) return;
            isPanning = true;
            startX = e.clientX - this.transform.x;
            startY = e.clientY - this.transform.y;
            this.svg.style.cursor = 'grabbing';
        });

        this.svg.addEventListener('mousemove', (e) => {
            if (!isPanning) return;
            this.transform.x = e.clientX - startX;
            this.transform.y = e.clientY - startY;
            this.applyTransform();
        });

        this.svg.addEventListener('mouseup', () => {
            isPanning = false;
            this.svg.style.cursor = 'grab';
        });

        this.svg.addEventListener('mouseleave', () => {
            isPanning = false;
            this.svg.style.cursor = 'grab';
        });

        this.svg.addEventListener('wheel', (e) => {
            e.preventDefault();
            const factor = e.deltaY > 0 ? 0.9 : 1.1;
            this.zoom(factor, e.clientX, e.clientY);
        });
    }

    zoom(factor, cx, cy) {
        const oldK = this.transform.k;
        this.transform.k = Math.max(0.2, Math.min(5, this.transform.k * factor));

        if (cx !== undefined && cy !== undefined) {
            const rect = this.svg.getBoundingClientRect();
            const x = cx - rect.left;
            const y = cy - rect.top;

            this.transform.x = x - (x - this.transform.x) * (this.transform.k / oldK);
            this.transform.y = y - (y - this.transform.y) * (this.transform.k / oldK);
        }

        this.applyTransform();
    }

    applyTransform() {
        this.graphContent.setAttribute('transform',
            `translate(${this.transform.x}, ${this.transform.y}) scale(${this.transform.k})`
        );
    }

    resetView() {
        this.transform = { x: 0, y: 0, k: 1 };
        this.applyTransform();
    }

    fitView() {
        const visibleNodes = this.nodes.filter(n => n.visible);
        if (visibleNodes.length === 0) return;

        const minX = Math.min(...visibleNodes.map(n => n.x));
        const maxX = Math.max(...visibleNodes.map(n => n.x));
        const minY = Math.min(...visibleNodes.map(n => n.y));
        const maxY = Math.max(...visibleNodes.map(n => n.y));

        const width = this.svg.clientWidth;
        const height = this.svg.clientHeight;
        const padding = 50;

        const scaleX = (width - 2 * padding) / (maxX - minX || 1);
        const scaleY = (height - 2 * padding) / (maxY - minY || 1);
        this.transform.k = Math.min(scaleX, scaleY, 2);

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        this.transform.x = width / 2 - centerX * this.transform.k;
        this.transform.y = height / 2 - centerY * this.transform.k;

        this.applyTransform();
    }

    selectNode(nodeId) {
        this.nodesGroup.querySelectorAll('.node.selected').forEach(n => n.classList.remove('selected'));
        this.edgesGroup.querySelectorAll('.edge.highlighted').forEach(e => {
            e.classList.remove('highlighted');
            e.setAttribute('marker-end', 'url(#arrowhead)');
        });

        const nodeG = this.nodesGroup.querySelector(`.node[data-id="${nodeId}"]`);
        const node = this.nodes.find(n => n.id === nodeId);

        if (!nodeG || !node) return;

        nodeG.classList.add('selected');
        this.selectedNode = node;

        this.edgesGroup.querySelectorAll('.edge').forEach(line => {
            const sourceId = line.dataset.source;
            const targetId = line.dataset.target;

            if (sourceId === nodeId || targetId === nodeId) {
                line.classList.add('highlighted');
                line.setAttribute('marker-end', 'url(#arrowhead-highlighted)');
            }
        });

        this.showNodeDetails(node);
    }

    showNodeDetails(node) {
        document.getElementById('detail-hint').style.display = 'none';
        document.getElementById('detail-content').classList.remove('hidden');

        document.getElementById('detail-title').textContent = node.title;
        document.getElementById('detail-author').textContent = node.author;
        document.getElementById('detail-year').textContent = node.year;
        document.getElementById('detail-cited-by').textContent = `${node.inDegree} Paper`;
        document.getElementById('detail-cites').textContent = `${node.outDegree} Paper`;

        const clusterTag = document.getElementById('detail-cluster');
        const cluster = this.data.clusters[node.cluster];
        clusterTag.textContent = cluster?.label || node.cluster;
        clusterTag.style.background = cluster?.color ? `${cluster.color}20` : '#eee';
        clusterTag.style.color = cluster?.color || '#666';

        document.getElementById('metric-degree').textContent = node.inDegree + node.outDegree;
        document.getElementById('metric-in-degree').textContent = node.inDegree;
        document.getElementById('metric-out-degree').textContent = node.outDegree;

        document.getElementById('detail-abstract-text').textContent = node.abstract || '-';

        const outgoing = this.edges.filter(e => e.source.id === node.id);
        const incoming = this.edges.filter(e => e.target.id === node.id);

        document.getElementById('outgoing-list').innerHTML = outgoing.length > 0
            ? outgoing.map(e => `
                <li class="connection-item" data-node="${e.target.id}">
                    ${e.target.author.split(',')[0]} (${e.target.year})
                </li>
            `).join('')
            : '<li class="no-connections">Keine ausgehenden Zitationen</li>';

        document.getElementById('incoming-list').innerHTML = incoming.length > 0
            ? incoming.map(e => `
                <li class="connection-item" data-node="${e.source.id}">
                    ${e.source.author.split(',')[0]} (${e.source.year})
                </li>
            `).join('')
            : '<li class="no-connections">Keine eingehenden Zitationen</li>';

        document.querySelectorAll('.connection-item').forEach(item => {
            item.addEventListener('click', () => {
                this.selectNode(item.dataset.node);
            });
        });
    }

    updateStats() {
        const visibleNodes = this.nodes.filter(n => n.visible);
        const visibleEdges = this.edges.filter(e => e.visible);

        document.getElementById('stat-nodes').textContent = visibleNodes.length;
        document.getElementById('stat-edges').textContent = visibleEdges.length;

        const n = visibleNodes.length;
        const maxEdges = n * (n - 1);
        const density = maxEdges > 0 ? (visibleEdges.length / maxEdges).toFixed(3) : 0;
        document.getElementById('stat-density').textContent = density;

        document.getElementById('visible-nodes').textContent = visibleNodes.length;
    }
}

export default AdaptiveNavigator;
