/**
 * Monitor Anomalie-Modus
 *
 * Ausreißer identifizieren und Alert-Management
 *
 * Benötigte Daten: metrics[], readings[], anomalies[], alerts[]
 * Wissensbasis: 15-MODI#Monitor-Anomalie
 */

class MonitorAnomalie {
    constructor(containerId, dataPath) {
        this.container = document.getElementById(containerId);
        this.dataPath = dataPath || '../data/scope-monitor.json';
        this.data = null;
        this.selectedAnomaly = null;
        this.filter = 'all';
        this.sensitivity = 70;
        this.detectionMethod = 'zscore';

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

        this.renderThresholdList();
        this.renderScoreChart();
        this.renderAnomalyList();
        this.renderAlertHistory();
        this.updateStats();
    }

    renderThresholdList() {
        const container = document.getElementById('threshold-list');
        if (!container) return;

        const metrics = this.data.metrics || [];

        container.innerHTML = metrics.slice(0, 4).map(metric => {
            const th = metric.thresholds || {};

            return `
                <div class="threshold-item" data-metric="${metric.id}">
                    <div class="threshold-metric">
                        <span class="threshold-color" style="background: ${metric.color}"></span>
                        ${metric.label}
                    </div>
                    <div class="threshold-inputs">
                        <div>
                            <label>Warnung hoch</label>
                            <input type="number" value="${th.warning_high || ''}" data-type="warning_high">
                        </div>
                        <div>
                            <label>Kritisch hoch</label>
                            <input type="number" value="${th.critical_high || ''}" data-type="critical_high">
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderScoreChart() {
        const container = document.getElementById('score-chart');
        if (!container) return;

        const readings = this.data.readings || [];
        const threshold = 0.7; // Anomaly threshold

        // Calculate simple anomaly scores for visualization
        const scores = readings.map((r, i) => {
            return r.anomaly ? 0.9 : Math.random() * 0.4;
        });

        const width = container.clientWidth;
        const barWidth = Math.max(4, (width / scores.length) - 2);

        container.innerHTML = `
            <div class="score-threshold-line" style="bottom: ${threshold * 100}%"></div>
            ${scores.map((score, i) => {
                const isAnomaly = score > threshold;
                const left = (i / scores.length) * 100;
                return `<div class="score-bar ${isAnomaly ? 'anomaly' : ''}"
                            style="left: ${left}%; height: ${score * 100}%; width: ${barWidth}px"></div>`;
            }).join('')}
        `;
    }

    renderAnomalyList() {
        const container = document.getElementById('anomaly-list');
        if (!container) return;

        const anomalies = this.data.anomalies || [];
        const alerts = this.data.alerts || [];

        // Combine anomalies and severe alerts
        let items = [
            ...anomalies.map(a => ({ ...a, itemType: 'anomaly' })),
            ...alerts.filter(a => a.severity === 'warning' || a.severity === 'critical')
                     .map(a => ({ ...a, itemType: 'alert', anomaly_score: 0.75 }))
        ];

        // Apply filter
        if (this.filter === 'unacknowledged') {
            items = items.filter(i => !i.acknowledged);
        } else if (this.filter === 'acknowledged') {
            items = items.filter(i => i.acknowledged);
        }

        // Sort by timestamp
        items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        container.innerHTML = items.map(item => {
            const isSelected = this.selectedAnomaly === item.id;
            const score = item.anomaly_score || 0.75;

            return `
                <li class="anomaly-item ${isSelected ? 'selected' : ''} ${item.acknowledged ? 'acknowledged' : ''}"
                    data-id="${item.id}">
                    <div class="anomaly-score-badge">
                        <span class="score">${score.toFixed(2)}</span>
                        <span class="label">Score</span>
                    </div>
                    <div class="anomaly-content-main">
                        <div class="anomaly-content-header">
                            <span class="anomaly-id">${item.id}</span>
                            <span class="anomaly-time">${this.formatTime(item.timestamp)}</span>
                        </div>
                        <div class="anomaly-description">${item.description || item.message}</div>
                        <div class="anomaly-metrics-affected">
                            ${(item.metrics_affected || [item.metric]).map(m =>
                                `<span class="affected-metric-badge">${m}</span>`
                            ).join('')}
                        </div>
                    </div>
                </li>
            `;
        }).join('') || '<li>Keine Anomalien gefunden</li>';
    }

    renderAlertHistory() {
        const container = document.getElementById('alert-history');
        if (!container) return;

        const alerts = this.data.alerts || [];

        container.innerHTML = alerts.slice(0, 5).map(alert => `
            <li class="alert-history-item">
                <span class="alert-history-icon">${alert.severity === 'critical' ? '🔴' : '🟡'}</span>
                <div class="alert-history-content">
                    <div>${alert.message}</div>
                    <div class="alert-history-time">${this.formatTime(alert.timestamp)}</div>
                </div>
            </li>
        `).join('') || '<li>Keine Alerts</li>';
    }

    updateStats() {
        const anomalies = this.data.anomalies || [];
        const alerts = this.data.alerts || [];
        const readings = this.data.readings || [];

        document.getElementById('stat-anomalies').textContent = anomalies.length + alerts.length;

        if (anomalies.length > 0) {
            const lastAnomaly = anomalies[anomalies.length - 1];
            document.getElementById('stat-last-anomaly').textContent = this.formatTime(lastAnomaly.timestamp);
        } else {
            document.getElementById('stat-last-anomaly').textContent = '--';
        }

        const normalCount = readings.filter(r => !r.anomaly).length;
        const normalRate = readings.length > 0 ? ((normalCount / readings.length) * 100).toFixed(1) : 100;
        document.getElementById('stat-normal-rate').textContent = `${normalRate}%`;
    }

    selectAnomaly(anomalyId) {
        this.selectedAnomaly = anomalyId;
        this.renderAnomalyList();
        this.showAnomalyDetail(anomalyId);
    }

    showAnomalyDetail(anomalyId) {
        const anomalies = this.data.anomalies || [];
        const alerts = this.data.alerts || [];
        const metrics = this.data.metrics || [];

        const anomaly = anomalies.find(a => a.id === anomalyId) ||
                       alerts.find(a => a.id === anomalyId);

        if (!anomaly) return;

        const prompt = document.getElementById('anomaly-prompt');
        const info = document.getElementById('anomaly-info');

        prompt?.classList.add('hidden');
        info?.classList.remove('hidden');

        document.getElementById('anomaly-id').textContent = anomaly.id;
        document.getElementById('anomaly-score').textContent = (anomaly.anomaly_score || 0.75).toFixed(2);
        document.getElementById('anomaly-time').textContent = this.formatDateTime(anomaly.timestamp);

        // Affected metrics
        const affectedList = document.getElementById('affected-metrics-list');
        const affectedMetrics = anomaly.metrics_affected || [anomaly.metric];

        affectedList.innerHTML = affectedMetrics.map(mId => {
            const metric = metrics.find(m => m.id === mId);
            return `
                <li>
                    <span class="metric-dot" style="background: ${metric?.color || '#888'}"></span>
                    ${metric?.label || mId}
                </li>
            `;
        }).join('');

        document.getElementById('anomaly-description').textContent =
            anomaly.description || anomaly.message || '--';
        document.getElementById('anomaly-cause').textContent =
            anomaly.probable_cause || 'Unbekannt';
    }

    acknowledgeAnomaly() {
        if (!this.selectedAnomaly) return;

        // Find and update
        const anomalies = this.data.anomalies || [];
        const alerts = this.data.alerts || [];

        const anomaly = anomalies.find(a => a.id === this.selectedAnomaly);
        const alert = alerts.find(a => a.id === this.selectedAnomaly);

        if (anomaly) anomaly.acknowledged = true;
        if (alert) alert.acknowledged = true;

        this.renderAnomalyList();
        console.log(`Anomalie ${this.selectedAnomaly} bestätigt`);
    }

    formatTime(timestamp) {
        if (!timestamp) return '--';
        const date = new Date(timestamp);
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }

    formatDateTime(timestamp) {
        if (!timestamp) return '--';
        const date = new Date(timestamp);
        return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}. ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }

    bindEvents() {
        // Sensitivity slider
        document.getElementById('sensitivity')?.addEventListener('input', (e) => {
            this.sensitivity = parseInt(e.target.value);
            document.getElementById('sensitivity-value').textContent = `${this.sensitivity}%`;
        });

        // Detection method
        document.getElementById('detection-method')?.addEventListener('change', (e) => {
            this.detectionMethod = e.target.value;
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filter = btn.dataset.filter;
                this.renderAnomalyList();
            });
        });

        // Anomaly list clicks
        document.getElementById('anomaly-list')?.addEventListener('click', (e) => {
            const item = e.target.closest('.anomaly-item');
            if (item) {
                this.selectAnomaly(item.dataset.id);
            }
        });

        // Acknowledge button
        document.getElementById('acknowledge-btn')?.addEventListener('click', () => {
            this.acknowledgeAnomaly();
        });

        // Investigate button
        document.getElementById('investigate-btn')?.addEventListener('click', () => {
            window.location.href = 'timeline.html';
        });
    }

    bindKeyboard() {
        document.addEventListener('keydown', (e) => {
            // Mode switching
            if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '4') {
                e.preventDefault();
                const modes = ['dashboard', 'timeline', 'anomalie', 'korrelation'];
                window.location.href = `${modes[parseInt(e.key) - 1]}.html`;
            }

            // Acknowledge
            if (e.key === 'a' && !e.metaKey && !e.ctrlKey) {
                this.acknowledgeAnomaly();
            }
        });
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    new MonitorAnomalie('anomaly-list');
});

export default MonitorAnomalie;
