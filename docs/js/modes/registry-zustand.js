/**
 * Registry Zustands-Modus
 * Erhaltungsstatus und Konservierung
 *
 * Benoetigte Daten: objects[] mit condition
 * Wissensbasis: 15-MODI#Registry-Zustand
 */

class RegistryZustand {
    constructor() {
        this.data = null;
        this.conditionFilter = 'all';
        this.sortBy = 'priority';
        this.selectedObject = null;
    }

    async init() {
        try {
            const response = await fetch('../data/workbench-metadata.json');
            this.data = await response.json();
            this.render();
            this.bindEvents();
            this.bindKeyboard();
        } catch (error) {
            console.error('Fehler beim Laden:', error);
        }
    }

    render() {
        this.renderConditionChart();
        this.renderPriorityList();
        this.renderConditionGrid();
    }

    getConditionLabel(condition) {
        const labels = {
            'excellent': 'Ausgezeichnet',
            'good': 'Gut',
            'fair': 'Befriedigend',
            'poor': 'Schlecht',
            'unknown': 'Unbekannt'
        };
        return labels[condition] || 'Unbekannt';
    }

    getConditionPriority(condition) {
        const priorities = {
            'poor': 1,
            'fair': 2,
            'unknown': 3,
            'good': 4,
            'excellent': 5
        };
        return priorities[condition] || 3;
    }

    normalizeCondition(obj) {
        if (typeof obj.condition === 'string') return obj.condition;
        if (typeof obj.condition === 'number') {
            const map = { 1: 'poor', 2: 'fair', 3: 'fair', 4: 'good', 5: 'excellent' };
            return map[obj.condition] || 'unknown';
        }
        return 'unknown';
    }

    renderConditionChart() {
        const container = document.getElementById('condition-chart');
        if (!container) return;

        const counts = { excellent: 0, good: 0, fair: 0, poor: 0, unknown: 0 };

        this.data.objects.forEach(obj => {
            const cond = this.normalizeCondition(obj);
            counts[cond] = (counts[cond] || 0) + 1;
        });

        const total = this.data.objects.length;
        const maxCount = Math.max(...Object.values(counts));

        container.innerHTML = `
            <div class="chart-bars">
                ${Object.entries(counts).map(([cond, count]) => {
                    const pct = (count / maxCount) * 100;
                    return `
                        <div class="chart-bar-row">
                            <span class="bar-label">${this.getConditionLabel(cond)}</span>
                            <div class="bar-track">
                                <div class="bar-fill ${cond}" style="width: ${pct}%"></div>
                            </div>
                            <span class="bar-count">${count}</span>
                        </div>
                    `;
                }).join('')}
            </div>
            <div class="chart-total">Gesamt: ${total}</div>
        `;
    }

    renderPriorityList() {
        const container = document.getElementById('priority-list');
        if (!container) return;

        const priorityObjects = this.data.objects
            .filter(obj => {
                const cond = this.normalizeCondition(obj);
                return cond === 'poor' || cond === 'fair';
            })
            .sort((a, b) => {
                return this.getConditionPriority(this.normalizeCondition(a)) -
                       this.getConditionPriority(this.normalizeCondition(b));
            })
            .slice(0, 5);

        if (priorityObjects.length === 0) {
            container.innerHTML = '<li class="no-priority">Keine dringenden Faelle</li>';
            return;
        }

        container.innerHTML = priorityObjects.map(obj => {
            const id = obj.inventory_number || obj.id;
            const cond = this.normalizeCondition(obj);

            return `
                <li class="priority-item ${cond}" data-id="${id}">
                    <span class="priority-dot ${cond}"></span>
                    <span class="priority-id">${id}</span>
                    <span class="priority-title">${(obj.title || '').substring(0, 20)}</span>
                </li>
            `;
        }).join('');
    }

    renderConditionGrid() {
        const container = document.getElementById('condition-grid');
        if (!container) return;

        let objects = [...this.data.objects];

        if (this.conditionFilter !== 'all') {
            objects = objects.filter(obj =>
                this.normalizeCondition(obj) === this.conditionFilter
            );
        }

        switch (this.sortBy) {
            case 'priority':
                objects.sort((a, b) =>
                    this.getConditionPriority(this.normalizeCondition(a)) -
                    this.getConditionPriority(this.normalizeCondition(b))
                );
                break;
            case 'alpha':
                objects.sort((a, b) =>
                    (a.title || '').localeCompare(b.title || '')
                );
                break;
        }

        container.innerHTML = objects.map(obj => {
            const id = obj.inventory_number || obj.id;
            const cond = this.normalizeCondition(obj);

            return `
                <div class="condition-card ${this.selectedObject === id ? 'selected' : ''}"
                     data-id="${id}">
                    <div class="card-status">
                        <span class="status-dot ${cond}"></span>
                        <span class="status-label">${this.getConditionLabel(cond)}</span>
                    </div>
                    <div class="card-content">
                        <h4>${obj.title || '(Ohne Titel)'}</h4>
                        <p class="card-id">${id}</p>
                        ${obj.notes ? `<p class="card-notes">${obj.notes}</p>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    selectObject(id) {
        this.selectedObject = id;

        document.querySelectorAll('.condition-card').forEach(el => {
            el.classList.toggle('selected', el.dataset.id === id);
        });

        const obj = this.data.objects.find(o => (o.inventory_number || o.id) === id);
        if (!obj) return;

        const panel = document.getElementById('condition-detail');
        const content = document.getElementById('detail-content');

        if (panel && content) {
            panel.classList.remove('hidden');
            const cond = this.normalizeCondition(obj);

            content.innerHTML = `
                <dl>
                    <dt>Inventarnummer</dt>
                    <dd>${id}</dd>
                    <dt>Titel</dt>
                    <dd>${obj.title || '(Ohne Titel)'}</dd>
                    <dt>Aktueller Zustand</dt>
                    <dd>
                        <span class="status-dot ${cond}"></span>
                        ${this.getConditionLabel(cond)}
                    </dd>
                    <dt>Anmerkungen</dt>
                    <dd>${obj.notes || 'Keine'}</dd>
                </dl>
            `;
        }
    }

    bindEvents() {
        document.querySelectorAll('.condition-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.condition-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.conditionFilter = btn.dataset.condition;
                this.renderConditionGrid();
            });
        });

        document.getElementById('sort-condition')?.addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.renderConditionGrid();
        });

        document.getElementById('condition-grid')?.addEventListener('click', (e) => {
            const card = e.target.closest('.condition-card');
            if (card) {
                this.selectObject(card.dataset.id);
            }
        });

        document.getElementById('priority-list')?.addEventListener('click', (e) => {
            const item = e.target.closest('.priority-item');
            if (item) {
                this.selectObject(item.dataset.id);
            }
        });

        document.getElementById('add-assessment')?.addEventListener('click', () => {
            if (this.selectedObject) {
                alert(`Neue Zustandsbewertung fuer ${this.selectedObject} (Demo)`);
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

            const conditionKeys = { '1': 'excellent', '2': 'good', '3': 'fair', '4': 'poor', '5': 'unknown' };
            if (conditionKeys[e.key] && !e.metaKey && !e.ctrlKey) {
                this.conditionFilter = conditionKeys[e.key];
                document.querySelectorAll('.condition-btn').forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.condition === this.conditionFilter);
                });
                this.renderConditionGrid();
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new RegistryZustand().init();
});

export default RegistryZustand;
