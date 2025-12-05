/**
 * Schema Validator Mode
 * JSON gegen Schema validieren
 */

class SchemaValidator {
    constructor() {
        this.schema = null;
        this.data = null;
        this.errors = [];
        this.options = {
            allErrors: true,
            verbose: false
        };
    }

    async init() {
        this.loadDemoSchema();
        this.bindEvents();
        this.bindKeyboard();
    }

    loadDemoSchema() {
        const demoSchema = {
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "title": "Person",
            "type": "object",
            "properties": {
                "name": { "type": "string", "minLength": 1 },
                "email": { "type": "string", "format": "email" },
                "age": { "type": "integer", "minimum": 0, "maximum": 150 }
            },
            "required": ["name", "email"]
        };

        document.getElementById('schema-input').value = JSON.stringify(demoSchema, null, 2);
        this.updateSchemaStatus(true);
    }

    validate() {
        // Parse schema
        try {
            this.schema = JSON.parse(document.getElementById('schema-input').value);
            this.updateSchemaStatus(true);
        } catch (err) {
            this.updateSchemaStatus(false, err.message);
            return;
        }

        // Parse data
        try {
            this.data = JSON.parse(document.getElementById('data-input').value);
        } catch (err) {
            this.showResult(false, [{ path: '/', message: 'Ungültiges JSON: ' + err.message }]);
            return;
        }

        // Validate
        this.errors = [];
        this.validateNode(this.data, this.schema, '');

        // Show results
        this.showResult(this.errors.length === 0, this.errors);
        this.updateStats();
    }

    validateNode(data, schema, path) {
        if (!schema) return;

        // Type check
        if (schema.type) {
            const actualType = this.getType(data);
            if (actualType !== schema.type) {
                this.errors.push({
                    path: path || '/',
                    keyword: 'type',
                    message: `Falscher Typ: erwartet ${schema.type}, gefunden ${actualType}`,
                    expected: schema.type,
                    actual: actualType
                });
                return; // Don't continue if type is wrong
            }
        }

        // Object validation
        if (schema.type === 'object' && typeof data === 'object' && data !== null) {
            // Required check
            if (schema.required) {
                for (const req of schema.required) {
                    if (!(req in data)) {
                        this.errors.push({
                            path: path || '/',
                            keyword: 'required',
                            message: `Pflichtfeld fehlt: ${req}`,
                            expected: req,
                            actual: 'nicht vorhanden'
                        });
                    }
                }
            }

            // Properties validation
            if (schema.properties) {
                for (const [key, value] of Object.entries(data)) {
                    const propSchema = schema.properties[key];
                    if (propSchema) {
                        this.validateNode(value, propSchema, `${path}/${key}`);
                    } else if (schema.additionalProperties === false) {
                        this.errors.push({
                            path: `${path}/${key}`,
                            keyword: 'additionalProperties',
                            message: `Unbekannte Property: ${key}`,
                            expected: 'keine zusätzlichen Properties',
                            actual: key
                        });
                    }
                }
            }
        }

        // Array validation
        if (schema.type === 'array' && Array.isArray(data)) {
            if (schema.minItems !== undefined && data.length < schema.minItems) {
                this.errors.push({
                    path: path || '/',
                    keyword: 'minItems',
                    message: `Zu wenige Elemente: min ${schema.minItems}, gefunden ${data.length}`,
                    expected: `>= ${schema.minItems}`,
                    actual: data.length
                });
            }

            if (schema.items) {
                data.forEach((item, i) => {
                    this.validateNode(item, schema.items, `${path}/${i}`);
                });
            }
        }

        // String validation
        if (schema.type === 'string' && typeof data === 'string') {
            if (schema.minLength !== undefined && data.length < schema.minLength) {
                this.errors.push({
                    path: path || '/',
                    keyword: 'minLength',
                    message: `String zu kurz: min ${schema.minLength}, gefunden ${data.length}`,
                    expected: `>= ${schema.minLength}`,
                    actual: data.length
                });
            }

            if (schema.maxLength !== undefined && data.length > schema.maxLength) {
                this.errors.push({
                    path: path || '/',
                    keyword: 'maxLength',
                    message: `String zu lang: max ${schema.maxLength}, gefunden ${data.length}`,
                    expected: `<= ${schema.maxLength}`,
                    actual: data.length
                });
            }

            if (schema.format === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data)) {
                this.errors.push({
                    path: path || '/',
                    keyword: 'format',
                    message: 'Ungültiges E-Mail-Format',
                    expected: 'gültige E-Mail',
                    actual: data
                });
            }
        }

        // Number validation
        if ((schema.type === 'number' || schema.type === 'integer') && typeof data === 'number') {
            if (schema.minimum !== undefined && data < schema.minimum) {
                this.errors.push({
                    path: path || '/',
                    keyword: 'minimum',
                    message: `Wert zu klein: min ${schema.minimum}, gefunden ${data}`,
                    expected: `>= ${schema.minimum}`,
                    actual: data
                });
            }

            if (schema.maximum !== undefined && data > schema.maximum) {
                this.errors.push({
                    path: path || '/',
                    keyword: 'maximum',
                    message: `Wert zu groß: max ${schema.maximum}, gefunden ${data}`,
                    expected: `<= ${schema.maximum}`,
                    actual: data
                });
            }

            if (schema.type === 'integer' && !Number.isInteger(data)) {
                this.errors.push({
                    path: path || '/',
                    keyword: 'type',
                    message: `Erwartet Integer, gefunden Dezimalzahl`,
                    expected: 'integer',
                    actual: data
                });
            }
        }
    }

    getType(value) {
        if (value === null) return 'null';
        if (Array.isArray(value)) return 'array';
        if (typeof value === 'number') {
            return Number.isInteger(value) ? 'integer' : 'number';
        }
        return typeof value;
    }

    showResult(valid, errors) {
        const container = document.getElementById('results-body');
        if (!container) return;

        if (valid) {
            container.innerHTML = `
                <div class="result-success">
                    <span class="success-icon">✓</span>
                    <h4>Validierung erfolgreich</h4>
                    <p>Die Daten entsprechen dem Schema.</p>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="result-errors">
                    ${errors.map((err, i) => `
                        <div class="error-item" data-index="${i}">
                            <span class="error-icon">✗</span>
                            <div class="error-content">
                                <span class="error-path">${err.path}</span>
                                <span class="error-message">${err.message}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }

    showErrorDetail(index) {
        const error = this.errors[index];
        if (!error) return;

        const detail = document.getElementById('error-detail');
        if (!detail) return;

        detail.classList.remove('hidden');

        document.getElementById('detail-path').textContent = error.path;
        document.getElementById('detail-keyword').textContent = error.keyword;
        document.getElementById('detail-message').textContent = error.message;
        document.getElementById('detail-expected').textContent = String(error.expected);
        document.getElementById('detail-actual').textContent = String(error.actual);
    }

    updateSchemaStatus(valid, message) {
        const status = document.getElementById('schema-status');
        if (status) {
            status.textContent = valid ? 'Gültig' : 'Ungültig';
            status.className = `schema-status ${valid ? 'valid' : 'invalid'}`;
        }
    }

    updateStats() {
        const errorCount = this.errors.filter(e => e.keyword !== 'warning').length;
        const warningCount = this.errors.filter(e => e.keyword === 'warning').length;

        document.getElementById('stat-status').textContent = errorCount === 0 ? 'Gültig' : 'Ungültig';
        document.getElementById('stat-status').className = errorCount === 0 ? 'valid' : 'invalid';
        document.getElementById('stat-errors').textContent = errorCount;
        document.getElementById('stat-warnings').textContent = warningCount;
    }

    bindEvents() {
        // Validate button
        document.getElementById('validate-btn')?.addEventListener('click', () => this.validate());

        // Schema select
        document.getElementById('schema-select')?.addEventListener('change', (e) => {
            if (e.target.value === 'demo') {
                this.loadDemoSchema();
            }
        });

        // File upload
        document.getElementById('schema-file')?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    document.getElementById('schema-input').value = event.target.result;
                    try {
                        JSON.parse(event.target.result);
                        this.updateSchemaStatus(true);
                    } catch (err) {
                        this.updateSchemaStatus(false, err.message);
                    }
                };
                reader.readAsText(file);
            }
        });

        // Error item click
        document.getElementById('results-body')?.addEventListener('click', (e) => {
            const item = e.target.closest('.error-item');
            if (item) {
                document.querySelectorAll('.error-item').forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
                this.showErrorDetail(parseInt(item.dataset.index));
            }
        });

        // Options
        document.getElementById('opt-all-errors')?.addEventListener('change', (e) => {
            this.options.allErrors = e.target.checked;
        });

        document.getElementById('opt-verbose')?.addEventListener('change', (e) => {
            this.options.verbose = e.target.checked;
        });
    }

    bindKeyboard() {
        document.addEventListener('keydown', (e) => {
            // Mode switching
            if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '4') {
                e.preventDefault();
                const modes = ['struktur', 'editor', 'validator', 'diff'];
                window.location.href = `${modes[parseInt(e.key) - 1]}.html`;
            }

            // Validate
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault();
                this.validate();
            }
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const app = new SchemaValidator();
    app.init();
});

export default SchemaValidator;
