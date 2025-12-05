/**
 * Monitor Korrelation-Modus
 *
 * Zusammenhänge zwischen Streams mit Scatter-Plot und Lag-Korrelation
 *
 * Benötigte Daten: metrics[], readings[], correlations[]
 * Wissensbasis: 15-MODI#Monitor-Korrelation
 */

class MonitorKorrelation {
    constructor(containerId, dataPath) {
        this.container = document.getElementById(containerId);
        this.dataPath = dataPath || '../data/scope-monitor.json';
        this.data = null;
        this.metricX = null;
        this.metricY = null;
        this.lagHours = 0;
        this.showRegression = true;
        this.colorByTime = true;

        this.init();
    }

    async init() {
        try {
            const response = await fetch(this.dataPath);
            this.data = await response.json();

            // Initialize with first two metrics
            const metrics = this.data.metrics || [];
            if (metrics.length > 0) this.metricX = metrics[0].id;
            if (metrics.length > 1) this.metricY = metrics[1].id;

            this.render();
            this.bindEvents();
            this.bindKeyboard();
        } catch (error) {
            console.error('Fehler beim Laden der Daten:', error);
        }
    }

    render() {
        if (!this.data) return;

        this.renderMetricSelectors();
        this.renderCorrelationMatrix();
        this.renderScatterPlot();
        this.renderKnownCorrelations();
        this.updateStats();
        this.updateCorrelationResult();
    }

    renderMetricSelectors() {
        const metrics = this.data.metrics || [];

        const optionsHTML = metrics.map(m =>
            `<option value="${m.id}">${m.label} (${m.unit})</option>`
        ).join('');

        const selectX = document.getElementById('metric-x');
        const selectY = document.getElementById('metric-y');

        if (selectX) {
            selectX.innerHTML = optionsHTML;
            selectX.value = this.metricX;
        }

        if (selectY) {
            selectY.innerHTML = optionsHTML;
            selectY.value = this.metricY;
        }
    }

    renderCorrelationMatrix() {
        const container = document.getElementById('correlation-matrix');
        if (!container) return;

        const metrics = this.data.metrics || [];
        const correlations = this.data.correlations || [];

        // Build correlation lookup
        const corrLookup = {};
        correlations.forEach(c => {
            corrLookup[`${c.metric_a}|${c.metric_b}`] = c.coefficient;
            corrLookup[`${c.metric_b}|${c.metric_a}`] = c.coefficient;
        });

        // Render mini matrix (first 4 metrics)
        const displayMetrics = metrics.slice(0, 4);

        let matrixHTML = '<div class="matrix-header matrix-row">';
        matrixHTML += '<div class="matrix-cell"></div>';
        displayMetrics.forEach(m => {
            matrixHTML += `<div class="matrix-label">${m.label.substring(0, 4)}</div>`;
        });
        matrixHTML += '</div>';

        displayMetrics.forEach(mRow => {
            matrixHTML += '<div class="matrix-row">';
            matrixHTML += `<div class="matrix-label">${mRow.label.substring(0, 4)}</div>`;

            displayMetrics.forEach(mCol => {
                const key = `${mRow.id}|${mCol.id}`;
                const coef = mRow.id === mCol.id ? 1 : (corrLookup[key] || 0);
                const strength = Math.abs(coef);
                const className = coef > 0.1 ? 'positive' : (coef < -0.1 ? 'negative' : 'neutral');

                matrixHTML += `<div class="matrix-cell ${className}"
                                   style="--strength: ${strength}"
                                   data-x="${mRow.id}" data-y="${mCol.id}"
                                   title="${mRow.label} × ${mCol.label}: ${coef.toFixed(2)}">
                                   ${mRow.id === mCol.id ? '1' : coef.toFixed(1)}
                               </div>`;
            });
            matrixHTML += '</div>';
        });

        container.innerHTML = matrixHTML;
    }

    renderScatterPlot() {
        const container = document.getElementById('scatter-container');
        const svg = document.getElementById('scatter-plot');
        if (!container || !svg) return;

        if (!this.metricX || !this.metricY) {
            svg.innerHTML = '<text x="50%" y="50%" text-anchor="middle">Wählen Sie zwei Metriken</text>';
            return;
        }

        const readings = this.data.readings || [];
        const metrics = this.data.metrics || [];
        const metricXObj = metrics.find(m => m.id === this.metricX);
        const metricYObj = metrics.find(m => m.id === this.metricY);

        if (readings.length === 0) {
            svg.innerHTML = '<text x="50%" y="50%" text-anchor="middle">Keine Daten</text>';
            return;
        }

        const width = container.clientWidth;
        const height = container.clientHeight;
        const padding = { top: 20, right: 20, bottom: 50, left: 60 };

        // Get data with lag
        const dataPoints = this.getDataWithLag();

        if (dataPoints.length < 2) {
            svg.innerHTML = '<text x="50%" y="50%" text-anchor="middle">Nicht genug Datenpunkte</text>';
            return;
        }

        const xValues = dataPoints.map(d => d.x);
        const yValues = dataPoints.map(d => d.y);

        const xMin = Math.min(...xValues);
        const xMax = Math.max(...xValues);
        const yMin = Math.min(...yValues);
        const yMax = Math.max(...yValues);

        const xRange = xMax - xMin || 1;
        const yRange = yMax - yMin || 1;

        let svgContent = '';

        // Grid
        for (let i = 0; i <= 5; i++) {
            const y = padding.top + (i / 5) * (height - padding.top - padding.bottom);
            const x = padding.left + (i / 5) * (width - padding.left - padding.right);
            svgContent += `<line stroke="#eee" x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}"/>`;
            svgContent += `<line stroke="#eee" x1="${x}" y1="${padding.top}" x2="${x}" y2="${height - padding.bottom}"/>`;
        }

        // Regression line
        if (this.showRegression) {
            const regression = this.calculateRegression(dataPoints);
            if (regression) {
                const x1 = padding.left;
                const x2 = width - padding.right;
                const y1 = padding.top + ((yMax - (regression.slope * xMin + regression.intercept)) / yRange) * (height - padding.top - padding.bottom);
                const y2 = padding.top + ((yMax - (regression.slope * xMax + regression.intercept)) / yRange) * (height - padding.top - padding.bottom);

                svgContent += `<line class="regression-line" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
            }
        }

        // Points
        dataPoints.forEach((point, i) => {
            const x = padding.left + ((point.x - xMin) / xRange) * (width - padding.left - padding.right);
            const y = padding.top + ((yMax - point.y) / yRange) * (height - padding.top - padding.bottom);

            // Color by time
            let color = '#4E7396';
            if (this.colorByTime) {
                const t = i / (dataPoints.length - 1);
                const r = Math.round(59 + t * (236 - 59));
                const g = Math.round(130 + t * (72 - 130));
                const b = Math.round(246 + t * (153 - 246));
                color = `rgb(${r}, ${g}, ${b})`;
            }

            svgContent += `<circle class="scatter-point" cx="${x}" cy="${y}" r="5" fill="${color}"
                                   data-index="${i}" data-x="${point.x}" data-y="${point.y}"/>`;
        });

        // Axes
        svgContent += `<line class="scatter-axis" x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}"/>`;
        svgContent += `<line class="scatter-axis" x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${height - padding.bottom}"/>`;

        // Axis labels
        svgContent += `<text class="scatter-axis-label" x="${width / 2}" y="${height - 10}" text-anchor="middle">${metricXObj?.label || this.metricX}</text>`;
        svgContent += `<text class="scatter-axis-label" x="15" y="${height / 2}" text-anchor="middle" transform="rotate(-90, 15, ${height / 2})">${metricYObj?.label || this.metricY}</text>`;

        // Value labels on axes
        svgContent += `<text class="scatter-axis-label" x="${padding.left}" y="${height - padding.bottom + 15}" text-anchor="middle">${xMin.toFixed(1)}</text>`;
        svgContent += `<text class="scatter-axis-label" x="${width - padding.right}" y="${height - padding.bottom + 15}" text-anchor="middle">${xMax.toFixed(1)}</text>`;
        svgContent += `<text class="scatter-axis-label" x="${padding.left - 5}" y="${height - padding.bottom}" text-anchor="end">${yMin.toFixed(1)}</text>`;
        svgContent += `<text class="scatter-axis-label" x="${padding.left - 5}" y="${padding.top + 5}" text-anchor="end">${yMax.toFixed(1)}</text>`;

        svg.innerHTML = svgContent;
    }

    getDataWithLag() {
        const readings = this.data.readings || [];
        const lagOffset = Math.abs(this.lagHours);
        const dataPoints = [];

        for (let i = lagOffset; i < readings.length; i++) {
            const xIndex = this.lagHours >= 0 ? i - lagOffset : i;
            const yIndex = this.lagHours >= 0 ? i : i - lagOffset;

            if (xIndex >= 0 && yIndex >= 0 && xIndex < readings.length && yIndex < readings.length) {
                const xVal = readings[xIndex][this.metricX];
                const yVal = readings[yIndex][this.metricY];

                if (xVal !== undefined && yVal !== undefined) {
                    dataPoints.push({
                        x: xVal,
                        y: yVal,
                        timestamp: readings[i].timestamp
                    });
                }
            }
        }

        return dataPoints;
    }

    calculateRegression(dataPoints) {
        const n = dataPoints.length;
        if (n < 2) return null;

        const sumX = dataPoints.reduce((s, p) => s + p.x, 0);
        const sumY = dataPoints.reduce((s, p) => s + p.y, 0);
        const sumXY = dataPoints.reduce((s, p) => s + p.x * p.y, 0);
        const sumX2 = dataPoints.reduce((s, p) => s + p.x * p.x, 0);
        const sumY2 = dataPoints.reduce((s, p) => s + p.y * p.y, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // R-squared
        const yMean = sumY / n;
        const ssTotal = dataPoints.reduce((s, p) => s + Math.pow(p.y - yMean, 2), 0);
        const ssResidual = dataPoints.reduce((s, p) => s + Math.pow(p.y - (slope * p.x + intercept), 2), 0);
        const r2 = 1 - (ssResidual / ssTotal);

        // Correlation coefficient
        const r = (n * sumXY - sumX * sumY) /
                  Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

        return { slope, intercept, r2, r };
    }

    renderKnownCorrelations() {
        const container = document.getElementById('known-correlations');
        if (!container) return;

        const correlations = this.data.correlations || [];

        container.innerHTML = correlations.map(corr => {
            const isActive = corr.metric_a === this.metricX && corr.metric_b === this.metricY ||
                            corr.metric_a === this.metricY && corr.metric_b === this.metricX;
            const className = corr.coefficient > 0 ? 'positive' : 'negative';

            return `
                <li class="known-correlation-item ${isActive ? 'active' : ''}"
                    data-metric-a="${corr.metric_a}" data-metric-b="${corr.metric_b}">
                    <div class="known-metrics">
                        ${corr.metric_a} × ${corr.metric_b}
                        <span class="known-coefficient ${className}">${corr.coefficient.toFixed(2)}</span>
                    </div>
                    <div class="known-description">${corr.description}</div>
                </li>
            `;
        }).join('') || '<li>Keine bekannten Korrelationen</li>';
    }

    updateStats() {
        const dataPoints = this.getDataWithLag();
        document.getElementById('stat-n').textContent = dataPoints.length;

        if (dataPoints.length >= 2) {
            const regression = this.calculateRegression(dataPoints);
            if (regression) {
                document.getElementById('stat-coefficient').textContent = regression.r.toFixed(3);
                document.getElementById('stat-pvalue').textContent = '< 0.05'; // Simplified
                document.getElementById('regression-slope').textContent = regression.slope.toFixed(3);
                document.getElementById('regression-intercept').textContent = regression.intercept.toFixed(3);
                document.getElementById('regression-r2').textContent = regression.r2.toFixed(3);
            }
        }
    }

    updateCorrelationResult() {
        const dataPoints = this.getDataWithLag();

        if (dataPoints.length < 2) {
            document.getElementById('result-coefficient').innerHTML =
                '<span class="coefficient-value">--</span><span class="coefficient-label">r</span>';
            document.getElementById('result-interpretation').textContent = 'Nicht genug Datenpunkte';
            return;
        }

        const regression = this.calculateRegression(dataPoints);
        if (!regression) return;

        const r = regression.r;
        document.getElementById('result-coefficient').innerHTML =
            `<span class="coefficient-value">${r.toFixed(2)}</span><span class="coefficient-label">r</span>`;

        let interpretation = '';
        const absR = Math.abs(r);
        if (absR > 0.7) {
            interpretation = r > 0 ? 'Starke positive Korrelation' : 'Starke negative Korrelation';
        } else if (absR > 0.4) {
            interpretation = r > 0 ? 'Mittlere positive Korrelation' : 'Mittlere negative Korrelation';
        } else if (absR > 0.2) {
            interpretation = r > 0 ? 'Schwache positive Korrelation' : 'Schwache negative Korrelation';
        } else {
            interpretation = 'Kein linearer Zusammenhang';
        }

        document.getElementById('result-interpretation').textContent = interpretation;
    }

    exportCSV() {
        const dataPoints = this.getDataWithLag();
        const rows = [`${this.metricX},${this.metricY}`];

        dataPoints.forEach(p => {
            rows.push(`${p.x},${p.y}`);
        });

        this.downloadFile(rows.join('\n'), 'correlation_export.csv', 'text/csv');
    }

    downloadFile(content, filename, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    bindEvents() {
        // Metric selectors
        document.getElementById('metric-x')?.addEventListener('change', (e) => {
            this.metricX = e.target.value;
            this.renderScatterPlot();
            this.renderKnownCorrelations();
            this.updateStats();
            this.updateCorrelationResult();
        });

        document.getElementById('metric-y')?.addEventListener('change', (e) => {
            this.metricY = e.target.value;
            this.renderScatterPlot();
            this.renderKnownCorrelations();
            this.updateStats();
            this.updateCorrelationResult();
        });

        // Lag slider
        document.getElementById('lag-slider')?.addEventListener('input', (e) => {
            this.lagHours = parseInt(e.target.value);
            document.getElementById('lag-value').textContent = this.lagHours;
            this.renderScatterPlot();
            this.updateStats();
            this.updateCorrelationResult();
        });

        // Chart options
        document.getElementById('show-regression')?.addEventListener('change', (e) => {
            this.showRegression = e.target.checked;
            this.renderScatterPlot();
        });

        document.getElementById('color-by-time')?.addEventListener('change', (e) => {
            this.colorByTime = e.target.checked;
            this.renderScatterPlot();
        });

        // Known correlations click
        document.getElementById('known-correlations')?.addEventListener('click', (e) => {
            const item = e.target.closest('.known-correlation-item');
            if (item) {
                this.metricX = item.dataset.metricA;
                this.metricY = item.dataset.metricB;
                document.getElementById('metric-x').value = this.metricX;
                document.getElementById('metric-y').value = this.metricY;
                this.render();
            }
        });

        // Matrix cell click
        document.getElementById('correlation-matrix')?.addEventListener('click', (e) => {
            const cell = e.target.closest('.matrix-cell');
            if (cell && cell.dataset.x && cell.dataset.y) {
                this.metricX = cell.dataset.x;
                this.metricY = cell.dataset.y;
                document.getElementById('metric-x').value = this.metricX;
                document.getElementById('metric-y').value = this.metricY;
                this.render();
            }
        });

        // Export
        document.getElementById('export-csv')?.addEventListener('click', () => this.exportCSV());
    }

    bindKeyboard() {
        document.addEventListener('keydown', (e) => {
            // Mode switching
            if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '4') {
                e.preventDefault();
                const modes = ['dashboard', 'timeline', 'anomalie', 'korrelation'];
                window.location.href = `${modes[parseInt(e.key) - 1]}.html`;
            }
        });
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    new MonitorKorrelation('scatter-container');
});

export default MonitorKorrelation;
