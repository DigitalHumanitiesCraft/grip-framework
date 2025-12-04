/**
 * Survey Module
 * Scope-Spezialisierung für Umfragedaten
 *
 * Kognitive Aufgabe: Identifikation von Gruppenunterschieden und Korrelationen
 *
 * UI-Elemente:
 * - Demografische Filter-Sidebar
 * - Likert-Scale-Visualisierung (Diverging Stacked Bar)
 * - Signifikanzindikatoren bei Gruppenvergleichen
 * - Fragebogen-Struktur als Navigation
 * - Korrelationsmatrix mit Heatmap
 */

export class Survey {
    constructor() {
        this.data = null;
        this.filteredData = [];
        this.activeScale = null;
    }

    async init() {
        try {
            const response = await fetch('data/scope-survey.json');
            this.data = await response.json();
            this.filteredData = [...(this.data.respondents || [])];

            this.setupEventListeners();
            this.render();

            console.log('Survey module initialized');
        } catch (error) {
            console.error('Error initializing Survey:', error);
        }
    }

    setupEventListeners() {
        document.getElementById('scale-select')?.addEventListener('change', (e) => {
            this.selectScale(e.target.value);
        });

        document.getElementById('reset-filters')?.addEventListener('click', () => {
            this.resetFilters();
        });

        document.getElementById('comparison-variable')?.addEventListener('change', (e) => {
            this.updateComparison(e.target.value);
        });
    }

    render() {
        this.renderSurveyMeta();
        this.renderDemographicFilters();
        this.renderScalesOverview();
        this.renderLikertCharts();
        this.renderCorrelationHeatmap();
        this.renderQuestionnaireStructure();
        this.updateFilterSummary();
    }

    renderSurveyMeta() {
        const meta = this.data?.survey_meta;
        if (!meta) return;

        document.getElementById('survey-title').textContent = meta.title || 'Umfrage';
        document.getElementById('survey-n').textContent = meta.n;
        document.getElementById('survey-response-rate').textContent = `${(meta.response_rate * 100).toFixed(0)}%`;
        document.getElementById('survey-period').textContent =
            `${meta.collection_period?.start} – ${meta.collection_period?.end}`;
        document.getElementById('total-count').textContent = meta.n;
    }

    renderDemographicFilters() {
        const container = document.getElementById('demographic-filters');
        const comparisonSelect = document.getElementById('comparison-variable');
        if (!container || !this.data?.demographics) return;

        container.innerHTML = this.data.demographics.map(demo => {
            if (demo.type === 'categorical' || demo.type === 'ordinal') {
                const values = demo.values || [];
                return `
                    <div class="filter-group" data-demo="${demo.id}">
                        <label>${demo.id.replace(/_/g, ' ')}</label>
                        <select id="filter-${demo.id}" data-demo="${demo.id}">
                            <option value="">Alle</option>
                            ${values.map(v => `<option value="${v}">${v}</option>`).join('')}
                        </select>
                    </div>
                `;
            }
            return '';
        }).join('');

        // Add event listeners to filters
        container.querySelectorAll('select').forEach(select => {
            select.addEventListener('change', () => this.applyFilters());
        });

        // Populate comparison variable select
        if (comparisonSelect) {
            comparisonSelect.innerHTML = this.data.demographics
                .filter(d => d.type === 'categorical')
                .map(d => `<option value="${d.id}">${d.id.replace(/_/g, ' ')}</option>`)
                .join('');
        }
    }

    renderScalesOverview() {
        const grid = document.getElementById('scales-grid');
        const scaleSelect = document.getElementById('scale-select');
        if (!grid || !this.data?.scales) return;

        grid.innerHTML = this.data.scales.map(scale => {
            const avgScore = this.calculateScaleAverage(scale.id);
            return `
                <div class="scale-card" data-scale="${scale.id}">
                    <h3>${scale.label}</h3>
                    <div class="scale-score">${avgScore.toFixed(2)}</div>
                    <div class="scale-meta">
                        <span>${scale.items.length} Items</span>
                        <span>α = ${scale.cronbach_alpha}</span>
                    </div>
                </div>
            `;
        }).join('');

        // Populate scale select
        if (scaleSelect) {
            scaleSelect.innerHTML = this.data.scales.map(s =>
                `<option value="${s.id}">${s.label}</option>`
            ).join('');
        }

        // Select first scale
        if (this.data.scales.length > 0) {
            this.selectScale(this.data.scales[0].id);
        }
    }

    calculateScaleAverage(scaleId) {
        const scale = this.data.scales.find(s => s.id === scaleId);
        if (!scale) return 0;

        const itemIds = scale.items;
        let total = 0;
        let count = 0;

        this.filteredData.forEach(resp => {
            itemIds.forEach(itemId => {
                if (resp[itemId] !== undefined) {
                    total += resp[itemId];
                    count++;
                }
            });
        });

        return count > 0 ? total / count : 0;
    }

    renderLikertCharts() {
        const container = document.getElementById('likert-charts');
        if (!container || !this.data?.items) return;

        const likertItems = this.data.items.filter(i => i.type === 'likert');

        container.innerHTML = likertItems.map(item => {
            const distribution = this.calculateDistribution(item.id, item.scale.max);
            const labels = item.scale.labels || [];

            return `
                <div class="likert-item">
                    <div class="likert-label">${item.text}</div>
                    <div class="likert-bar-container">
                        ${distribution.map((pct, i) => {
                            const isNegative = i < Math.floor(item.scale.max / 2);
                            const isNeutral = i === Math.floor(item.scale.max / 2);
                            const colorClass = isNeutral ? 'neutral' : (isNegative ? 'negative' : 'positive');
                            return `<div class="likert-segment ${colorClass}" style="width: ${pct}%" title="${labels[i] || i+1}: ${pct.toFixed(1)}%"></div>`;
                        }).join('')}
                    </div>
                    <div class="likert-mean">M = ${this.calculateItemMean(item.id).toFixed(2)}</div>
                </div>
            `;
        }).join('');
    }

    calculateDistribution(itemId, max) {
        const counts = new Array(max).fill(0);
        this.filteredData.forEach(resp => {
            const val = resp[itemId];
            if (val >= 1 && val <= max) {
                counts[val - 1]++;
            }
        });

        const total = counts.reduce((a, b) => a + b, 0);
        return counts.map(c => total > 0 ? (c / total) * 100 : 0);
    }

    calculateItemMean(itemId) {
        let total = 0;
        let count = 0;
        this.filteredData.forEach(resp => {
            if (resp[itemId] !== undefined) {
                total += resp[itemId];
                count++;
            }
        });
        return count > 0 ? total / count : 0;
    }

    renderCorrelationHeatmap() {
        const container = document.getElementById('correlation-heatmap');
        if (!container || !this.data?.scales) return;

        const scaleIds = this.data.scales.map(s => s.id);
        const correlations = this.calculateCorrelations(scaleIds);

        container.innerHTML = `
            <table class="correlation-table">
                <thead>
                    <tr>
                        <th></th>
                        ${scaleIds.map(id => `<th>${id.replace(/_/g, ' ').slice(0, 10)}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${scaleIds.map((id1, i) => `
                        <tr>
                            <th>${id1.replace(/_/g, ' ').slice(0, 10)}</th>
                            ${scaleIds.map((id2, j) => {
                                const r = correlations[i][j];
                                const color = this.getCorrelationColor(r);
                                return `<td style="background-color: ${color}" title="r = ${r.toFixed(2)}">${r.toFixed(2)}</td>`;
                            }).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    calculateCorrelations(scaleIds) {
        const n = scaleIds.length;
        const matrix = Array(n).fill(null).map(() => Array(n).fill(1));

        for (let i = 0; i < n; i++) {
            for (let j = i + 1; j < n; j++) {
                const r = this.pearsonCorrelation(scaleIds[i], scaleIds[j]);
                matrix[i][j] = r;
                matrix[j][i] = r;
            }
        }
        return matrix;
    }

    pearsonCorrelation(scaleId1, scaleId2) {
        const scale1 = this.data.scales.find(s => s.id === scaleId1);
        const scale2 = this.data.scales.find(s => s.id === scaleId2);
        if (!scale1 || !scale2) return 0;

        const vals1 = this.filteredData.map(r => this.getScaleScore(r, scale1));
        const vals2 = this.filteredData.map(r => this.getScaleScore(r, scale2));

        const n = vals1.length;
        if (n === 0) return 0;

        const mean1 = vals1.reduce((a, b) => a + b, 0) / n;
        const mean2 = vals2.reduce((a, b) => a + b, 0) / n;

        let num = 0, den1 = 0, den2 = 0;
        for (let i = 0; i < n; i++) {
            const d1 = vals1[i] - mean1;
            const d2 = vals2[i] - mean2;
            num += d1 * d2;
            den1 += d1 * d1;
            den2 += d2 * d2;
        }

        const den = Math.sqrt(den1 * den2);
        return den > 0 ? num / den : 0;
    }

    getScaleScore(respondent, scale) {
        let total = 0;
        let count = 0;
        scale.items.forEach(itemId => {
            if (respondent[itemId] !== undefined) {
                total += respondent[itemId];
                count++;
            }
        });
        return count > 0 ? total / count : 0;
    }

    getCorrelationColor(r) {
        const intensity = Math.abs(r);
        if (r >= 0) {
            return `rgba(74, 124, 89, ${intensity})`;
        } else {
            return `rgba(184, 84, 80, ${intensity})`;
        }
    }

    renderQuestionnaireStructure() {
        const container = document.getElementById('items-accordion');
        if (!container || !this.data?.scales) return;

        container.innerHTML = this.data.scales.map(scale => {
            const itemsHtml = scale.items.map(itemId => {
                const item = this.data.items.find(i => i.id === itemId);
                return item ? `
                    <li class="item-entry">
                        <span class="item-id">${itemId}</span>
                        <span class="item-text">${item.text}</span>
                    </li>
                ` : '';
            }).join('');

            return `
                <details class="scale-accordion" open>
                    <summary>
                        <span class="scale-name">${scale.label}</span>
                        <span class="scale-alpha">α = ${scale.cronbach_alpha}</span>
                    </summary>
                    <ul class="items-list">${itemsHtml}</ul>
                </details>
            `;
        }).join('');
    }

    updateFilterSummary() {
        document.getElementById('filtered-count').textContent = this.filteredData.length;
        const total = this.data?.respondents?.length || 0;
        document.getElementById('total-count').textContent = total;
        const pct = total > 0 ? ((this.filteredData.length / total) * 100).toFixed(0) : 0;
        document.getElementById('filter-percent').textContent = pct;
    }

    selectScale(scaleId) {
        this.activeScale = scaleId;
        const scale = this.data?.scales?.find(s => s.id === scaleId);

        // Update scale info
        const alphaEl = document.getElementById('cronbach-alpha');
        if (alphaEl && scale) {
            alphaEl.textContent = scale.cronbach_alpha;
        }

        // Highlight selected scale card
        document.querySelectorAll('.scale-card').forEach(el => {
            el.classList.toggle('active', el.dataset.scale === scaleId);
        });

        this.updateComparison(document.getElementById('comparison-variable')?.value || 'age_group');
    }

    resetFilters() {
        document.querySelectorAll('#demographic-filters select').forEach(select => {
            select.value = '';
        });
        this.applyFilters();
    }

    updateComparison(variable) {
        const container = document.getElementById('comparison-chart');
        if (!container || !this.activeScale || !variable) return;

        const scale = this.data.scales.find(s => s.id === this.activeScale);
        if (!scale) return;

        const demo = this.data.demographics.find(d => d.id === variable);
        if (!demo || !demo.values) return;

        const groups = {};
        demo.values.forEach(v => {
            groups[v] = { total: 0, count: 0 };
        });

        this.filteredData.forEach(r => {
            const group = r[variable];
            if (groups[group]) {
                const score = this.getScaleScore(r, scale);
                groups[group].total += score;
                groups[group].count++;
            }
        });

        const results = demo.values.map(v => ({
            label: v,
            mean: groups[v].count > 0 ? groups[v].total / groups[v].count : 0,
            n: groups[v].count
        }));

        const maxMean = Math.max(...results.map(r => r.mean), 5);

        container.innerHTML = results.map(r => `
            <div class="comparison-bar-row">
                <span class="comparison-label">${r.label} (n=${r.n})</span>
                <div class="comparison-bar-bg">
                    <div class="comparison-bar" style="width: ${(r.mean / maxMean) * 100}%">
                        <span class="comparison-value">${r.mean.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    applyFilters() {
        this.filteredData = [...(this.data?.respondents || [])];

        document.querySelectorAll('#demographic-filters select').forEach(select => {
            const demoId = select.dataset.demo;
            const value = select.value;
            if (value) {
                this.filteredData = this.filteredData.filter(r => String(r[demoId]) === value);
            }
        });

        this.renderScalesOverview();
        this.renderLikertCharts();
        this.renderCorrelationHeatmap();
        this.updateFilterSummary();
        if (this.activeScale) {
            this.updateComparison(document.getElementById('comparison-variable')?.value || 'age_group');
        }
    }
}
