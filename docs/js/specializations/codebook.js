/**
 * Codebook Module
 * Workbench-Spezialisierung für Variablendefinitionen
 *
 * Kognitive Aufgabe: Definieren und Dokumentieren von Datenstrukturen
 *
 * UI-Elemente:
 * - Variable-Liste mit Typ-Icons
 * - Werte-Tabelle mit Labels und Missings
 * - Validierungsregeln-Editor
 * - Abhängigkeits-Anzeige zwischen Variablen
 * - Import von bestehenden Schemata
 * - Export als DDI, SPSS-Syntax oder JSON-Schema
 */

export class Codebook {
    constructor() {
        this.data = null;
        this.variables = [];
        this.variableGroups = [];
        this.validationRules = [];
        this.selectedVariable = null;
        this.viewMode = 'list';
    }

    async init() {
        try {
            const response = await fetch('../examples/data/workbench-codebook.json');
            this.data = await response.json();

            this.variables = this.data.variables || [];
            this.variableGroups = this.data.variable_groups || [];
            this.validationRules = this.data.validation_rules || [];

            this.setupEventListeners();
            this.render();

            console.log('Codebook module initialized');
        } catch (error) {
            console.error('Error initializing Codebook:', error);
        }
    }

    setupEventListeners() {
        document.getElementById('variable-search')?.addEventListener('input', (e) => {
            this.searchVariables(e.target.value);
        });

        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setViewMode(e.target.dataset.view);
            });
        });

        document.getElementById('export-btn')?.addEventListener('click', () => {
            const format = document.getElementById('export-format').value;
            this.exportCodebook(format);
        });

        document.getElementById('add-variable')?.addEventListener('click', () => {
            this.addVariable();
        });

        document.getElementById('add-rule')?.addEventListener('click', () => {
            this.addValidationRule();
        });

        // Editor
        document.getElementById('editor-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveVariable();
        });

        document.getElementById('cancel-edit')?.addEventListener('click', () => {
            this.cancelEdit();
        });

        // Values editor
        document.getElementById('add-valid-value')?.addEventListener('click', () => {
            this.addValue('valid');
        });

        document.getElementById('add-missing-value')?.addEventListener('click', () => {
            this.addValue('missing');
        });
    }

    render() {
        this.renderCodebookMeta();
        this.renderVariableGroups();
        this.renderVariableList();
        this.renderVariableTable();
        this.renderValidationRules();
    }

    renderCodebookMeta() {
        const meta = this.data?.codebook_meta;
        if (!meta) return;

        const titleEl = document.getElementById('codebook-title');
        if (titleEl) titleEl.textContent = meta.title || 'Codebook';

        const metaEl = document.getElementById('codebook-meta');
        if (metaEl) {
            metaEl.innerHTML = `
                <dt>Version</dt><dd>${meta.version || '–'}</dd>
                <dt>DOI</dt><dd>${meta.doi || '–'}</dd>
                <dt>Aktualisiert</dt><dd>${meta.last_modified || '–'}</dd>
            `;
        }

        const descEl = document.getElementById('codebook-description');
        if (descEl) descEl.textContent = meta.description || '';

        const statsEl = document.getElementById('codebook-stats');
        if (statsEl) {
            statsEl.innerHTML = `
                <span>${this.variables.length} Variablen</span>
                <span>${this.variableGroups.length} Gruppen</span>
                <span>${this.validationRules.length} Regeln</span>
            `;
        }
    }

    renderVariableGroups() {
        const container = document.getElementById('variable-groups');
        if (!container) return;

        container.innerHTML = this.variableGroups.map(group => `
            <div class="variable-group" data-group="${group.id}">
                <h4 class="group-label">${group.label}</h4>
                <p class="group-desc">${group.description}</p>
                <span class="group-count">${group.variables.length} Variablen</span>
            </div>
        `).join('');

        container.querySelectorAll('.variable-group').forEach(el => {
            el.addEventListener('click', () => {
                const groupId = el.dataset.group;
                const group = this.variableGroups.find(g => g.id === groupId);
                if (group) {
                    this.filteredVariables = this.variables.filter(v => group.variables.includes(v.name));
                    this.renderVariableList();
                    this.renderVariableTable();
                }
            });
        });
    }

    renderVariableList() {
        const container = document.getElementById('variable-list');
        if (!container) return;

        const vars = this.filteredVariables || this.variables;

        container.innerHTML = vars.map(v => `
            <li class="variable-item ${this.selectedVariable?.name === v.name ? 'selected' : ''}" data-name="${v.name}">
                <span class="var-icon">${this.getTypeIcon(v.type)}</span>
                <span class="var-name">${v.name}</span>
                <span class="var-label">${v.label}</span>
            </li>
        `).join('');

        container.querySelectorAll('.variable-item').forEach(li => {
            li.addEventListener('click', () => this.selectVariable(li.dataset.name));
        });
    }

    renderVariableTable() {
        const container = document.getElementById('variable-table');
        if (!container) return;

        const vars = this.filteredVariables || this.variables;

        container.innerHTML = `
            <table class="variables-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Label</th>
                        <th>Typ</th>
                        <th>Messniveau</th>
                        <th>Werte</th>
                    </tr>
                </thead>
                <tbody>
                    ${vars.map(v => `
                        <tr class="variable-row ${this.selectedVariable?.name === v.name ? 'selected' : ''}" data-name="${v.name}">
                            <td class="var-name">${v.name}</td>
                            <td class="var-label">${v.label}</td>
                            <td class="var-type">${this.getTypeIcon(v.type)} ${v.type}</td>
                            <td class="var-level">${v.measurement_level}</td>
                            <td class="var-values">
                                ${v.valid_values ? v.valid_values.length + ' Werte' : ''}
                                ${v.valid_range ? `${v.valid_range.min}–${v.valid_range.max}` : ''}
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        container.querySelectorAll('.variable-row').forEach(tr => {
            tr.addEventListener('click', () => this.selectVariable(tr.dataset.name));
        });
    }

    renderValidationRules() {
        const container = document.getElementById('validation-rules');
        if (!container) return;

        container.innerHTML = this.validationRules.map(rule => `
            <div class="validation-rule" data-rule="${rule.id}">
                <span class="rule-id">${rule.id}</span>
                <span class="rule-desc">${rule.description}</span>
                <code class="rule-expr">${rule.expression}</code>
                <span class="rule-vars">${rule.affected_variables.join(', ')}</span>
            </div>
        `).join('');
    }

    renderVariableEditor() {
        const panel = document.getElementById('variable-editor');
        if (!panel || !this.selectedVariable) return;

        const v = this.selectedVariable;

        panel.classList.remove('hidden');
        panel.innerHTML = `
            <h3>${v.name}: ${v.label}</h3>
            <dl class="variable-meta">
                <dt>Typ</dt><dd>${this.getTypeIcon(v.type)} ${v.type}</dd>
                <dt>Messniveau</dt><dd>${v.measurement_level}</dd>
                <dt>Fragebogen</dt><dd>${v.source_questionnaire || '–'}</dd>
            </dl>
            <div class="question-text">
                <h4>Fragetext</h4>
                <p>${v.question_text || '–'}</p>
            </div>
        `;

        this.renderValuesEditor();
    }

    renderValuesEditor() {
        const container = document.getElementById('values-editor');
        if (!container || !this.selectedVariable) return;

        const v = this.selectedVariable;

        let valuesHtml = '';

        if (v.valid_values) {
            valuesHtml += `
                <div class="valid-values">
                    <h4>Gültige Werte</h4>
                    <table class="values-table">
                        <thead><tr><th>Wert</th><th>Label</th></tr></thead>
                        <tbody>
                            ${v.valid_values.map(val => `
                                <tr><td>${val.value}</td><td>${val.label}</td></tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }

        if (v.valid_range) {
            valuesHtml += `
                <div class="valid-range">
                    <h4>Gültiger Bereich</h4>
                    <p>Min: ${v.valid_range.min}, Max: ${v.valid_range.max}</p>
                </div>
            `;
        }

        if (v.missing_values) {
            valuesHtml += `
                <div class="missing-values">
                    <h4>Missing Values</h4>
                    <table class="values-table missing">
                        <thead><tr><th>Wert</th><th>Bedeutung</th></tr></thead>
                        <tbody>
                            ${v.missing_values.map(val => `
                                <tr><td>${val.value}</td><td>${val.label}</td></tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }

        container.innerHTML = valuesHtml;
    }

    searchVariables(query) {
        const lowerQuery = query.toLowerCase();
        this.filteredVariables = this.variables.filter(v =>
            v.name.toLowerCase().includes(lowerQuery) ||
            v.label.toLowerCase().includes(lowerQuery)
        );
        this.renderVariableList();
        this.renderVariableTable();
    }

    setViewMode(mode) {
        this.viewMode = mode;
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === mode);
        });
        document.getElementById('variable-list-container')?.classList.toggle('hidden', mode !== 'list');
        document.getElementById('variable-table-container')?.classList.toggle('hidden', mode !== 'table');
    }

    selectVariable(varName) {
        this.selectedVariable = this.variables.find(v => v.name === varName);
        this.renderVariableList();
        this.renderVariableTable();
        this.renderVariableEditor();
    }

    addVariable() {
        const newVar = {
            name: `v${this.variables.length + 1}`,
            label: 'Neue Variable',
            type: 'categorical',
            measurement_level: 'nominal',
            valid_values: [],
            missing_values: []
        };
        this.variables.push(newVar);
        this.renderVariableList();
        this.renderVariableTable();
        this.selectVariable(newVar.name);
    }

    saveVariable() {
        this.renderVariableList();
        this.renderVariableTable();
    }

    cancelEdit() {
        this.selectedVariable = null;
        document.getElementById('variable-editor')?.classList.add('hidden');
    }

    addValue(type) {
        if (!this.selectedVariable) return;

        if (type === 'valid' && this.selectedVariable.valid_values) {
            this.selectedVariable.valid_values.push({ value: 0, label: 'Neuer Wert' });
        } else if (type === 'missing') {
            if (!this.selectedVariable.missing_values) {
                this.selectedVariable.missing_values = [];
            }
            this.selectedVariable.missing_values.push({ value: -99, label: 'Neuer Missing' });
        }
        this.renderValuesEditor();
    }

    addValidationRule() {
        const newRule = {
            id: `R${this.validationRules.length + 1}`,
            description: 'Neue Regel',
            expression: '',
            affected_variables: []
        };
        this.validationRules.push(newRule);
        this.renderValidationRules();
    }

    exportCodebook(format) {
        switch (format) {
            case 'json':
                return this.exportJSON();
            case 'ddi':
                return this.exportDDI();
            case 'spss':
                return this.exportSPSS();
            case 'stata':
                return this.exportStata();
        }
    }

    exportJSON() {
        // TODO: Generate JSON Schema
    }

    exportDDI() {
        // TODO: Generate DDI-C XML
    }

    exportSPSS() {
        // TODO: Generate SPSS Syntax
    }

    exportStata() {
        // TODO: Generate Stata Do-File
    }

    getTypeIcon(type) {
        const icons = {
            categorical: '📊',
            numeric: '🔢',
            string: '📝',
            date: '📅'
        };
        return icons[type] || '❓';
    }
}
