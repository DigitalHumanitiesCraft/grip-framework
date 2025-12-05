/**
 * Matrix Heatmap-Modus
 * Visuelle Mustererkennung durch Farbintensitaet
 *
 * Benoetigte Daten: dimensions, cells[]
 * Wissensbasis: 15-MODI#Matrix-Heatmap
 */

class MatrixHeatmap {
    constructor() {
        this.data = null;
        this.colorScheme = 'sequential';
        this.valueType = 'count';
        this.showValues = true;
        this.cellSize = 60;
    }

    async init() {
        try {
            const response = await fetch('../data/scope-matrix.json');
            this.data = await response.json();
            this.render();
            this.bindEvents();
            this.bindKeyboard();
        } catch (error) {
            console.error('Fehler beim Laden:', error);
        }
    }

    render() {
        this.renderMeta();
        this.renderHeatmap();
        this.renderLegend();
        this.renderStatistics();
    }

    renderMeta() {
        const title = document.getElementById('matrix-title');
        const source = document.getElementById('matrix-source');
        if (title) title.textContent = this.data?.metadata?.title || 'Heatmap';
        if (source) source.textContent = this.data?.metadata?.source || '';
    }

    renderHeatmap() {
        const container = document.getElementById('heatmap-container');
        if (!container || !this.data?.dimensions) return;

        const rows = this.data.dimensions.rows.values;
        const cols = this.data.dimensions.columns.values;

        const margin = { top: 80, right: 20, bottom: 20, left: 120 };
        const width = cols.length * this.cellSize + margin.left + margin.right;
        const height = rows.length * this.cellSize + margin.top + margin.bottom;

        const values = this.getAllValues();
        const minVal = Math.min(...values);
        const maxVal = Math.max(...values);

        let svg = `
            <svg width="${width}" height="${height}" class="heatmap-svg">
                <!-- Column headers -->
                ${cols.map((col, i) => `
                    <text x="${margin.left + i * this.cellSize + this.cellSize / 2}"
                          y="${margin.top - 10}"
                          class="col-label" text-anchor="middle"
                          transform="rotate(-45, ${margin.left + i * this.cellSize + this.cellSize / 2}, ${margin.top - 10})">
                        ${col}
                    </text>
                `).join('')}

                <!-- Row headers -->
                ${rows.map((row, i) => `
                    <text x="${margin.left - 10}"
                          y="${margin.top + i * this.cellSize + this.cellSize / 2 + 5}"
                          class="row-label" text-anchor="end">
                        ${row}
                    </text>
                `).join('')}

                <!-- Cells -->
                ${rows.map((row, i) =>
                    cols.map((col, j) => {
                        const value = this.getCellValue(row, col);
                        const color = this.getColor(value, minVal, maxVal);
                        const x = margin.left + j * this.cellSize;
                        const y = margin.top + i * this.cellSize;
                        return `
                            <g class="heatmap-cell" data-row="${row}" data-col="${col}">
                                <rect x="${x}" y="${y}"
                                      width="${this.cellSize - 2}" height="${this.cellSize - 2}"
                                      fill="${color}" rx="4"/>
                                ${this.showValues ? `
                                    <text x="${x + this.cellSize / 2}" y="${y + this.cellSize / 2 + 5}"
                                          class="cell-value" text-anchor="middle">
                                        ${this.formatValue(value)}
                                    </text>
                                ` : ''}
                            </g>
                        `;
                    }).join('')
                ).join('')}
            </svg>
        `;

        container.innerHTML = svg;

        // Event listener fuer Tooltip
        container.querySelectorAll('.heatmap-cell').forEach(cell => {
            cell.addEventListener('mouseenter', (e) => this.showTooltip(e, cell.dataset.row, cell.dataset.col));
            cell.addEventListener('mouseleave', () => this.hideTooltip());
        });
    }

    renderLegend() {
        const values = this.getAllValues();
        const minVal = Math.min(...values);
        const maxVal = Math.max(...values);

        document.getElementById('legend-min').textContent = this.formatValue(minVal);
        document.getElementById('legend-max').textContent = this.formatValue(maxVal);

        const gradient = document.querySelector('.legend-gradient');
        if (gradient) {
            gradient.style.background = this.getGradientCSS();
        }
    }

    renderStatistics() {
        const values = this.getAllValues();
        const n = values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);
        const mean = values.reduce((a, b) => a + b, 0) / n;

        document.getElementById('stat-min').textContent = this.formatValue(min);
        document.getElementById('stat-max').textContent = this.formatValue(max);
        document.getElementById('stat-mean').textContent = this.formatValue(mean);
        document.getElementById('stat-n').textContent = this.data.totals?.grand_total || n;
    }

    getAllValues() {
        return this.data.cells.map(cell => this.getCellValueFromCell(cell));
    }

    getCellValue(row, col) {
        const cell = this.data.cells.find(c => c.row === row && c.column === col);
        return this.getCellValueFromCell(cell);
    }

    getCellValueFromCell(cell) {
        if (!cell) return 0;
        const grandTotal = this.data.totals.grand_total;
        const rowTotal = this.data.totals.row_totals[cell.row];
        const colTotal = this.data.totals.column_totals[cell.column];

        switch (this.valueType) {
            case 'row-percent': return (cell.count / rowTotal) * 100;
            case 'col-percent': return (cell.count / colTotal) * 100;
            case 'total-percent': return (cell.count / grandTotal) * 100;
            default: return cell.count;
        }
    }

    formatValue(value) {
        if (this.valueType.includes('percent')) {
            return value.toFixed(1) + '%';
        }
        return Math.round(value).toString();
    }

    getColor(value, min, max) {
        const range = max - min || 1;
        const normalized = (value - min) / range;

        switch (this.colorScheme) {
            case 'warm':
                return `rgba(196, 112, 90, ${0.2 + normalized * 0.8})`;
            case 'cool':
                return `rgba(74, 124, 89, ${0.2 + normalized * 0.8})`;
            case 'viridis':
                return this.viridis(normalized);
            default:
                return `rgba(70, 130, 180, ${0.2 + normalized * 0.8})`;
        }
    }

    viridis(t) {
        const r = Math.round(68 + t * (253 - 68));
        const g = Math.round(1 + t * (231 - 1));
        const b = Math.round(84 + t * (37 - 84));
        return `rgb(${r}, ${g}, ${b})`;
    }

    getGradientCSS() {
        switch (this.colorScheme) {
            case 'warm':
                return 'linear-gradient(to right, rgba(196, 112, 90, 0.2), rgba(196, 112, 90, 1))';
            case 'cool':
                return 'linear-gradient(to right, rgba(74, 124, 89, 0.2), rgba(74, 124, 89, 1))';
            case 'viridis':
                return 'linear-gradient(to right, rgb(68, 1, 84), rgb(253, 231, 37))';
            default:
                return 'linear-gradient(to right, rgba(70, 130, 180, 0.2), rgba(70, 130, 180, 1))';
        }
    }

    showTooltip(event, row, col) {
        const tooltip = document.getElementById('cell-tooltip');
        if (!tooltip) return;

        const cell = this.data.cells.find(c => c.row === row && c.column === col);
        if (!cell) return;

        tooltip.innerHTML = `
            <strong>${row} / ${col}</strong><br>
            Anzahl: ${cell.count}<br>
            Erwartet: ${cell.expected?.toFixed(1) || '-'}
        `;
        tooltip.classList.remove('hidden');

        const rect = event.target.getBoundingClientRect();
        tooltip.style.left = rect.right + 10 + 'px';
        tooltip.style.top = rect.top + 'px';
    }

    hideTooltip() {
        document.getElementById('cell-tooltip')?.classList.add('hidden');
    }

    bindEvents() {
        document.getElementById('color-scheme')?.addEventListener('change', (e) => {
            this.colorScheme = e.target.value;
            this.renderHeatmap();
            this.renderLegend();
        });

        document.getElementById('value-type')?.addEventListener('change', (e) => {
            this.valueType = e.target.value;
            this.renderHeatmap();
            this.renderLegend();
            this.renderStatistics();
        });

        document.getElementById('show-values')?.addEventListener('change', (e) => {
            this.showValues = e.target.checked;
            this.renderHeatmap();
        });
    }

    bindKeyboard() {
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '4') {
                e.preventDefault();
                const modes = ['tabelle', 'heatmap', 'residuen', 'pivot'];
                window.location.href = `${modes[parseInt(e.key) - 1]}.html`;
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MatrixHeatmap().init();
});

export default MatrixHeatmap;
