/**
 * Schema Editor Mode
 * Visueller JSON Schema Editor
 */

class SchemaEditor {
    constructor() {
        this.schema = null;
        this.selectedPropertyPath = null;
        this.viewMode = 'form'; // 'form' or 'code'
    }

    async init() {
        this.createNewSchema();
        this.render();
        this.bindEvents();
        this.bindKeyboard();
    }

    createNewSchema() {
        this.schema = {
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "title": "Neues Schema",
            "type": "object",
            "properties": {},
            "required": []
        };
    }

    render() {
        if (this.viewMode === 'form') {
            this.renderFormEditor();
        } else {
            this.renderCodeEditor();
        }
    }

    renderFormEditor() {
        const container = document.getElementById('form-editor');
        if (!container) return;

        container.innerHTML = `
            <div class="schema-header-form">
                <div class="form-group">
                    <label>Titel</label>
                    <input type="text" id="schema-title" value="${this.schema.title || ''}">
                </div>
                <div class="form-group">
                    <label>Beschreibung</label>
                    <input type="text" id="schema-description" value="${this.schema.description || ''}">
                </div>
            </div>

            <div class="properties-section">
                <h3>Properties</h3>
                <div class="properties-list" id="properties-list">
                    ${this.renderProperties(this.schema.properties, '', this.schema.required)}
                </div>
                <button id="add-property" class="add-btn">+ Property hinzufügen</button>
            </div>
        `;

        // Sync inputs
        document.getElementById('schema-title')?.addEventListener('input', (e) => {
            this.schema.title = e.target.value;
        });

        document.getElementById('schema-description')?.addEventListener('input', (e) => {
            this.schema.description = e.target.value;
        });
    }

    renderProperties(properties, path, required = []) {
        if (!properties || Object.keys(properties).length === 0) {
            return '<p class="no-properties">Keine Properties definiert</p>';
        }

        return Object.entries(properties).map(([name, prop]) => {
            const fullPath = path ? `${path}.${name}` : name;
            const isSelected = this.selectedPropertyPath === fullPath;
            const isRequired = required.includes(name);

            let nestedHtml = '';
            if (prop.type === 'object' && prop.properties) {
                nestedHtml = `
                    <div class="nested-properties">
                        ${this.renderProperties(prop.properties, fullPath, prop.required)}
                    </div>
                `;
            }

            return `
                <div class="property-item ${isSelected ? 'selected' : ''}" data-path="${fullPath}">
                    <div class="property-header">
                        <span class="property-name ${isRequired ? 'required' : ''}">${name}</span>
                        <span class="property-type type-${prop.type}">${prop.type || 'any'}</span>
                        <button class="edit-btn" data-path="${fullPath}">✎</button>
                        <button class="delete-btn" data-path="${fullPath}">×</button>
                    </div>
                    ${prop.description ? `<p class="property-desc">${prop.description}</p>` : ''}
                    ${nestedHtml}
                </div>
            `;
        }).join('');
    }

    renderCodeEditor() {
        const container = document.getElementById('code-editor');
        const textarea = document.getElementById('json-source');

        if (textarea) {
            textarea.value = JSON.stringify(this.schema, null, 2);
        }

        container?.classList.remove('hidden');
        document.getElementById('form-editor')?.classList.add('hidden');
    }

    addProperty(type, parentPath = '') {
        const name = prompt('Property-Name:');
        if (!name) return;

        const newProp = {
            type: type,
            description: ''
        };

        if (type === 'object') {
            newProp.properties = {};
        }
        if (type === 'array') {
            newProp.items = { type: 'string' };
        }

        if (parentPath) {
            const parent = this.getPropertyByPath(parentPath);
            if (parent && parent.properties) {
                parent.properties[name] = newProp;
            }
        } else {
            this.schema.properties[name] = newProp;
        }

        this.render();
    }

    getPropertyByPath(path) {
        const parts = path.split('.');
        let current = this.schema;

        for (const part of parts) {
            if (current.properties && current.properties[part]) {
                current = current.properties[part];
            } else {
                return null;
            }
        }

        return current;
    }

    deleteProperty(path) {
        const parts = path.split('.');
        const name = parts.pop();
        let parent = this.schema;

        for (const part of parts) {
            if (parent.properties && parent.properties[part]) {
                parent = parent.properties[part];
            } else {
                return;
            }
        }

        if (parent.properties && parent.properties[name]) {
            delete parent.properties[name];
            // Also remove from required
            if (parent.required) {
                parent.required = parent.required.filter(r => r !== name);
            }
        }

        this.selectedPropertyPath = null;
        this.render();
        this.hidePropertyForm();
    }

    selectProperty(path) {
        this.selectedPropertyPath = path;
        this.render();
        this.showPropertyForm(path);
    }

    showPropertyForm(path) {
        const prop = this.getPropertyByPath(path);
        if (!prop) return;

        const parts = path.split('.');
        const name = parts.pop();
        const parentPath = parts.join('.');
        const parent = parentPath ? this.getPropertyByPath(parentPath) : this.schema;

        const form = document.getElementById('selected-property');
        if (!form) return;

        form.classList.remove('hidden');

        document.getElementById('prop-name').value = name;
        document.getElementById('prop-type').value = prop.type || 'string';
        document.getElementById('prop-description').value = prop.description || '';
        document.getElementById('prop-required').checked = parent.required?.includes(name) || false;
    }

    hidePropertyForm() {
        const form = document.getElementById('selected-property');
        form?.classList.add('hidden');
    }

    updateProperty() {
        if (!this.selectedPropertyPath) return;

        const parts = this.selectedPropertyPath.split('.');
        const oldName = parts.pop();
        const parentPath = parts.join('.');
        const parent = parentPath ? this.getPropertyByPath(parentPath) : this.schema;

        const newName = document.getElementById('prop-name').value;
        const newType = document.getElementById('prop-type').value;
        const newDesc = document.getElementById('prop-description').value;
        const isRequired = document.getElementById('prop-required').checked;

        const prop = parent.properties[oldName];

        // Update property
        prop.type = newType;
        prop.description = newDesc;

        // Handle rename
        if (newName !== oldName) {
            parent.properties[newName] = prop;
            delete parent.properties[oldName];

            // Update required array
            if (parent.required) {
                const idx = parent.required.indexOf(oldName);
                if (idx !== -1) {
                    parent.required[idx] = newName;
                }
            }

            this.selectedPropertyPath = parentPath ? `${parentPath}.${newName}` : newName;
        }

        // Handle required
        if (!parent.required) parent.required = [];
        const reqIdx = parent.required.indexOf(newName);
        if (isRequired && reqIdx === -1) {
            parent.required.push(newName);
        } else if (!isRequired && reqIdx !== -1) {
            parent.required.splice(reqIdx, 1);
        }

        this.render();
    }

    saveSchema() {
        // Sync from code editor if in code mode
        if (this.viewMode === 'code') {
            try {
                this.schema = JSON.parse(document.getElementById('json-source').value);
            } catch (err) {
                alert('Ungültiges JSON: ' + err.message);
                return;
            }
        }

        const blob = new Blob([JSON.stringify(this.schema, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.schema.title || 'schema'}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    applyTemplate(templateName) {
        const templates = {
            person: {
                "$schema": "https://json-schema.org/draft/2020-12/schema",
                "title": "Person",
                "type": "object",
                "properties": {
                    "name": { "type": "string", "description": "Vollständiger Name" },
                    "email": { "type": "string", "format": "email" },
                    "age": { "type": "integer", "minimum": 0 }
                },
                "required": ["name", "email"]
            },
            address: {
                "$schema": "https://json-schema.org/draft/2020-12/schema",
                "title": "Adresse",
                "type": "object",
                "properties": {
                    "street": { "type": "string" },
                    "city": { "type": "string" },
                    "postalCode": { "type": "string" },
                    "country": { "type": "string" }
                },
                "required": ["street", "city", "country"]
            },
            event: {
                "$schema": "https://json-schema.org/draft/2020-12/schema",
                "title": "Event",
                "type": "object",
                "properties": {
                    "title": { "type": "string" },
                    "date": { "type": "string", "format": "date-time" },
                    "location": { "type": "string" },
                    "attendees": { "type": "array", "items": { "type": "string" } }
                },
                "required": ["title", "date"]
            }
        };

        if (templates[templateName]) {
            this.schema = JSON.parse(JSON.stringify(templates[templateName]));
            this.selectedPropertyPath = null;
            this.render();
        }
    }

    bindEvents() {
        // View toggle
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                this.viewMode = btn.dataset.view;

                if (this.viewMode === 'form') {
                    document.getElementById('form-editor')?.classList.remove('hidden');
                    document.getElementById('code-editor')?.classList.add('hidden');
                    // Sync from code
                    try {
                        this.schema = JSON.parse(document.getElementById('json-source').value);
                    } catch {}
                    this.render();
                } else {
                    document.getElementById('form-editor')?.classList.add('hidden');
                    document.getElementById('code-editor')?.classList.remove('hidden');
                    this.renderCodeEditor();
                }
            });
        });

        // New schema
        document.getElementById('new-schema')?.addEventListener('click', () => {
            if (confirm('Aktuelles Schema verwerfen?')) {
                this.createNewSchema();
                this.selectedPropertyPath = null;
                this.render();
            }
        });

        // Save
        document.getElementById('save-schema')?.addEventListener('click', () => this.saveSchema());

        // Add property types
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.addProperty(btn.dataset.type);
            });
        });

        // Add property button (in form)
        document.getElementById('properties-list')?.addEventListener('click', (e) => {
            if (e.target.id === 'add-property') {
                this.addProperty('string');
            }
        });

        // Property actions
        document.getElementById('form-editor')?.addEventListener('click', (e) => {
            const editBtn = e.target.closest('.edit-btn');
            if (editBtn) {
                this.selectProperty(editBtn.dataset.path);
                return;
            }

            const deleteBtn = e.target.closest('.delete-btn');
            if (deleteBtn) {
                if (confirm('Property löschen?')) {
                    this.deleteProperty(deleteBtn.dataset.path);
                }
                return;
            }

            const item = e.target.closest('.property-item');
            if (item) {
                this.selectProperty(item.dataset.path);
            }
        });

        // Property form changes
        ['prop-name', 'prop-type', 'prop-description', 'prop-required'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', () => this.updateProperty());
        });

        // Delete property
        document.getElementById('delete-property')?.addEventListener('click', () => {
            if (this.selectedPropertyPath && confirm('Property löschen?')) {
                this.deleteProperty(this.selectedPropertyPath);
            }
        });

        // Templates
        document.querySelectorAll('.template-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('Aktuelles Schema mit Template ersetzen?')) {
                    this.applyTemplate(btn.dataset.template);
                }
            });
        });

        // Format JSON
        document.getElementById('format-json')?.addEventListener('click', () => {
            const textarea = document.getElementById('json-source');
            try {
                const json = JSON.parse(textarea.value);
                textarea.value = JSON.stringify(json, null, 2);
            } catch (err) {
                alert('Ungültiges JSON');
            }
        });

        // Copy JSON
        document.getElementById('copy-json')?.addEventListener('click', () => {
            const json = this.viewMode === 'code'
                ? document.getElementById('json-source').value
                : JSON.stringify(this.schema, null, 2);
            navigator.clipboard.writeText(json);
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

            // Save
            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault();
                this.saveSchema();
            }

            // Toggle view
            if (e.key === 'Tab' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                this.viewMode = this.viewMode === 'form' ? 'code' : 'form';
                document.querySelectorAll('.toggle-btn').forEach(b => {
                    b.classList.toggle('active', b.dataset.view === this.viewMode);
                });
                this.render();
            }
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const app = new SchemaEditor();
    app.init();
});

export default SchemaEditor;
