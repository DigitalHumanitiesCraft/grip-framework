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

    renderMeta() {}
    renderDimensionSelectors() {}
    renderCrosstab() {}
    renderStatistics() {}
    renderLegend() {}

    swapDimensions() {}
    selectCell(row, col) {}

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

    getCellColor(value) {
        // TODO: Implement color scaling based on this.colorScale
        return '';
    }
}
