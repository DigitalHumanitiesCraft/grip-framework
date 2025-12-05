/**
 * Codebook Variablenliste Mode
 * Übersicht aller Variablen mit Filter und Sortierung
 */

class CodebookVariablenliste {
    constructor() {
        this.data = null;
        this.variables = [];
        this.filteredVariables = [];
        this.selectedVariable = null;
        this.selectedRows = new Set();
        this.sortBy = 'position';
        this.sortAsc = true;
        this.filters = {
            search: '',
            type: '',
            group: '',
            missingOnly: false
        };
    }

    async init() {
        try {
            const response = await fetch('../data/codebook-data.json');
            this.data = await response.json();
            this.variables = this.data.variables || [];
            this.populateFilters();
            this.applyFilters();
            this.render();
            this.bindEvents();
            this.bindKeyboard();
            this.updateStats();
        } catch (error) {
            console.error('Fehler beim Laden der Codebook-Daten:', error);
            this.loadDemoData();
        }
    }

    loadDemoData() {
        this.variables = [
            { position: 1, name: 'id', label: 'Fallnummer', type: 'numeric', validN: 1000, missingN: 0, min: 1, max: 1000, group: 'Identifikation' },
            { position: 2, name: 'age', label: 'Alter in Jahren', type: 'numeric', validN: 985, missingN: 15, min: 18, max: 99, group: 'Demografie' },
            { position: 3, name: 'gender', label: 'Geschlecht', type: 'categorical', validN: 998, missingN: 2, values: [{ code: 1, label: 'männlich' }, { code: 2, label: 'weiblich' }, { code: 3, label: 'divers' }], group: 'Demografie' },
            { position: 4, name: 'education', label: 'Höchster Bildungsabschluss', type: 'categorical', validN: 990, missingN: 10, values: [{ code: 1, label: 'ohne' }, { code: 2, label: 'Hauptschule' }, { code: 3, label: 'Realschule' }, { code: 4, label: 'Abitur' }, { code: 5, label: 'Hochschule' }], group: 'Demografie' },
            { position: 5, name: 'income', label: 'Monatliches Nettoeinkommen', type: 'numeric', validN: 850, missingN: 150, min: 0, max: 25000, group: 'Sozioökonomie' },
            { position: 6, name: 'satisfaction', label: 'Lebenszufriedenheit (1-10)', type: 'numeric', validN: 995, missingN: 5, min: 1, max: 10, group: 'Einstellungen' },
            { position: 7, name: 'interview_date', label: 'Interviewdatum', type: 'date', validN: 1000, missingN: 0, group: 'Methodik' },
            { position: 8, name: 'comments', label: 'Offene Anmerkungen', type: 'string', validN: 234, missingN: 766, group: 'Sonstiges' }
        ];
        this.populateFilters();
        this.applyFilters();
        this.render();
        this.updateStats();
    }

    populateFilters() {
        // Populate group filter
        const groups = [...new Set(this.variables.map(v => v.group).filter(Boolean))];
        const groupSelect = document.getElementById('filter-group');
        if (groupSelect) {
            groupSelect.innerHTML = '<option value="">Alle Gruppen</option>' +
                groups.map(g => `<option value="${g}">${g}</option>`).join('');
        }
    }

    applyFilters() {
        this.filteredVariables = this.variables.filter(v => {
            // Search filter
            if (this.filters.search) {
                const search = this.filters.search.toLowerCase();
                const matches = v.name.toLowerCase().includes(search) ||
                               v.label?.toLowerCase().includes(search);
                if (!matches) return false;
            }

            // Type filter
            if (this.filters.type && v.type !== this.filters.type) {
                return false;
            }

            // Group filter
            if (this.filters.group && v.group !== this.filters.group) {
                return false;
            }

            // Missing only
            if (this.filters.missingOnly && v.missingN === 0) {
                return false;
            }

            return true;
        });

        // Sort
        this.filteredVariables.sort((a, b) => {
            let valA = a[this.sortBy];
            let valB = b[this.sortBy];

            if (typeof valA === 'string') {
                valA = valA.toLowerCase();
                valB = valB?.toLowerCase() || '';
            }

            if (this.sortBy === 'completeness') {
                valA = a.validN / (a.validN + a.missingN);
                valB = b.validN / (b.validN + b.missingN);
            }

            if (valA < valB) return this.sortAsc ? -1 : 1;
            if (valA > valB) return this.sortAsc ? 1 : -1;
            return 0;
        });
    }

    render() {
        const tbody = document.getElementById('variable-tbody');
        if (!tbody) return;

        tbody.innerHTML = this.filteredVariables.map(v => {
            const isSelected = this.selectedRows.has(v.name);
            const completeness = Math.round((v.validN / (v.validN + v.missingN)) * 100);

            return `
                <tr data-name="${v.name}" class="${isSelected ? 'selected' : ''}">
                    <td class="col-select">
                        <input type="checkbox" ${isSelected ? 'checked' : ''}>
                    </td>
                    <td class="col-pos">${v.position}</td>
                    <td class="col-name"><code>${v.name}</code></td>
                    <td class="col-label">${v.label || '–'}</td>
                    <td class="col-type"><span class="type-badge ${v.type}">${this.getTypeLabel(v.type)}</span></td>
                    <td class="col-values">${this.getValuesDisplay(v)}</td>
                    <td class="col-missing">
                        <span class="completeness-bar" style="--completeness: ${completeness}%"></span>
                        ${v.missingN > 0 ? `<span class="missing-count">${v.missingN}</span>` : '–'}
                    </td>
                </tr>
            `;
        }).join('');
    }

    getTypeLabel(type) {
        const labels = {
            numeric: 'Num',
            string: 'Str',
            date: 'Dat',
            categorical: 'Kat'
        };
        return labels[type] || type;
    }

    getValuesDisplay(variable) {
        if (variable.type === 'categorical' && variable.values) {
            return `${variable.values.length} Kategorien`;
        }
        if (variable.type === 'numeric' && variable.min !== undefined) {
            return `${variable.min}–${variable.max}`;
        }
        return '–';
    }

    bindEvents() {
        // Search
        document.getElementById('var-search')?.addEventListener('input', (e) => {
            this.filters.search = e.target.value;
            this.applyFilters();
            this.render();
            this.updateStats();
        });

        // Type filter
        document.getElementById('filter-type')?.addEventListener('change', (e) => {
            this.filters.type = e.target.value;
            this.applyFilters();
            this.render();
            this.updateStats();
        });

        // Group filter
        document.getElementById('filter-group')?.addEventListener('change', (e) => {
            this.filters.group = e.target.value;
            this.applyFilters();
            this.render();
            this.updateStats();
        });

        // Missing only filter
        document.getElementById('filter-missing')?.addEventListener('change', (e) => {
            this.filters.missingOnly = e.target.checked;
            this.applyFilters();
            this.render();
            this.updateStats();
        });

        // Sort
        document.getElementById('sort-by')?.addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.applyFilters();
            this.render();
        });

        // Row selection
        document.getElementById('variable-tbody')?.addEventListener('click', (e) => {
            const row = e.target.closest('tr');
            if (!row) return;

            const varName = row.dataset.name;

            if (e.target.type === 'checkbox') {
                if (e.target.checked) {
                    this.selectedRows.add(varName);
                } else {
                    this.selectedRows.delete(varName);
                }
                this.updateBulkActions();
            } else {
                this.showQuickInfo(varName);
            }
        });

        // Select all
        document.getElementById('select-all')?.addEventListener('click', () => {
            if (this.selectedRows.size === this.filteredVariables.length) {
                this.selectedRows.clear();
            } else {
                this.filteredVariables.forEach(v => this.selectedRows.add(v.name));
            }
            this.render();
            this.updateBulkActions();
        });

        // Export selected
        document.getElementById('export-selected')?.addEventListener('click', () => {
            this.exportSelected();
        });
    }

    showQuickInfo(varName) {
        const variable = this.variables.find(v => v.name === varName);
        if (!variable) return;

        const quickInfo = document.getElementById('quick-info');
        if (!quickInfo) return;

        quickInfo.classList.remove('hidden');

        document.getElementById('qi-name').textContent = variable.name;
        document.getElementById('qi-label').textContent = variable.label || '';
        document.getElementById('qi-type').textContent = variable.type;

        if (variable.type === 'numeric') {
            document.getElementById('qi-range').textContent =
                variable.min !== undefined ? `${variable.min} – ${variable.max}` : '–';
        } else if (variable.type === 'categorical') {
            document.getElementById('qi-range').textContent =
                variable.values ? `${variable.values.length} Kategorien` : '–';
        } else {
            document.getElementById('qi-range').textContent = '–';
        }

        document.getElementById('qi-missing').textContent =
            `${variable.missingN} (${Math.round((variable.missingN / (variable.validN + variable.missingN)) * 100)}%)`;

        document.getElementById('qi-detail').href = `variablendetail.html?var=${varName}`;
    }

    updateBulkActions() {
        const exportBtn = document.getElementById('export-selected');
        const selectAllBtn = document.getElementById('select-all');

        if (exportBtn) {
            exportBtn.disabled = this.selectedRows.size === 0;
        }

        if (selectAllBtn) {
            selectAllBtn.textContent =
                this.selectedRows.size === this.filteredVariables.length ? '☑ Keine' : '☐ Alle';
        }
    }

    exportSelected() {
        const selected = this.variables.filter(v => this.selectedRows.has(v.name));
        const csv = this.toCSV(selected);

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'codebook-variables.csv';
        a.click();
        URL.revokeObjectURL(url);
    }

    toCSV(variables) {
        const headers = ['Position', 'Name', 'Label', 'Type', 'Valid N', 'Missing N'];
        const rows = variables.map(v => [
            v.position,
            v.name,
            `"${(v.label || '').replace(/"/g, '""')}"`,
            v.type,
            v.validN,
            v.missingN
        ]);

        return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    updateStats() {
        document.getElementById('stat-total').textContent = this.variables.length;
        document.getElementById('stat-filtered').textContent = this.filteredVariables.length;

        const groups = new Set(this.variables.map(v => v.group).filter(Boolean));
        document.getElementById('stat-groups').textContent = groups.size;
    }

    bindKeyboard() {
        document.addEventListener('keydown', (e) => {
            // Mode switching
            if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '4') {
                e.preventDefault();
                const modes = ['variablenliste', 'variablendetail', 'validierung', 'export'];
                window.location.href = `${modes[parseInt(e.key) - 1]}.html`;
            }

            // Focus search
            if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
                e.preventDefault();
                document.getElementById('var-search')?.focus();
            }
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const app = new CodebookVariablenliste();
    app.init();
});

export default CodebookVariablenliste;
