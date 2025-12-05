/**
 * Survey Skalen-Modus
 *
 * Reliabilitätsanalyse mit Cronbach-Alpha und Item-Korrelationen
 *
 * Benötigte Daten: scales[], items[], respondents[]
 * Wissensbasis: 15-MODI#Survey-Skalen, 12-STANDARDS#DDI
 */

class SurveySkalen {
    constructor(containerId, dataPath) {
        this.container = document.getElementById(containerId);
        this.dataPath = dataPath || '../data/scope-survey.json';
        this.data = null;
        this.selectedScale = null;
        this.selectedItem = null;
        this.showIfDeleted = true;
        this.showCorrectedCorr = true;

        this.init();
    }

    async init() {
        try {
            const response = await fetch(this.dataPath);
            this.data = await response.json();
            this.render();
            this.bindEvents();
            this.bindKeyboard();
        } catch (error) {
            console.error('Fehler beim Laden der Daten:', error);
        }
    }

    render() {
        if (!this.data) return;

        this.renderScaleList();

        // Erste Skala automatisch auswählen
        if (this.data.scales?.length > 0 && !this.selectedScale) {
            this.selectScale(this.data.scales[0].id);
        }
    }

    renderScaleList() {
        const list = document.getElementById('scale-list');
        if (!list) return;

        list.innerHTML = (this.data.scales || []).map(scale => {
            const alphaClass = this.getAlphaClass(scale.cronbach_alpha);
            const isSelected = this.selectedScale === scale.id;

            return `
                <li>
                    <button class="scale-btn ${isSelected ? 'active' : ''}"
                            data-scale="${scale.id}">
                        <span class="scale-label">${scale.label}</span>
                        <span class="alpha-badge ${alphaClass}">
                            α = ${scale.cronbach_alpha?.toFixed(2) || '?'}
                        </span>
                    </button>
                </li>
            `;
        }).join('');
    }

    getAlphaClass(alpha) {
        if (!alpha) return 'unknown';
        if (alpha >= 0.9) return 'excellent';
        if (alpha >= 0.8) return 'good';
        if (alpha >= 0.7) return 'acceptable';
        if (alpha >= 0.6) return 'questionable';
        return 'poor';
    }

    selectScale(scaleId) {
        this.selectedScale = scaleId;
        this.selectedItem = null;

        this.renderScaleList();
        this.renderScaleAnalysis();
        this.renderCorrelationMatrix();
    }

    renderScaleAnalysis() {
        const scale = this.data.scales?.find(s => s.id === this.selectedScale);
        if (!scale) return;

        // Header
        document.getElementById('scale-title').textContent = scale.label;

        // Summary
        const summary = document.getElementById('scale-summary');
        if (summary) {
            const alphaClass = this.getAlphaClass(scale.cronbach_alpha);
            summary.innerHTML = `
                <div class="summary-stat">
                    <span class="stat-label">Cronbach's α</span>
                    <span class="stat-value ${alphaClass}">${scale.cronbach_alpha?.toFixed(3) || '-'}</span>
                </div>
                <div class="summary-stat">
                    <span class="stat-label">Items</span>
                    <span class="stat-value">${scale.items?.length || 0}</span>
                </div>
                <div class="summary-stat">
                    <span class="stat-label">n</span>
                    <span class="stat-value">${this.data.respondents?.length || 0}</span>
                </div>
            `;
        }

        // Item-Tabelle
        this.renderItemTable(scale);
    }

    renderItemTable(scale) {
        const tbody = document.getElementById('item-tbody');
        if (!tbody) return;

        const items = scale.items || [];
        const itemData = items.map(itemId => {
            const item = this.data.items?.find(i => i.id === itemId);
            const stats = this.calculateItemStats(itemId, scale);

            return {
                id: itemId,
                text: item?.text || itemId,
                ...stats
            };
        });

        tbody.innerHTML = itemData.map(item => {
            const ritClass = this.getRitClass(item.rit);
            const alphaIfDeletedClass = item.alphaIfDeleted > scale.cronbach_alpha ? 'higher' : 'lower';
            const isSelected = this.selectedItem === item.id;

            return `
                <tr class="${isSelected ? 'selected' : ''}" data-item="${item.id}">
                    <td class="item-text" title="${item.text}">
                        <code>${item.id}</code>
                        <span>${this.truncateText(item.text, 40)}</span>
                    </td>
                    <td class="numeric">${item.mean.toFixed(2)}</td>
                    <td class="numeric">${item.sd.toFixed(2)}</td>
                    <td class="numeric ${ritClass}" ${this.showCorrectedCorr ? '' : 'style="opacity:0.3"'}>
                        ${item.rit.toFixed(3)}
                    </td>
                    <td class="numeric ${alphaIfDeletedClass}" ${this.showIfDeleted ? '' : 'style="opacity:0.3"'}>
                        ${item.alphaIfDeleted.toFixed(3)}
                    </td>
                </tr>
            `;
        }).join('');
    }

    calculateItemStats(itemId, scale) {
        const values = (this.data.respondents || [])
            .map(r => r[itemId])
            .filter(v => v !== undefined && v !== null);

        const n = values.length;
        const mean = n > 0 ? values.reduce((a, b) => a + b, 0) / n : 0;
        const variance = n > 0 ? values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / n : 0;
        const sd = Math.sqrt(variance);

        // Trennschärfe (korrigierte Item-Total-Korrelation)
        const rit = this.calculateCorrectedItemTotal(itemId, scale);

        // Alpha bei Item-Ausschluss
        const alphaIfDeleted = this.calculateAlphaIfDeleted(itemId, scale);

        return { mean, sd, rit, alphaIfDeleted };
    }

    calculateCorrectedItemTotal(itemId, scale) {
        const otherItems = scale.items?.filter(id => id !== itemId) || [];
        if (otherItems.length === 0) return 0;

        const respondents = this.data.respondents || [];

        // Item-Werte
        const itemValues = respondents.map(r => r[itemId]).filter(v => v !== undefined);

        // Summe der anderen Items
        const totalValues = respondents.map(r => {
            const sum = otherItems.reduce((acc, id) => acc + (r[id] || 0), 0);
            return sum;
        });

        return this.pearsonCorrelation(itemValues, totalValues);
    }

    calculateAlphaIfDeleted(itemId, scale) {
        const remainingItems = scale.items?.filter(id => id !== itemId) || [];
        if (remainingItems.length < 2) return 0;

        // Vereinfachte Alpha-Berechnung
        const k = remainingItems.length;
        const respondents = this.data.respondents || [];

        // Varianzen der Items
        const itemVariances = remainingItems.map(id => {
            const values = respondents.map(r => r[id]).filter(v => v !== undefined);
            const mean = values.reduce((a, b) => a + b, 0) / values.length;
            return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
        });

        // Gesamtvarianz
        const totals = respondents.map(r =>
            remainingItems.reduce((sum, id) => sum + (r[id] || 0), 0)
        );
        const totalMean = totals.reduce((a, b) => a + b, 0) / totals.length;
        const totalVariance = totals.reduce((sum, v) => sum + Math.pow(v - totalMean, 2), 0) / totals.length;

        const sumItemVariances = itemVariances.reduce((a, b) => a + b, 0);

        if (totalVariance === 0) return 0;

        return (k / (k - 1)) * (1 - sumItemVariances / totalVariance);
    }

    pearsonCorrelation(x, y) {
        const n = Math.min(x.length, y.length);
        if (n === 0) return 0;

        const meanX = x.reduce((a, b) => a + b, 0) / n;
        const meanY = y.reduce((a, b) => a + b, 0) / n;

        let numerator = 0;
        let denomX = 0;
        let denomY = 0;

        for (let i = 0; i < n; i++) {
            const dx = x[i] - meanX;
            const dy = y[i] - meanY;
            numerator += dx * dy;
            denomX += dx * dx;
            denomY += dy * dy;
        }

        const denom = Math.sqrt(denomX * denomY);
        return denom === 0 ? 0 : numerator / denom;
    }

    getRitClass(rit) {
        if (rit >= 0.5) return 'excellent';
        if (rit >= 0.3) return 'good';
        if (rit >= 0.2) return 'acceptable';
        return 'poor';
    }

    renderCorrelationMatrix() {
        const container = document.getElementById('correlation-matrix');
        if (!container) return;

        const scale = this.data.scales?.find(s => s.id === this.selectedScale);
        if (!scale) return;

        const items = scale.items || [];
        const correlations = this.calculateCorrelationMatrix(items);

        let html = '<table class="corr-table"><thead><tr><th></th>';
        items.forEach(id => {
            html += `<th title="${id}">${id.substring(0, 8)}</th>`;
        });
        html += '</tr></thead><tbody>';

        items.forEach((rowId, i) => {
            html += `<tr><th title="${rowId}">${rowId.substring(0, 8)}</th>`;
            items.forEach((colId, j) => {
                const r = correlations[i][j];
                const color = this.getCorrelationColor(r);
                const display = i === j ? '1.00' : r.toFixed(2);

                html += `<td style="background-color: ${color}" title="${rowId} × ${colId} = ${r.toFixed(3)}">${display}</td>`;
            });
            html += '</tr>';
        });

        html += '</tbody></table>';
        container.innerHTML = html;
    }

    calculateCorrelationMatrix(items) {
        const matrix = [];
        const respondents = this.data.respondents || [];

        items.forEach((rowId, i) => {
            matrix[i] = [];
            const rowValues = respondents.map(r => r[rowId]).filter(v => v !== undefined);

            items.forEach((colId, j) => {
                if (i === j) {
                    matrix[i][j] = 1;
                } else if (j < i) {
                    matrix[i][j] = matrix[j][i];
                } else {
                    const colValues = respondents.map(r => r[colId]).filter(v => v !== undefined);
                    matrix[i][j] = this.pearsonCorrelation(rowValues, colValues);
                }
            });
        });

        return matrix;
    }

    getCorrelationColor(r) {
        // Blau für negative, Rot für positive Korrelationen
        const intensity = Math.abs(r);
        const alpha = 0.1 + intensity * 0.6;

        if (r >= 0) {
            return `rgba(180, 84, 80, ${alpha})`; // Scope-Rot
        } else {
            return `rgba(74, 124, 89, ${alpha})`; // Grün
        }
    }

    selectItem(itemId) {
        this.selectedItem = itemId;

        document.querySelectorAll('#item-tbody tr').forEach(tr => {
            tr.classList.toggle('selected', tr.dataset.item === itemId);
        });

        this.showItemDetail(itemId);
    }

    showItemDetail(itemId) {
        const item = this.data.items?.find(i => i.id === itemId);
        if (!item) return;

        const prompt = document.getElementById('item-prompt');
        const info = document.getElementById('item-info');

        prompt?.classList.add('hidden');
        info?.classList.remove('hidden');

        document.getElementById('item-label').textContent = item.text;
        document.getElementById('item-id').textContent = item.id;

        // Empfehlung basierend auf Trennschärfe
        const scale = this.data.scales?.find(s => s.id === this.selectedScale);
        const stats = this.calculateItemStats(itemId, scale);

        let recommendation = '';
        if (stats.rit < 0.2) {
            recommendation = 'Item sollte überprüft werden. Trennschärfe unter 0.20 deutet auf geringe Diskriminationsfähigkeit hin.';
        } else if (stats.alphaIfDeleted > scale.cronbach_alpha) {
            recommendation = 'Entfernung würde Alpha verbessern. Prüfen, ob inhaltlich verzichtbar.';
        } else {
            recommendation = 'Item trägt zur Skalenreliabilität bei. Keine Anpassung nötig.';
        }

        document.getElementById('item-recommendation').textContent = recommendation;

        // Mini-Histogramm
        this.renderItemHistogram(itemId, item.scale);
    }

    renderItemHistogram(itemId, scale) {
        const container = document.getElementById('item-histogram-chart');
        if (!container) return;

        const values = (this.data.respondents || [])
            .map(r => r[itemId])
            .filter(v => v !== undefined);

        const freq = {};
        for (let i = scale.min; i <= scale.max; i++) {
            freq[i] = 0;
        }
        values.forEach(v => {
            if (freq[v] !== undefined) freq[v]++;
        });

        const maxFreq = Math.max(...Object.values(freq), 1);

        let bars = '';
        for (let i = scale.min; i <= scale.max; i++) {
            const height = (freq[i] / maxFreq) * 100;
            bars += `
                <div class="mini-bar-container">
                    <div class="mini-bar" style="height: ${height}%"></div>
                    <span class="mini-bar-label">${i}</span>
                </div>
            `;
        }

        container.innerHTML = `<div class="mini-histogram">${bars}</div>`;
    }

    truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    bindEvents() {
        // Skalen-Auswahl
        document.getElementById('scale-list')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.scale-btn');
            if (btn) {
                this.selectScale(btn.dataset.scale);
            }
        });

        // Analyse-Optionen
        document.getElementById('show-if-deleted')?.addEventListener('change', (e) => {
            this.showIfDeleted = e.target.checked;
            this.renderScaleAnalysis();
        });

        document.getElementById('show-corrected-corr')?.addEventListener('change', (e) => {
            this.showCorrectedCorr = e.target.checked;
            this.renderScaleAnalysis();
        });

        // Item-Auswahl
        document.getElementById('item-table')?.addEventListener('click', (e) => {
            const row = e.target.closest('tr[data-item]');
            if (row) {
                this.selectItem(row.dataset.item);
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

            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateItems(e.key === 'ArrowDown' ? 1 : -1);
            }

            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                this.navigateScales(e.key === 'ArrowRight' ? 1 : -1);
            }
        });
    }

    navigateItems(direction) {
        const rows = document.querySelectorAll('#item-tbody tr');
        const currentIndex = Array.from(rows).findIndex(r => r.classList.contains('selected'));

        let newIndex = currentIndex + direction;
        if (newIndex < 0) newIndex = rows.length - 1;
        if (newIndex >= rows.length) newIndex = 0;

        const newRow = rows[newIndex];
        if (newRow) {
            this.selectItem(newRow.dataset.item);
        }
    }

    navigateScales(direction) {
        const scales = this.data.scales || [];
        const currentIndex = scales.findIndex(s => s.id === this.selectedScale);

        let newIndex = currentIndex + direction;
        if (newIndex < 0) newIndex = scales.length - 1;
        if (newIndex >= scales.length) newIndex = 0;

        this.selectScale(scales[newIndex].id);
    }
}

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    new SurveySkalen('item-table');
});

export default SurveySkalen;
