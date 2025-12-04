/**
 * Monitor Module
 * Scope-Spezialisierung für Echtzeit-/Zeitreihendaten
 *
 * Kognitive Aufgabe: Zustandsüberwachung und Ausreißererkennung
 *
 * UI-Elemente:
 * - Ampel-Indikatoren für Schwellwerte
 * - Sparklines für schnellen Trendüberblick
 * - Anomalie-Highlighting in Zeitreihen
 * - Threshold-Linien in Charts
 * - Alert-Log mit Zeitstempeln
 * - Auto-Refresh-Indikator
 */

export class Monitor {
    constructor() {
        this.data = null;
        this.refreshInterval = null;
        this.visibleMetrics = new Set();
    }

    async init() {
        try {
            const response = await fetch('../examples/data/scope-monitor.json');
            this.data = await response.json();

            this.data.metrics.forEach(m => this.visibleMetrics.add(m.id));

            this.setupEventListeners();
            this.render();

            console.log('Monitor module initialized');
        } catch (error) {
            console.error('Error initializing Monitor:', error);
        }
    }

    setupEventListeners() {
        document.getElementById('refresh-interval')?.addEventListener('change', (e) => {
            this.setRefreshInterval(parseInt(e.target.value));
        });

        document.getElementById('time-range')?.addEventListener('change', (e) => {
            this.setTimeRange(e.target.value);
        });

        // Alert filters
        ['filter-critical', 'filter-warning', 'filter-acknowledged'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', () => this.filterAlerts());
        });
    }

    render() {
        this.renderSystemInfo();
        this.renderStatusOverview();
        this.renderSparklines();
        this.renderTimeseries();
        this.renderAlerts();
        this.renderAnomalies();
    }

    renderSystemInfo() {
        const sys = this.data?.system;
        if (!sys) return;

        document.getElementById('system-name').textContent = sys.name;
        document.getElementById('system-location').textContent = sys.location;

        const statusEl = document.getElementById('system-status');
        if (statusEl) {
            statusEl.textContent = sys.status;
            statusEl.className = `status-indicator status-${sys.status}`;
        }

        document.getElementById('last-update').textContent = new Date().toLocaleTimeString('de-DE');
    }

    renderStatusOverview() {
        const container = document.getElementById('status-overview');
        if (!container || !this.data?.metrics) return;

        const latestReading = this.data.readings?.[this.data.readings.length - 1] || {};

        container.innerHTML = this.data.metrics.map(metric => {
            const value = latestReading[metric.id];
            const status = value !== undefined ? this.getStatus(metric.id, value) : 'unknown';

            return `
                <div class="status-card status-${status}">
                    <div class="status-light"></div>
                    <div class="status-info">
                        <span class="metric-label">${metric.label}</span>
                        <span class="metric-value">${value !== undefined ? value.toFixed(1) : '-'} ${metric.unit}</span>
                    </div>
                    <div class="threshold-info">
                        <span class="range">Normal: ${metric.normal_range.min}–${metric.normal_range.max}</span>
                    </div>
                </div>
            `;
        }).join('');

        // Render metrics checkboxes
        const checkboxContainer = document.getElementById('metrics-checkboxes');
        if (checkboxContainer) {
            checkboxContainer.innerHTML = this.data.metrics.map(m => `
                <label class="metric-checkbox">
                    <input type="checkbox" data-metric="${m.id}" ${this.visibleMetrics.has(m.id) ? 'checked' : ''}>
                    ${m.label}
                </label>
            `).join('');

            checkboxContainer.querySelectorAll('input').forEach(cb => {
                cb.addEventListener('change', (e) => {
                    if (e.target.checked) {
                        this.visibleMetrics.add(e.target.dataset.metric);
                    } else {
                        this.visibleMetrics.delete(e.target.dataset.metric);
                    }
                    this.renderSparklines();
                    this.renderTimeseries();
                });
            });
        }
    }

    renderSparklines() {
        const container = document.getElementById('sparklines-row');
        if (!container || !this.data?.metrics) return;

        container.innerHTML = this.data.metrics
            .filter(m => this.visibleMetrics.has(m.id))
            .map(metric => {
                const values = this.data.readings.map(r => r[metric.id]).filter(v => v !== undefined);
                const min = Math.min(...values);
                const max = Math.max(...values);
                const range = max - min || 1;

                // Create SVG sparkline
                const width = 120;
                const height = 30;
                const points = values.map((v, i) => {
                    const x = (i / (values.length - 1)) * width;
                    const y = height - ((v - min) / range) * height;
                    return `${x},${y}`;
                }).join(' ');

                return `
                    <div class="sparkline-card">
                        <span class="sparkline-label">${metric.label}</span>
                        <svg class="sparkline" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
                            <polyline points="${points}" fill="none" stroke="var(--terracotta)" stroke-width="1.5"/>
                        </svg>
                        <span class="sparkline-range">${min.toFixed(1)}–${max.toFixed(1)} ${metric.unit}</span>
                    </div>
                `;
            }).join('');
    }

    renderTimeseries() {
        const container = document.getElementById('timeseries-charts');
        if (!container || !this.data?.metrics) return;

        container.innerHTML = this.data.metrics
            .filter(m => this.visibleMetrics.has(m.id))
            .map(metric => {
                const values = this.data.readings.map(r => ({
                    time: r.timestamp,
                    value: r[metric.id],
                    status: r.status?.[metric.id],
                    anomaly: r.anomaly_score
                })).filter(v => v.value !== undefined);

                const min = Math.min(...values.map(v => v.value), metric.thresholds.critical_low);
                const max = Math.max(...values.map(v => v.value), metric.thresholds.critical_high);
                const range = max - min || 1;

                const width = 600;
                const height = 150;

                // Create threshold lines
                const warnHighY = height - ((metric.thresholds.warning_high - min) / range) * height;
                const critHighY = height - ((metric.thresholds.critical_high - min) / range) * height;
                const warnLowY = height - ((metric.thresholds.warning_low - min) / range) * height;
                const critLowY = height - ((metric.thresholds.critical_low - min) / range) * height;

                // Create data points
                const points = values.map((v, i) => {
                    const x = (i / (values.length - 1)) * width;
                    const y = height - ((v.value - min) / range) * height;
                    return { x, y, status: v.status, anomaly: v.anomaly };
                });

                const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');

                return `
                    <div class="timeseries-chart">
                        <h3>${metric.label}</h3>
                        <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
                            <!-- Threshold zones -->
                            <rect x="0" y="0" width="${width}" height="${critHighY}" fill="rgba(184, 84, 80, 0.1)"/>
                            <rect x="0" y="${critHighY}" width="${width}" height="${warnHighY - critHighY}" fill="rgba(196, 135, 90, 0.1)"/>
                            <rect x="0" y="${warnLowY}" width="${width}" height="${critLowY - warnLowY}" fill="rgba(196, 135, 90, 0.1)"/>
                            <rect x="0" y="${critLowY}" width="${width}" height="${height - critLowY}" fill="rgba(184, 84, 80, 0.1)"/>

                            <!-- Threshold lines -->
                            <line x1="0" y1="${critHighY}" x2="${width}" y2="${critHighY}" stroke="#B85450" stroke-dasharray="4,2"/>
                            <line x1="0" y1="${warnHighY}" x2="${width}" y2="${warnHighY}" stroke="#C4875A" stroke-dasharray="4,2"/>
                            <line x1="0" y1="${warnLowY}" x2="${width}" y2="${warnLowY}" stroke="#C4875A" stroke-dasharray="4,2"/>
                            <line x1="0" y1="${critLowY}" x2="${width}" y2="${critLowY}" stroke="#B85450" stroke-dasharray="4,2"/>

                            <!-- Data line -->
                            <path d="${linePath}" fill="none" stroke="var(--terracotta)" stroke-width="2"/>

                            <!-- Anomaly points -->
                            ${points.filter(p => p.anomaly > 0.7).map(p => `
                                <circle cx="${p.x}" cy="${p.y}" r="5" fill="${p.status === 'critical' ? '#B85450' : '#C4875A'}"/>
                            `).join('')}
                        </svg>
                        <div class="timeseries-legend">
                            <span class="legend-item critical">Kritisch: >${metric.thresholds.critical_high}/${metric.thresholds.critical_low}< ${metric.unit}</span>
                            <span class="legend-item warning">Warnung: >${metric.thresholds.warning_high}/${metric.thresholds.warning_low}< ${metric.unit}</span>
                        </div>
                    </div>
                `;
            }).join('');
    }

    renderAlerts() {
        const list = document.getElementById('alerts-list');
        const countEl = document.getElementById('alert-count');
        if (!list || !this.data?.alerts) return;

        const showCritical = document.getElementById('filter-critical')?.checked ?? true;
        const showWarning = document.getElementById('filter-warning')?.checked ?? true;
        const showAcknowledged = document.getElementById('filter-acknowledged')?.checked ?? false;

        const filtered = this.data.alerts.filter(a => {
            if (a.level === 'critical' && !showCritical) return false;
            if (a.level === 'warning' && !showWarning) return false;
            if (a.acknowledged && !showAcknowledged) return false;
            return true;
        });

        if (countEl) {
            countEl.textContent = filtered.length;
        }

        list.innerHTML = filtered.map(alert => `
            <li class="alert-item alert-${alert.level} ${alert.acknowledged ? 'acknowledged' : ''}">
                <div class="alert-header">
                    <span class="alert-level">${alert.level === 'critical' ? '!!' : '!'}</span>
                    <span class="alert-time">${new Date(alert.timestamp).toLocaleTimeString('de-DE')}</span>
                </div>
                <div class="alert-content">
                    <span class="alert-metric">${alert.metric}</span>
                    <span class="alert-value">${alert.value} (Schwelle: ${alert.threshold})</span>
                </div>
                <p class="alert-message">${alert.message}</p>
                ${alert.acknowledged ? `
                    <div class="alert-ack">
                        Bestätigt von ${alert.acknowledged_by}
                        ${alert.resolution ? `<br>Maßnahme: ${alert.resolution}` : ''}
                    </div>
                ` : ''}
            </li>
        `).join('');
    }

    renderAnomalies() {
        const tbody = document.getElementById('anomalies-body');
        if (!tbody || !this.data?.readings) return;

        const anomalies = this.data.readings.filter(r => r.anomaly_score > 0.5);

        tbody.innerHTML = anomalies.map(r => {
            const affectedMetrics = Object.keys(r.status || {});
            return `
                <tr class="anomaly-row">
                    <td>${new Date(r.timestamp).toLocaleString('de-DE')}</td>
                    <td>${affectedMetrics.join(', ') || '-'}</td>
                    <td>${affectedMetrics.map(m => `${r[m]} ${this.data.metrics.find(mt => mt.id === m)?.unit || ''}`).join(', ')}</td>
                    <td><span class="anomaly-score">${(r.anomaly_score * 100).toFixed(0)}%</span></td>
                    <td><span class="status-badge status-${Object.values(r.status || {})[0] || 'ok'}">${Object.values(r.status || {})[0] || 'ok'}</span></td>
                </tr>
            `;
        }).join('');
    }

    setRefreshInterval(ms) {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        if (ms > 0) {
            this.refreshInterval = setInterval(() => this.refresh(), ms);
        }
    }

    setTimeRange(range) {
        // In a real implementation, this would filter readings by time
        console.log('Time range set to:', range);
        this.renderTimeseries();
    }

    filterAlerts() {
        this.renderAlerts();
    }

    refresh() {
        document.getElementById('last-update').textContent = new Date().toLocaleTimeString('de-DE');
        this.render();
    }

    getStatus(metric, value) {
        const config = this.data.metrics.find(m => m.id === metric);
        if (!config) return 'ok';

        const { thresholds } = config;
        if (value >= thresholds.critical_high || value <= thresholds.critical_low) return 'critical';
        if (value >= thresholds.warning_high || value <= thresholds.warning_low) return 'warning';
        return 'ok';
    }
}
