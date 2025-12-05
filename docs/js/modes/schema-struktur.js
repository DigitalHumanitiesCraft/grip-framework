/**
 * Schema Struktur Mode
 * JSON Schema Baumansicht
 */

class SchemaStruktur {
    constructor() {
        this.schema = null;
        this.expandedNodes = new Set();
        this.selectedProperty = null;
    }

    async init() {
        this.loadDemoSchema();
        this.bindEvents();
        this.bindKeyboard();
    }

    loadDemoSchema() {
        this.schema = {
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "title": "Person",
            "description": "Ein Schema für Personendaten",
            "type": "object",
            "properties": {
                "id": {
                    "type": "integer",
                    "description": "Eindeutige ID"
                },
                "name": {
                    "type": "object",
                    "properties": {
                        "firstName": {
                            "type": "string",
                            "description": "Vorname"
                        },
                        "lastName": {
                            "type": "string",
                            "description": "Nachname"
                        }
                    },
                    "required": ["firstName", "lastName"]
                },
                "email": {
                    "type": "string",
                    "format": "email",
                    "description": "E-Mail-Adresse"
                },
                "age": {
                    "type": "integer",
                    "minimum": 0,
                    "maximum": 150,
                    "description": "Alter in Jahren"
                },
                "tags": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    },
                    "description": "Liste von Tags"
                },
                "active": {
                    "type": "boolean",
                    "default": true,
                    "description": "Aktiver Status"
                }
            },
            "required": ["id", "name", "email"]
        };

        this.render();
        this.updateStats();
        this.updateSchemaInfo();
    }

    render() {
        const container = document.getElementById('schema-tree');
        if (!container) return;

        if (!this.schema) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Laden Sie ein JSON Schema um die Struktur anzuzeigen.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.renderNode(this.schema, 'root', '', 0);
    }

    renderNode(node, name, path, level) {
        const fullPath = path ? `${path}.${name}` : name;
        const isExpanded = this.expandedNodes.has(fullPath);
        const isSelected = this.selectedProperty === fullPath;
        const hasChildren = node.properties || node.items;
        const isRequired = this.isRequired(path, name);

        let typeDisplay = node.type || 'any';
        if (node.type === 'array' && node.items?.type) {
            typeDisplay = `array<${node.items.type}>`;
        }

        let childrenHtml = '';
        if (hasChildren && isExpanded) {
            if (node.properties) {
                childrenHtml = Object.entries(node.properties)
                    .map(([key, value]) => this.renderNode(value, key, fullPath, level + 1))
                    .join('');
            } else if (node.items && typeof node.items === 'object') {
                childrenHtml = this.renderNode(node.items, '[items]', fullPath, level + 1);
            }
        }

        return `
            <div class="tree-node" data-path="${fullPath}" data-level="${level}">
                <div class="node-row ${isSelected ? 'selected' : ''}" style="padding-left: ${level * 16 + 8}px">
                    ${hasChildren ? `
                        <button class="expand-btn ${isExpanded ? 'expanded' : ''}" data-path="${fullPath}">
                            ${isExpanded ? '▼' : '▶'}
                        </button>
                    ` : '<span class="expand-placeholder"></span>'}
                    <span class="node-name ${isRequired ? 'required' : ''}" data-path="${fullPath}">
                        ${name}
                    </span>
                    <span class="node-type type-${node.type || 'any'}">${typeDisplay}</span>
                    ${node.description ? `<span class="node-desc">${this.truncate(node.description, 30)}</span>` : ''}
                </div>
                ${childrenHtml ? `<div class="node-children">${childrenHtml}</div>` : ''}
            </div>
        `;
    }

    isRequired(parentPath, name) {
        if (!parentPath) return false;
        // Navigate to parent and check required array
        const parts = parentPath.split('.').filter(p => p && p !== 'root');
        let current = this.schema;

        for (const part of parts) {
            if (part === '[items]') {
                current = current.items;
            } else if (current.properties) {
                current = current.properties[part];
            }
            if (!current) return false;
        }

        return current.required?.includes(name) || false;
    }

    truncate(str, maxLength) {
        if (str.length <= maxLength) return str;
        return str.substring(0, maxLength - 1) + '…';
    }

    toggleNode(path) {
        if (this.expandedNodes.has(path)) {
            this.expandedNodes.delete(path);
        } else {
            this.expandedNodes.add(path);
        }
        this.render();
    }

    selectProperty(path) {
        this.selectedProperty = path;
        this.render();
        this.showPropertyDetail(path);
    }

    showPropertyDetail(path) {
        const parts = path.split('.').filter(p => p && p !== 'root');
        let current = this.schema;
        let parentPath = '';

        for (const part of parts) {
            parentPath = parentPath ? `${parentPath}.${part}` : part;
            if (part === '[items]') {
                current = current.items;
            } else if (current.properties) {
                current = current.properties[part];
            }
            if (!current) return;
        }

        const detail = document.getElementById('property-detail');
        if (!detail) return;

        detail.classList.remove('hidden');

        const name = parts[parts.length - 1] || 'root';
        document.getElementById('detail-name').textContent = name;
        document.getElementById('detail-type').textContent = current.type || 'any';
        document.getElementById('detail-description').textContent = current.description || '–';
        document.getElementById('detail-required').textContent =
            this.isRequired(parts.slice(0, -1).join('.'), name) ? 'Ja' : 'Nein';
        document.getElementById('detail-default').textContent =
            current.default !== undefined ? JSON.stringify(current.default) : '–';
    }

    expandAll() {
        const collectPaths = (node, path) => {
            const paths = [path];
            if (node.properties) {
                Object.entries(node.properties).forEach(([key, value]) => {
                    paths.push(...collectPaths(value, `${path}.${key}`));
                });
            }
            if (node.items) {
                paths.push(...collectPaths(node.items, `${path}.[items]`));
            }
            return paths;
        };

        collectPaths(this.schema, 'root').forEach(p => this.expandedNodes.add(p));
        this.render();
    }

    collapseAll() {
        this.expandedNodes.clear();
        this.render();
    }

    filterTree(query) {
        if (!query) {
            this.render();
            return;
        }

        // Expand nodes that match
        const lowerQuery = query.toLowerCase();
        const findMatches = (node, path) => {
            const matches = [];
            if (node.properties) {
                Object.entries(node.properties).forEach(([key, value]) => {
                    if (key.toLowerCase().includes(lowerQuery) ||
                        value.description?.toLowerCase().includes(lowerQuery)) {
                        matches.push(`${path}.${key}`);
                        // Expand ancestors
                        let ancestorPath = path;
                        while (ancestorPath) {
                            this.expandedNodes.add(ancestorPath);
                            const lastDot = ancestorPath.lastIndexOf('.');
                            ancestorPath = lastDot > 0 ? ancestorPath.substring(0, lastDot) : '';
                        }
                    }
                    matches.push(...findMatches(value, `${path}.${key}`));
                });
            }
            return matches;
        };

        findMatches(this.schema, 'root');
        this.render();
    }

    updateStats() {
        let propertyCount = 0;
        let requiredCount = 0;
        let maxDepth = 0;

        const traverse = (node, depth) => {
            maxDepth = Math.max(maxDepth, depth);
            if (node.properties) {
                propertyCount += Object.keys(node.properties).length;
                requiredCount += (node.required?.length || 0);
                Object.values(node.properties).forEach(p => traverse(p, depth + 1));
            }
            if (node.items) {
                traverse(node.items, depth + 1);
            }
        };

        traverse(this.schema, 0);

        document.getElementById('stat-properties').textContent = propertyCount;
        document.getElementById('stat-required').textContent = requiredCount;
        document.getElementById('stat-depth').textContent = maxDepth;
    }

    updateSchemaInfo() {
        document.getElementById('info-title').textContent = this.schema.title || '–';
        document.getElementById('info-version').textContent = this.schema.version || '–';
        document.getElementById('info-draft').textContent =
            this.schema.$schema?.match(/draft[-/](\d+|[\w-]+)/)?.[0] || '–';
    }

    bindEvents() {
        const container = document.getElementById('schema-tree');

        // Expand/collapse
        container?.addEventListener('click', (e) => {
            const expandBtn = e.target.closest('.expand-btn');
            if (expandBtn) {
                this.toggleNode(expandBtn.dataset.path);
                return;
            }

            const nodeName = e.target.closest('.node-name');
            if (nodeName) {
                this.selectProperty(nodeName.dataset.path);
            }
        });

        // Expand/collapse all
        document.getElementById('expand-all')?.addEventListener('click', () => this.expandAll());
        document.getElementById('collapse-all')?.addEventListener('click', () => this.collapseAll());

        // Search
        document.getElementById('tree-search')?.addEventListener('input', (e) => {
            this.filterTree(e.target.value);
        });

        // File upload
        document.getElementById('schema-file')?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        this.schema = JSON.parse(event.target.result);
                        this.expandedNodes.clear();
                        this.render();
                        this.updateStats();
                        this.updateSchemaInfo();
                    } catch (err) {
                        alert('Ungültiges JSON: ' + err.message);
                    }
                };
                reader.readAsText(file);
            }
        });

        // URL load
        document.getElementById('load-schema')?.addEventListener('click', async () => {
            const url = document.getElementById('schema-url').value;
            if (url) {
                try {
                    const response = await fetch(url);
                    this.schema = await response.json();
                    this.expandedNodes.clear();
                    this.render();
                    this.updateStats();
                    this.updateSchemaInfo();
                } catch (err) {
                    alert('Fehler beim Laden: ' + err.message);
                }
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

            // Expand all
            if (e.key === 'e' || e.key === 'E') {
                if (!e.target.matches('input, textarea')) {
                    this.expandAll();
                }
            }

            // Collapse all
            if (e.key === 'w' || e.key === 'W') {
                if (!e.target.matches('input, textarea')) {
                    this.collapseAll();
                }
            }

            // Focus search
            if (e.key === '/') {
                if (!e.target.matches('input, textarea')) {
                    e.preventDefault();
                    document.getElementById('tree-search')?.focus();
                }
            }
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const app = new SchemaStruktur();
    app.init();
});

export default SchemaStruktur;
