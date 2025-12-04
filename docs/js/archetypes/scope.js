// Scope Archetype - Multidimensional data with analytical dashboards
// GRIP Framework

export class AdaptiveScope {
    constructor(dataUrl) {
        this.dataUrl = dataUrl;
        this.data = null;
        this.filteredData = [];
        this.currentPage = 1;
        this.pageSize = 10;
        this.sortField = 'id';
        this.sortAsc = true;
        this.filters = {
            departments: [],
            ageGroups: [],
            remote: 'all',
            support: 'all'
        };
        this.init();
    }

    async init() {
        try {
            const response = await fetch(this.dataUrl);
            this.data = await response.json();
            this.initFilters();
            this.applyFilters();
            this.bindEvents();
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    }

    initFilters() {
        const departments = [...new Set(this.data.respondents.map(r => r.department))];
        const deptContainer = document.getElementById('filter-department');
        deptContainer.innerHTML = departments.map(dept => `
            <label><input type="checkbox" value="${dept}" checked> ${dept}</label>
        `).join('');
        this.filters.departments = departments;

        const ageGroups = [...new Set(this.data.respondents.map(r => r.age_group))];
        const ageContainer = document.getElementById('filter-age');
        ageContainer.innerHTML = ageGroups.sort().map(age => `
            <label><input type="checkbox" value="${age}" checked> ${age}</label>
        `).join('');
        this.filters.ageGroups = ageGroups;

        document.getElementById('total-count').textContent = this.data.respondents.length;
    }

    applyFilters() {
        const searchTerm = document.getElementById('table-search')?.value?.toLowerCase() || '';

        this.filteredData = this.data.respondents.filter(r => {
            if (!this.filters.departments.includes(r.department)) return false;
            if (!this.filters.ageGroups.includes(r.age_group)) return false;

            if (this.filters.remote !== 'all') {
                if (this.filters.remote === '0' && r.remote_days !== 0) return false;
                if (this.filters.remote === '1-2' && (r.remote_days < 1 || r.remote_days > 2)) return false;
                if (this.filters.remote === '3-4' && (r.remote_days < 3 || r.remote_days > 4)) return false;
                if (this.filters.remote === '5' && r.remote_days !== 5) return false;
            }

            if (this.filters.support !== 'all' && r.support_needed !== this.filters.support) return false;

            if (searchTerm) {
                const searchable = `${r.id} ${r.department} ${r.age_group}`.toLowerCase();
                if (!searchable.includes(searchTerm)) return false;
            }

            return true;
        });

        this.filteredData.sort((a, b) => {
            let valA = a[this.sortField];
            let valB = b[this.sortField];
            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();
            if (valA < valB) return this.sortAsc ? -1 : 1;
            if (valA > valB) return this.sortAsc ? 1 : -1;
            return 0;
        });

        this.currentPage = 1;
        this.render();
    }

    render() {
        this.renderFilterSummary();
        this.renderKPIs();
        this.renderCharts();
        this.renderCorrelationMatrix();
        this.renderTable();
    }

    renderFilterSummary() {
        const filtered = this.filteredData.length;
        const total = this.data.respondents.length;
        const percent = Math.round((filtered / total) * 100);

        document.getElementById('filtered-count').textContent = filtered;
        document.getElementById('filter-percent').textContent = percent;
    }

    renderKPIs() {
        const data = this.filteredData;
        if (data.length === 0) {
            document.getElementById('kpi-row').innerHTML = '<p class="no-data">Keine Daten für aktuelle Filter</p>';
            return;
        }

        const avg = (arr, key) => arr.reduce((sum, r) => sum + r[key], 0) / arr.length;

        const avgTools = avg(data, 'satisfaction_digital_tools');
        const avgChange = avg(data, 'change_readiness');
        const avgRemote = avg(data, 'remote_days');
        const supportRate = (data.filter(r => r.support_needed === 'ja').length / data.length) * 100;

        document.getElementById('kpi-row').innerHTML = `
            <div class="kpi-card">
                <span class="kpi-value">${avgTools.toFixed(1)}</span>
                <span class="kpi-label">Zufriedenheit Tools</span>
                <span class="kpi-sublabel">Skala 1-5</span>
            </div>
            <div class="kpi-card">
                <span class="kpi-value">${avgChange.toFixed(1)}</span>
                <span class="kpi-label">Veränderungsbereitschaft</span>
                <span class="kpi-sublabel">Skala 1-5</span>
            </div>
            <div class="kpi-card">
                <span class="kpi-value">${avgRemote.toFixed(1)}</span>
                <span class="kpi-label">Home-Office Tage</span>
                <span class="kpi-sublabel">pro Woche</span>
            </div>
            <div class="kpi-card">
                <span class="kpi-value">${supportRate.toFixed(0)}%</span>
                <span class="kpi-label">Wünschen Support</span>
                <span class="kpi-sublabel">IT-Unterstützung</span>
            </div>
        `;
    }

    renderCharts() {
        this.renderBarChart('chart-age', 'age_group', 'satisfaction_digital_tools');
        this.renderBarChart('chart-department', 'department', 'satisfaction_digital_tools');
    }

    renderBarChart(containerId, groupBy, metric) {
        const container = document.getElementById(containerId);
        const data = this.filteredData;

        if (data.length === 0) {
            container.innerHTML = '<p class="no-data">Keine Daten</p>';
            return;
        }

        const groups = {};
        data.forEach(r => {
            const key = r[groupBy];
            if (!groups[key]) groups[key] = [];
            groups[key].push(r[metric]);
        });

        const results = Object.entries(groups).map(([label, values]) => ({
            label,
            value: values.reduce((a, b) => a + b, 0) / values.length,
            n: values.length
        }));

        results.sort((a, b) => a.label.localeCompare(b.label));

        const maxValue = 5;

        container.innerHTML = results.map(r => {
            const width = (r.value / maxValue) * 100;
            return `
                <div class="bar-group">
                    <span class="bar-label">${r.label}</span>
                    <div class="bar-container">
                        <div class="bar" style="width: ${width}%"></div>
                    </div>
                    <span class="bar-value">${r.value.toFixed(1)}</span>
                    <span class="bar-n">(n=${r.n})</span>
                </div>
            `;
        }).join('');
    }

    renderCorrelationMatrix() {
        const container = document.getElementById('correlation-matrix');
        const data = this.filteredData;

        if (data.length < 3) {
            container.innerHTML = '<p class="no-data">Zu wenige Daten für Korrelation</p>';
            return;
        }

        const variables = [
            { key: 'satisfaction_digital_tools', label: 'Tools' },
            { key: 'satisfaction_communication', label: 'Komm.' },
            { key: 'satisfaction_training', label: 'Training' },
            { key: 'change_readiness', label: 'Change' },
            { key: 'remote_days', label: 'Remote' }
        ];

        const correlations = [];
        for (let i = 0; i < variables.length; i++) {
            const row = [];
            for (let j = 0; j < variables.length; j++) {
                if (i === j) {
                    row.push(1);
                } else if (j < i) {
                    row.push(correlations[j][i]);
                } else {
                    row.push(this.pearsonCorrelation(
                        data.map(r => r[variables[i].key]),
                        data.map(r => r[variables[j].key])
                    ));
                }
            }
            correlations.push(row);
        }

        let html = '<table class="corr-table"><thead><tr><th></th>';
        variables.forEach(v => {
            html += `<th>${v.label}</th>`;
        });
        html += '</tr></thead><tbody>';

        correlations.forEach((row, i) => {
            html += `<tr><th>${variables[i].label}</th>`;
            row.forEach((corr, j) => {
                const intensity = Math.abs(corr);
                const color = corr >= 0 ?
                    `rgba(74, 124, 89, ${intensity * 0.8})` :
                    `rgba(184, 84, 80, ${intensity * 0.8})`;
                const textColor = intensity > 0.5 ? 'white' : 'var(--color-ink)';
                html += `<td style="background: ${color}; color: ${textColor}">${corr.toFixed(2)}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';

        container.innerHTML = html;
    }

    pearsonCorrelation(x, y) {
        const n = x.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0);
        const sumX2 = x.reduce((total, xi) => total + xi * xi, 0);
        const sumY2 = y.reduce((total, yi) => total + yi * yi, 0);

        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt(
            (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
        );

        return denominator === 0 ? 0 : numerator / denominator;
    }

    renderTable() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = Math.min(start + this.pageSize, this.filteredData.length);
        const pageData = this.filteredData.slice(start, end);

        const tbody = document.getElementById('table-body');
        tbody.innerHTML = pageData.map(r => `
            <tr>
                <td>${r.id}</td>
                <td>${r.age_group}</td>
                <td>${r.department}</td>
                <td>${r.tenure_years}</td>
                <td>${r.remote_days}</td>
                <td class="${this.getValueClass(r.satisfaction_digital_tools)}">${r.satisfaction_digital_tools}</td>
                <td class="${this.getValueClass(r.satisfaction_communication)}">${r.satisfaction_communication}</td>
                <td class="${this.getValueClass(r.satisfaction_training)}">${r.satisfaction_training}</td>
                <td class="${this.getValueClass(r.change_readiness)}">${r.change_readiness}</td>
            </tr>
        `).join('');

        document.getElementById('pagination-info').textContent =
            `Zeige ${start + 1}-${end} von ${this.filteredData.length}`;

        const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
        const btns = document.getElementById('pagination-btns');
        let btnHtml = '';

        btnHtml += `<button ${this.currentPage === 1 ? 'disabled' : ''} data-page="1">&laquo;</button>`;
        btnHtml += `<button ${this.currentPage === 1 ? 'disabled' : ''} data-page="${this.currentPage - 1}">&lsaquo;</button>`;

        for (let i = Math.max(1, this.currentPage - 2); i <= Math.min(totalPages, this.currentPage + 2); i++) {
            btnHtml += `<button class="${i === this.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }

        btnHtml += `<button ${this.currentPage === totalPages ? 'disabled' : ''} data-page="${this.currentPage + 1}">&rsaquo;</button>`;
        btnHtml += `<button ${this.currentPage === totalPages ? 'disabled' : ''} data-page="${totalPages}">&raquo;</button>`;

        btns.innerHTML = btnHtml;
    }

    getValueClass(value) {
        if (value >= 4) return 'value-high';
        if (value <= 2) return 'value-low';
        return '';
    }

    bindEvents() {
        document.getElementById('filter-department').addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                if (e.target.checked) {
                    this.filters.departments.push(e.target.value);
                } else {
                    this.filters.departments = this.filters.departments.filter(d => d !== e.target.value);
                }
                this.applyFilters();
            }
        });

        document.getElementById('filter-age').addEventListener('change', (e) => {
            if (e.target.type === 'checkbox') {
                if (e.target.checked) {
                    this.filters.ageGroups.push(e.target.value);
                } else {
                    this.filters.ageGroups = this.filters.ageGroups.filter(a => a !== e.target.value);
                }
                this.applyFilters();
            }
        });

        document.getElementById('filter-remote').addEventListener('change', (e) => {
            this.filters.remote = e.target.value;
            this.applyFilters();
        });

        document.getElementById('filter-support').addEventListener('change', (e) => {
            this.filters.support = e.target.value;
            this.applyFilters();
        });

        document.getElementById('reset-filters').addEventListener('click', () => {
            document.querySelectorAll('#filter-department input, #filter-age input').forEach(cb => {
                cb.checked = true;
            });
            document.getElementById('filter-remote').value = 'all';
            document.getElementById('filter-support').value = 'all';
            document.getElementById('table-search').value = '';

            this.filters.departments = [...new Set(this.data.respondents.map(r => r.department))];
            this.filters.ageGroups = [...new Set(this.data.respondents.map(r => r.age_group))];
            this.filters.remote = 'all';
            this.filters.support = 'all';

            this.applyFilters();
        });

        document.getElementById('table-search').addEventListener('input', () => {
            this.applyFilters();
        });

        document.getElementById('sort-by').addEventListener('change', (e) => {
            this.sortField = e.target.value;
            this.applyFilters();
        });

        document.getElementById('pagination-btns').addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON' && !e.target.disabled) {
                this.currentPage = parseInt(e.target.dataset.page);
                this.renderTable();
            }
        });

        document.getElementById('export-csv').addEventListener('click', () => {
            this.exportCSV();
        });
    }

    exportCSV() {
        const headers = ['id', 'age_group', 'department', 'tenure_years', 'remote_days',
                        'satisfaction_digital_tools', 'satisfaction_communication',
                        'satisfaction_training', 'change_readiness', 'support_needed'];

        let csv = headers.join(',') + '\n';
        this.filteredData.forEach(r => {
            csv += headers.map(h => r[h]).join(',') + '\n';
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'survey_export.csv';
        link.click();
    }
}

export default AdaptiveScope;
