/**
 * Survey Verteilungs-Modus
 *
 * Histogramme und deskriptive Statistik mit Subgruppen-Vergleich
 *
 * Benötigte Daten: respondents[], items[]
 * Wissensbasis: 15-MODI#Survey-Verteilung, 12-STANDARDS#DDI
 */

class SurveyVerteilung {
    constructor(containerId, dataPath) {
        this.container = document.getElementById(containerId);
        this.dataPath = dataPath || '../data/scope-survey.json';
        this.data = null;
        this.filteredData = null;
        this.filters = {
            department: 'all',
            age_group: 'all',
            remote_days: 5
        };
        this.compareBy = 'none';
        this.viewMode = 'bars';
        this.selectedVariable = null;

        this.init();
    }

    async init() {
        try {
            const response = await fetch(this.dataPath);
            this.data = await response.json();
            this.filteredData = [...(this.data.respondents || [])];
            this.render();
            this.bindEvents();
            this.bindKeyboard();
        } catch (error) {
            console.error('Fehler beim Laden der Daten:', error);
        }
    }

    render() {
        if (!this.data) return;

        this.renderFilterOptions();
        this.applyFilters();
        this.renderHistograms();
        this.updateStats();
    }

    renderFilterOptions() {
        // Abteilungen
        const deptSelect = document.getElementById('filter-department');
        if (deptSelect) {
            const departments = [...new Set(this.data.respondents?.map(r => r.department) || [])];
            deptSelect.innerHTML = `
                <option value="all">Alle</option>
                ${departments.map(d => `<option value="${d}">${d}</option>`).join('')}
            `;
        }

        // Altersgruppen
        const ageSelect = document.getElementById('filter-age');
        if (ageSelect) {
            const ageGroups = [...new Set(this.data.respondents?.map(r => r.age_group) || [])];
            ageSelect.innerHTML = `
                <option value="all">Alle</option>
                ${ageGroups.map(a => `<option value="${a}">${a}</option>`).join('')}
            `;
        }
    }

    applyFilters() {
        this.filteredData = (this.data.respondents || []).filter(r => {
            if (this.filters.department !== 'all' && r.department !== this.filters.department) {
                return false;
            }
            if (this.filters.age_group !== 'all' && r.age_group !== this.filters.age_group) {
                return false;
            }
            if (r.remote_days > this.filters.remote_days) {
                return false;
            }
            return true;
        });

        this.updateStats();
    }

    updateStats() {
        const filtered = document.getElementById('stat-filtered');
        const total = document.getElementById('stat-total');

        if (filtered) filtered.textContent = this.filteredData.length;
        if (total) total.textContent = this.data.respondents?.length || 0;
    }

    renderHistograms() {
        const container = document.getElementById('histogram-grid');
        if (!container) return;

        const items = this.data.items?.filter(i => i.type === 'likert') || [];

        container.innerHTML = items.map(item =>
            this.renderHistogram(item)
        ).join('');
    }

    renderHistogram(item) {
        const values = this.filteredData
            .map(r => r[item.id])
            .filter(v => v !== undefined && v !== null);

        const stats = this.calculateStats(values);
        const freq = this.calculateFrequencies(values, item.scale);

        const isSelected = this.selectedVariable === item.id;

        return `
            <div class="histogram-card ${isSelected ? 'selected' : ''}"
                 data-variable="${item.id}">
                <div class="histogram-header">
                    <h3>${this.truncateText(item.text, 50)}</h3>
                    <code>${item.id}</code>
                </div>
                <div class="histogram-chart">
                    ${this.renderBars(freq, item.scale, values.length)}
                </div>
                <div class="histogram-stats">
                    <span>M = ${stats.mean.toFixed(2)}</span>
                    <span>SD = ${stats.sd.toFixed(2)}</span>
                    <span>n = ${values.length}</span>
                </div>
            </div>
        `;
    }

    renderBars(freq, scale, total) {
        const maxFreq = Math.max(...Object.values(freq), 1);

        let bars = '';
        for (let i = scale.min; i <= scale.max; i++) {
            const count = freq[i] || 0;
            const height = (count / maxFreq) * 100;
            const percent = total > 0 ? ((count / total) * 100).toFixed(0) : 0;

            bars += `
                <div class="bar-container">
                    <div class="bar" style="height: ${height}%">
                        <span class="bar-value">${this.viewMode === 'percent' ? percent + '%' : count}</span>
                    </div>
                    <span class="bar-label">${i}</span>
                </div>
            `;
        }

        return `<div class="bars-wrapper">${bars}</div>`;
    }

    calculateStats(values) {
        if (values.length === 0) {
            return { mean: 0, sd: 0, median: 0, n: 0 };
        }

        const n = values.length;
        const mean = values.reduce((a, b) => a + b, 0) / n;
        const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / n;
        const sd = Math.sqrt(variance);

        const sorted = [...values].sort((a, b) => a - b);
        const median = n % 2 === 0
            ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
            : sorted[Math.floor(n / 2)];

        return { mean, sd, median, n };
    }

    calculateFrequencies(values, scale) {
        const freq = {};
        for (let i = scale.min; i <= scale.max; i++) {
            freq[i] = 0;
        }
        values.forEach(v => {
            if (freq[v] !== undefined) freq[v]++;
        });
        return freq;
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    selectVariable(varId) {
        this.selectedVariable = varId;

        document.querySelectorAll('.histogram-card').forEach(el => {
            el.classList.toggle('selected', el.dataset.variable === varId);
        });

        this.showVariableDetail(varId);
    }

    showVariableDetail(varId) {
        const item = this.data.items?.find(i => i.id === varId);
        if (!item) return;

        const prompt = document.getElementById('var-prompt');
        const info = document.getElementById('var-info');

        prompt?.classList.add('hidden');
        info?.classList.remove('hidden');

        document.getElementById('var-label').textContent = item.text;
        document.getElementById('var-id').textContent = item.id;

        const values = this.filteredData
            .map(r => r[varId])
            .filter(v => v !== undefined);

        const stats = this.calculateStats(values);

        document.getElementById('var-mean').textContent = stats.mean.toFixed(2);
        document.getElementById('var-sd').textContent = stats.sd.toFixed(2);
        document.getElementById('var-median').textContent = stats.median.toFixed(1);
        document.getElementById('var-n').textContent = stats.n;

        // Frequenztabelle
        this.renderFrequencyTable(varId, item.scale);
    }

    renderFrequencyTable(varId, scale) {
        const tbody = document.querySelector('#freq-table tbody');
        if (!tbody) return;

        const values = this.filteredData
            .map(r => r[varId])
            .filter(v => v !== undefined);

        const freq = this.calculateFrequencies(values, scale);
        const total = values.length;

        let rows = '';
        for (let i = scale.min; i <= scale.max; i++) {
            const count = freq[i] || 0;
            const percent = total > 0 ? ((count / total) * 100).toFixed(1) : 0;

            rows += `
                <tr>
                    <td>${i}</td>
                    <td>${count}</td>
                    <td>${percent}%</td>
                </tr>
            `;
        }

        tbody.innerHTML = rows;
    }

    bindEvents() {
        // Filter-Änderungen
        document.getElementById('filter-department')?.addEventListener('change', (e) => {
            this.filters.department = e.target.value;
            this.applyFilters();
            this.renderHistograms();
            if (this.selectedVariable) {
                this.showVariableDetail(this.selectedVariable);
            }
        });

        document.getElementById('filter-age')?.addEventListener('change', (e) => {
            this.filters.age_group = e.target.value;
            this.applyFilters();
            this.renderHistograms();
            if (this.selectedVariable) {
                this.showVariableDetail(this.selectedVariable);
            }
        });

        document.getElementById('filter-remote')?.addEventListener('input', (e) => {
            this.filters.remote_days = parseInt(e.target.value);
            document.getElementById('filter-remote-value').textContent = `0-${e.target.value}`;
            this.applyFilters();
            this.renderHistograms();
            if (this.selectedVariable) {
                this.showVariableDetail(this.selectedVariable);
            }
        });

        // Filter zurücksetzen
        document.getElementById('reset-filters')?.addEventListener('click', () => {
            this.filters = { department: 'all', age_group: 'all', remote_days: 5 };
            document.getElementById('filter-department').value = 'all';
            document.getElementById('filter-age').value = 'all';
            document.getElementById('filter-remote').value = 5;
            document.getElementById('filter-remote-value').textContent = '0-5';
            this.applyFilters();
            this.renderHistograms();
        });

        // Vergleichsgruppe
        document.getElementById('compare-by')?.addEventListener('change', (e) => {
            this.compareBy = e.target.value;
            this.renderHistograms();
        });

        // View-Mode
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.viewMode = btn.dataset.view;
                this.renderHistograms();
            });
        });

        // Histogramm-Klick
        document.getElementById('histogram-grid')?.addEventListener('click', (e) => {
            const card = e.target.closest('.histogram-card');
            if (card) {
                this.selectVariable(card.dataset.variable);
            }
        });
    }

    bindKeyboard() {
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '4') {
                e.preventDefault();
                const modes = ['fragebogen', 'verteilung', 'skalen', 'codebook'];
                window.location.href = `${modes[parseInt(e.key) - 1]}.html`;
            }

            if (e.key === 'Tab') {
                e.preventDefault();
                this.navigateHistograms(e.shiftKey ? -1 : 1);
            }
        });
    }

    navigateHistograms(direction) {
        const cards = document.querySelectorAll('.histogram-card');
        const currentIndex = Array.from(cards).findIndex(c =>
            c.classList.contains('selected')
        );

        let newIndex = currentIndex + direction;
        if (newIndex < 0) newIndex = cards.length - 1;
        if (newIndex >= cards.length) newIndex = 0;

        const newCard = cards[newIndex];
        if (newCard) {
            this.selectVariable(newCard.dataset.variable);
            newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    new SurveyVerteilung('histogram-grid');
});

export default SurveyVerteilung;
