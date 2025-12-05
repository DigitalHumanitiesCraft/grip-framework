/**
 * Monitor Timeline-Modus
 *
 * Zeitreihenanalyse mit Zoom/Pan und Event-Annotations
 *
 * Benötigte Daten: metrics[], readings[], alerts[]
 * Wissensbasis: 15-MODI#Monitor-Timeline
 */

class MonitorTimeline {
    constructor(containerId, dataPath) {
        this.container = document.getElementById(containerId);
        this.dataPath = dataPath || '../data/scope-monitor.json';
        this.data = null;
        this.visibleMetrics = new Set();
        this.timeRange = '24h';
        this.showThresholds = true;
        this.showAnnotations = true;
        this.smoothLines = false;
        this.hoveredPoint = null;

        this.init();
    }

    async init() {
        try {
            const response = await fetch(this.dataPath);
            this.data = await response.json();
            // Initialize with first two metrics visible
            const metrics = this.data.metrics || [];
            if (metrics.length > 0) this.visibleMetrics.add(metrics[0].id);
            if (metrics.length > 1) this.visibleMetrics.add(metrics[1].id);
            this.render();
            this.bindEvents();
            this.bindKeyboard();
        } catch (error) {
            console.error('Fehler beim Laden der Daten:', error);
        }
    }

    render() {
        if (!this.data) return;

        this.renderMetricCheckboxes();
        this.renderTimelineChart();
        this.renderEventsStrip();
        this.renderEventsList();
        this.updateStats();
    }

    renderMetricCheckboxes() {
        const container = document.getElementById('metric-checkboxes');
        if (!container) return;

        const metrics = this.data.metrics || [];

        container.innerHTML = metrics.map(metric => `
            <label class="checkbox-label">
                <input type="checkbox" data-metric="${metric.id}"
                       ${this.visibleMetrics.has(metric.id) ? 'checked' : ''}>
                <span class="metric-color" style="background: ${metric.color}"></span>
                ${metric.label}
            </label>
        `).join('');
    }

    renderTimelineChart() {
        const container = document.getElementById('chart-container');
        const svg = document.getElementById('timeline-chart');
        if (!container || !svg) return;

        const readings = this.data.readings || [];
        const metrics = this.data.metrics || [];

        if (readings.length === 0) {
            svg.innerHTML = '<text x="50%" y="50%" text-anchor="middle">Keine Daten</text>';
            return;
        }

        const width = container.clientWidth - 60;
        const height = container.clientHeight - 40;
        const padding = { top: 20, right: 20, bottom: 30, left: 50 };

        // Get time range
        const timestamps = readings.map(r => new Date(r.timestamp).getTime());
        const minTime = Math.min(...timestamps);
        const maxTime = Math.max(...timestamps);

        let svgContent = '';

        // Draw grid lines
        for (let i = 0; i <= 5; i++) {
            const y = padding.top + (i / 5) * (height - padding.top - padding.bottom);
            svgContent += `<line class="chart-grid" x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#eee"/>`;
        }

        // Draw each visible metric
        this.visibleMetrics.forEach(metricId => {
            const metric = metrics.find(m => m.id === metricId);
            if (!metric) return;

            const values = readings.map(r => r[metricId]).filter(v => v !== undefined);
            if (values.length === 0) return;

            const minVal = Math.min(...values);
            const maxVal = Math.max(...values);
            const range = maxVal - minVal || 1;

            // Threshold lines
            if (this.showThresholds && metric.thresholds) {
                const th = metric.thresholds;
                if (th.warning_high) {
                    const y = padding.top + ((maxVal - th.warning_high) / range) * (height - padding.top - padding.bottom);
                    svgContent += `<line class="chart-threshold warning" x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}"/>`;
                }
                if (th.critical_high) {
                    const y = padding.top + ((maxVal - th.critical_high) / range) * (height - padding.top - padding.bottom);
                    svgContent += `<line class="chart-threshold critical" x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}"/>`;
                }
            }

            // Data line
            const points = readings.map((r, i) => {
                const x = padding.left + ((timestamps[i] - minTime) / (maxTime - minTime)) * (width - padding.left - padding.right);
                const y = padding.top + ((maxVal - (r[metricId] || minVal)) / range) * (height - padding.top - padding.bottom);
                return `${x},${y}`;
            }).join(' ');

            svgContent += `<polyline class="chart-line ${this.smoothLines ? 'smooth' : ''}"
                                     points="${points}"
                                     stroke="${metric.color}"
                                     data-metric="${metricId}"/>`;

            // Data points
            readings.forEach((r, i) => {
                const x = padding.left + ((timestamps[i] - minTime) / (maxTime - minTime)) * (width - padding.left - padding.right);
                const y = padding.top + ((maxVal - (r[metricId] || minVal)) / range) * (height - padding.top - padding.bottom);
                svgContent += `<circle class="chart-point" cx="${x}" cy="${y}" r="3" fill="${metric.color}"
                                       data-metric="${metricId}" data-index="${i}"/>`;
            });
        });

        // Axes
        svgContent += `<line class="chart-axis" x1="${padding.left}" y1="${height - padding.bottom}" x2="${width - padding.right}" y2="${height - padding.bottom}"/>`;
        svgContent += `<line class="chart-axis" x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${height - padding.bottom}"/>`;

        // Time labels
        const timeSteps = 5;
        for (let i = 0; i <= timeSteps; i++) {
            const x = padding.left + (i / timeSteps) * (width - padding.left - padding.right);
            const time = new Date(minTime + (i / timeSteps) * (maxTime - minTime));
            const label = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
            svgContent += `<text class="chart-axis-label" x="${x}" y="${height - 5}" text-anchor="middle">${label}</text>`;
        }

        svg.innerHTML = svgContent;
    }

    renderEventsStrip() {
        const container = document.getElementById('events-strip');
        if (!container) return;

        if (!this.showAnnotations) {
            container.innerHTML = '';
            return;
        }

        const alerts = this.data.alerts || [];
        const anomalies = this.data.anomalies || [];
        const readings = this.data.readings || [];

        if (readings.length === 0) return;

        const timestamps = readings.map(r => new Date(r.timestamp).getTime());
        const minTime = Math.min(...timestamps);
        const maxTime = Math.max(...timestamps);
        const timeRange = maxTime - minTime || 1;

        let markersHTML = '';

        // Alert markers
        alerts.forEach(alert => {
            const time = new Date(alert.timestamp).getTime();
            const left = ((time - minTime) / timeRange) * 100;
            markersHTML += `<div class="event-marker alert" style="left: ${left}%" data-alert="${alert.id}" title="${alert.message}"></div>`;
        });

        // Anomaly markers
        anomalies.forEach(anomaly => {
            const time = new Date(anomaly.timestamp).getTime();
            const left = ((time - minTime) / timeRange) * 100;
            markersHTML += `<div class="event-marker anomaly" style="left: ${left}%" data-anomaly="${anomaly.id}" title="${anomaly.description}"></div>`;
        });

        container.innerHTML = markersHTML;
    }

    renderEventsList() {
        const container = document.getElementById('events-list');
        if (!container) return;

        const alerts = this.data.alerts || [];
        const anomalies = this.data.anomalies || [];

        const events = [
            ...alerts.map(a => ({ ...a, type: 'alert' })),
            ...anomalies.map(a => ({ ...a, type: 'anomaly' }))
        ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        container.innerHTML = events.slice(0, 5).map(event => `
            <li class="event-item">
                <span class="event-dot ${event.type}"></span>
                <div>
                    <div>${event.message || event.description}</div>
                    <div class="event-time">${this.formatTime(event.timestamp)}</div>
                </div>
            </li>
        `).join('') || '<li>Keine Ereignisse</li>';
    }

    updateStats() {
        const readings = this.data.readings || [];
        document.getElementById('stat-points').textContent = readings.length;

        if (readings.length > 0) {
            const first = new Date(readings[0].timestamp);
            const last = new Date(readings[readings.length - 1].timestamp);
            const hours = Math.round((last - first) / (1000 * 60 * 60));
            document.getElementById('stat-span').textContent = `${hours}h`;
        }
    }

    showPointDetail(metricId, index) {
        const readings = this.data.readings || [];
        const metrics = this.data.metrics || [];
        const reading = readings[index];

        if (!reading) return;

        const prompt = document.getElementById('point-prompt');
        const info = document.getElementById('point-info');

        prompt?.classList.add('hidden');
        info?.classList.remove('hidden');

        document.getElementById('point-time').textContent = this.formatTime(reading.timestamp);

        const valuesContainer = document.getElementById('point-values');
        valuesContainer.innerHTML = Array.from(this.visibleMetrics).map(mId => {
            const metric = metrics.find(m => m.id === mId);
            return `
                <div class="point-value-row">
                    <span class="point-metric-color" style="background: ${metric?.color || '#888'}"></span>
                    <span class="point-metric-label">${metric?.label || mId}</span>
                    <span class="point-metric-value">${reading[mId] ?? '--'} ${metric?.unit || ''}</span>
                </div>
            `;
        }).join('');
    }

    formatTime(timestamp) {
        if (!timestamp) return '--';
        const date = new Date(timestamp);
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }

    exportCSV() {
        const readings = this.data.readings || [];
        const metrics = this.data.metrics || [];

        const headers = ['Timestamp', ...metrics.map(m => m.label)];
        const rows = [headers.join(',')];

        readings.forEach(r => {
            const row = [r.timestamp, ...metrics.map(m => r[m.id] ?? '')];
            rows.push(row.join(','));
        });

        this.downloadFile(rows.join('\n'), 'timeline_export.csv', 'text/csv');
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
        // Metric checkboxes
        document.getElementById('metric-checkboxes')?.addEventListener('change', (e) => {
            const checkbox = e.target;
            if (checkbox.type === 'checkbox') {
                const metric = checkbox.dataset.metric;
                if (checkbox.checked) {
                    this.visibleMetrics.add(metric);
                } else {
                    this.visibleMetrics.delete(metric);
                }
                this.renderTimelineChart();
            }
        });

        // Time range buttons
        document.querySelectorAll('.range-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.range-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.timeRange = btn.dataset.range;
                this.render();
            });
        });

        // Chart options
        document.getElementById('show-thresholds')?.addEventListener('change', (e) => {
            this.showThresholds = e.target.checked;
            this.renderTimelineChart();
        });

        document.getElementById('show-annotations')?.addEventListener('change', (e) => {
            this.showAnnotations = e.target.checked;
            this.renderEventsStrip();
        });

        document.getElementById('smooth-lines')?.addEventListener('change', (e) => {
            this.smoothLines = e.target.checked;
            this.renderTimelineChart();
        });

        // Chart hover
        document.getElementById('timeline-chart')?.addEventListener('mousemove', (e) => {
            const point = e.target.closest('.chart-point');
            if (point) {
                this.showPointDetail(point.dataset.metric, parseInt(point.dataset.index));
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
    new MonitorTimeline('chart-container');
});

export default MonitorTimeline;
