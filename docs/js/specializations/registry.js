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

    renderCollectionMeta() {}
    renderLocationTree() {}
    renderFilters() {}
    renderQualityIndicator() {}
    renderTable() {}
    renderCards() {}
    renderEditor() {}

    searchByInventory(pattern) {
        // Support wildcards: GM-2024-* matches GM-2024-0001, GM-2024-0002, etc.
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$', 'i');
        this.filteredObjects = this.objects.filter(obj => regex.test(obj.inventory_number || obj.id));
        this.renderTable();
    }

    applyFilters() {}
    setViewMode(mode) {}
    selectAll(checked) {}
    updateSelectionCount() {}
    applyBulkAction() {}

    editObject(index) {
        this.editingObject = this.filteredObjects[index];
        this.renderEditor();
    }

    saveObject() {}
    cancelEdit() {}
    checkDuplicates() {}

    calculateCompleteness(obj) {
        const requiredFields = this.data.schema?.required_fields || [];
        if (requiredFields.length === 0) return 100;

        const filled = requiredFields.filter(field => obj[field] && obj[field] !== '').length;
        return Math.round((filled / requiredFields.length) * 100);
    }
}
