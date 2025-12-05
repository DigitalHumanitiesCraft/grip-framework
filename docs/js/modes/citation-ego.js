/**
 * Citation Ego-Netzwerk-Modus
 *
 * Radiales Layout mit einer Fokus-Publikation im Zentrum
 *
 * Benötigte Daten: publications[], citations[]
 * Wissensbasis: 15-MODI#Citation-Ego-Netzwerk
 */

class CitationEgo {
    constructor(containerId, dataPath) {
        this.container = document.getElementById(containerId);
        this.dataPath = dataPath || '../data/navigator-citations.json';
        this.data = null;
        this.publications = [];
        this.citations = [];
        this.focusPub = null;
        this.depth = 1;
        this.showCites = true;
        this.showCitedBy = true;
        this.selectedNeighbor = null;
        this.egoNetwork = { nodes: [], edges: [] };

        this.init();
    }

    async init() {
        try {
            const response = await fetch(this.dataPath);
            this.data = await response.json();
            this.prepareData();
            this.render();
            this.bindEvents();
            this.bindKeyboard();
        } catch (error) {
            console.error('Fehler beim Laden der Daten:', error);
        }
    }

    prepareData() {
        this.publications = this.data.publications || [];
        this.citations = this.data.citations || [];

        // Erste Publikation als Default-Fokus
        if (this.publications.length > 0 && !this.focusPub) {
            this.focusPub = this.publications[0].id;
        }
    }

    render() {
        if (!this.data) return;

        this.renderFocusSelector();
        this.buildEgoNetwork();
        this.renderGraph();
        this.updateStats();
        this.showFocusDetail();
    }

    renderFocusSelector() {
        const select = document.getElementById('focus-publication');
        if (!select) return;

        select.innerHTML = this.publications.map(pub =>
            `<option value="${pub.id}" ${pub.id === this.focusPub ? 'selected' : ''}>
                ${this.truncate(pub.title, 50)} (${pub.year})
            </option>`
        ).join('');
    }

    buildEgoNetwork() {
        if (!this.focusPub) return;

        const nodes = new Map();
        const edges = [];

        // Fokus-Knoten
        const focusNode = this.publications.find(p => p.id === this.focusPub);
        if (!focusNode) return;

        nodes.set(this.focusPub, {
            ...focusNode,
            level: 0,
            type: 'focus'
        });

        // Level 1: Direkte Verbindungen
        if (this.showCites) {
            // Publikationen, die der Fokus zitiert
            this.citations
                .filter(c => c.source === this.focusPub)
                .forEach(c => {
                    const target = this.publications.find(p => p.id === c.target);
                    if (target && !nodes.has(c.target)) {
                        nodes.set(c.target, { ...target, level: 1, type: 'cites' });
                    }
                    edges.push({ source: this.focusPub, target: c.target, type: 'cites' });
                });
        }

        if (this.showCitedBy) {
            // Publikationen, die den Fokus zitieren
            this.citations
                .filter(c => c.target === this.focusPub)
                .forEach(c => {
                    const source = this.publications.find(p => p.id === c.source);
                    if (source && !nodes.has(c.source)) {
                        nodes.set(c.source, { ...source, level: 1, type: 'cited-by' });
                    }
                    edges.push({ source: c.source, target: this.focusPub, type: 'cited-by' });
                });
        }

        // Level 2: Indirekte Verbindungen (wenn depth === 2)
        if (this.depth === 2) {
            const level1Ids = Array.from(nodes.keys()).filter(id => nodes.get(id).level === 1);

            level1Ids.forEach(nodeId => {
                // Zitiert von Level-1-Knoten
                if (this.showCites) {
                    this.citations
                        .filter(c => c.source === nodeId)
                        .forEach(c => {
                            const target = this.publications.find(p => p.id === c.target);
                            if (target && !nodes.has(c.target)) {
                                nodes.set(c.target, { ...target, level: 2, type: 'cites-2' });
                            }
                            if (nodes.has(c.target)) {
                                edges.push({ source: nodeId, target: c.target, type: 'cites' });
                            }
                        });
                }

                // Zitiert Level-1-Knoten
                if (this.showCitedBy) {
                    this.citations
                        .filter(c => c.target === nodeId)
                        .forEach(c => {
                            const source = this.publications.find(p => p.id === c.source);
                            if (source && !nodes.has(c.source)) {
                                nodes.set(c.source, { ...source, level: 2, type: 'cited-by-2' });
                            }
                            if (nodes.has(c.source)) {
                                edges.push({ source: c.source, target: nodeId, type: 'cited-by' });
                            }
                        });
                }
            });
        }

        // Co-Citation-Kanten finden (Publikationen, die gemeinsam zitiert werden)
        const level1Cites = Array.from(nodes.keys())
            .filter(id => nodes.get(id).type === 'cites');

        for (let i = 0; i < level1Cites.length; i++) {
            for (let j = i + 1; j < level1Cites.length; j++) {
                // Prüfen, ob beide von derselben Quelle zitiert werden
                const commonSources = this.citations.filter(c =>
                    c.target === level1Cites[i]
                ).map(c => c.source).filter(src =>
                    this.citations.some(c => c.source === src && c.target === level1Cites[j])
                );

                if (commonSources.length > 0) {
                    edges.push({
                        source: level1Cites[i],
                        target: level1Cites[j],
                        type: 'co-citation'
                    });
                }
            }
        }

        this.egoNetwork = {
            nodes: Array.from(nodes.values()),
            edges: edges
        };
    }

    renderGraph() {
        const svg = document.getElementById('ego-graph');
        if (!svg) return;

        const container = document.getElementById('ego-container');
        const width = container?.clientWidth || 600;
        const height = container?.clientHeight || 450;

        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

        const centerX = width / 2;
        const centerY = height / 2;

        // Cluster-Farben
        const clusterColors = {};
        (this.data.clusters || []).forEach(c => {
            clusterColors[c.id] = c.color;
        });

        // Positionen berechnen (radiales Layout)
        const positions = {};
        const level1Nodes = this.egoNetwork.nodes.filter(n => n.level === 1);
        const level2Nodes = this.egoNetwork.nodes.filter(n => n.level === 2);

        // Fokus im Zentrum
        const focusNode = this.egoNetwork.nodes.find(n => n.level === 0);
        if (focusNode) {
            positions[focusNode.id] = { x: centerX, y: centerY };
        }

        // Level 1 im inneren Ring
        const radius1 = Math.min(width, height) * 0.25;
        level1Nodes.forEach((node, i) => {
            const angle = (2 * Math.PI * i) / level1Nodes.length - Math.PI / 2;
            positions[node.id] = {
                x: centerX + radius1 * Math.cos(angle),
                y: centerY + radius1 * Math.sin(angle)
            };
        });

        // Level 2 im äußeren Ring
        const radius2 = Math.min(width, height) * 0.4;
        level2Nodes.forEach((node, i) => {
            const angle = (2 * Math.PI * i) / level2Nodes.length - Math.PI / 2;
            positions[node.id] = {
                x: centerX + radius2 * Math.cos(angle),
                y: centerY + radius2 * Math.sin(angle)
            };
        });

        // Kanten zeichnen
        const edgesHtml = this.egoNetwork.edges.map(edge => {
            const source = positions[edge.source];
            const target = positions[edge.target];
            if (!source || !target) return '';

            return `
                <line class="ego-edge ${edge.type}"
                      x1="${source.x}" y1="${source.y}"
                      x2="${target.x}" y2="${target.y}"
                      data-source="${edge.source}"
                      data-target="${edge.target}"/>
            `;
        }).join('');

        // Knoten zeichnen
        const nodesHtml = this.egoNetwork.nodes.map(node => {
            const pos = positions[node.id];
            if (!pos) return '';

            const color = clusterColors[node.cluster] || '#888';
            const radius = node.level === 0 ? 20 : (node.level === 1 ? 12 : 8);
            const isCenter = node.level === 0;
            const isSelected = this.selectedNeighbor === node.id;

            return `
                <g class="${isCenter ? 'ego-center' : 'ego-node'} ${isSelected ? 'selected' : ''}"
                   data-node="${node.id}"
                   transform="translate(${pos.x}, ${pos.y})">
                    <circle r="${radius}" fill="${color}"/>
                    <text dy="${radius + 15}" text-anchor="middle"
                          class="${isCenter ? 'ego-center-label' : 'ego-label'}">
                        ${this.truncate(node.title, isCenter ? 25 : 15)}
                    </text>
                </g>
            `;
        }).join('');

        svg.innerHTML = `
            <g class="ego-edges">${edgesHtml}</g>
            <g class="ego-nodes">${nodesHtml}</g>
        `;
    }

    updateStats() {
        const cites = this.egoNetwork.edges.filter(e => e.type === 'cites').length;
        const citedBy = this.egoNetwork.edges.filter(e => e.type === 'cited-by').length;
        const coCitation = this.egoNetwork.edges.filter(e => e.type === 'co-citation').length;

        document.getElementById('stat-cites').textContent = cites;
        document.getElementById('stat-cited-by').textContent = citedBy;
        document.getElementById('stat-co-citation').textContent = coCitation;
    }

    showFocusDetail() {
        const pub = this.publications.find(p => p.id === this.focusPub);
        if (!pub) return;

        document.getElementById('focus-title').textContent = pub.title;
        document.getElementById('focus-authors').textContent = (pub.authors || []).join(', ');
        document.getElementById('focus-year').textContent = pub.year;
        document.getElementById('focus-abstract').textContent = pub.abstract || 'Kein Abstract verfügbar.';
    }

    selectNeighbor(nodeId) {
        if (nodeId === this.focusPub) {
            this.selectedNeighbor = null;
            document.getElementById('neighbor-section')?.classList.add('hidden');
            this.renderGraph();
            return;
        }

        this.selectedNeighbor = nodeId;
        this.renderGraph();
        this.showNeighborDetail(nodeId);
    }

    showNeighborDetail(nodeId) {
        const pub = this.publications.find(p => p.id === nodeId);
        const node = this.egoNetwork.nodes.find(n => n.id === nodeId);
        if (!pub || !node) return;

        const section = document.getElementById('neighbor-section');
        section?.classList.remove('hidden');

        document.getElementById('neighbor-title').textContent = pub.title;
        document.getElementById('neighbor-authors').textContent = (pub.authors || []).join(', ');

        // Beziehung beschreiben
        let relation = '';
        if (node.type === 'cites') {
            relation = 'Wird zitiert von Fokus-Publikation';
        } else if (node.type === 'cited-by') {
            relation = 'Zitiert die Fokus-Publikation';
        } else if (node.type.includes('-2')) {
            relation = '2. Grad Verbindung';
        }

        document.getElementById('neighbor-relation').textContent = relation;
    }

    setFocus(pubId) {
        this.focusPub = pubId;
        this.selectedNeighbor = null;
        document.getElementById('neighbor-section')?.classList.add('hidden');
        this.buildEgoNetwork();
        this.renderGraph();
        this.updateStats();
        this.showFocusDetail();
    }

    setDepth(depth) {
        this.depth = depth;

        // UI aktualisieren
        document.querySelectorAll('.depth-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.depth) === depth);
        });

        this.buildEgoNetwork();
        this.renderGraph();
        this.updateStats();
    }

    truncate(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    bindEvents() {
        // Fokus-Auswahl
        document.getElementById('focus-publication')?.addEventListener('change', (e) => {
            this.setFocus(e.target.value);
        });

        // Tiefe
        document.querySelectorAll('.depth-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setDepth(parseInt(btn.dataset.depth));
            });
        });

        // Richtungsfilter
        document.getElementById('show-cites')?.addEventListener('change', (e) => {
            this.showCites = e.target.checked;
            this.buildEgoNetwork();
            this.renderGraph();
            this.updateStats();
        });

        document.getElementById('show-cited-by')?.addEventListener('change', (e) => {
            this.showCitedBy = e.target.checked;
            this.buildEgoNetwork();
            this.renderGraph();
            this.updateStats();
        });

        // Node-Klick
        document.getElementById('ego-graph')?.addEventListener('click', (e) => {
            const nodeEl = e.target.closest('.ego-node, .ego-center');
            if (nodeEl) {
                const nodeId = nodeEl.dataset.node;
                if (nodeId !== this.focusPub) {
                    this.selectNeighbor(nodeId);
                }
            }
        });

        // Doppelklick zum Fokus wechseln
        document.getElementById('ego-graph')?.addEventListener('dblclick', (e) => {
            const nodeEl = e.target.closest('.ego-node');
            if (nodeEl) {
                this.setFocus(nodeEl.dataset.node);
                document.getElementById('focus-publication').value = nodeEl.dataset.node;
            }
        });
    }

    bindKeyboard() {
        document.addEventListener('keydown', (e) => {
            // Modi-Wechsel
            if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '4') {
                e.preventDefault();
                const modes = ['netzwerk', 'timeline', 'bibliometrie', 'ego'];
                window.location.href = `${modes[parseInt(e.key) - 1]}.html`;
            }

            // Tiefe wechseln
            if (e.key === '1') {
                this.setDepth(1);
            }
            if (e.key === '2') {
                this.setDepth(2);
            }

            // Nachbarn durchschalten
            if (e.key === 'Tab') {
                e.preventDefault();
                this.navigateNeighbors(e.shiftKey ? -1 : 1);
            }
        });
    }

    navigateNeighbors(direction) {
        const neighbors = this.egoNetwork.nodes.filter(n => n.level > 0);
        if (neighbors.length === 0) return;

        const currentIndex = neighbors.findIndex(n => n.id === this.selectedNeighbor);
        let newIndex = currentIndex + direction;

        if (newIndex < 0) newIndex = neighbors.length - 1;
        if (newIndex >= neighbors.length) newIndex = 0;

        this.selectNeighbor(neighbors[newIndex].id);
    }
}

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    new CitationEgo('ego-graph');
});

export default CitationEgo;
