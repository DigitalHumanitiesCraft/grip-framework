/**
 * Monitor Dashboard-Modus
 *
 * Echtzeit-Überblick mit Ampel-Kacheln und Auto-Refresh
 *
 * Benötigte Daten: system{}, metrics[], current_values{}, alerts[]
 * Wissensbasis: 15-MODI#Monitor-Dashboard
 */

class MonitorDashboard {
    constructor(containerId, dataPath) {
        this.container = document.getElementById(containerId);
        this.dataPath = dataPath || '../data/scope-monitor.json';
        this.data = null;
        this.selectedMetric = null;
        this.autoRefreshInterval = null;
        this.autoRefreshRate = 60000;

        this.init();
    }

    async init() {
        try {
            const response = await fetch(this.dataPath);
            this.data = await response.json();
            this.render();
            this.bindEvents();
            this.bindKeyboard();
            this.startAutoRefresh();
        } catch (error) {
            console.error('Fehler beim Laden der Daten:', error);
        }
    }

    render() {
        if (!this.data) return;

        this.renderSystemInfo();
        this.renderAlerts();
        this.renderMetricsGrid();
        this.updateStats();
        this.updateLastUpdate();
    }

    renderSystemInfo() {
        const system = this.data.system;
        if (!system) return;

        document.getElementById('system-name').textContent = system.name;
        document.getElementById('system-location').textContent = system.location;
        document.getElementById('dashboard-title').textContent = system.name;

        // Determine overall status
        const alerts = this.data.alerts || [];
        const unacknowledged = alerts.filter(a => !a.acknowledged);
        const hasCritical = unacknowledged.some(a => a.severity === 'critical');
        const hasWarning = unacknowledged.some(a => a.severity === 'warning');

        const statusIndicator = document.querySelector('.status-indicator');
        const statusText = document.getElementById('system-status');

        if (hasCritical) {
            statusIndicator.className = 'status-indicator critical';
            statusText.textContent = 'Kritisch';
        } else if (hasWarning) {
            statusIndicator.className = 'status-indicator warning';
            statusText.textContent = 'Warnung';
        } else {
            statusIndicator.className = 'status-indicator normal';
            statusText.textContent = 'Normal';
        }
    }

    renderAlerts() {
        const container = document.getElementById('alerts-list');
        if (!container) return;

        const alerts = this.data.alerts || [];
        const unacknowledged = alerts.filter(a => !a.acknowledged);

        document.getElementById('alert-count').textContent = unacknowledged.length;

        if (alerts.length === 0) {
            container.innerHTML = '<li class="no-alerts">Keine aktiven Warnungen</li>';
            return;
        }

        container.innerHTML = alerts.slice(0, 5).map(alert => {
            const icon = alert.severity === 'critical' ? '🔴' : '🟡';

            return `
                <li class="alert-item ${alert.severity} ${alert.acknowledged ? 'acknowledged' : ''}"
                    data-alert="${alert.id}">
                    <span class="alert-icon">${icon}</span>
                    <div class="alert-content">
                        <div class="alert-message">${alert.message}</div>
                        <div class="alert-time">${this.formatTime(alert.timestamp)}</div>
                    </div>
                </li>
            `;
        }).join('');
    }

    renderMetricsGrid() {
        const container = document.getElementById('metrics-grid');
        if (!container) return;

        const metrics = this.data.metrics || [];
        const currentValues = this.data.current_values || {};
        const readings = this.data.readings || [];

        container.innerHTML = metrics.map(metric => {
            const current = currentValues[metric.id] || {};
            const status = current.status || 'normal';
            const trend = current.trend || 'stable';
            const isSelected = this.selectedMetric === metric.id;

            // Get sparkline data
            const sparklineData = readings.map(r => r[metric.id]).filter(v => v !== undefined);

            return `
                <div class="metric-tile ${status} ${isSelected ? 'selected' : ''}"
                     data-metric="${metric.id}">
                    <div class="metric-tile-header">
                        <span class="metric-label">${metric.label}</span>
                        <span class="metric-status-icon ${status}"></span>
                    </div>
                    <div class="metric-value-container">
                        <span class="metric-value">${current.value ?? '--'}</span>
                        <span class="metric-unit">${metric.unit}</span>
                    </div>
                    <div class="metric-trend">
                        <span class="trend-arrow ${trend}">${this.getTrendArrow(trend)}</span>
                        <span>${this.getTrendLabel(trend)}</span>
                    </div>
                    <svg class="metric-sparkline" viewBox="0 0 100 30" preserveAspectRatio="none">
                        ${this.createSparkline(sparklineData, metric.color)}
                    </svg>
                </div>
            `;
        }).join('');
    }

    createSparkline(data, color) {
        if (data.length < 2) return '';

        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min || 1;

        const points = data.map((v, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 30 - ((v - min) / range) * 30;
            return `${x},${y}`;
        }).join(' ');

        return `<polyline points="${points}" fill="none" stroke="${color}" stroke-width="2"/>`;
    }

    getTrendArrow(trend) {
        const arrows = {
            'rising': '↑',
            'falling': '↓',
            'stable': '→'
        };
        return arrows[trend] || '→';
    }

    getTrendLabel(trend) {
        const labels = {
            'rising': 'steigend',
            'falling': 'fallend',
            'stable': 'stabil'
        };
        return labels[trend] || trend;
    }

    updateStats() {
        const stats = this.data.statistics || {};

        document.getElementById('stat-uptime').textContent = `${stats.uptime_percent || '--'}%`;
        document.getElementById('stat-quality').textContent = stats.data_quality || '--';
        document.getElementById('stat-readings').textContent = stats.readings_count || '--';
    }

    updateLastUpdate() {
        const now = new Date();
        document.getElementById('last-update').textContent =
            `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    }

    selectMetric(metricId) {
        this.selectedMetric = metricId;
        this.renderMetricsGrid();
        this.showMetricDetail(metricId);
    }

    showMetricDetail(metricId) {
        const metric = (this.data.metrics || []).find(m => m.id === metricId);
        if (!metric) return;

        const currentValues = this.data.current_values || {};
        const current = currentValues[metricId] || {};

        const prompt = document.getElementById('metric-prompt');
        const info = document.getElementById('metric-info');

        prompt?.classList.add('hidden');
        info?.classList.remove('hidden');

        document.getElementById('detail-label').textContent = metric.label;

        const statusEl = document.getElementById('detail-status');
        statusEl.textContent = this.getStatusLabel(current.status);
        statusEl.className = `detail-status ${current.status || 'normal'}`;

        document.getElementById('detail-value').textContent = current.value ?? '--';
        document.getElementById('detail-unit').textContent = metric.unit;

        const trendIndicator = document.getElementById('detail-trend');
        trendIndicator.textContent = this.getTrendArrow(current.trend);
        trendIndicator.className = `trend-indicator ${current.trend}`;
        document.getElementById('detail-trend-text').textContent = this.getTrendLabel(current.trend);

        // Thresholds
        const th = metric.thresholds || {};
        document.getElementById('th-crit-low').textContent = th.critical_low ?? '--';
        document.getElementById('th-warn-low').textContent = th.warning_low ?? '--';
        document.getElementById('th-warn-high').textContent = th.warning_high ?? '--';
        document.getElementById('th-crit-high').textContent = th.critical_high ?? '--';

        // Mini chart
        const readings = this.data.readings || [];
        const chartData = readings.map(r => r[metricId]).filter(v => v !== undefined);
        this.renderMiniChart(chartData, metric);
    }

    renderMiniChart(data, metric) {
        const container = document.getElementById('mini-chart');
        if (!container || data.length < 2) return;

        const width = 200;
        const height = 50;
        const padding = 5;

        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min || 1;

        const points = data.map((v, i) => {
            const x = padding + (i / (data.length - 1)) * (width - 2 * padding);
            const y = height - padding - ((v - min) / range) * (height - 2 * padding);
            return `${x},${y}`;
        }).join(' ');

        container.innerHTML = `
            <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
                <polyline points="${points}" fill="none" stroke="${metric.color}" stroke-width="2"/>
            </svg>
        `;
    }

    getStatusLabel(status) {
        const labels = {
            'normal': 'Normal',
            'warning': 'Warnung',
            'critical': 'Kritisch'
        };
        return labels[status] || status;
    }

    formatTime(timestamp) {
        if (!timestamp) return '--';
        const date = new Date(timestamp);
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }

    startAutoRefresh() {
        const rate = parseInt(document.getElementById('auto-refresh')?.value) * 1000;
        if (rate > 0) {
            this.autoRefreshInterval = setInterval(() => {
                this.refresh();
            }, rate);
        }
    }

    stopAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
    }

    async refresh() {
        // In production, this would re-fetch data
        this.updateLastUpdate();
        console.log('Dashboard aktualisiert');
    }

    bindEvents() {
        // Metric tile clicks
        document.getElementById('metrics-grid')?.addEventListener('click', (e) => {
            const tile = e.target.closest('.metric-tile');
            if (tile) {
                this.selectMetric(tile.dataset.metric);
            }
        });

        // Refresh button
        document.getElementById('refresh-now')?.addEventListener('click', () => {
            this.refresh();
        });

        // Auto-refresh select
        document.getElementById('auto-refresh')?.addEventListener('change', (e) => {
            this.stopAutoRefresh();
            const rate = parseInt(e.target.value) * 1000;
            if (rate > 0) {
                this.autoRefreshInterval = setInterval(() => this.refresh(), rate);
            }
        });

        // View toggle
        document.getElementById('view-grid')?.addEventListener('click', () => {
            document.getElementById('view-grid').classList.add('active');
            document.getElementById('view-list').classList.remove('active');
            document.getElementById('metrics-grid').style.display = 'grid';
        });

        document.getElementById('view-list')?.addEventListener('click', () => {
            document.getElementById('view-list').classList.add('active');
            document.getElementById('view-grid').classList.remove('active');
            // Would switch to list view
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

            // Refresh
            if (e.key === 'r' && !e.metaKey && !e.ctrlKey) {
                this.refresh();
            }
        });
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    new MonitorDashboard('metrics-grid');
});

export default MonitorDashboard;
