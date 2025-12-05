/**
 * Registry Karteikarten-Modus
 * Einzelobjekt-Formular mit Validierung
 *
 * Benoetigte Daten: objects[], schema
 * Wissensbasis: 15-MODI#Registry-Karteikarte
 */

class RegistryKarteikarte {
    constructor() {
        this.data = null;
        this.currentIndex = 0;
        this.currentObject = null;
        this.originalObject = null;
        this.hasChanges = false;
        this.changeHistory = [];
    }

    async init() {
        try {
            const response = await fetch('../data/workbench-metadata.json');
            this.data = await response.json();

            const urlParams = new URLSearchParams(window.location.search);
            const requestedId = urlParams.get('id');
            if (requestedId) {
                const idx = this.data.objects.findIndex(o =>
                    (o.inventory_number || o.id) === requestedId
                );
                if (idx >= 0) this.currentIndex = idx;
            }

            this.loadObject(this.currentIndex);
            this.renderThumbnails();
            this.bindEvents();
            this.bindKeyboard();
        } catch (error) {
            console.error('Fehler beim Laden:', error);
        }
    }

    loadObject(index) {
        if (index < 0 || index >= this.data.objects.length) return;

        this.currentIndex = index;
        this.currentObject = { ...this.data.objects[index] };
        this.originalObject = { ...this.data.objects[index] };
        this.hasChanges = false;

        this.renderForm();
        this.renderValidation();
        this.updateNavigation();
    }

    renderForm() {
        const obj = this.currentObject;

        document.getElementById('object-title').textContent =
            obj.title || '(Ohne Titel)';

        document.getElementById('field-inventory').value =
            obj.inventory_number || obj.id || '';
        document.getElementById('field-title').value = obj.title || '';
        document.getElementById('field-creator').value =
            obj.creator || obj.artist || '';

        const dateValue = typeof obj.date === 'object' ? obj.date.text : obj.date;
        document.getElementById('field-date').value = dateValue || '';

        document.getElementById('field-medium').value = obj.medium || '';

        if (obj.dimensions) {
            if (typeof obj.dimensions === 'object') {
                document.getElementById('field-height').value = obj.dimensions.height_cm || '';
                document.getElementById('field-width').value = obj.dimensions.width_cm || '';
            } else {
                document.getElementById('field-height').value = '';
                document.getElementById('field-width').value = '';
            }
        }

        document.getElementById('field-category').value = obj.category || '';

        const locationValue = typeof obj.location === 'object'
            ? `${obj.location.building} / ${obj.location.room}`
            : obj.location || '';
        document.getElementById('field-location').value = locationValue;

        document.getElementById('field-condition').value =
            typeof obj.condition === 'string' ? obj.condition : '';

        document.getElementById('field-notes').value = obj.notes || '';
    }

    renderValidation() {
        const errors = this.validateObject();
        const statusDiv = document.getElementById('validation-status');
        const errorList = document.getElementById('validation-errors');

        if (errors.length === 0) {
            statusDiv.className = 'status-ok';
            statusDiv.innerHTML = '<span class="status-icon">&#10003;</span><span class="status-text">Keine Fehler</span>';
            errorList.innerHTML = '';
        } else {
            statusDiv.className = 'status-error';
            statusDiv.innerHTML = `<span class="status-icon">&#10007;</span><span class="status-text">${errors.length} Fehler</span>`;
            errorList.innerHTML = errors.map(e => `<li>${e}</li>`).join('');
        }
    }

    validateObject() {
        const errors = [];
        const obj = this.currentObject;

        if (!obj.inventory_number && !obj.id) {
            errors.push('Inventarnummer fehlt');
        }
        if (!obj.title) {
            errors.push('Titel fehlt');
        }
        if (!obj.creator && !obj.artist) {
            errors.push('Kuenstler/Urheber fehlt');
        }

        const validConditions = ['excellent', 'good', 'fair', 'poor', 'unknown'];
        if (obj.condition && typeof obj.condition !== 'string') {
            errors.push('Zustand muss Text sein, nicht Zahl');
        } else if (obj.condition && !validConditions.includes(obj.condition)) {
            errors.push('Ungueltiger Zustandswert');
        }

        const validCategories = ['Malerei', 'Skulptur', 'Grafik', 'Fotografie', 'Installation'];
        if (obj.category && !validCategories.includes(obj.category)) {
            errors.push('Kategorie muss Grossbuchstaben beginnen');
        }

        return errors;
    }

    renderThumbnails() {
        const container = document.getElementById('object-thumbs');
        if (!container) return;

        container.innerHTML = this.data.objects.map((obj, idx) => {
            const id = obj.inventory_number || obj.id;
            const hasErrors = this.data.objects[idx].validation_errors?.length > 0 || !obj.title;

            return `
                <li class="${idx === this.currentIndex ? 'active' : ''} ${hasErrors ? 'has-errors' : ''}"
                    data-index="${idx}">
                    <span class="thumb-id">${id}</span>
                </li>
            `;
        }).join('');
    }

    updateNavigation() {
        const position = document.getElementById('object-position');
        if (position) {
            position.textContent = `${this.currentIndex + 1} / ${this.data.objects.length}`;
        }

        document.getElementById('prev-object').disabled = this.currentIndex === 0;
        document.getElementById('next-object').disabled = this.currentIndex === this.data.objects.length - 1;

        document.querySelectorAll('#object-thumbs li').forEach((li, idx) => {
            li.classList.toggle('active', idx === this.currentIndex);
        });
    }

    collectFormData() {
        return {
            inventory_number: document.getElementById('field-inventory').value,
            title: document.getElementById('field-title').value,
            creator: document.getElementById('field-creator').value,
            date: document.getElementById('field-date').value,
            medium: document.getElementById('field-medium').value,
            dimensions: {
                height_cm: parseFloat(document.getElementById('field-height').value) || null,
                width_cm: parseFloat(document.getElementById('field-width').value) || null
            },
            category: document.getElementById('field-category').value,
            condition: document.getElementById('field-condition').value,
            notes: document.getElementById('field-notes').value
        };
    }

    saveChanges() {
        const formData = this.collectFormData();
        Object.assign(this.currentObject, formData);

        this.changeHistory.push({
            timestamp: new Date().toISOString(),
            field: 'multiple',
            description: 'Aenderungen gespeichert'
        });

        this.data.objects[this.currentIndex] = { ...this.currentObject };
        this.originalObject = { ...this.currentObject };
        this.hasChanges = false;

        this.renderValidation();
        this.renderThumbnails();
        this.renderHistory();

        console.log('Gespeichert:', this.currentObject);
    }

    discardChanges() {
        this.currentObject = { ...this.originalObject };
        this.hasChanges = false;
        this.renderForm();
        this.renderValidation();
    }

    renderHistory() {
        const list = document.getElementById('change-history');
        if (!list) return;

        if (this.changeHistory.length === 0) {
            list.innerHTML = '<li class="history-placeholder">Keine Aenderungen</li>';
        } else {
            list.innerHTML = this.changeHistory.slice(-5).reverse().map(h => `
                <li>
                    <span class="history-time">${new Date(h.timestamp).toLocaleTimeString()}</span>
                    <span class="history-desc">${h.description}</span>
                </li>
            `).join('');
        }
    }

    bindEvents() {
        document.getElementById('prev-object')?.addEventListener('click', () => {
            if (this.hasChanges && !confirm('Ungespeicherte Aenderungen verwerfen?')) return;
            this.loadObject(this.currentIndex - 1);
        });

        document.getElementById('next-object')?.addEventListener('click', () => {
            if (this.hasChanges && !confirm('Ungespeicherte Aenderungen verwerfen?')) return;
            this.loadObject(this.currentIndex + 1);
        });

        document.getElementById('object-thumbs')?.addEventListener('click', (e) => {
            const li = e.target.closest('li[data-index]');
            if (li) {
                if (this.hasChanges && !confirm('Ungespeicherte Aenderungen verwerfen?')) return;
                this.loadObject(parseInt(li.dataset.index));
            }
        });

        document.getElementById('object-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveChanges();
        });

        document.getElementById('discard-changes')?.addEventListener('click', () => {
            this.discardChanges();
        });

        document.getElementById('object-form')?.addEventListener('input', () => {
            this.hasChanges = true;
            this.currentObject = { ...this.currentObject, ...this.collectFormData() };
            this.renderValidation();
        });
    }

    bindKeyboard() {
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '4') {
                e.preventDefault();
                const modes = ['liste', 'karteikarte', 'standort', 'zustand'];
                window.location.href = `${modes[parseInt(e.key) - 1]}.html`;
            }

            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault();
                this.saveChanges();
            }

            if ((e.metaKey || e.ctrlKey) && e.key === 'ArrowLeft') {
                e.preventDefault();
                if (this.currentIndex > 0) {
                    if (this.hasChanges && !confirm('Ungespeicherte Aenderungen verwerfen?')) return;
                    this.loadObject(this.currentIndex - 1);
                }
            }

            if ((e.metaKey || e.ctrlKey) && e.key === 'ArrowRight') {
                e.preventDefault();
                if (this.currentIndex < this.data.objects.length - 1) {
                    if (this.hasChanges && !confirm('Ungespeicherte Aenderungen verwerfen?')) return;
                    this.loadObject(this.currentIndex + 1);
                }
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new RegistryKarteikarte().init();
});

export default RegistryKarteikarte;
