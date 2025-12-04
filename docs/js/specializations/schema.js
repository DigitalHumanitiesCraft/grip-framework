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

    renderSchemaMeta() {
        const meta = this.data?.schema_meta;
        if (!meta) return;

        const titleEl = document.getElementById('schema-title');
        if (titleEl) titleEl.textContent = meta.title || 'Schema';

        const descEl = document.getElementById('schema-description');
        if (descEl) descEl.textContent = meta.description || '';

        const metaEl = document.getElementById('schema-meta');
        if (metaEl) {
            metaEl.innerHTML = `
                <dt>Version</dt><dd>${meta.version || '–'}</dd>
                <dt>Standard</dt><dd>${this.data?.metadata?.source_standard || '–'}</dd>
            `;
        }
    }

    renderSchemaTree() {
        const container = document.getElementById('schema-tree');
        if (!container || !this.schema?.properties) return;

        const buildTree = (props, required = [], path = '') => {
            return Object.entries(props).map(([name, prop]) => {
                const isRequired = required.includes(name);
                const hasChildren = prop.type === 'object' && prop.properties;
                const isRef = prop.$ref;
                const isSelected = this.selectedProperty === (path + name);

                let typeLabel = prop.type || 'ref';
                if (prop.enum) typeLabel = 'enum';
                if (isRef) typeLabel = 'ref';

                let childrenHtml = '';
                if (hasChildren) {
                    childrenHtml = `<ul class="tree-children">${buildTree(prop.properties, prop.required || [], path + name + '.')}</ul>`;
                }

                return `
                    <li class="tree-item ${isSelected ? 'selected' : ''}" data-path="${path + name}">
                        <span class="tree-toggle">${hasChildren ? '▸' : '•'}</span>
                        <span class="prop-name">${name}</span>
                        <span class="prop-type type-${typeLabel}">${typeLabel}</span>
                        ${isRequired ? '<span class="required-marker">*</span>' : ''}
                        ${childrenHtml}
                    </li>
                `;
            }).join('');
        };

        container.innerHTML = `<ul class="schema-tree">${buildTree(this.schema.properties, this.schema.required || [])}</ul>`;

        container.querySelectorAll('.tree-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectProperty(item.dataset.path);
            });
        });

        container.querySelectorAll('.tree-toggle').forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const children = toggle.parentElement.querySelector('.tree-children');
                if (children) {
                    children.classList.toggle('collapsed');
                    toggle.textContent = children.classList.contains('collapsed') ? '▸' : '▾';
                }
            });
        });
    }

    renderDefinitions() {
        const container = document.getElementById('definitions-list');
        if (!container || !this.schema?.definitions) return;

        container.innerHTML = Object.entries(this.schema.definitions).map(([name, def]) => `
            <div class="definition-item" data-name="${name}">
                <span class="def-name">${name}</span>
                <span class="def-type">${def.type || 'object'}</span>
                ${def.properties ? `<span class="def-props">${Object.keys(def.properties).length} properties</span>` : ''}
            </div>
        `).join('');
    }

    renderPropertiesTable() {
        const container = document.getElementById('properties-table');
        if (!container || !this.schema?.properties) return;

        const required = this.schema.required || [];

        container.innerHTML = `
            <table class="schema-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Required</th>
                        <th>Constraints</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(this.schema.properties).map(([name, prop]) => {
                        const constraints = this.getConstraintsSummary(prop);
                        return `
                            <tr class="prop-row ${this.selectedProperty === name ? 'selected' : ''}" data-name="${name}">
                                <td class="prop-name">${name}</td>
                                <td class="prop-type">${prop.type || (prop.$ref ? 'ref' : '?')}</td>
                                <td class="prop-required">${required.includes(name) ? '✓' : ''}</td>
                                <td class="prop-constraints">${constraints}</td>
                                <td class="prop-desc">${prop.description || ''}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;

        container.querySelectorAll('.prop-row').forEach(tr => {
            tr.addEventListener('click', () => this.selectProperty(tr.dataset.name));
        });
    }

    getConstraintsSummary(prop) {
        const constraints = [];
        if (prop.minLength !== undefined) constraints.push(`min: ${prop.minLength}`);
        if (prop.maxLength !== undefined) constraints.push(`max: ${prop.maxLength}`);
        if (prop.minimum !== undefined) constraints.push(`≥ ${prop.minimum}`);
        if (prop.maximum !== undefined) constraints.push(`≤ ${prop.maximum}`);
        if (prop.pattern) constraints.push('pattern');
        if (prop.enum) constraints.push(`enum(${prop.enum.length})`);
        if (prop.minItems !== undefined) constraints.push(`items ≥ ${prop.minItems}`);
        if (prop.$ref) constraints.push(`→ ${prop.$ref.split('/').pop()}`);
        return constraints.join(', ') || '–';
    }

    renderSource() {
        const textarea = document.getElementById('schema-source');
        if (!textarea) return;

        textarea.value = JSON.stringify(this.schema, null, 2);
    }

    renderTestCases() {
        const container = document.getElementById('test-cases');
        if (!container) return;

        container.innerHTML = this.testCases.map((tc, idx) => `
            <div class="test-case" data-index="${idx}">
                <div class="test-header">
                    <span class="test-desc">${tc.description}</span>
                    <span class="test-expected expected-${tc.expected}">${tc.expected}</span>
                </div>
                <pre class="test-data">${JSON.stringify(tc.data, null, 2).slice(0, 100)}...</pre>
                <button class="run-test-btn" data-index="${idx}">Test</button>
            </div>
        `).join('');

        container.querySelectorAll('.run-test-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.dataset.index);
                this.runTest(idx);
            });
        });
    }

    renderStats() {
        const statsEl = document.getElementById('schema-stats');
        if (!statsEl) return;

        const propCount = Object.keys(this.schema?.properties || {}).length;
        const reqCount = this.schema?.required?.length || 0;
        const defCount = Object.keys(this.schema?.definitions || {}).length;

        statsEl.innerHTML = `
            <span>${propCount} Properties</span>
            <span>${reqCount} Required</span>
            <span>${defCount} Definitions</span>
        `;
    }

    renderPropertyDetail() {
        const panel = document.getElementById('property-detail');
        if (!panel || !this.selectedProperty) return;

        // Navigate to nested property
        const pathParts = this.selectedProperty.split('.');
        let prop = this.schema.properties;
        for (const part of pathParts) {
            if (prop[part]) {
                prop = prop[part];
                if (prop.properties) {
                    prop = prop.properties;
                } else {
                    break;
                }
            }
        }

        const propDef = prop;
        const propName = pathParts[pathParts.length - 1];
        const isRequired = this.schema.required?.includes(propName);

        panel.classList.remove('hidden');
        panel.innerHTML = `
            <h3>${propName}</h3>
            <form id="detail-form">
                <div class="form-group">
                    <label>Type</label>
                    <select id="prop-type" name="type">
                        <option value="string" ${propDef.type === 'string' ? 'selected' : ''}>string</option>
                        <option value="number" ${propDef.type === 'number' ? 'selected' : ''}>number</option>
                        <option value="integer" ${propDef.type === 'integer' ? 'selected' : ''}>integer</option>
                        <option value="boolean" ${propDef.type === 'boolean' ? 'selected' : ''}>boolean</option>
                        <option value="array" ${propDef.type === 'array' ? 'selected' : ''}>array</option>
                        <option value="object" ${propDef.type === 'object' ? 'selected' : ''}>object</option>
                    </select>
                </div>

                <div class="form-group">
                    <label><input type="checkbox" name="required" ${isRequired ? 'checked' : ''}> Required</label>
                </div>

                <div class="form-group">
                    <label>Description</label>
                    <textarea name="description">${propDef.description || ''}</textarea>
                </div>

                <div id="string-constraints" class="${propDef.type !== 'string' ? 'hidden' : ''}">
                    <h4>String Constraints</h4>
                    <div class="form-group">
                        <label>Min Length</label>
                        <input type="number" name="minLength" value="${propDef.minLength || ''}">
                    </div>
                    <div class="form-group">
                        <label>Max Length</label>
                        <input type="number" name="maxLength" value="${propDef.maxLength || ''}">
                    </div>
                    <div class="form-group">
                        <label>Pattern</label>
                        <input type="text" name="pattern" value="${propDef.pattern || ''}">
                    </div>
                </div>

                <div id="number-constraints" class="${!['number', 'integer'].includes(propDef.type) ? 'hidden' : ''}">
                    <h4>Number Constraints</h4>
                    <div class="form-group">
                        <label>Minimum</label>
                        <input type="number" name="minimum" value="${propDef.minimum || ''}">
                    </div>
                    <div class="form-group">
                        <label>Maximum</label>
                        <input type="number" name="maximum" value="${propDef.maximum || ''}">
                    </div>
                </div>

                <div id="array-constraints" class="${propDef.type !== 'array' ? 'hidden' : ''}">
                    <h4>Array Constraints</h4>
                    <div class="form-group">
                        <label>Min Items</label>
                        <input type="number" name="minItems" value="${propDef.minItems || ''}">
                    </div>
                </div>

                ${propDef.enum ? `
                    <div class="enum-values">
                        <h4>Enum Values</h4>
                        <ul>
                            ${propDef.enum.map(v => `<li>${v}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}

                <button type="submit" class="save-btn">Save</button>
            </form>
        `;

        document.getElementById('prop-type')?.addEventListener('change', (e) => {
            this.updateConstraintsVisibility(e.target.value);
        });

        document.getElementById('detail-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProperty();
        });
    }

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

    addProperty() {
        const name = prompt('Property Name:');
        if (!name) return;

        if (!this.schema.properties) this.schema.properties = {};
        this.schema.properties[name] = {
            type: 'string',
            description: ''
        };

        this.renderSchemaTree();
        this.renderPropertiesTable();
        this.selectProperty(name);
    }

    saveProperty() {
        if (!this.selectedProperty) return;

        const form = document.getElementById('detail-form');
        if (!form) return;

        const formData = new FormData(form);
        const prop = this.schema.properties[this.selectedProperty];

        prop.type = formData.get('type');
        prop.description = formData.get('description');

        // Update constraints based on type
        if (prop.type === 'string') {
            const minLen = formData.get('minLength');
            const maxLen = formData.get('maxLength');
            const pattern = formData.get('pattern');

            if (minLen) prop.minLength = parseInt(minLen);
            else delete prop.minLength;

            if (maxLen) prop.maxLength = parseInt(maxLen);
            else delete prop.maxLength;

            if (pattern) prop.pattern = pattern;
            else delete prop.pattern;
        } else if (prop.type === 'number' || prop.type === 'integer') {
            const min = formData.get('minimum');
            const max = formData.get('maximum');

            if (min) prop.minimum = parseFloat(min);
            else delete prop.minimum;

            if (max) prop.maximum = parseFloat(max);
            else delete prop.maximum;
        } else if (prop.type === 'array') {
            const minItems = formData.get('minItems');
            if (minItems) prop.minItems = parseInt(minItems);
            else delete prop.minItems;
        }

        // Update required
        const isRequired = formData.get('required') === 'on';
        if (!this.schema.required) this.schema.required = [];

        if (isRequired && !this.schema.required.includes(this.selectedProperty)) {
            this.schema.required.push(this.selectedProperty);
        } else if (!isRequired) {
            this.schema.required = this.schema.required.filter(r => r !== this.selectedProperty);
        }

        this.renderSchemaTree();
        this.renderPropertiesTable();
        this.renderSource();
    }

    deleteProperty() {
        if (!this.selectedProperty) return;

        if (confirm(`Delete property "${this.selectedProperty}"?`)) {
            delete this.schema.properties[this.selectedProperty];

            if (this.schema.required) {
                this.schema.required = this.schema.required.filter(r => r !== this.selectedProperty);
            }

            this.selectedProperty = null;
            this.renderSchemaTree();
            this.renderPropertiesTable();
            this.renderSource();
            document.getElementById('property-detail')?.classList.add('hidden');
        }
    }

    runTest(idx) {
        const tc = this.testCases[idx];
        if (!tc) return;

        const errors = this.validateData(tc.data);
        const isValid = errors.length === 0;

        const testEl = document.querySelector(`.test-case[data-index="${idx}"]`);
        if (testEl) {
            const resultClass = (isValid && tc.expected === 'valid') || (!isValid && tc.expected === 'invalid')
                ? 'test-pass' : 'test-fail';
            testEl.classList.remove('test-pass', 'test-fail');
            testEl.classList.add(resultClass);
        }
    }

    validateData(data) {
        const errors = [];

        // Check required fields
        (this.schema.required || []).forEach(field => {
            if (data[field] === undefined || data[field] === null || data[field] === '') {
                errors.push({ field, message: `${field} is required` });
            }
        });

        // Check types and patterns
        Object.entries(this.schema.properties || {}).forEach(([name, prop]) => {
            const value = data[name];
            if (value === undefined) return;

            if (prop.type === 'string' && typeof value !== 'string') {
                errors.push({ field: name, message: `${name} must be a string` });
            }

            if (prop.pattern && typeof value === 'string') {
                if (!new RegExp(prop.pattern).test(value)) {
                    errors.push({ field: name, message: `${name} pattern mismatch` });
                }
            }

            if (prop.minLength !== undefined && value.length < prop.minLength) {
                errors.push({ field: name, message: `${name} too short` });
            }

            if (prop.type === 'integer' && !Number.isInteger(value)) {
                errors.push({ field: name, message: `${name} must be an integer` });
            }

            if (prop.minimum !== undefined && value < prop.minimum) {
                errors.push({ field: name, message: `${name} below minimum` });
            }

            if (prop.maximum !== undefined && value > prop.maximum) {
                errors.push({ field: name, message: `${name} above maximum` });
            }
        });

        return errors;
    }

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

    addTestCase() {
        const desc = prompt('Test description:');
        if (!desc) return;

        this.testCases.push({
            description: desc,
            data: {},
            expected: 'valid'
        });

        this.renderTestCases();
    }

    runAllTests() {
        this.testCases.forEach((_, idx) => this.runTest(idx));

        const passCount = document.querySelectorAll('.test-pass').length;
        const total = this.testCases.length;

        alert(`Tests: ${passCount}/${total} passed`);
    }

    importSchema() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    this.schema = JSON.parse(event.target.result);
                    this.render();
                } catch (err) {
                    alert('Invalid JSON file');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    exportSchema() {
        const json = JSON.stringify(this.schema, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'schema.json';
        a.click();

        URL.revokeObjectURL(url);
    }
}
