/**
 * Citation Timeline-Modus
 *
 * Chronologische Darstellung mit Zitationslinien
 *
 * Benötigte Daten: publications[] mit year, citations[]
 * Wissensbasis: 15-MODI#Citation-Timeline
 */

class CitationTimeline {
    constructor(containerId, dataPath) {
        this.container = document.getElementById(containerId);
        this.dataPath = dataPath || '../data/navigator-citations.json';
        this.data = null;
        this.publications = [];
        this.citations = [];
        this.yearFrom = 1960;
        this.yearTo = 2020;
        this.activeCluster = new Set();
        this.showCitations = true;
        this.highlightPath = false;
        this.selectedNode = null;

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

        // Zeitraum ermitteln
        const years = this.publications.map(p => p.year);
        this.yearFrom = Math.min(...years) - 2;
        this.yearTo = Math.max(...years) + 2;

        // Alle Cluster aktiv
        this.activeCluster = new Set((this.data.clusters || []).map(c => c.id));

        // Inputs setzen
        document.getElementById('year-from').value = this.yearFrom;
        document.getElementById('year-to').value = this.yearTo;
    }

    render() {
        if (!this.data) return;

        this.renderClusterCheckboxes();
        this.renderTimeline();
        this.updateStats();
    }

    renderClusterCheckboxes() {
        const container = document.getElementById('cluster-checkboxes');
        if (!container) return;

        container.innerHTML = (this.data.clusters || []).map(cluster => `
            <label class="checkbox-label">
                <input type="checkbox" data-cluster="${cluster.id}"
                       ${this.activeCluster.has(cluster.id) ? 'checked' : ''}>
                <span class="cluster-dot" style="background: ${cluster.color}"></span>
                ${cluster.label}
            </label>
        `).join('');
    }

    renderTimeline() {
        this.renderAxis();
        this.renderGraph();
    }

    renderAxis() {
        const axis = document.getElementById('timeline-axis');
        if (!axis) return;

        const years = [];
        for (let y = this.yearFrom; y <= this.yearTo; y += 5) {
            years.push(y);
        }

        axis.innerHTML = years.map(year => {
            const pos = this.yearToPercent(year);
            return `<div class="axis-marker" style="left: ${pos}%">${year}</div>`;
        }).join('');
    }

    renderGraph() {
        const container = document.getElementById('timeline-graph');
        if (!container) return;

        const clusterColors = {};
        (this.data.clusters || []).forEach(c => {
            clusterColors[c.id] = c.color;
        });

        // Filtern
        const filtered = this.publications.filter(p =>
            p.year >= this.yearFrom &&
            p.year <= this.yearTo &&
            this.activeCluster.has(p.cluster)
        );

        // Vertikale Positionen (nach Cluster gruppieren)
        const clusterRows = {};
        let rowIndex = 0;
        (this.data.clusters || []).forEach(c => {
            if (this.activeCluster.has(c.id)) {
                clusterRows[c.id] = rowIndex++;
            }
        });
        const totalRows = rowIndex || 1;

        // SVG für Verbindungslinien
        let svgLines = '';
        if (this.showCitations) {
            this.citations.forEach(cit => {
                const source = filtered.find(p => p.id === cit.source);
                const target = filtered.find(p => p.id === cit.target);
                if (!source || !target) return;

                const x1 = this.yearToPercent(source.year);
                const y1 = ((clusterRows[source.cluster] + 0.5) / totalRows) * 100;
                const x2 = this.yearToPercent(target.year);
                const y2 = ((clusterRows[target.cluster] + 0.5) / totalRows) * 100;

                const isHighlighted = this.highlightPath &&
                    (this.selectedNode === cit.source || this.selectedNode === cit.target);

                svgLines += `
                    <line class="citation-line ${isHighlighted ? 'highlighted' : ''}"
                          x1="${x1}%" y1="${y1}%"
                          x2="${x2}%" y2="${y2}%"
                          data-source="${cit.source}"
                          data-target="${cit.target}"/>
                `;
            });
        }

        // Nodes
        const nodesHtml = filtered.map(pub => {
            const x = this.yearToPercent(pub.year);
            const y = ((clusterRows[pub.cluster] + 0.5) / totalRows) * 100;
            const color = clusterColors[pub.cluster] || '#888';
            const isSelected = this.selectedNode === pub.id;

            return `
                <div class="timeline-node ${isSelected ? 'selected' : ''}"
                     data-node="${pub.id}"
                     style="left: ${x}%; top: ${y}%; background: ${color}">
                    <span class="node-year">${pub.year}</span>
                    <span class="node-title">${this.truncate(pub.title, 30)}</span>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <svg class="citation-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
                ${svgLines}
            </svg>
            <div class="timeline-nodes">
                ${nodesHtml}
            </div>
        `;
    }

    yearToPercent(year) {
        const range = this.yearTo - this.yearFrom;
        return ((year - this.yearFrom) / range) * 100;
    }

    updateStats() {
        const filtered = this.publications.filter(p =>
            p.year >= this.yearFrom &&
            p.year <= this.yearTo &&
            this.activeCluster.has(p.cluster)
        );

        document.getElementById('stat-range').textContent = `${this.yearFrom}–${this.yearTo}`;
        document.getElementById('stat-count').textContent = filtered.length;
    }

    selectNode(nodeId) {
        this.selectedNode = nodeId;
        this.renderGraph();
        this.showNodeDetail(nodeId);
    }

    showNodeDetail(nodeId) {
        const pub = this.publications.find(p => p.id === nodeId);
        if (!pub) return;

        const prompt = document.getElementById('node-prompt');
        const info = document.getElementById('node-info');

        prompt?.classList.add('hidden');
        info?.classList.remove('hidden');

        document.getElementById('node-title').textContent = pub.title;
        document.getElementById('node-authors').textContent = pub.authors?.join(', ') || '-';
        document.getElementById('node-year').textContent = pub.year;
        document.getElementById('node-citations').textContent = pub.citations_received?.toLocaleString() || '-';
        document.getElementById('node-abstract').textContent = pub.abstract || '-';
    }

    truncate(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    bindEvents() {
        // Zeitraum-Filter
        document.getElementById('year-from')?.addEventListener('change', (e) => {
            this.yearFrom = parseInt(e.target.value);
            this.render();
        });

        document.getElementById('year-to')?.addEventListener('change', (e) => {
            this.yearTo = parseInt(e.target.value);
            this.render();
        });

        // Cluster-Filter
        document.getElementById('cluster-checkboxes')?.addEventListener('change', (e) => {
            const checkbox = e.target;
            if (checkbox.type === 'checkbox') {
                const cluster = checkbox.dataset.cluster;
                if (checkbox.checked) {
                    this.activeCluster.add(cluster);
                } else {
                    this.activeCluster.delete(cluster);
                }
                this.render();
            }
        });

        // Verbindungen
        document.getElementById('show-citations')?.addEventListener('change', (e) => {
            this.showCitations = e.target.checked;
            this.renderGraph();
        });

        document.getElementById('highlight-path')?.addEventListener('change', (e) => {
            this.highlightPath = e.target.checked;
            this.renderGraph();
        });

        // Node-Klick
        document.getElementById('timeline-graph')?.addEventListener('click', (e) => {
            const node = e.target.closest('.timeline-node');
            if (node) {
                this.selectNode(node.dataset.node);
            }
        });
    }

    bindKeyboard() {
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '4') {
                e.preventDefault();
                const modes = ['netzwerk', 'timeline', 'bibliometrie', 'ego'];
                window.location.href = `${modes[parseInt(e.key) - 1]}.html`;
            }

            if (e.key === 'ArrowLeft') {
                this.yearFrom -= 5;
                this.yearTo -= 5;
                document.getElementById('year-from').value = this.yearFrom;
                document.getElementById('year-to').value = this.yearTo;
                this.render();
            }

            if (e.key === 'ArrowRight') {
                this.yearFrom += 5;
                this.yearTo += 5;
                document.getElementById('year-from').value = this.yearFrom;
                document.getElementById('year-to').value = this.yearTo;
                this.render();
            }
        });
    }
}

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    new CitationTimeline('timeline-graph');
});

export default CitationTimeline;
