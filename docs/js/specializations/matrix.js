/**
 * Matrix Module
 * Scope-Spezialisierung für Kreuztabellen
 *
 * Kognitive Aufgabe: Identifikation von Zellmustern in zweidimensionalen Tabellen
 *
 * UI-Elemente:
 * - Heatmap-Färbung nach Zellwerten
 * - Zeilen- und Spalten-Marginalen
 * - Residuen-Anzeige (beobachtet vs. erwartet)
 * - Chi-Quadrat-Indikator
 * - Sortierbare Achsen
 * - Highlight bei Klick auf Zeile/Spalte
 */

export class Matrix {
    constructor() {
        this.data = null;
        this.displayMode = 'count'; // count, row-percent, col-percent, residual
        this.colorScale = 'sequential';
        this.selectedCell = null;
    }

    async init() {
        try {
            const response = await fetch('../examples/data/scope-matrix.json');
            this.data = await response.json();

            this.setupEventListeners();
            this.render();

            console.log('Matrix module initialized');
        } catch (error) {
            console.error('Error initializing Matrix:', error);
        }
    }

    setupEventListeners() {
        document.querySelectorAll('input[name="cell-display"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.displayMode = e.target.value;
                this.renderCrosstab();
            });
        });

        document.getElementById('color-scale')?.addEventListener('change', (e) => {
            this.colorScale = e.target.value;
            this.renderCrosstab();
        });

        document.getElementById('swap-btn')?.addEventListener('click', () => {
            this.swapDimensions();
        });

        // Cell click handler
        document.getElementById('crosstab-body')?.addEventListener('click', (e) => {
            const cell = e.target.closest('td[data-row][data-col]');
            if (cell) {
                this.selectCell(cell.dataset.row, cell.dataset.col);
            }
        });
    }

    render() {
        this.renderMeta();
        this.renderDimensionSelectors();
        this.renderCrosstab();
        this.renderStatistics();
        this.renderLegend();
    }

    renderMeta() {
        const meta = this.data?.metadata;
        if (!meta) return;

        const titleEl = document.getElementById('matrix-title');
        if (titleEl) {
            titleEl.textContent = meta.title || 'Kreuztabelle';
        }

        const sourceEl = document.getElementById('matrix-source');
        if (sourceEl) {
            sourceEl.textContent = meta.source || '';
        }
    }

    renderDimensionSelectors() {
        const rowDim = document.getElementById('row-dimension');
        const colDim = document.getElementById('col-dimension');

        if (rowDim && this.data?.dimensions?.rows) {
            rowDim.textContent = this.data.dimensions.rows.label;
        }
        if (colDim && this.data?.dimensions?.columns) {
            colDim.textContent = this.data.dimensions.columns.label;
        }
    }

    renderCrosstab() {
        const thead = document.getElementById('crosstab-head');
        const tbody = document.getElementById('crosstab-body');
        if (!thead || !tbody || !this.data?.dimensions) return;

        const rows = this.data.dimensions.rows.values;
        const cols = this.data.dimensions.columns.values;
        const rowTotals = this.data.totals.row_totals;
        const colTotals = this.data.totals.column_totals;
        const grandTotal = this.data.totals.grand_total;

        // Find min/max for color scaling
        let allValues = [];
        rows.forEach(row => {
            cols.forEach(col => {
                allValues.push(this.getCellValue(row, col));
            });
        });
        const minVal = Math.min(...allValues.map(v => parseFloat(v) || 0));
        const maxVal = Math.max(...allValues.map(v => parseFloat(v) || 0));

        // Header row
        thead.innerHTML = `
            <tr>
                <th></th>
                ${cols.map(col => `<th class="col-header" data-col="${col}">${col}</th>`).join('')}
                <th class="marginal">Σ</th>
            </tr>
        `;

        // Data rows
        tbody.innerHTML = rows.map(row => `
            <tr>
                <th class="row-header" data-row="${row}">${row}</th>
                ${cols.map(col => {
                    const value = this.getCellValue(row, col);
                    const color = this.getCellColor(parseFloat(value), minVal, maxVal);
                    const isSelected = this.selectedCell?.row === row && this.selectedCell?.col === col;
                    return `<td data-row="${row}" data-col="${col}"
                               style="background-color: ${color}"
                               class="${isSelected ? 'selected' : ''}">${value}${this.displayMode.includes('percent') ? '%' : ''}</td>`;
                }).join('')}
                <td class="marginal row-total">${rowTotals[row]}</td>
            </tr>
        `).join('') + `
            <tr class="marginal-row">
                <th>Σ</th>
                ${cols.map(col => `<td class="marginal col-total">${colTotals[col]}</td>`).join('')}
                <td class="marginal grand-total">${grandTotal}</td>
            </tr>
        `;
    }

    renderStatistics() {
        const stats = this.data?.statistics;
        if (!stats) return;

        const container = document.getElementById('statistics-panel');
        if (container) {
            container.innerHTML = `
                <div class="stat-item">
                    <span class="stat-label">χ²</span>
                    <span class="stat-value">${stats.chi_square.toFixed(1)}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">df</span>
                    <span class="stat-value">${stats.df}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">p</span>
                    <span class="stat-value ${stats.p_value < 0.05 ? 'significant' : ''}">${stats.p_value < 0.001 ? '< .001' : stats.p_value.toFixed(3)}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Cramér's V</span>
                    <span class="stat-value">${stats.cramers_v.toFixed(2)}</span>
                </div>
                <p class="stat-interpretation">${stats.interpretation}</p>
            `;
        }
    }

    renderLegend() {
        const container = document.getElementById('color-legend');
        if (!container) return;

        const isResidual = this.displayMode === 'residual';

        if (isResidual) {
            container.innerHTML = `
                <div class="legend-title">Residuen</div>
                <div class="legend-scale diverging">
                    <span class="legend-min">−</span>
                    <div class="legend-gradient diverging"></div>
                    <span class="legend-max">+</span>
                </div>
                <div class="legend-labels">
                    <span>unter erwartet</span>
                    <span>über erwartet</span>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="legend-title">${this.displayMode === 'count' ? 'Häufigkeit' : 'Prozent'}</div>
                <div class="legend-scale sequential">
                    <span class="legend-min">niedrig</span>
                    <div class="legend-gradient sequential"></div>
                    <span class="legend-max">hoch</span>
                </div>
            `;
        }
    }

    swapDimensions() {
        if (!this.data?.dimensions) return;

        // Swap rows and columns
        const temp = this.data.dimensions.rows;
        this.data.dimensions.rows = this.data.dimensions.columns;
        this.data.dimensions.columns = temp;

        // Swap cell references
        this.data.cells = this.data.cells.map(cell => ({
            ...cell,
            row: cell.column,
            column: cell.row
        }));

        // Swap totals
        const tempTotals = this.data.totals.row_totals;
        this.data.totals.row_totals = this.data.totals.column_totals;
        this.data.totals.column_totals = tempTotals;

        this.render();
    }

    selectCell(row, col) {
        this.selectedCell = { row, col };

        // Highlight selected cell
        document.querySelectorAll('#crosstab-body td[data-row]').forEach(td => {
            td.classList.remove('selected');
        });
        document.querySelector(`#crosstab-body td[data-row="${row}"][data-col="${col}"]`)?.classList.add('selected');

        // Update cell detail panel
        const cell = this.data.cells.find(c => c.row === row && c.column === col);
        if (!cell) return;

        const detailPanel = document.getElementById('cell-detail');
        if (detailPanel) {
            detailPanel.classList.remove('hidden');
            detailPanel.innerHTML = `
                <h3>Zellendetail</h3>
                <dl>
                    <dt>${this.data.dimensions.rows.label}</dt>
                    <dd>${row}</dd>
                    <dt>${this.data.dimensions.columns.label}</dt>
                    <dd>${col}</dd>
                    <dt>Beobachtet (n)</dt>
                    <dd>${cell.count}</dd>
                    <dt>Erwartet (e)</dt>
                    <dd>${cell.expected.toFixed(1)}</dd>
                    <dt>Standardisiertes Residuum</dt>
                    <dd class="${cell.residual > 1.96 ? 'positive' : cell.residual < -1.96 ? 'negative' : ''}">${cell.residual.toFixed(2)}</dd>
                    <dt>Zeilenprozent</dt>
                    <dd>${(cell.count / this.data.totals.row_totals[row] * 100).toFixed(1)}%</dd>
                    <dt>Spaltenprozent</dt>
                    <dd>${(cell.count / this.data.totals.column_totals[col] * 100).toFixed(1)}%</dd>
                </dl>
            `;
        }
    }

    getCellValue(row, col) {
        const cell = this.data.cells.find(c => c.row === row && c.column === col);
        if (!cell) return null;

        switch (this.displayMode) {
            case 'count': return cell.count;
            case 'row-percent': return (cell.count / this.data.totals.row_totals[row] * 100).toFixed(1);
            case 'col-percent': return (cell.count / this.data.totals.column_totals[col] * 100).toFixed(1);
            case 'residual': return cell.residual.toFixed(2);
            default: return cell.count;
        }
    }

    getCellColor(value, min, max) {
        if (this.displayMode === 'residual') {
            // Diverging scale for residuals
            const intensity = Math.min(Math.abs(value) / 5, 1);
            if (value > 0) {
                return `rgba(74, 124, 89, ${intensity})`; // Green for positive
            } else {
                return `rgba(184, 84, 80, ${intensity})`; // Red for negative
            }
        } else {
            // Sequential scale
            const range = max - min || 1;
            const normalized = (value - min) / range;
            const intensity = 0.1 + normalized * 0.6;
            return `rgba(196, 112, 90, ${intensity})`; // Terracotta
        }
    }
}
