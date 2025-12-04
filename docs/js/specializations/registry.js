/**
 * Registry Module
 * Workbench-Spezialisierung für Sammlungsinventare
 *
 * Kognitive Aufgabe: Sichten und Korrigieren von Bestandsdaten
 *
 * UI-Elemente:
 * - Inventarnummer-Suche
 * - Standort-Hierarchie (Gebäude > Raum > Regal)
 * - Zustandsfelder mit kontrollierten Vokabularen
 * - Duplikat-Warnung
 * - Vollständigkeitsanzeige pro Datensatz
 * - Batch-Standort-Änderung
 */

export class Registry {
    constructor() {
        this.data = null;
        this.objects = [];
        this.filteredObjects = [];
        this.selectedObjects = new Set();
        this.editingObject = null;
        this.viewMode = 'table';
    }

    async init() {
        try {
            const response = await fetch('../examples/data/workbench-metadata.json');
            this.data = await response.json();

            this.objects = this.data.objects || [];
            this.filteredObjects = [...this.objects];

            this.setupEventListeners();
            this.render();

            console.log('Registry module initialized');
        } catch (error) {
            console.error('Error initializing Registry:', error);
        }
    }

    setupEventListeners() {
        document.getElementById('inventory-search')?.addEventListener('input', (e) => {
            this.searchByInventory(e.target.value);
        });

        document.getElementById('search-btn')?.addEventListener('click', () => {
            const query = document.getElementById('inventory-search').value;
            this.searchByInventory(query);
        });

        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setViewMode(e.target.dataset.view);
            });
        });

        // Filters
        ['filter-category', 'filter-condition'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', () => this.applyFilters());
        });

        document.getElementById('filter-completeness')?.addEventListener('input', (e) => {
            document.getElementById('completeness-value').textContent = `≥ ${e.target.value}%`;
            this.applyFilters();
        });

        // Bulk actions
        document.getElementById('bulk-action')?.addEventListener('change', (e) => {
            document.getElementById('apply-bulk').disabled = !e.target.value || this.selectedObjects.size === 0;
        });

        document.getElementById('apply-bulk')?.addEventListener('click', () => {
            this.applyBulkAction();
        });

        document.getElementById('select-all')?.addEventListener('change', (e) => {
            this.selectAll(e.target.checked);
        });

        // Editor
        document.getElementById('editor-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveObject();
        });

        document.getElementById('cancel-edit')?.addEventListener('click', () => {
            this.cancelEdit();
        });

        document.getElementById('check-duplicates')?.addEventListener('click', () => {
            this.checkDuplicates();
        });
    }

    render() {
        this.renderCollectionMeta();
        this.renderLocationTree();
        this.renderFilters();
        this.renderQualityIndicator();
        this.renderTable();
        this.updateSelectionCount();
    }

    renderCollectionMeta() {
        const meta = this.data?.collection_meta;
        if (!meta) return;

        const titleEl = document.getElementById('collection-title');
        if (titleEl) titleEl.textContent = meta.name || 'Sammlung';

        const statsEl = document.getElementById('collection-stats');
        if (statsEl) {
            statsEl.innerHTML = `
                <dt>Objekte</dt><dd>${this.objects.length}</dd>
                <dt>Institution</dt><dd>${meta.institution || '–'}</dd>
            `;
        }
    }

    renderLocationTree() {
        const container = document.getElementById('location-tree');
        if (!container || !this.data?.locations) return;

        container.innerHTML = this.data.locations.map(loc => `
            <div class="location-building">
                <h4 class="building-name">${loc.building}</h4>
                <ul class="room-list">
                    ${loc.rooms.map(room => {
                        const count = this.objects.filter(o => {
                            const objLoc = typeof o.location === 'string' ? o.location : o.location?.room;
                            return objLoc?.includes(room);
                        }).length;
                        return `<li class="room-item" data-room="${room}">${room} <span class="room-count">(${count})</span></li>`;
                    }).join('')}
                </ul>
            </div>
        `).join('');

        container.querySelectorAll('.room-item').forEach(item => {
            item.addEventListener('click', () => {
                const room = item.dataset.room;
                this.filteredObjects = this.objects.filter(o => {
                    const objLoc = typeof o.location === 'string' ? o.location : o.location?.room;
                    return objLoc?.includes(room);
                });
                this.renderTable();
            });
        });
    }

    renderFilters() {
        const categorySelect = document.getElementById('filter-category');
        const conditionSelect = document.getElementById('filter-condition');

        if (categorySelect && this.data?.schema?.controlled_vocabularies?.category) {
            categorySelect.innerHTML = '<option value="">Alle Kategorien</option>' +
                this.data.schema.controlled_vocabularies.category.map(c =>
                    `<option value="${c}">${c}</option>`
                ).join('');
        }

        if (conditionSelect && this.data?.schema?.controlled_vocabularies?.condition) {
            conditionSelect.innerHTML = '<option value="">Alle Zustände</option>' +
                this.data.schema.controlled_vocabularies.condition.map(c =>
                    `<option value="${c}">${c}</option>`
                ).join('');
        }
    }

    renderQualityIndicator() {
        const container = document.getElementById('quality-indicator');
        if (!container || !this.data?.summary) return;

        const { total_objects, objects_with_errors, error_types } = this.data.summary;
        const errorRate = ((objects_with_errors / total_objects) * 100).toFixed(0);

        container.innerHTML = `
            <div class="quality-score">
                <span class="score-value">${100 - errorRate}%</span>
                <span class="score-label">Qualität</span>
            </div>
            <div class="error-summary">
                <span class="error-count">${objects_with_errors} Objekte mit Fehlern</span>
                <ul class="error-types">
                    ${Object.entries(error_types).map(([type, count]) =>
                        `<li><span class="error-type-name">${type}</span>: ${count}</li>`
                    ).join('')}
                </ul>
            </div>
        `;
    }

    renderTable() {
        const tbody = document.getElementById('objects-tbody');
        const countEl = document.getElementById('objects-count');
        if (!tbody) return;

        if (countEl) {
            countEl.textContent = `${this.filteredObjects.length} / ${this.objects.length}`;
        }

        tbody.innerHTML = this.filteredObjects.map((obj, idx) => {
            const id = obj.inventory_number || obj.id;
            const completeness = this.calculateCompleteness(obj);
            const hasErrors = this.data?.validation_errors?.some(e => e.object_id === id);
            const isSelected = this.selectedObjects.has(id);

            return `
                <tr class="object-row ${hasErrors ? 'has-errors' : ''} ${isSelected ? 'selected' : ''}" data-index="${idx}">
                    <td><input type="checkbox" class="object-select" data-id="${id}" ${isSelected ? 'checked' : ''}></td>
                    <td class="inv-number">${id || '<span class="missing">fehlt</span>'}</td>
                    <td class="obj-title">${obj.title || '<span class="missing">kein Titel</span>'}</td>
                    <td class="obj-artist">${obj.artist || obj.creator || '–'}</td>
                    <td class="obj-category">${obj.category || '–'}</td>
                    <td class="obj-location">${typeof obj.location === 'string' ? obj.location : obj.location?.room || '–'}</td>
                    <td class="obj-completeness">
                        <div class="completeness-bar" style="--completeness: ${completeness}%"></div>
                        <span>${completeness}%</span>
                    </td>
                    <td class="obj-actions">
                        <button class="edit-btn" data-index="${idx}">Bearbeiten</button>
                    </td>
                </tr>
            `;
        }).join('');

        // Add event listeners
        tbody.querySelectorAll('.object-select').forEach(cb => {
            cb.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.selectedObjects.add(e.target.dataset.id);
                } else {
                    this.selectedObjects.delete(e.target.dataset.id);
                }
                this.updateSelectionCount();
            });
        });

        tbody.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => this.editObject(parseInt(btn.dataset.index)));
        });
    }

    renderCards() {
        const container = document.getElementById('objects-cards');
        if (!container) return;

        container.innerHTML = this.filteredObjects.map((obj, idx) => {
            const id = obj.inventory_number || obj.id;
            const completeness = this.calculateCompleteness(obj);
            const hasErrors = this.data?.validation_errors?.some(e => e.object_id === id);

            return `
                <div class="object-card ${hasErrors ? 'has-errors' : ''}" data-index="${idx}">
                    <h4>${obj.title || 'Ohne Titel'}</h4>
                    <p class="card-artist">${obj.artist || obj.creator || 'Unbekannt'}</p>
                    <dl class="card-meta">
                        <dt>Inv.Nr.</dt><dd>${id || '–'}</dd>
                        <dt>Kategorie</dt><dd>${obj.category || '–'}</dd>
                        <dt>Zustand</dt><dd>${obj.condition || '–'}</dd>
                    </dl>
                    <div class="card-completeness">${completeness}% vollständig</div>
                </div>
            `;
        }).join('');
    }

    renderEditor() {
        const panel = document.getElementById('editor-panel');
        if (!panel || !this.editingObject) return;

        const obj = this.editingObject;
        const id = obj.inventory_number || obj.id;
        const errors = this.data?.validation_errors?.filter(e => e.object_id === id) || [];

        panel.classList.remove('hidden');
        panel.innerHTML = `
            <h3>Objekt bearbeiten</h3>
            <form id="editor-form">
                <div class="form-group">
                    <label>Inventarnummer</label>
                    <input type="text" name="id" value="${id || ''}" required>
                </div>
                <div class="form-group">
                    <label>Titel</label>
                    <input type="text" name="title" value="${obj.title || ''}">
                </div>
                <div class="form-group">
                    <label>Künstler</label>
                    <input type="text" name="artist" value="${obj.artist || obj.creator || ''}">
                </div>
                <div class="form-group">
                    <label>Kategorie</label>
                    <select name="category">
                        ${this.data?.schema?.controlled_vocabularies?.category?.map(c =>
                            `<option value="${c}" ${obj.category?.toLowerCase() === c.toLowerCase() ? 'selected' : ''}>${c}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Zustand</label>
                    <select name="condition">
                        ${this.data?.schema?.controlled_vocabularies?.condition?.map(c =>
                            `<option value="${c}" ${obj.condition === c ? 'selected' : ''}>${c}</option>`
                        ).join('')}
                    </select>
                </div>
                ${errors.length > 0 ? `
                    <div class="validation-errors">
                        <h4>Validierungsfehler</h4>
                        <ul>
                            ${errors.map(e => `<li><strong>${e.field}:</strong> ${e.error}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                <div class="form-actions">
                    <button type="submit" class="save-btn">Speichern</button>
                    <button type="button" id="cancel-edit" class="cancel-btn">Abbrechen</button>
                </div>
            </form>
        `;

        document.getElementById('editor-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveObject();
        });

        document.getElementById('cancel-edit')?.addEventListener('click', () => this.cancelEdit());
    }

    searchByInventory(pattern) {
        if (!pattern) {
            this.filteredObjects = [...this.objects];
        } else {
            const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$', 'i');
            this.filteredObjects = this.objects.filter(obj => regex.test(obj.inventory_number || obj.id || ''));
        }
        this.renderTable();
    }

    applyFilters() {
        const category = document.getElementById('filter-category')?.value;
        const condition = document.getElementById('filter-condition')?.value;
        const minCompleteness = parseInt(document.getElementById('filter-completeness')?.value || 0);

        this.filteredObjects = this.objects.filter(obj => {
            if (category && obj.category?.toLowerCase() !== category.toLowerCase()) return false;
            if (condition && obj.condition !== condition) return false;
            if (this.calculateCompleteness(obj) < minCompleteness) return false;
            return true;
        });

        this.renderTable();
    }

    setViewMode(mode) {
        this.viewMode = mode;
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === mode);
        });

        if (mode === 'table') {
            this.renderTable();
        } else {
            this.renderCards();
        }
    }

    selectAll(checked) {
        this.filteredObjects.forEach(obj => {
            const id = obj.inventory_number || obj.id;
            if (checked) {
                this.selectedObjects.add(id);
            } else {
                this.selectedObjects.delete(id);
            }
        });
        this.renderTable();
        this.updateSelectionCount();
    }

    updateSelectionCount() {
        const countEl = document.getElementById('selection-count');
        if (countEl) {
            countEl.textContent = this.selectedObjects.size;
        }

        const bulkBtn = document.getElementById('apply-bulk');
        const bulkAction = document.getElementById('bulk-action')?.value;
        if (bulkBtn) {
            bulkBtn.disabled = !bulkAction || this.selectedObjects.size === 0;
        }
    }

    applyBulkAction() {
        const action = document.getElementById('bulk-action')?.value;
        if (!action || this.selectedObjects.size === 0) return;

        alert(`Aktion "${action}" auf ${this.selectedObjects.size} Objekte anwenden (Demo)`);
    }

    editObject(index) {
        this.editingObject = this.filteredObjects[index];
        this.renderEditor();
    }

    saveObject() {
        if (!this.editingObject) return;

        const form = document.getElementById('editor-form');
        if (!form) return;

        const formData = new FormData(form);

        // Update object
        Object.keys(this.editingObject).forEach(key => {
            if (formData.has(key)) {
                this.editingObject[key] = formData.get(key);
            }
        });

        this.cancelEdit();
        this.renderTable();
    }

    cancelEdit() {
        this.editingObject = null;
        document.getElementById('editor-panel')?.classList.add('hidden');
    }

    checkDuplicates() {
        const ids = this.objects.map(o => o.inventory_number || o.id).filter(Boolean);
        const duplicates = ids.filter((id, idx) => ids.indexOf(id) !== idx);

        if (duplicates.length > 0) {
            alert(`Duplikate gefunden: ${[...new Set(duplicates)].join(', ')}`);
        } else {
            alert('Keine Duplikate gefunden');
        }
    }

    calculateCompleteness(obj) {
        const requiredFields = this.data.schema?.required_fields || [];
        if (requiredFields.length === 0) return 100;

        const filled = requiredFields.filter(field => obj[field] && obj[field] !== '').length;
        return Math.round((filled / requiredFields.length) * 100);
    }
}
