/**
 * Codebook Variablendetail Mode
 * Detailansicht einer einzelnen Variable
 */

class CodebookVariablendetail {
    constructor() {
        this.data = null;
        this.variables = [];
        this.currentIndex = 0;
    }

    async init() {
        try {
            const response = await fetch('../data/codebook-data.json');
            this.data = await response.json();
            this.variables = this.data.variables || [];

            // Check for URL parameter
            const urlParams = new URLSearchParams(window.location.search);
            const varName = urlParams.get('var');
            if (varName) {
                const index = this.variables.findIndex(v => v.name === varName);
                if (index !== -1) this.currentIndex = index;
            }

            this.populateSelect();
            this.populateList();
            this.render();
            this.bindEvents();
            this.bindKeyboard();
        } catch (error) {
            console.error('Fehler beim Laden der Codebook-Daten:', error);
            this.loadDemoData();
        }
    }

    loadDemoData() {
        this.variables = [
            {
                position: 1, name: 'id', label: 'Fallnummer',
                type: 'numeric', validN: 1000, missingN: 0, min: 1, max: 1000,
                group: 'Identifikation',
                description: 'Eindeutige Identifikationsnummer für jeden Befragten.'
            },
            {
                position: 2, name: 'age', label: 'Alter in Jahren',
                type: 'numeric', validN: 985, missingN: 15, min: 18, max: 99,
                mean: 45.3, stddev: 17.2,
                group: 'Demografie',
                description: 'Alter der befragten Person in vollendeten Jahren zum Zeitpunkt der Befragung.',
                source: 'Direkte Abfrage'
            },
            {
                position: 3, name: 'gender', label: 'Geschlecht',
                type: 'categorical', validN: 998, missingN: 2,
                values: [
                    { code: 1, label: 'männlich', n: 485, percent: 48.6 },
                    { code: 2, label: 'weiblich', n: 498, percent: 49.9 },
                    { code: 3, label: 'divers', n: 15, percent: 1.5 }
                ],
                group: 'Demografie',
                description: 'Geschlechtsidentität der befragten Person.'
            },
            {
                position: 4, name: 'education', label: 'Höchster Bildungsabschluss',
                type: 'categorical', validN: 990, missingN: 10,
                values: [
                    { code: 1, label: 'ohne Abschluss', n: 45, percent: 4.5 },
                    { code: 2, label: 'Hauptschulabschluss', n: 180, percent: 18.2 },
                    { code: 3, label: 'Realschulabschluss', n: 285, percent: 28.8 },
                    { code: 4, label: 'Abitur', n: 230, percent: 23.2 },
                    { code: 5, label: 'Hochschulabschluss', n: 250, percent: 25.3 }
                ],
                group: 'Demografie',
                description: 'Höchster allgemeinbildender Schulabschluss.'
            }
        ];
        this.populateSelect();
        this.populateList();
        this.render();
    }

    populateSelect() {
        const select = document.getElementById('var-select');
        if (!select) return;

        select.innerHTML = this.variables.map((v, i) =>
            `<option value="${i}">${v.name} – ${v.label || ''}</option>`
        ).join('');

        select.value = this.currentIndex;
    }

    populateList() {
        const list = document.getElementById('var-list');
        if (!list) return;

        list.innerHTML = this.variables.map((v, i) => `
            <li data-index="${i}" class="${i === this.currentIndex ? 'active' : ''}">
                <span class="var-name">${v.name}</span>
            </li>
        `).join('');
    }

    render() {
        const variable = this.variables[this.currentIndex];
        if (!variable) return;

        // Header
        document.getElementById('var-position').textContent = `#${variable.position}`;
        document.getElementById('var-name').textContent = variable.name;
        document.getElementById('var-type').textContent = variable.type;
        document.getElementById('var-type').className = `var-type-badge ${variable.type}`;

        // Labels
        document.getElementById('var-label').textContent = variable.label || '–';
        document.getElementById('var-description').textContent = variable.description || '';

        // Values
        document.getElementById('val-min').textContent = variable.min ?? '–';
        document.getElementById('val-max').textContent = variable.max ?? '–';
        document.getElementById('val-valid').textContent = variable.validN ?? '–';
        document.getElementById('val-missing').textContent = variable.missingN ?? '–';

        // Value codes for categorical
        const codesContainer = document.getElementById('value-codes');
        if (variable.type === 'categorical' && variable.values) {
            codesContainer.innerHTML = `
                <table class="value-codes-table">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Label</th>
                            <th>N</th>
                            <th>%</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${variable.values.map(v => `
                            <tr>
                                <td>${v.code}</td>
                                <td>${v.label}</td>
                                <td>${v.n ?? '–'}</td>
                                <td>${v.percent ? v.percent.toFixed(1) + '%' : '–'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        } else {
            codesContainer.innerHTML = '';
        }

        // Distribution chart
        this.renderDistribution(variable);

        // Metadata
        document.getElementById('meta-group').textContent = variable.group || '–';
        document.getElementById('meta-source').textContent = variable.source || '–';
        document.getElementById('meta-derivation').textContent = variable.derivation || '–';
        document.getElementById('meta-notes').textContent = variable.notes || '–';

        // Related variables
        this.renderRelated(variable);

        // Update navigation
        document.getElementById('prev-var').disabled = this.currentIndex === 0;
        document.getElementById('next-var').disabled = this.currentIndex === this.variables.length - 1;

        // Update list highlight
        document.querySelectorAll('#var-list li').forEach((li, i) => {
            li.classList.toggle('active', i === this.currentIndex);
        });

        document.getElementById('var-select').value = this.currentIndex;
    }

    renderDistribution(variable) {
        const container = document.getElementById('distribution-chart');
        if (!container) return;

        if (variable.type === 'categorical' && variable.values) {
            const maxPercent = Math.max(...variable.values.map(v => v.percent || 0));

            container.innerHTML = `
                <div class="bar-chart">
                    ${variable.values.map(v => `
                        <div class="bar-row">
                            <span class="bar-label">${v.label}</span>
                            <div class="bar-container">
                                <div class="bar" style="width: ${(v.percent / maxPercent) * 100}%"></div>
                            </div>
                            <span class="bar-value">${v.percent?.toFixed(1) || 0}%</span>
                        </div>
                    `).join('')}
                </div>
            `;
        } else if (variable.type === 'numeric' && variable.mean !== undefined) {
            container.innerHTML = `
                <div class="numeric-stats">
                    <div class="stat-box">
                        <span class="stat-label">Mittelwert</span>
                        <span class="stat-value">${variable.mean.toFixed(2)}</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-label">Std.Abw.</span>
                        <span class="stat-value">${variable.stddev?.toFixed(2) || '–'}</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-label">Min</span>
                        <span class="stat-value">${variable.min}</span>
                    </div>
                    <div class="stat-box">
                        <span class="stat-label">Max</span>
                        <span class="stat-value">${variable.max}</span>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = '<p class="no-distribution">Keine Verteilungsdaten verfügbar</p>';
        }
    }

    renderRelated(variable) {
        const list = document.getElementById('related-list');
        if (!list) return;

        // Find variables in same group
        const related = this.variables.filter(v =>
            v.group === variable.group && v.name !== variable.name
        ).slice(0, 5);

        if (related.length === 0) {
            list.innerHTML = '<li class="no-related">Keine verwandten Variablen</li>';
            return;
        }

        list.innerHTML = related.map(v => `
            <li>
                <a href="?var=${v.name}" class="related-link">
                    <span class="related-name">${v.name}</span>
                    <span class="related-label">${v.label || ''}</span>
                </a>
            </li>
        `).join('');
    }

    navigate(delta) {
        const newIndex = this.currentIndex + delta;
        if (newIndex >= 0 && newIndex < this.variables.length) {
            this.currentIndex = newIndex;
            this.render();
        }
    }

    bindEvents() {
        // Select change
        document.getElementById('var-select')?.addEventListener('change', (e) => {
            this.currentIndex = parseInt(e.target.value);
            this.render();
        });

        // Navigation buttons
        document.getElementById('prev-var')?.addEventListener('click', () => this.navigate(-1));
        document.getElementById('next-var')?.addEventListener('click', () => this.navigate(1));

        // List click
        document.getElementById('var-list')?.addEventListener('click', (e) => {
            const li = e.target.closest('li');
            if (li) {
                this.currentIndex = parseInt(li.dataset.index);
                this.render();
            }
        });

        // Related links
        document.getElementById('related-list')?.addEventListener('click', (e) => {
            const link = e.target.closest('.related-link');
            if (link) {
                e.preventDefault();
                const varName = new URL(link.href).searchParams.get('var');
                const index = this.variables.findIndex(v => v.name === varName);
                if (index !== -1) {
                    this.currentIndex = index;
                    this.render();
                }
            }
        });
    }

    bindKeyboard() {
        document.addEventListener('keydown', (e) => {
            // Mode switching
            if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '4') {
                e.preventDefault();
                const modes = ['variablenliste', 'variablendetail', 'validierung', 'export'];
                window.location.href = `${modes[parseInt(e.key) - 1]}.html`;
            }

            // Navigation
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.navigate(-1);
            }
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.navigate(1);
            }
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const app = new CodebookVariablendetail();
    app.init();
});

export default CodebookVariablendetail;
