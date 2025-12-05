/**
 * Registry Listen-Modus
 * Objektuebersicht fuer Bestandsmanagement
 *
 * Benoetigte Daten: objects[], schema
 * Wissensbasis: 15-MODI#Registry-Liste
 */

class RegistryListe {
    constructor() {
        this.data = null;
        this.filteredObjects = [];
        this.selectedObjects = new Set();
        this.sortBy = 'inventory_number';
        this.sortDir = 'asc';
        this.filters = { category: 'all', location: 'all', condition: 'all' };
        this.searchQuery = '';
        this.currentPage = 1;
        this.pageSize = 20;
        this.visibleColumns = ['inventory_number', 'title', 'creator', 'date', 'location'];
    }

    async init() {
        try {
            const response = await fetch('../data/workbench-metadata.json');
            this.data = await response.json();
            this.filteredObjects = [...this.data.objects];
            this.render();
            this.bindEvents();
            this.bindKeyboard();
        } catch (error) {
            console.error('Fehler beim Laden:', error);
        }
    }

    render() {
        this.renderFilters();
        this.applyFilters();
        this.renderTable();
        this.renderStats();
        this.renderPagination();
    }

    renderFilters() {
        const categorySelect = document.getElementById('filter-category');
        const locationSelect = document.getElementById('filter-location');

        if (categorySelect) {
            const categories = [...new Set(this.data.objects.map(o => o.category).filter(Boolean))];
            categorySelect.innerHTML = `<option value="all">Alle</option>` +
                categories.map(c => `<option value="${c}">${c}</option>`).join('');
        }

        if (locationSelect) {
            const locations = [...new Set(this.data.objects.map(o =>
                typeof o.location === 'object' ? o.location.building : o.location
            ).filter(Boolean))];
            locationSelect.innerHTML = `<option value="all">Alle</option>` +
                locations.map(l => `<option value="${l}">${l}</option>`).join('');
        }
    }

    applyFilters() {
        this.filteredObjects = this.data.objects.filter(obj => {
            if (this.filters.category !== 'all' && obj.category !== this.filters.category) return false;

            const objLocation = typeof obj.location === 'object' ? obj.location.building : obj.location;
            if (this.filters.location !== 'all' && objLocation !== this.filters.location) return false;

            if (this.filters.condition !== 'all' && obj.condition !== this.filters.condition) return false;

            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase();
                const invNum = (obj.inventory_number || obj.id || '').toLowerCase();
                const title = (obj.title || '').toLowerCase();
                if (!invNum.includes(query) && !title.includes(query)) return false;
            }

            return true;
        });

        this.sortObjects();
        this.currentPage = 1;
    }

    sortObjects() {
        this.filteredObjects.sort((a, b) => {
            let aVal = this.getFieldValue(a, this.sortBy);
            let bVal = this.getFieldValue(b, this.sortBy);

            if (typeof aVal === 'string') aVal = aVal.toLowerCase();
            if (typeof bVal === 'string') bVal = bVal.toLowerCase();

            let result = 0;
            if (aVal < bVal) result = -1;
            if (aVal > bVal) result = 1;

            return this.sortDir === 'asc' ? result : -result;
        });
    }

    getFieldValue(obj, field) {
        switch (field) {
            case 'inventory_number': return obj.inventory_number || obj.id || '';
            case 'creator': return obj.creator || obj.artist || '';
            case 'date': return typeof obj.date === 'object' ? obj.date.text : obj.date || '';
            case 'location': return typeof obj.location === 'object' ? obj.location.room : obj.location || '';
            default: return obj[field] || '';
        }
    }

    renderTable() {
        const thead = document.getElementById('list-head');
        const tbody = document.getElementById('list-body');
        if (!thead || !tbody) return;

        const columnLabels = {
            inventory_number: 'Inv.-Nr.',
            title: 'Titel',
            creator: 'Kuenstler',
            date: 'Datierung',
            category: 'Kategorie',
            location: 'Standort',
            condition: 'Zustand'
        };

        thead.innerHTML = `
            <tr>
                <th class="check-col"></th>
                ${this.visibleColumns.map(col => `
                    <th class="sortable ${this.sortBy === col ? 'sorted' : ''}" data-col="${col}">
                        ${columnLabels[col]}
                        ${this.sortBy === col ? (this.sortDir === 'asc' ? '&#8593;' : '&#8595;') : ''}
                    </th>
                `).join('')}
            </tr>
        `;

        const startIdx = (this.currentPage - 1) * this.pageSize;
        const pageObjects = this.filteredObjects.slice(startIdx, startIdx + this.pageSize);

        tbody.innerHTML = pageObjects.map(obj => {
            const id = obj.inventory_number || obj.id;
            const hasErrors = obj.validation_errors?.length > 0 || !obj.title;

            return `
                <tr class="${hasErrors ? 'has-errors' : ''} ${this.selectedObjects.has(id) ? 'selected' : ''}"
                    data-id="${id}">
                    <td class="check-col">
                        <input type="checkbox" ${this.selectedObjects.has(id) ? 'checked' : ''}>
                    </td>
                    ${this.visibleColumns.map(col => `
                        <td>${this.getFieldValue(obj, col) || '-'}</td>
                    `).join('')}
                </tr>
            `;
        }).join('');
    }

    renderStats() {
        document.getElementById('stat-filtered').textContent = this.filteredObjects.length;
        document.getElementById('stat-total').textContent = this.data.objects.length;

        const errorCount = this.data.objects.filter(o =>
            o.validation_errors?.length > 0 || !o.title
        ).length;
        document.getElementById('stat-errors').textContent = errorCount;
    }

    renderPagination() {
        const container = document.getElementById('pagination');
        if (!container) return;

        const totalPages = Math.ceil(this.filteredObjects.length / this.pageSize);
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let html = '<div class="pagination-controls">';
        html += `<button ${this.currentPage === 1 ? 'disabled' : ''} data-page="${this.currentPage - 1}">&larr;</button>`;

        for (let i = 1; i <= totalPages; i++) {
            html += `<button class="${i === this.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }

        html += `<button ${this.currentPage === totalPages ? 'disabled' : ''} data-page="${this.currentPage + 1}">&rarr;</button>`;
        html += '</div>';

        container.innerHTML = html;
    }

    showQuickView(id) {
        const obj = this.data.objects.find(o => (o.inventory_number || o.id) === id);
        if (!obj) return;

        const quickView = document.getElementById('quick-view');
        const content = document.getElementById('quick-view-content');
        const editLink = document.getElementById('edit-link');

        if (quickView && content) {
            quickView.classList.remove('hidden');
            content.innerHTML = `
                <dl>
                    <dt>Inv.-Nr.</dt>
                    <dd>${obj.inventory_number || obj.id}</dd>
                    <dt>Titel</dt>
                    <dd>${obj.title || '(ohne Titel)'}</dd>
                    <dt>Kuenstler</dt>
                    <dd>${obj.creator || obj.artist || 'Unbekannt'}</dd>
                    <dt>Datierung</dt>
                    <dd>${typeof obj.date === 'object' ? obj.date.text : obj.date || '-'}</dd>
                </dl>
            `;
            editLink.href = `karteikarte.html?id=${id}`;
        }
    }

    updateBulkButtons() {
        const hasSelection = this.selectedObjects.size > 0;
        document.getElementById('bulk-export').disabled = !hasSelection;
        document.getElementById('bulk-move').disabled = !hasSelection;
    }

    bindEvents() {
        document.getElementById('search-input')?.addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.applyFilters();
            this.renderTable();
            this.renderStats();
            this.renderPagination();
        });

        ['filter-category', 'filter-location', 'filter-condition'].forEach(id => {
            document.getElementById(id)?.addEventListener('change', (e) => {
                const filterKey = id.replace('filter-', '');
                this.filters[filterKey] = e.target.value;
                this.applyFilters();
                this.renderTable();
                this.renderStats();
                this.renderPagination();
            });
        });

        document.getElementById('reset-filters')?.addEventListener('click', () => {
            this.filters = { category: 'all', location: 'all', condition: 'all' };
            this.searchQuery = '';
            document.getElementById('search-input').value = '';
            document.getElementById('filter-category').value = 'all';
            document.getElementById('filter-location').value = 'all';
            document.getElementById('filter-condition').value = 'all';
            this.applyFilters();
            this.renderTable();
            this.renderStats();
            this.renderPagination();
        });

        document.getElementById('sort-by')?.addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.sortObjects();
            this.renderTable();
        });

        document.getElementById('sort-dir')?.addEventListener('click', () => {
            this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
            document.getElementById('sort-dir').innerHTML = this.sortDir === 'asc' ? '&#8593;' : '&#8595;';
            this.sortObjects();
            this.renderTable();
        });

        document.getElementById('list-head')?.addEventListener('click', (e) => {
            const th = e.target.closest('.sortable');
            if (th) {
                const col = th.dataset.col;
                if (this.sortBy === col) {
                    this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
                } else {
                    this.sortBy = col;
                    this.sortDir = 'asc';
                }
                this.sortObjects();
                this.renderTable();
            }
        });

        document.getElementById('list-body')?.addEventListener('click', (e) => {
            const row = e.target.closest('tr');
            if (!row) return;

            const id = row.dataset.id;
            const checkbox = e.target.closest('input[type="checkbox"]');

            if (checkbox) {
                if (checkbox.checked) {
                    this.selectedObjects.add(id);
                } else {
                    this.selectedObjects.delete(id);
                }
                row.classList.toggle('selected', checkbox.checked);
                this.updateBulkButtons();
            } else {
                this.showQuickView(id);
            }
        });

        document.getElementById('select-all')?.addEventListener('change', (e) => {
            const startIdx = (this.currentPage - 1) * this.pageSize;
            const pageObjects = this.filteredObjects.slice(startIdx, startIdx + this.pageSize);

            pageObjects.forEach(obj => {
                const id = obj.inventory_number || obj.id;
                if (e.target.checked) {
                    this.selectedObjects.add(id);
                } else {
                    this.selectedObjects.delete(id);
                }
            });

            this.renderTable();
            this.updateBulkButtons();
        });

        document.getElementById('pagination')?.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-page]');
            if (btn && !btn.disabled) {
                this.currentPage = parseInt(btn.dataset.page);
                this.renderTable();
                this.renderPagination();
            }
        });
    }

    bindKeyboard() {
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '4') {
                e.preventDefault();
                const modes = ['liste', 'karteikarte', 'standort', 'zustand'];
                window.location.href = `${modes[parseInt(e.key) - 1]}.html`;
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new RegistryListe().init();
});

export default RegistryListe;
