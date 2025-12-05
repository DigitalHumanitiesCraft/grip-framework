/**
 * Citation Bibliometrie-Modus
 *
 * Sortierbare Metriken-Tabelle mit Export-Funktionen
 *
 * Benötigte Daten: publications[], citations[]
 * Wissensbasis: 15-MODI#Citation-Bibliometrie
 */

class CitationBibliometrie {
    constructor(containerId, dataPath) {
        this.container = document.getElementById(containerId);
        this.dataPath = dataPath || '../data/navigator-citations.json';
        this.data = null;
        this.publications = [];
        this.filteredPubs = [];
        this.sortColumn = 'citations';
        this.sortDirection = 'desc';
        this.searchTerm = '';
        this.clusterFilter = 'all';
        this.selectedPubs = new Set();
        this.visibleMetrics = new Set(['citations', 'in_degree', 'out_degree']);

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
        const citations = this.data.citations || [];

        this.publications = (this.data.publications || []).map(pub => {
            const inDegree = citations.filter(c => c.target === pub.id).length;
            const outDegree = citations.filter(c => c.source === pub.id).length;

            return {
                ...pub,
                in_degree: inDegree,
                out_degree: outDegree,
                citations: pub.citations_received || 0
            };
        });

        this.filteredPubs = [...this.publications];
        this.applySort();
    }

    render() {
        if (!this.data) return;

        this.renderClusterFilter();
        this.renderTable();
        this.updateStats();
    }

    renderClusterFilter() {
        const select = document.getElementById('filter-cluster');
        if (!select) return;

        const clusters = this.data.clusters || [];
        select.innerHTML = `
            <option value="all">Alle</option>
            ${clusters.map(c => `<option value="${c.id}">${c.label}</option>`).join('')}
        `;
    }

    applyFilters() {
        this.filteredPubs = this.publications.filter(pub => {
            // Cluster-Filter
            if (this.clusterFilter !== 'all' && pub.cluster !== this.clusterFilter) {
                return false;
            }

            // Suchfilter
            if (this.searchTerm) {
                const term = this.searchTerm.toLowerCase();
                const matchTitle = pub.title?.toLowerCase().includes(term);
                const matchAuthors = pub.authors?.some(a => a.toLowerCase().includes(term));
                if (!matchTitle && !matchAuthors) return false;
            }

            return true;
        });

        this.applySort();
    }

    applySort() {
        this.filteredPubs.sort((a, b) => {
            let valA = a[this.sortColumn];
            let valB = b[this.sortColumn];

            // String-Vergleich für Textspalten
            if (this.sortColumn === 'title' || this.sortColumn === 'cluster') {
                valA = valA || '';
                valB = valB || '';
                return this.sortDirection === 'asc'
                    ? valA.localeCompare(valB)
                    : valB.localeCompare(valA);
            }

            // Autoren als String
            if (this.sortColumn === 'authors') {
                valA = (valA || []).join(', ');
                valB = (valB || []).join(', ');
                return this.sortDirection === 'asc'
                    ? valA.localeCompare(valB)
                    : valB.localeCompare(valA);
            }

            // Numerischer Vergleich
            valA = valA || 0;
            valB = valB || 0;
            return this.sortDirection === 'asc' ? valA - valB : valB - valA;
        });
    }

    renderTable() {
        const tbody = document.getElementById('metrics-tbody');
        if (!tbody) return;

        // Header-Sortierung aktualisieren
        document.querySelectorAll('.metrics-table th').forEach(th => {
            th.classList.remove('sortable');
            if (th.dataset.sort === this.sortColumn) {
                th.classList.add('sortable');
                th.innerHTML = th.innerHTML.replace(/ [↑↓]$/, '') +
                    (this.sortDirection === 'asc' ? ' ↑' : ' ↓');
            }
        });

        const clusterColors = {};
        (this.data.clusters || []).forEach(c => {
            clusterColors[c.id] = c.color;
        });

        tbody.innerHTML = this.filteredPubs.map(pub => {
            const isSelected = this.selectedPubs.has(pub.id);
            const cluster = this.data.clusters?.find(c => c.id === pub.cluster);
            const isHighImpact = pub.citations > 100;

            return `
                <tr class="${isSelected ? 'selected' : ''}" data-pub="${pub.id}">
                    <td class="pub-title">
                        <span class="pub-title-text" title="${pub.title}">${pub.title}</span>
                    </td>
                    <td class="pub-authors" title="${(pub.authors || []).join(', ')}">
                        ${(pub.authors || []).slice(0, 2).join(', ')}${pub.authors?.length > 2 ? ' et al.' : ''}
                    </td>
                    <td class="numeric">${pub.year || '-'}</td>
                    <td class="numeric ${isHighImpact ? 'high-impact' : ''}">${pub.citations.toLocaleString()}</td>
                    <td class="numeric">${pub.in_degree}</td>
                    <td class="numeric">${pub.out_degree}</td>
                    <td>
                        <span class="cluster-badge" style="background: ${clusterColors[pub.cluster] || '#ddd'}20; color: ${clusterColors[pub.cluster] || '#666'}">
                            ${cluster?.label || pub.cluster}
                        </span>
                    </td>
                </tr>
            `;
        }).join('');
    }

    updateStats() {
        const pubs = this.filteredPubs;

        const totalCitations = pubs.reduce((sum, p) => sum + (p.citations || 0), 0);
        const avgCitations = pubs.length > 0 ? totalCitations / pubs.length : 0;
        const maxCitations = pubs.length > 0 ? Math.max(...pubs.map(p => p.citations || 0)) : 0;

        document.getElementById('stat-total-citations').textContent = totalCitations.toLocaleString();
        document.getElementById('stat-avg-citations').textContent = avgCitations.toFixed(1);
        document.getElementById('stat-max-citations').textContent = maxCitations.toLocaleString();
    }

    selectPublication(pubId, addToSelection = false) {
        if (addToSelection) {
            if (this.selectedPubs.has(pubId)) {
                this.selectedPubs.delete(pubId);
            } else {
                this.selectedPubs.add(pubId);
            }
        } else {
            this.selectedPubs.clear();
            this.selectedPubs.add(pubId);
        }

        this.renderTable();
        this.showTrend(pubId);
        this.updateComparison();
    }

    showTrend(pubId) {
        const pub = this.publications.find(p => p.id === pubId);
        if (!pub) return;

        const prompt = document.getElementById('trend-prompt');
        const info = document.getElementById('trend-info');

        prompt?.classList.add('hidden');
        info?.classList.remove('hidden');

        document.getElementById('trend-title').textContent = this.truncate(pub.title, 50);

        // Simulierter Trend (in echten Daten wäre das eine Zeitreihe)
        const trendGraph = document.getElementById('trend-graph');
        if (trendGraph) {
            const bars = [];
            const baseYear = pub.year || 2010;
            for (let i = 0; i < 10; i++) {
                const height = Math.random() * 80 + 10;
                bars.push(`<div class="trend-bar" style="height: ${height}%"></div>`);
            }
            trendGraph.innerHTML = bars.join('');
        }

        document.getElementById('trend-summary').textContent =
            `${pub.citations} Zitationen seit ${pub.year}. Durchschnitt: ${(pub.citations / Math.max(1, 2024 - pub.year)).toFixed(1)}/Jahr.`;
    }

    updateComparison() {
        const list = document.getElementById('comparison-list');
        if (!list) return;

        if (this.selectedPubs.size === 0) {
            list.innerHTML = '<p class="empty">Keine Auswahl</p>';
            return;
        }

        list.innerHTML = Array.from(this.selectedPubs).map(pubId => {
            const pub = this.publications.find(p => p.id === pubId);
            if (!pub) return '';

            return `
                <div class="comparison-item" data-pub="${pubId}">
                    <span>${this.truncate(pub.title, 25)}</span>
                    <span class="remove">×</span>
                </div>
            `;
        }).join('');
    }

    truncate(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    exportCSV() {
        const headers = ['Titel', 'Autoren', 'Jahr', 'Zitationen', 'In-Degree', 'Out-Degree', 'Cluster'];
        const rows = this.filteredPubs.map(pub => [
            `"${(pub.title || '').replace(/"/g, '""')}"`,
            `"${(pub.authors || []).join('; ')}"`,
            pub.year || '',
            pub.citations || 0,
            pub.in_degree || 0,
            pub.out_degree || 0,
            pub.cluster || ''
        ]);

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        this.downloadFile(csv, 'citations.csv', 'text/csv');
    }

    exportBibTeX() {
        const entries = this.filteredPubs.map(pub => {
            const key = pub.id.replace(/[^a-zA-Z0-9]/g, '');
            const authors = (pub.authors || []).join(' and ');

            return `@article{${key},
  author = {${authors}},
  title = {${pub.title || ''}},
  year = {${pub.year || ''}},
  journal = {${pub.venue || ''}},
  note = {Cited by ${pub.citations || 0}}
}`;
        });

        this.downloadFile(entries.join('\n\n'), 'citations.bib', 'text/plain');
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    bindEvents() {
        // Suche
        document.getElementById('search-publications')?.addEventListener('input', (e) => {
            this.searchTerm = e.target.value;
            this.applyFilters();
            this.renderTable();
            this.updateStats();
        });

        // Cluster-Filter
        document.getElementById('filter-cluster')?.addEventListener('change', (e) => {
            this.clusterFilter = e.target.value;
            this.applyFilters();
            this.renderTable();
            this.updateStats();
        });

        // Metriken-Checkboxen
        document.querySelectorAll('.metric-selector input').forEach(input => {
            input.addEventListener('change', (e) => {
                const metric = e.target.dataset.metric;
                if (e.target.checked) {
                    this.visibleMetrics.add(metric);
                } else {
                    this.visibleMetrics.delete(metric);
                }
                // TODO: Spalten ein-/ausblenden
            });
        });

        // Tabellen-Sortierung
        document.querySelectorAll('.metrics-table th[data-sort]').forEach(th => {
            th.addEventListener('click', () => {
                const column = th.dataset.sort;
                if (this.sortColumn === column) {
                    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    this.sortColumn = column;
                    this.sortDirection = 'desc';
                }
                this.applySort();
                this.renderTable();
            });
        });

        // Zeilen-Klick
        document.getElementById('metrics-tbody')?.addEventListener('click', (e) => {
            const row = e.target.closest('tr[data-pub]');
            if (row) {
                this.selectPublication(row.dataset.pub, e.shiftKey);
            }
        });

        // Vergleichs-Liste entfernen
        document.getElementById('comparison-list')?.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove')) {
                const item = e.target.closest('.comparison-item');
                if (item) {
                    this.selectedPubs.delete(item.dataset.pub);
                    this.renderTable();
                    this.updateComparison();
                }
            }
        });

        // Export
        document.getElementById('export-csv')?.addEventListener('click', () => this.exportCSV());
        document.getElementById('export-bibtex')?.addEventListener('click', () => this.exportBibTeX());
    }

    bindKeyboard() {
        document.addEventListener('keydown', (e) => {
            // Modi-Wechsel
            if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '4') {
                e.preventDefault();
                const modes = ['netzwerk', 'timeline', 'bibliometrie', 'ego'];
                window.location.href = `${modes[parseInt(e.key) - 1]}.html`;
            }

            // Suche fokussieren
            if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
                e.preventDefault();
                document.getElementById('search-publications')?.focus();
            }

            // Navigation
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                if (document.activeElement?.id !== 'search-publications') {
                    e.preventDefault();
                    this.navigateRows(e.key === 'ArrowDown' ? 1 : -1);
                }
            }
        });
    }

    navigateRows(direction) {
        const rows = document.querySelectorAll('#metrics-tbody tr');
        const currentIndex = Array.from(rows).findIndex(r => r.classList.contains('selected'));

        let newIndex = currentIndex + direction;
        if (newIndex < 0) newIndex = rows.length - 1;
        if (newIndex >= rows.length) newIndex = 0;

        const newRow = rows[newIndex];
        if (newRow) {
            this.selectPublication(newRow.dataset.pub);
            newRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    new CitationBibliometrie('metrics-table');
});

export default CitationBibliometrie;
