/**
 * Matrix Pivot-Modus
 * Dimensionen flexibel anordnen und aggregieren
 *
 * Benoetigte Daten: dimensions, cells[]
 * Wissensbasis: 15-MODI#Matrix-Pivot
 */

class MatrixPivot {
    constructor() {
        this.data = null;
        this.rowDimension = null;
        this.colDimension = null;
        this.aggregation = 'sum';
        this.showGrandTotals = true;
        this.showSubtotals = false;
    }

    async init() {
        try {
            const response = await fetch('../data/scope-matrix.json');
            this.data = await response.json();
            this.rowDimension = this.data.dimensions.rows.id;
            this.colDimension = this.data.dimensions.columns.id;
            this.render();
            this.bindEvents();
            this.bindKeyboard();
        } catch (error) {
            console.error('Fehler beim Laden:', error);
        }
    }

    render() {
        this.renderMeta();
        this.renderDimensionChips();
        this.renderTable();
    }

    renderMeta() {
        const title = document.getElementById('matrix-title');
        const source = document.getElementById('matrix-source');
        if (title) title.textContent = this.data?.metadata?.title || 'Pivot-Tabelle';
        if (source) source.textContent = this.data?.metadata?.source || '';
    }

    renderDimensionChips() {
        const rowZone = document.querySelector('[data-zone="rows"]');
        const colZone = document.querySelector('[data-zone="columns"]');

        if (rowZone) {
            rowZone.innerHTML = this.rowDimension
                ? `<span class="dimension-chip" data-dim="${this.rowDimension}" draggable="true">
                     ${this.getDimensionLabel(this.rowDimension)}
                   </span>`
                : '<span class="placeholder">Dimension hierher ziehen</span>';
        }

        if (colZone) {
            colZone.innerHTML = this.colDimension
                ? `<span class="dimension-chip" data-dim="${this.colDimension}" draggable="true">
                     ${this.getDimensionLabel(this.colDimension)}
                   </span>`
                : '<span class="placeholder">Dimension hierher ziehen</span>';
        }

        this.setupDragAndDrop();
    }

    getDimensionLabel(dimId) {
        if (dimId === this.data.dimensions.rows.id) return this.data.dimensions.rows.label;
        if (dimId === this.data.dimensions.columns.id) return this.data.dimensions.columns.label;
        return dimId;
    }

    getDimensionValues(dimId) {
        if (dimId === this.data.dimensions.rows.id) return this.data.dimensions.rows.values;
        if (dimId === this.data.dimensions.columns.id) return this.data.dimensions.columns.values;
        return [];
    }

    setupDragAndDrop() {
        document.querySelectorAll('.dimension-chip').forEach(chip => {
            chip.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', chip.dataset.dim);
                chip.classList.add('dragging');
            });
            chip.addEventListener('dragend', () => {
                chip.classList.remove('dragging');
            });
        });

        document.querySelectorAll('.drop-zone').forEach(zone => {
            zone.addEventListener('dragover', (e) => {
                e.preventDefault();
                zone.classList.add('drag-over');
            });
            zone.addEventListener('dragleave', () => {
                zone.classList.remove('drag-over');
            });
            zone.addEventListener('drop', (e) => {
                e.preventDefault();
                zone.classList.remove('drag-over');
                const dimId = e.dataTransfer.getData('text/plain');
                const targetZone = zone.dataset.zone;

                if (targetZone === 'rows') {
                    if (this.colDimension === dimId) this.colDimension = this.rowDimension;
                    this.rowDimension = dimId;
                } else {
                    if (this.rowDimension === dimId) this.rowDimension = this.colDimension;
                    this.colDimension = dimId;
                }

                this.render();
            });
        });
    }

    renderTable() {
        const thead = document.getElementById('pivot-head');
        const tbody = document.getElementById('pivot-body');
        const tfoot = document.getElementById('pivot-foot');
        if (!thead || !tbody) return;

        const rowValues = this.getDimensionValues(this.rowDimension);
        const colValues = this.getDimensionValues(this.colDimension);

        // Header
        thead.innerHTML = `
            <tr>
                <th class="corner-cell">${this.getDimensionLabel(this.rowDimension)} \\ ${this.getDimensionLabel(this.colDimension)}</th>
                ${colValues.map(col => `<th class="col-header">${col}</th>`).join('')}
                ${this.showGrandTotals ? '<th class="total-header">Summe</th>' : ''}
            </tr>
        `;

        // Body
        const aggregatedData = this.aggregateData();

        tbody.innerHTML = rowValues.map(row => {
            const rowData = aggregatedData.filter(d => d.row === row);
            const rowTotal = rowData.reduce((sum, d) => sum + d.value, 0);

            return `
                <tr>
                    <th class="row-header">${row}</th>
                    ${colValues.map(col => {
                        const cell = rowData.find(d => d.col === col);
                        return `<td class="data-cell">${this.formatValue(cell?.value || 0)}</td>`;
                    }).join('')}
                    ${this.showGrandTotals ? `<td class="row-total">${this.formatValue(rowTotal)}</td>` : ''}
                </tr>
            `;
        }).join('');

        // Footer
        if (this.showGrandTotals && tfoot) {
            const colTotals = colValues.map(col => {
                return aggregatedData.filter(d => d.col === col).reduce((sum, d) => sum + d.value, 0);
            });
            const grandTotal = colTotals.reduce((a, b) => a + b, 0);

            tfoot.innerHTML = `
                <tr>
                    <th class="total-label">Summe</th>
                    ${colTotals.map(total => `<td class="col-total">${this.formatValue(total)}</td>`).join('')}
                    <td class="grand-total">${this.formatValue(grandTotal)}</td>
                </tr>
            `;
        }
    }

    aggregateData() {
        const result = [];
        const rowValues = this.getDimensionValues(this.rowDimension);
        const colValues = this.getDimensionValues(this.colDimension);

        rowValues.forEach(row => {
            colValues.forEach(col => {
                const cells = this.data.cells.filter(c => {
                    const cellRow = this.rowDimension === this.data.dimensions.rows.id ? c.row : c.column;
                    const cellCol = this.colDimension === this.data.dimensions.columns.id ? c.column : c.row;
                    return cellRow === row && cellCol === col;
                });

                let value = 0;
                switch (this.aggregation) {
                    case 'sum':
                        value = cells.reduce((sum, c) => sum + c.count, 0);
                        break;
                    case 'count':
                        value = cells.length;
                        break;
                    case 'mean':
                        value = cells.length > 0
                            ? cells.reduce((sum, c) => sum + c.count, 0) / cells.length
                            : 0;
                        break;
                    case 'min':
                        value = cells.length > 0
                            ? Math.min(...cells.map(c => c.count))
                            : 0;
                        break;
                    case 'max':
                        value = cells.length > 0
                            ? Math.max(...cells.map(c => c.count))
                            : 0;
                        break;
                }

                result.push({ row, col, value });
            });
        });

        return result;
    }

    formatValue(value) {
        if (this.aggregation === 'mean') {
            return value.toFixed(1);
        }
        return Math.round(value).toString();
    }

    resetPivot() {
        this.rowDimension = this.data.dimensions.rows.id;
        this.colDimension = this.data.dimensions.columns.id;
        this.aggregation = 'sum';
        this.render();
    }

    exportPivot() {
        const rowValues = this.getDimensionValues(this.rowDimension);
        const colValues = this.getDimensionValues(this.colDimension);
        const aggregatedData = this.aggregateData();

        let csv = ',' + colValues.join(',') + '\n';
        rowValues.forEach(row => {
            const rowData = colValues.map(col => {
                const cell = aggregatedData.find(d => d.row === row && d.col === col);
                return cell?.value || 0;
            });
            csv += row + ',' + rowData.join(',') + '\n';
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'pivot-export.csv';
        a.click();
        URL.revokeObjectURL(url);
    }

    bindEvents() {
        document.getElementById('aggregation-function')?.addEventListener('change', (e) => {
            this.aggregation = e.target.value;
            this.renderTable();
        });

        document.getElementById('show-grand-totals')?.addEventListener('change', (e) => {
            this.showGrandTotals = e.target.checked;
            this.renderTable();
        });

        document.getElementById('show-subtotals')?.addEventListener('change', (e) => {
            this.showSubtotals = e.target.checked;
            this.renderTable();
        });

        document.getElementById('reset-pivot')?.addEventListener('click', () => {
            this.resetPivot();
        });

        document.getElementById('export-pivot')?.addEventListener('click', () => {
            this.exportPivot();
        });
    }

    bindKeyboard() {
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '4') {
                e.preventDefault();
                const modes = ['tabelle', 'heatmap', 'residuen', 'pivot'];
                window.location.href = `${modes[parseInt(e.key) - 1]}.html`;
            }

            if ((e.metaKey || e.ctrlKey) && e.key === 'r') {
                e.preventDefault();
                this.resetPivot();
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MatrixPivot().init();
});

export default MatrixPivot;
