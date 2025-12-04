/**
 * Schema Module
 * Workbench-Spezialisierung für JSON-Schema-Editierung
 *
 * Kognitive Aufgabe: Definieren und Validieren von Datenstrukturen
 *
 * UI-Elemente:
 * - Schema-Tree mit Typ-Annotationen
 * - Live-Validierung von Beispieldaten
 * - Fehler-Highlighting mit JSON-Pointer
 * - Type-Dropdown (string, number, array, object)
 * - Required-Toggle pro Feld
 * - Regex-Editor für Pattern-Constraints
 */

export class Schema {
    constructor() {
        this.data = null;
        this.schema = null;
        this.testCases = [];
        this.selectedProperty = null;
        this.activeTab = 'visual';
    }

    async init() {
        try {
            const response = await fetch('../examples/data/workbench-schema.json');
            this.data = await response.json();

            this.schema = this.data.schema || {};
            this.testCases = this.data.test_data || [];

            this.setupEventListeners();
            this.render();

            console.log('Schema module initialized');
        } catch (error) {
            console.error('Error initializing Schema:', error);
        }
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Property actions
        document.getElementById('add-property')?.addEventListener('click', () => {
            this.addProperty();
        });

        document.getElementById('delete-property')?.addEventListener('click', () => {
            this.deleteProperty();
        });

        // Source editor
        document.getElementById('format-json')?.addEventListener('click', () => {
            this.formatSource();
        });

        document.getElementById('apply-source')?.addEventListener('click', () => {
            this.applySource();
        });

        // Validation
        document.getElementById('validate-btn')?.addEventListener('click', () => {
            this.validateTestData();
        });

        document.getElementById('add-test-case')?.addEventListener('click', () => {
            this.addTestCase();
        });

        document.getElementById('run-all-tests')?.addEventListener('click', () => {
            this.runAllTests();
        });

        // Import/Export
        document.getElementById('import-schema')?.addEventListener('click', () => {
            this.importSchema();
        });

        document.getElementById('export-schema')?.addEventListener('click', () => {
            this.exportSchema();
        });

        // Property type change
        document.getElementById('prop-type')?.addEventListener('change', (e) => {
            this.updateConstraintsVisibility(e.target.value);
        });

        // Property form
        document.getElementById('detail-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProperty();
        });
    }

    render() {
        this.renderSchemaMeta();
        this.renderSchemaTree();
        this.renderDefinitions();
        this.renderPropertiesTable();
        this.renderSource();
        this.renderTestCases();
        this.renderStats();
    }

    renderSchemaMeta() {}
    renderSchemaTree() {}
    renderDefinitions() {}
    renderPropertiesTable() {}
    renderSource() {}
    renderTestCases() {}
    renderStats() {}
    renderPropertyDetail() {}

    switchTab(tab) {
        this.activeTab = tab;
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tab}-tab`);
            content.classList.toggle('hidden', content.id !== `${tab}-tab`);
        });
    }

    selectProperty(propName) {
        this.selectedProperty = propName;
        this.renderPropertyDetail();
    }

    addProperty() {}
    saveProperty() {}
    deleteProperty() {}

    updateConstraintsVisibility(type) {
        const constraintSections = ['string-constraints', 'number-constraints', 'array-constraints'];
        constraintSections.forEach(id => {
            document.getElementById(id)?.classList.add('hidden');
        });

        if (type === 'string') {
            document.getElementById('string-constraints')?.classList.remove('hidden');
        } else if (type === 'number' || type === 'integer') {
            document.getElementById('number-constraints')?.classList.remove('hidden');
        } else if (type === 'array') {
            document.getElementById('array-constraints')?.classList.remove('hidden');
        }
    }

    formatSource() {
        const textarea = document.getElementById('schema-source');
        try {
            const parsed = JSON.parse(textarea.value);
            textarea.value = JSON.stringify(parsed, null, 2);
        } catch (e) {
            console.error('Invalid JSON');
        }
    }

    applySource() {
        const textarea = document.getElementById('schema-source');
        try {
            this.schema = JSON.parse(textarea.value);
            this.render();
        } catch (e) {
            console.error('Invalid JSON:', e);
        }
    }

    validateTestData() {
        const textarea = document.getElementById('test-data');
        try {
            const data = JSON.parse(textarea.value);
            const errors = this.validate(data);
            this.showValidationResult(errors);
        } catch (e) {
            this.showValidationResult([{ message: 'Invalid JSON: ' + e.message }]);
        }
    }

    validate(data) {
        // TODO: Implement JSON Schema validation
        // For now, return empty array (valid)
        return [];
    }

    showValidationResult(errors) {
        const indicator = document.getElementById('result-indicator');
        const errorList = document.getElementById('validation-errors');

        if (errors.length === 0) {
            indicator.innerHTML = '<span class="valid">✓ Valid</span>';
            errorList.innerHTML = '';
        } else {
            indicator.innerHTML = '<span class="invalid">✗ Invalid</span>';
            errorList.innerHTML = errors.map(e => `<li>${e.message}</li>`).join('');
        }
    }

    addTestCase() {}
    runAllTests() {}
    importSchema() {}
    exportSchema() {}
}
