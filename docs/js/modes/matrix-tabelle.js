/**
 * Matrix Tabellen-Modus
 * Klassische Kreuztabelle mit exakten Werten
 *
 * Benoetigte Daten: dimensions, cells[], totals
 * Wissensbasis: 15-MODI#Matrix-Tabelle
 */

class MatrixTabelle {
    constructor() {
        this.data = null;
        this.sortRows = 'original';
        this.sortCols = 'original';
        this.showTotals = true;
        this.showPercent = false;
        this.selectedCell = null;
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
        this.renderTable();
        this.renderStatistics();
    }

    renderMeta() {
        const title = document.getElementById('matrix-title');
        const source = document.getElementById('matrix-source');
        if (title) title.textContent = this.data?.metadata?.title || 'Kreuztabelle';
        if (source) source.textContent = this.data?.metadata?.source || '';
    }

    renderTable() {
        const thead = document.getElementById('crosstab-head');
        const tbody = document.getElementById('crosstab-body');
        const tfoot = document.getElementById('crosstab-foot');
        if (!thead || !tbody || !this.data?.dimensions) return;

        const rows = this.getSortedValues('rows');
        const cols = this.getSortedValues('columns');
        const rowTotals = this.data.totals.row_totals;
        const colTotals = this.data.totals.column_totals;
        const grandTotal = this.data.totals.grand_total;

        // Header
        thead.innerHTML = `
            <tr>
                <th class="corner-cell">${this.data.dimensions.rows.label}</th>
                ${cols.map(col => `<th class="col-header">${col}</th>`).join('')}
                ${this.showTotals ? '<th class="total-header">Summe</th>' : ''}
            </tr>
        `;

        // Body
        tbody.innerHTML = rows.map(row => `
            <tr>
                <th class="row-header">${row}</th>
                ${cols.map(col => {
                    const cell = this.getCell(row, col);
                    const isSelected = this.selectedCell?.row === row && this.selectedCell?.col === col;
                    let content = cell?.count || 0;
                    if (this.showPercent) {
                        const pct = ((cell?.count || 0) / grandTotal * 100).toFixed(1);
                        content = `${cell?.count || 0} <span class="percent">(${pct}%)</span>`;
                    }
                    return `<td class="data-cell ${isSelected ? 'selected' : ''}"
                               data-row="${row}" data-col="${col}">${content}</td>`;
                }).join('')}
                ${this.showTotals ? `<td class="row-total">${rowTotals[row] || 0}</td>` : ''}
            </tr>
        `).join('');

        // Footer
        if (this.showTotals) {
            tfoot.innerHTML = `
                <tr>
                    <th class="total-label">Summe</th>
                    ${cols.map(col => `<td class="col-total">${colTotals[col] || 0}</td>`).join('')}
                    <td class="grand-total">${grandTotal}</td>
                </tr>
            `;
        } else {
            tfoot.innerHTML = '';
        }
    }

    renderStatistics() {
        const stats = this.data?.statistics;
        if (!stats) return;

        document.getElementById('stat-chi').textContent = stats.chi_square?.toFixed(2) || '-';
        document.getElementById('stat-df').textContent = stats.df || '-';
        document.getElementById('stat-p').textContent = stats.p_value < 0.001 ? '< .001' : stats.p_value?.toFixed(4) || '-';
        document.getElementById('stat-v').textContent = stats.cramers_v?.toFixed(3) || '-';
        document.getElementById('stat-n').textContent = this.data.totals?.grand_total || '-';
    }

    getCell(row, col) {
        return this.data.cells.find(c => c.row === row && c.column === col);
    }

    getSortedValues(dimension) {
        const dim = this.data.dimensions[dimension];
        const values = [...dim.values];
        const totals = dimension === 'rows' ? this.data.totals.row_totals : this.data.totals.column_totals;
        const sortType = dimension === 'rows' ? this.sortRows : this.sortCols;

        switch (sortType) {
            case 'alpha':
                return values.sort((a, b) => a.localeCompare(b));
            case 'total-asc':
                return values.sort((a, b) => (totals[a] || 0) - (totals[b] || 0));
            case 'total-desc':
                return values.sort((a, b) => (totals[b] || 0) - (totals[a] || 0));
            default:
                return values;
        }
    }

    selectCell(row, col) {
        this.selectedCell = { row, col };

        document.querySelectorAll('.data-cell').forEach(td => {
            td.classList.toggle('selected', td.dataset.row === row && td.dataset.col === col);
        });

        const cell = this.getCell(row, col);
        if (!cell) return;

        const detail = document.getElementById('cell-detail');
        const content = document.getElementById('cell-detail-content');
        if (detail && content) {
            detail.classList.remove('hidden');
            const rowTotal = this.data.totals.row_totals[row];
            const colTotal = this.data.totals.column_totals[col];
            const grandTotal = this.data.totals.grand_total;

            content.innerHTML = `
                <dt>${this.data.dimensions.rows.label}</dt>
                <dd>${row}</dd>
                <dt>${this.data.dimensions.columns.label}</dt>
                <dd>${col}</dd>
                <dt>Beobachtet</dt>
                <dd>${cell.count}</dd>
                <dt>Erwartet</dt>
                <dd>${cell.expected?.toFixed(1) || '-'}</dd>
                <dt>Zeilenprozent</dt>
                <dd>${(cell.count / rowTotal * 100).toFixed(1)}%</dd>
                <dt>Spaltenprozent</dt>
                <dd>${(cell.count / colTotal * 100).toFixed(1)}%</dd>
                <dt>Gesamtprozent</dt>
                <dd>${(cell.count / grandTotal * 100).toFixed(2)}%</dd>
            `;
        }
    }

    bindEvents() {
        document.getElementById('sort-rows')?.addEventListener('change', (e) => {
            this.sortRows = e.target.value;
            this.renderTable();
        });

        document.getElementById('sort-cols')?.addEventListener('change', (e) => {
            this.sortCols = e.target.value;
            this.renderTable();
        });

        document.getElementById('show-totals')?.addEventListener('change', (e) => {
            this.showTotals = e.target.checked;
            this.renderTable();
        });

        document.getElementById('show-percent')?.addEventListener('change', (e) => {
            this.showPercent = e.target.checked;
            this.renderTable();
        });

        document.getElementById('crosstab-body')?.addEventListener('click', (e) => {
            const cell = e.target.closest('.data-cell');
            if (cell) {
                this.selectCell(cell.dataset.row, cell.dataset.col);
            }
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
    new MatrixTabelle().init();
});

export default MatrixTabelle;
