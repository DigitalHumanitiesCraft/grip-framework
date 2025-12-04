// Adaptive Workbench - Auto-Validation against Schema
// GRIP Framework Demo

class AdaptiveWorkbench {
    constructor(dataUrl) {
        this.dataUrl = dataUrl;
        this.data = null;
        this.objects = [];
        this.schema = {};
        this.validationErrors = [];
        this.filteredObjects = [];
        this.selectedCell = null;
        this.currentPage = 1;
        this.pageSize = 10;
        this.currentView = 'table';
        this.undoStack = [];
        this.redoStack = [];

        this.init();
    }

    async init() {
        try {
            const response = await fetch(this.dataUrl);
            this.data = await response.json();
            this.schema = this.data.schema;
            this.objects = this.data.objects.map((obj, i) => ({
                ...obj,
                _index: i,
                _status: 'valid',
                _errors: []
            }));
            this.validationErrors = this.data.validation_errors || [];

            this.setupDOM();
            this.renderSchema();
            this.validateAll();
            this.applyFilters();
            this.renderTable();
            this.renderBatchOperations();
            this.setupInteractions();
            this.updateStats();
        } catch (error) {
            console.error('Error loading workbench data:', error);
        }
    }

    setupDOM() {
        document.getElementById('dataset-title').textContent = this.data.metadata.title.split(':')[0];
        document.getElementById('dataset-description').textContent = this.data.metadata.description;
    }

    renderSchema() {
        const container = document.getElementById('schema-fields');
        const fields = Object.entries(this.schema);

        container.innerHTML = fields.map(([key, description]) => {
            const isRequired = description.includes('Pflicht');
            return `
                <div class="schema-field ${isRequired ? 'required' : ''}">
                    <span class="field-name">${key}</span>
                    <span class="field-desc">${description}</span>
                </div>
            `;
        }).join('');
    }

    validateAll() {
        // Reset all statuses
        this.objects.forEach(obj => {
            obj._status = 'valid';
            obj._errors = [];
        });

        // Apply known validation errors from JSON
        this.validationErrors.forEach(error => {
            const obj = this.objects.find(o => o.id === error.object_id || (error.object_id === '' && o.id === ''));
            if (obj) {
                obj._status = 'error';
                obj._errors.push({
                    field: error.field,
                    error: error.error,
                    expected: error.expected,
                    actual: error.actual
                });
            }
        });

        // Run additional live validation
        this.objects.forEach(obj => {
            // Check required fields
            if (!obj.id || obj.id.trim() === '') {
                if (!obj._errors.some(e => e.field === 'id')) {
                    obj._status = 'error';
                    obj._errors.push({
                        field: 'id',
                        error: 'Pflichtfeld leer',
                        expected: 'Inventarnummer',
                        actual: obj.id || ''
                    });
                }
            }

            if (!obj.title || obj.title.trim() === '') {
                if (!obj._errors.some(e => e.field === 'title')) {
                    obj._status = obj._status === 'error' ? 'error' : 'warning';
                    obj._errors.push({
                        field: 'title',
                        error: 'Titel fehlt',
                        expected: 'Titel des Werks',
                        actual: obj.title || ''
                    });
                }
            }

            if (!obj.artist || obj.artist === null) {
                if (!obj._errors.some(e => e.field === 'artist')) {
                    obj._status = obj._status === 'error' ? 'error' : 'warning';
                    obj._errors.push({
                        field: 'artist',
                        error: 'Künstler fehlt',
                        expected: 'Künstlername',
                        actual: obj.artist || 'null'
                    });
                }
            }

            // Date format validation
            if (obj.date && !this.isValidDateFormat(obj.date)) {
                if (!obj._errors.some(e => e.field === 'date')) {
                    obj._status = 'error';
                    obj._errors.push({
                        field: 'date',
                        error: 'Ungültiges Datumsformat',
                        expected: 'YYYY oder YYYY-MM-DD',
                        actual: obj.date
                    });
                }
            }

            // Category validation
            const validCategories = ['Malerei', 'Skulptur', 'Grafik', 'Fotografie', 'Installation'];
            if (obj.category && !validCategories.includes(obj.category)) {
                if (!obj._errors.some(e => e.field === 'category')) {
                    obj._status = 'error';
                    obj._errors.push({
                        field: 'category',
                        error: 'Ungültige Kategorie',
                        expected: validCategories.join(', '),
                        actual: obj.category
                    });
                }
            }
        });
    }

    isValidDateFormat(date) {
        if (!date) return true;
        // Allow: YYYY, YYYY-MM-DD, YYYY-YYYY, ca. YYYY, um YYYY
        const patterns = [
            /^\d{4}$/,                    // 1923
            /^\d{4}-\d{2}-\d{2}$/,         // 1923-05-20
            /^\d{4}-\d{4}$/,               // 1955-1957
            /^ca\.\s?\d{4}$/,              // ca. 1900
            /^um\s?\d{4}$/                 // um 1905
        ];
        return patterns.some(p => p.test(date));
    }

    applyFilters() {
        const statusFilter = document.getElementById('status-filter').value;
        const searchTerm = document.getElementById('search-input').value.toLowerCase();

        this.filteredObjects = this.objects.filter(obj => {
            // Status filter
            if (statusFilter !== 'all' && obj._status !== statusFilter) {
                return false;
            }

            // Search filter
            if (searchTerm) {
                const searchFields = ['id', 'title', 'artist', 'category', 'location'];
                const matches = searchFields.some(field =>
                    obj[field] && obj[field].toString().toLowerCase().includes(searchTerm)
                );
                if (!matches) return false;
            }

            return true;
        });

        this.currentPage = 1;
        this.renderTable();
        this.renderPagination();
    }

    renderTable() {
        const thead = document.getElementById('table-header');
        const tbody = document.getElementById('table-body');

        // Define visible columns
        const columns = ['id', 'title', 'artist', 'date', 'category', 'location', 'condition'];

        // Render header
        thead.innerHTML = `
            <tr>
                <th class="col-status"></th>
                ${columns.map(col => `<th class="col-${col}">${col}</th>`).join('')}
                <th class="col-actions"></th>
            </tr>
        `;

        // Get paginated data
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        const pageData = this.filteredObjects.slice(start, end);

        // Render rows
        tbody.innerHTML = pageData.map(obj => {
            const statusClass = obj._status === 'error' ? 'row-error' :
                               obj._status === 'warning' ? 'row-warning' : 'row-valid';

            return `
                <tr class="${statusClass}" data-index="${obj._index}">
                    <td class="status-cell">
                        <span class="status-dot ${obj._status}" title="${obj._errors.length} Fehler"></span>
                    </td>
                    ${columns.map(col => {
                        const hasError = obj._errors.some(e => e.field === col);
                        const cellClass = hasError ? 'cell-error' : '';
                        const isEditable = col !== 'id'; // ID is read-only
                        const value = obj[col] !== null && obj[col] !== undefined ? obj[col] : '';

                        return `
                            <td class="${cellClass} ${isEditable ? '' : 'cell-readonly'}"
                                ${isEditable ? 'contenteditable="true"' : ''}
                                data-field="${col}"
                                data-index="${obj._index}">${this.escapeHtml(value.toString())}</td>
                        `;
                    }).join('')}
                    <td class="actions-cell">
                        <button class="row-action duplicate-btn" data-index="${obj._index}" title="Duplizieren">⊕</button>
                        <button class="row-action delete-btn" data-index="${obj._index}" title="Löschen">×</button>
                    </td>
                </tr>
            `;
        }).join('');

        this.renderPagination();
        this.setupTableInteractions();
    }

    renderPagination() {
        const total = this.filteredObjects.length;
        const totalPages = Math.ceil(total / this.pageSize);
        const start = Math.min((this.currentPage - 1) * this.pageSize + 1, total);
        const end = Math.min(this.currentPage * this.pageSize, total);

        document.getElementById('pagination-info').textContent = `Zeige ${start}-${end} von ${total}`;

        const btnsContainer = document.getElementById('pagination-btns');
        let btns = '';

        btns += `<button ${this.currentPage === 1 ? 'disabled' : ''} data-page="prev">&laquo;</button>`;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
                btns += `<button class="${i === this.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
            } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
                btns += `<button disabled>...</button>`;
            }
        }

        btns += `<button ${this.currentPage === totalPages ? 'disabled' : ''} data-page="next">&raquo;</button>`;

        btnsContainer.innerHTML = btns;

        // Add pagination listeners
        btnsContainer.querySelectorAll('button:not(:disabled)').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = btn.dataset.page;
                if (page === 'prev') this.currentPage--;
                else if (page === 'next') this.currentPage++;
                else this.currentPage = parseInt(page);
                this.renderTable();
            });
        });
    }

    setupTableInteractions() {
        const tbody = document.getElementById('table-body');

        // Cell focus
        tbody.querySelectorAll('td[contenteditable="true"]').forEach(cell => {
            cell.addEventListener('focus', () => {
                this.selectCell(cell);
            });

            cell.addEventListener('blur', () => {
                this.updateCellValue(cell);
            });

            cell.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    cell.blur();
                }
            });
        });

        // Delete buttons
        tbody.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                this.deleteObject(index);
            });
        });

        // Duplicate buttons
        tbody.querySelectorAll('.duplicate-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                this.duplicateObject(index);
            });
        });
    }

    selectCell(cell) {
        this.selectedCell = cell;
        const index = parseInt(cell.dataset.index);
        const field = cell.dataset.field;
        const obj = this.objects[index];

        document.getElementById('inspector-hint').style.display = 'none';
        document.getElementById('inspector-details').classList.remove('hidden');

        document.getElementById('inspector-object').textContent = obj.id || '(keine ID)';
        document.getElementById('inspector-field').textContent = field;
        document.getElementById('inspector-expected').textContent = this.schema[field] || '-';
        document.getElementById('inspector-value').textContent = obj[field] || '(leer)';

        // Show error section if this field has an error
        const error = obj._errors.find(e => e.field === field);
        const errorSection = document.getElementById('error-section');
        const quickFix = document.getElementById('quick-fix');

        if (error) {
            errorSection.classList.remove('hidden');
            document.getElementById('error-text').textContent = `${error.error}. Erwartet: ${error.expected}`;

            // Generate quick fix if possible
            const fix = this.generateQuickFix(obj, field, error);
            if (fix) {
                quickFix.classList.remove('hidden');
                const fixBtn = document.getElementById('fix-btn');
                fixBtn.textContent = `→ ${fix.label}`;
                fixBtn.onclick = () => {
                    this.applyQuickFix(obj, field, fix.value);
                };
            } else {
                quickFix.classList.add('hidden');
            }
        } else {
            errorSection.classList.add('hidden');
        }
    }

    generateQuickFix(obj, field, error) {
        // Date format fixes
        if (field === 'date' && error.error === 'Ungültiges Datumsformat') {
            const value = obj.date;
            // DD.MM.YYYY -> YYYY-MM-DD
            const dmyMatch = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
            if (dmyMatch) {
                return {
                    label: `In ${dmyMatch[3]}-${dmyMatch[2]}-${dmyMatch[1]} konvertieren`,
                    value: `${dmyMatch[3]}-${dmyMatch[2]}-${dmyMatch[1]}`
                };
            }
        }

        // Category case fixes
        if (field === 'category' && error.error.includes('Kleinschreibung')) {
            const corrected = obj.category.charAt(0).toUpperCase() + obj.category.slice(1).toLowerCase();
            return {
                label: `In "${corrected}" korrigieren`,
                value: corrected
            };
        }

        // Spelling fixes
        if (field === 'category' && obj.category === 'Graphik') {
            return {
                label: `In "Grafik" korrigieren`,
                value: 'Grafik'
            };
        }

        // Artist null fix
        if (field === 'artist' && (obj.artist === null || obj.artist === '')) {
            return {
                label: `Mit "Unbekannt" füllen`,
                value: 'Unbekannt'
            };
        }

        return null;
    }

    applyQuickFix(obj, field, value) {
        // Save to undo stack
        this.undoStack.push({
            type: 'edit',
            index: obj._index,
            field: field,
            oldValue: obj[field],
            newValue: value
        });
        this.redoStack = [];
        this.updateUndoButtons();

        // Apply fix
        obj[field] = value;

        // Revalidate and re-render
        this.validateAll();
        this.applyFilters();
        this.updateStats();
    }

    updateCellValue(cell) {
        const index = parseInt(cell.dataset.index);
        const field = cell.dataset.field;
        const obj = this.objects[index];
        const oldValue = obj[field];
        const newValue = cell.textContent.trim();

        if (oldValue !== newValue) {
            // Save to undo stack
            this.undoStack.push({
                type: 'edit',
                index: index,
                field: field,
                oldValue: oldValue,
                newValue: newValue
            });
            this.redoStack = [];
            this.updateUndoButtons();

            // Update value
            obj[field] = newValue;

            // Revalidate
            this.validateAll();
            this.applyFilters();
            this.updateStats();
        }
    }

    deleteObject(index) {
        if (!confirm('Objekt wirklich löschen?')) return;

        const obj = this.objects[index];
        this.undoStack.push({
            type: 'delete',
            index: index,
            object: { ...obj }
        });
        this.redoStack = [];
        this.updateUndoButtons();

        this.objects.splice(index, 1);
        // Re-index
        this.objects.forEach((o, i) => o._index = i);

        this.validateAll();
        this.applyFilters();
        this.updateStats();
    }

    duplicateObject(index) {
        const obj = this.objects[index];
        const newObj = {
            ...obj,
            id: obj.id + '-copy',
            _index: this.objects.length,
            _status: 'valid',
            _errors: []
        };

        this.objects.push(newObj);
        this.undoStack.push({
            type: 'duplicate',
            index: newObj._index
        });
        this.redoStack = [];
        this.updateUndoButtons();

        this.validateAll();
        this.applyFilters();
        this.updateStats();
    }

    updateUndoButtons() {
        document.getElementById('undo-btn').disabled = this.undoStack.length === 0;
        document.getElementById('redo-btn').disabled = this.redoStack.length === 0;
    }

    undo() {
        if (this.undoStack.length === 0) return;

        const action = this.undoStack.pop();
        this.redoStack.push(action);

        if (action.type === 'edit') {
            this.objects[action.index][action.field] = action.oldValue;
        } else if (action.type === 'delete') {
            this.objects.splice(action.index, 0, action.object);
            this.objects.forEach((o, i) => o._index = i);
        } else if (action.type === 'duplicate') {
            this.objects.splice(action.index, 1);
            this.objects.forEach((o, i) => o._index = i);
        }

        this.updateUndoButtons();
        this.validateAll();
        this.applyFilters();
        this.updateStats();
    }

    redo() {
        if (this.redoStack.length === 0) return;

        const action = this.redoStack.pop();
        this.undoStack.push(action);

        if (action.type === 'edit') {
            this.objects[action.index][action.field] = action.newValue;
        } else if (action.type === 'delete') {
            this.objects.splice(action.index, 1);
            this.objects.forEach((o, i) => o._index = i);
        } else if (action.type === 'duplicate') {
            // Re-add duplicated object
            const original = this.objects[Math.min(action.index - 1, this.objects.length - 1)];
            const newObj = { ...original, id: original.id + '-copy', _index: this.objects.length };
            this.objects.push(newObj);
        }

        this.updateUndoButtons();
        this.validateAll();
        this.applyFilters();
        this.updateStats();
    }

    updateStats() {
        const errors = this.objects.filter(o => o._status === 'error').length;
        const warnings = this.objects.filter(o => o._status === 'warning').length;
        const valid = this.objects.filter(o => o._status === 'valid').length;

        document.getElementById('stat-errors').textContent = errors;
        document.getElementById('stat-warnings').textContent = warnings;
        document.getElementById('stat-valid').textContent = valid;

        // Error breakdown
        const errorTypes = {};
        this.objects.forEach(obj => {
            obj._errors.forEach(err => {
                errorTypes[err.error] = (errorTypes[err.error] || 0) + 1;
            });
        });

        const errorList = document.getElementById('error-types-list');
        errorList.innerHTML = Object.entries(errorTypes)
            .sort((a, b) => b[1] - a[1])
            .map(([type, count]) => `
                <li class="error-type-item">
                    <span class="error-type-name">${type}</span>
                    <span class="error-type-count">${count}</span>
                </li>
            `).join('') || '<li class="no-errors">Keine Fehler gefunden</li>';
    }

    renderBatchOperations() {
        const container = document.getElementById('batch-ops');

        // Analyze common issues
        const dateErrors = this.objects.filter(o =>
            o._errors.some(e => e.field === 'date' && e.error === 'Ungültiges Datumsformat')
        ).length;

        const categoryErrors = this.objects.filter(o =>
            o._errors.some(e => e.field === 'category')
        ).length;

        const missingArtists = this.objects.filter(o =>
            o.artist === null || o.artist === ''
        ).length;

        const ops = [];

        if (dateErrors > 0) {
            ops.push({
                label: `Alle Datumsformate korrigieren (${dateErrors})`,
                action: () => this.batchFixDates()
            });
        }

        if (categoryErrors > 0) {
            ops.push({
                label: `Alle Kategorien normalisieren (${categoryErrors})`,
                action: () => this.batchFixCategories()
            });
        }

        if (missingArtists > 0) {
            ops.push({
                label: `Fehlende Künstler mit "Unbekannt" füllen (${missingArtists})`,
                action: () => this.batchFixArtists()
            });
        }

        container.innerHTML = ops.length > 0
            ? ops.map((op, i) => `<button class="batch-btn" data-op="${i}">${op.label}</button>`).join('')
            : '<p class="no-batch-ops">Keine Batch-Operationen verfügbar</p>';

        container.querySelectorAll('.batch-btn').forEach((btn, i) => {
            btn.addEventListener('click', () => {
                ops[i].action();
                btn.textContent = 'Ausgeführt!';
                btn.disabled = true;
            });
        });
    }

    batchFixDates() {
        this.objects.forEach(obj => {
            if (obj.date) {
                const dmyMatch = obj.date.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
                if (dmyMatch) {
                    obj.date = `${dmyMatch[3]}-${dmyMatch[2]}-${dmyMatch[1]}`;
                }
            }
        });
        this.validateAll();
        this.applyFilters();
        this.updateStats();
        this.renderBatchOperations();
    }

    batchFixCategories() {
        const categoryMap = {
            'malerei': 'Malerei',
            'skulptur': 'Skulptur',
            'grafik': 'Grafik',
            'graphik': 'Grafik',
            'fotografie': 'Fotografie',
            'installation': 'Installation'
        };

        this.objects.forEach(obj => {
            if (obj.category) {
                const lower = obj.category.toLowerCase();
                if (categoryMap[lower]) {
                    obj.category = categoryMap[lower];
                }
            }
        });
        this.validateAll();
        this.applyFilters();
        this.updateStats();
        this.renderBatchOperations();
    }

    batchFixArtists() {
        this.objects.forEach(obj => {
            if (obj.artist === null || obj.artist === '') {
                obj.artist = 'Unbekannt';
            }
        });
        this.validateAll();
        this.applyFilters();
        this.updateStats();
        this.renderBatchOperations();
    }

    setupInteractions() {
        // View toggle
        document.querySelectorAll('.tool-btn[data-view]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tool-btn[data-view]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.switchView(btn.dataset.view);
            });
        });

        // Filters
        document.getElementById('status-filter').addEventListener('change', () => this.applyFilters());
        document.getElementById('search-input').addEventListener('input', () => this.applyFilters());

        // Undo/Redo
        document.getElementById('undo-btn').addEventListener('click', () => this.undo());
        document.getElementById('redo-btn').addEventListener('click', () => this.redo());

        // Validate button
        document.getElementById('validate-btn').addEventListener('click', () => {
            this.validateAll();
            this.applyFilters();
            this.updateStats();
            this.renderBatchOperations();
        });

        // Export buttons
        document.querySelectorAll('.export-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.exportData(btn.dataset.format);
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                this.undo();
            }
            if (e.ctrlKey && e.key === 'y') {
                e.preventDefault();
                this.redo();
            }
        });
    }

    switchView(view) {
        this.currentView = view;

        document.getElementById('view-table').classList.toggle('hidden', view !== 'table');
        document.getElementById('view-table').classList.toggle('active', view === 'table');
        document.getElementById('view-json').classList.toggle('hidden', view !== 'json');
        document.getElementById('view-errors').classList.toggle('hidden', view !== 'errors');

        if (view === 'json') {
            this.renderJsonView();
        } else if (view === 'errors') {
            this.renderErrorsView();
        }
    }

    renderJsonView() {
        const cleanObjects = this.objects.map(obj => {
            const clean = { ...obj };
            delete clean._index;
            delete clean._status;
            delete clean._errors;
            return clean;
        });

        const json = JSON.stringify(cleanObjects, null, 2);
        document.getElementById('json-display').textContent = json;
    }

    renderErrorsView() {
        const container = document.getElementById('errors-list');
        const objectsWithErrors = this.objects.filter(o => o._errors.length > 0);

        if (objectsWithErrors.length === 0) {
            container.innerHTML = '<div class="no-errors-message">Keine Validierungsfehler gefunden!</div>';
            return;
        }

        container.innerHTML = objectsWithErrors.map(obj => `
            <div class="error-card">
                <div class="error-card-header">
                    <span class="error-card-id">${obj.id || '(keine ID)'}</span>
                    <span class="error-card-title">${obj.title || '(kein Titel)'}</span>
                    <span class="error-badge">${obj._errors.length} Fehler</span>
                </div>
                <ul class="error-card-list">
                    ${obj._errors.map(err => `
                        <li class="error-card-item">
                            <strong>${err.field}:</strong> ${err.error}
                            <span class="error-detail">Erwartet: ${err.expected}, Gefunden: ${err.actual}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `).join('');
    }

    exportData(format) {
        let content, filename, type;

        const cleanObjects = this.objects.map(obj => {
            const clean = { ...obj };
            delete clean._index;
            delete clean._status;
            delete clean._errors;
            return clean;
        });

        if (format === 'json') {
            content = JSON.stringify(cleanObjects, null, 2);
            filename = 'export.json';
            type = 'application/json';
        } else if (format === 'csv') {
            const headers = Object.keys(this.schema);
            const rows = cleanObjects.map(obj =>
                headers.map(h => `"${(obj[h] || '').toString().replace(/"/g, '""')}"`).join(',')
            );
            content = [headers.join(','), ...rows].join('\n');
            filename = 'export.csv';
            type = 'text/csv';
        } else if (format === 'report') {
            const errors = this.objects.filter(o => o._status === 'error').length;
            const warnings = this.objects.filter(o => o._status === 'warning').length;
            const valid = this.objects.filter(o => o._status === 'valid').length;

            content = `VALIDIERUNGSREPORT
==================
${this.data.metadata.title}
Generiert: ${new Date().toISOString()}

ZUSAMMENFASSUNG
---------------
Gesamtobjekte: ${this.objects.length}
Valide: ${valid}
Warnungen: ${warnings}
Fehler: ${errors}

FEHLERDETAILS
-------------
${this.objects.filter(o => o._errors.length > 0).map(obj =>
    `${obj.id || '(keine ID)'}: ${obj._errors.map(e => `${e.field} - ${e.error}`).join('; ')}`
).join('\n')}
`;
            filename = 'validierungsreport.txt';
            type = 'text/plain';
        }

        // Download
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}

// Initialize when DOM ready
document.addEventListener('DOMContentLoaded', () => {
    new AdaptiveWorkbench('data/workbench-metadata.json');
});
