/**
 * Matrix Residuen-Modus
 * Statistische Abweichungen vom Erwartungswert
 *
 * Benoetigte Daten: dimensions, cells[] mit expected und residual
 * Wissensbasis: 15-MODI#Matrix-Residuen
 */

class MatrixResiduen {
    constructor() {
        this.data = null;
        this.residualType = 'standardized';
        this.threshold = 1.96;
        this.highlightSig = true;
        this.showExpected = false;
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
        this.renderChiContributions();
        this.renderStatistics();
    }

    renderMeta() {
        const title = document.getElementById('matrix-title');
        const source = document.getElementById('matrix-source');
        if (title) title.textContent = this.data?.metadata?.title || 'Residuenanalyse';
        if (source) source.textContent = this.data?.metadata?.source || '';
    }

    renderTable() {
        const thead = document.getElementById('residuen-head');
        const tbody = document.getElementById('residuen-body');
        if (!thead || !tbody || !this.data?.dimensions) return;

        const rows = this.data.dimensions.rows.values;
        const cols = this.data.dimensions.columns.values;

        thead.innerHTML = `
            <tr>
                <th></th>
                ${cols.map(col => `<th class="col-header">${col}</th>`).join('')}
            </tr>
        `;

        tbody.innerHTML = rows.map(row => `
            <tr>
                <th class="row-header">${row}</th>
                ${cols.map(col => {
                    const cell = this.getCell(row, col);
                    const residual = this.getResidual(cell);
                    const isSignificant = Math.abs(residual) > this.threshold;
                    const color = this.getResidualColor(residual);
                    const isSelected = this.selectedCell?.row === row && this.selectedCell?.col === col;

                    let content = residual.toFixed(2);
                    if (this.showExpected && cell) {
                        content += `<br><span class="expected">(E: ${cell.expected?.toFixed(0)})</span>`;
                    }

                    return `
                        <td class="residual-cell ${isSignificant && this.highlightSig ? 'significant' : ''} ${isSelected ? 'selected' : ''}"
                            data-row="${row}" data-col="${col}"
                            style="background-color: ${color}">
                            ${content}
                        </td>
                    `;
                }).join('')}
            </tr>
        `).join('');
    }

    renderChiContributions() {
        const container = document.getElementById('chi-contributions');
        if (!container) return;

        // Berechne Chi-Quadrat-Beitraege pro Zelle
        const contributions = this.data.cells.map(cell => ({
            label: `${cell.row}/${cell.column}`.substring(0, 10),
            value: Math.pow(cell.residual || 0, 2),
            row: cell.row,
            column: cell.column
        })).sort((a, b) => b.value - a.value).slice(0, 8);

        const maxContrib = Math.max(...contributions.map(c => c.value));

        container.innerHTML = `
            <div class="contrib-chart">
                ${contributions.map(c => `
                    <div class="contrib-bar-container" data-row="${c.row}" data-col="${c.column}">
                        <span class="contrib-label">${c.label}</span>
                        <div class="contrib-bar" style="width: ${(c.value / maxContrib) * 100}%"></div>
                        <span class="contrib-value">${c.value.toFixed(1)}</span>
                    </div>
                `).join('')}
            </div>
        `;

        container.querySelectorAll('.contrib-bar-container').forEach(bar => {
            bar.addEventListener('click', () => {
                this.selectCell(bar.dataset.row, bar.dataset.col);
            });
        });
    }

    renderStatistics() {
        const stats = this.data?.statistics;
        if (!stats) return;

        document.getElementById('stat-chi').textContent = stats.chi_square?.toFixed(2) || '-';
        document.getElementById('stat-df').textContent = stats.df || '-';
        document.getElementById('stat-p').textContent = stats.p_value < 0.001 ? '< .001' : stats.p_value?.toFixed(4) || '-';
        document.getElementById('stat-v').textContent = stats.cramers_v?.toFixed(3) || '-';
    }

    getCell(row, col) {
        return this.data.cells.find(c => c.row === row && c.column === col);
    }

    getResidual(cell) {
        if (!cell) return 0;

        switch (this.residualType) {
            case 'raw':
                return cell.count - (cell.expected || 0);
            case 'adjusted':
                // Adjusted standardized residual
                const rowTotal = this.data.totals.row_totals[cell.row];
                const colTotal = this.data.totals.column_totals[cell.column];
                const grandTotal = this.data.totals.grand_total;
                const rowProp = rowTotal / grandTotal;
                const colProp = colTotal / grandTotal;
                const adjFactor = Math.sqrt((1 - rowProp) * (1 - colProp));
                return (cell.residual || 0) / adjFactor;
            default:
                return cell.residual || 0;
        }
    }

    getResidualColor(residual) {
        const absResidual = Math.abs(residual);
        const intensity = Math.min(absResidual / 5, 1) * 0.7;

        if (residual > 0) {
            return `rgba(74, 124, 89, ${intensity})`; // Gruen
        } else {
            return `rgba(184, 84, 80, ${intensity})`; // Rot
        }
    }

    selectCell(row, col) {
        this.selectedCell = { row, col };

        document.querySelectorAll('.residual-cell').forEach(td => {
            td.classList.toggle('selected', td.dataset.row === row && td.dataset.col === col);
        });

        const cell = this.getCell(row, col);
        if (!cell) return;

        const detail = document.getElementById('cell-detail');
        const content = document.getElementById('cell-detail-content');
        if (detail && content) {
            detail.classList.remove('hidden');
            const residual = this.getResidual(cell);
            const chiContrib = Math.pow(residual, 2);

            content.innerHTML = `
                <dt>${this.data.dimensions.rows.label}</dt>
                <dd>${row}</dd>
                <dt>${this.data.dimensions.columns.label}</dt>
                <dd>${col}</dd>
                <dt>Beobachtet (O)</dt>
                <dd>${cell.count}</dd>
                <dt>Erwartet (E)</dt>
                <dd>${cell.expected?.toFixed(1) || '-'}</dd>
                <dt>O - E</dt>
                <dd>${(cell.count - cell.expected).toFixed(1)}</dd>
                <dt>Std. Residuum</dt>
                <dd class="${Math.abs(residual) > this.threshold ? 'significant' : ''}">${residual.toFixed(3)}</dd>
                <dt>Chi-Beitrag</dt>
                <dd>${chiContrib.toFixed(2)}</dd>
                <dt>Signifikant?</dt>
                <dd>${Math.abs(residual) > this.threshold ? 'Ja (p < .05)' : 'Nein'}</dd>
            `;
        }
    }

    bindEvents() {
        document.getElementById('residual-type')?.addEventListener('change', (e) => {
            this.residualType = e.target.value;
            this.renderTable();
            this.renderChiContributions();
        });

        document.getElementById('threshold')?.addEventListener('change', (e) => {
            this.threshold = parseFloat(e.target.value);
            this.renderTable();
        });

        document.getElementById('highlight-sig')?.addEventListener('change', (e) => {
            this.highlightSig = e.target.checked;
            this.renderTable();
        });

        document.getElementById('show-expected')?.addEventListener('change', (e) => {
            this.showExpected = e.target.checked;
            this.renderTable();
        });

        document.getElementById('residuen-body')?.addEventListener('click', (e) => {
            const cell = e.target.closest('.residual-cell');
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
    new MatrixResiduen().init();
});

export default MatrixResiduen;
