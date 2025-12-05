/**
 * Schema Diff Mode
 * Vergleich von Schema-Versionen
 */

class SchemaDiff {
    constructor() {
        this.schemaA = null;
        this.schemaB = null;
        this.differences = [];
        this.options = {
            structural: true,
            semantic: true,
            breaking: true
        };
    }

    async init() {
        this.loadDemoSchemas();
        this.bindEvents();
        this.bindKeyboard();
    }

    loadDemoSchemas() {
        const schemaA = {
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "title": "Person v1",
            "type": "object",
            "properties": {
                "name": { "type": "string" },
                "email": { "type": "string" },
                "age": { "type": "number" }
            },
            "required": ["name", "email"]
        };

        const schemaB = {
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "title": "Person v2",
            "type": "object",
            "properties": {
                "name": { "type": "string", "minLength": 1 },
                "email": { "type": "string", "format": "email" },
                "age": { "type": "integer", "minimum": 0 },
                "phone": { "type": "string" }
            },
            "required": ["name", "email", "age"]
        };

        document.getElementById('schema-a').value = JSON.stringify(schemaA, null, 2);
        document.getElementById('schema-b').value = JSON.stringify(schemaB, null, 2);
    }

    compare() {
        // Parse schemas
        try {
            this.schemaA = JSON.parse(document.getElementById('schema-a').value);
        } catch (err) {
            alert('Schema A: Ungültiges JSON - ' + err.message);
            return;
        }

        try {
            this.schemaB = JSON.parse(document.getElementById('schema-b').value);
        } catch (err) {
            alert('Schema B: Ungültiges JSON - ' + err.message);
            return;
        }

        // Compare
        this.differences = [];
        this.compareNodes(this.schemaA, this.schemaB, '');

        // Render results
        this.renderResults();
        this.updateStats();
    }

    compareNodes(nodeA, nodeB, path) {
        // Both null or undefined
        if (nodeA === nodeB) return;

        // One is missing
        if (nodeA === undefined || nodeA === null) {
            this.differences.push({
                type: 'added',
                path: path || '/',
                before: null,
                after: nodeB,
                breaking: false
            });
            return;
        }

        if (nodeB === undefined || nodeB === null) {
            this.differences.push({
                type: 'removed',
                path: path || '/',
                before: nodeA,
                after: null,
                breaking: true
            });
            return;
        }

        // Different types
        if (typeof nodeA !== typeof nodeB) {
            this.differences.push({
                type: 'changed',
                path: path || '/',
                before: nodeA,
                after: nodeB,
                breaking: true
            });
            return;
        }

        // Compare objects
        if (typeof nodeA === 'object' && !Array.isArray(nodeA)) {
            const allKeys = new Set([...Object.keys(nodeA), ...Object.keys(nodeB)]);

            for (const key of allKeys) {
                const childPath = path ? `${path}.${key}` : key;

                if (!(key in nodeA)) {
                    // Added in B
                    const isBreaking = key === 'required' ||
                        (nodeB.required && nodeB.required.includes(key));

                    this.differences.push({
                        type: 'added',
                        path: childPath,
                        before: null,
                        after: nodeB[key],
                        breaking: isBreaking
                    });
                } else if (!(key in nodeB)) {
                    // Removed in B
                    this.differences.push({
                        type: 'removed',
                        path: childPath,
                        before: nodeA[key],
                        after: null,
                        breaking: true
                    });
                } else {
                    // Compare recursively
                    this.compareNodes(nodeA[key], nodeB[key], childPath);
                }
            }
        }

        // Compare arrays
        else if (Array.isArray(nodeA)) {
            if (JSON.stringify(nodeA) !== JSON.stringify(nodeB)) {
                this.differences.push({
                    type: 'changed',
                    path: path || '/',
                    before: nodeA,
                    after: nodeB,
                    breaking: path?.includes('required')
                });
            }
        }

        // Compare primitives
        else if (nodeA !== nodeB) {
            const isBreaking = path?.includes('type') ||
                (path?.includes('minimum') && nodeB > nodeA) ||
                (path?.includes('maximum') && nodeB < nodeA);

            this.differences.push({
                type: 'changed',
                path: path || '/',
                before: nodeA,
                after: nodeB,
                breaking: isBreaking
            });
        }
    }

    renderResults() {
        const container = document.getElementById('results-body');
        if (!container) return;

        if (this.differences.length === 0) {
            container.innerHTML = `
                <div class="no-diff">
                    <p>Keine Unterschiede gefunden. Die Schemas sind identisch.</p>
                </div>
            `;
            return;
        }

        const filteredDiffs = this.differences.filter(d => {
            if (!this.options.structural && d.type !== 'changed') return false;
            if (!this.options.semantic && d.type === 'changed') return false;
            return true;
        });

        container.innerHTML = `
            <div class="diff-list">
                ${filteredDiffs.map((diff, i) => `
                    <div class="diff-item ${diff.type} ${diff.breaking ? 'breaking' : ''}" data-index="${i}">
                        <span class="diff-icon">${this.getDiffIcon(diff.type)}</span>
                        <div class="diff-content">
                            <span class="diff-path">${diff.path}</span>
                            <span class="diff-summary">${this.getDiffSummary(diff)}</span>
                        </div>
                        ${diff.breaking ? '<span class="breaking-badge">Breaking</span>' : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    getDiffIcon(type) {
        const icons = {
            added: '+',
            removed: '−',
            changed: '~'
        };
        return icons[type] || '?';
    }

    getDiffSummary(diff) {
        if (diff.type === 'added') {
            return `Hinzugefügt: ${this.formatValue(diff.after)}`;
        }
        if (diff.type === 'removed') {
            return `Entfernt: ${this.formatValue(diff.before)}`;
        }
        return `${this.formatValue(diff.before)} → ${this.formatValue(diff.after)}`;
    }

    formatValue(value) {
        if (value === null || value === undefined) return 'null';
        if (typeof value === 'object') {
            return JSON.stringify(value).substring(0, 50);
        }
        return String(value);
    }

    showChangeDetail(index) {
        const diff = this.differences[index];
        if (!diff) return;

        const detail = document.getElementById('change-detail');
        if (!detail) return;

        detail.classList.remove('hidden');

        const typeEl = document.getElementById('detail-type');
        typeEl.textContent = diff.type === 'added' ? 'Hinzugefügt' :
                            diff.type === 'removed' ? 'Entfernt' : 'Geändert';
        typeEl.className = `change-type ${diff.type}`;

        document.getElementById('detail-path').textContent = diff.path;
        document.getElementById('detail-before').textContent =
            diff.before !== null ? JSON.stringify(diff.before, null, 2) : '–';
        document.getElementById('detail-after').textContent =
            diff.after !== null ? JSON.stringify(diff.after, null, 2) : '–';
        document.getElementById('detail-impact').textContent =
            diff.breaking ? 'Breaking Change - kann existierende Daten invalidieren' : 'Nicht-breaking';
    }

    swapSchemas() {
        const tempA = document.getElementById('schema-a').value;
        document.getElementById('schema-a').value = document.getElementById('schema-b').value;
        document.getElementById('schema-b').value = tempA;
    }

    updateStats() {
        const added = this.differences.filter(d => d.type === 'added').length;
        const removed = this.differences.filter(d => d.type === 'removed').length;
        const changed = this.differences.filter(d => d.type === 'changed').length;
        const breaking = this.differences.filter(d => d.breaking).length;

        document.getElementById('stat-added').textContent = added;
        document.getElementById('stat-removed').textContent = removed;
        document.getElementById('stat-changed').textContent = changed;
        document.getElementById('stat-breaking').textContent = breaking;
    }

    bindEvents() {
        // Compare
        document.getElementById('compare-btn')?.addEventListener('click', () => this.compare());

        // Swap
        document.getElementById('swap-btn')?.addEventListener('click', () => this.swapSchemas());

        // Options
        document.getElementById('opt-structural')?.addEventListener('change', (e) => {
            this.options.structural = e.target.checked;
            this.renderResults();
        });

        document.getElementById('opt-semantic')?.addEventListener('change', (e) => {
            this.options.semantic = e.target.checked;
            this.renderResults();
        });

        document.getElementById('opt-breaking')?.addEventListener('change', (e) => {
            this.options.breaking = e.target.checked;
        });

        // Diff item click
        document.getElementById('results-body')?.addEventListener('click', (e) => {
            const item = e.target.closest('.diff-item');
            if (item) {
                document.querySelectorAll('.diff-item').forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
                this.showChangeDetail(parseInt(item.dataset.index));
            }
        });

        // File uploads
        document.getElementById('schema-a-file')?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    document.getElementById('schema-a').value = event.target.result;
                };
                reader.readAsText(file);
            }
        });

        document.getElementById('schema-b-file')?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    document.getElementById('schema-b').value = event.target.result;
                };
                reader.readAsText(file);
            }
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

            // Compare
            if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
                e.preventDefault();
                this.compare();
            }
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const app = new SchemaDiff();
    app.init();
});

export default SchemaDiff;
