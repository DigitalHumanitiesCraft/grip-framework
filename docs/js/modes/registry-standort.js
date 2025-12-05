/**
 * Registry Standort-Modus
 * Physische Verortung und Logistik
 *
 * Benoetigte Daten: objects[], locations[]
 * Wissensbasis: 15-MODI#Registry-Standort
 */

class RegistryStandort {
    constructor() {
        this.data = null;
        this.selectedLocation = null;
        this.selectedObject = null;
        this.viewMode = 'tree';
        this.moveSource = null;
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
        this.renderLocationTree();
        this.renderStats();
        this.renderLocationContent();
    }

    renderLocationTree() {
        const container = document.getElementById('location-tree');
        if (!container) return;

        const locations = this.data.locations || [];

        container.innerHTML = locations.map(loc => {
            const buildingCount = this.getObjectsAtBuilding(loc.building).length;

            return `
                <li class="tree-building ${this.selectedLocation === loc.building ? 'selected' : ''}">
                    <span class="tree-toggle" data-building="${loc.building}">
                        <span class="toggle-icon">&#9656;</span>
                        ${loc.building} <span class="count">(${buildingCount})</span>
                    </span>
                    <ul class="tree-rooms hidden">
                        ${(loc.rooms || []).map(room => {
                            const roomCount = this.getObjectsAtRoom(loc.building, room).length;
                            return `
                                <li class="tree-room ${this.selectedLocation === room ? 'selected' : ''}"
                                    data-building="${loc.building}" data-room="${room}">
                                    ${room} <span class="count">(${roomCount})</span>
                                </li>
                            `;
                        }).join('')}
                    </ul>
                </li>
            `;
        }).join('');
    }

    renderStats() {
        const objects = this.data.objects || [];

        let exhibition = 0;
        let depot = 0;
        let unassigned = 0;

        objects.forEach(obj => {
            const loc = typeof obj.location === 'object' ? obj.location.building : obj.location;
            if (!loc) {
                unassigned++;
            } else if (loc.includes('Depot')) {
                depot++;
            } else {
                exhibition++;
            }
        });

        document.getElementById('stat-exhibition').textContent = exhibition;
        document.getElementById('stat-depot').textContent = depot;
        document.getElementById('stat-unassigned').textContent = unassigned;
    }

    renderLocationContent() {
        const container = document.getElementById('location-content');
        const header = document.getElementById('current-location');
        if (!container) return;

        let objects = this.data.objects || [];
        let locationName = 'Alle Standorte';

        if (this.selectedLocation) {
            locationName = this.selectedLocation;
            objects = objects.filter(obj => {
                const loc = typeof obj.location === 'object' ? obj.location : { room: obj.location };
                return loc.room === this.selectedLocation ||
                       loc.building === this.selectedLocation;
            });
        }

        if (header) header.textContent = locationName;

        if (this.viewMode === 'tree') {
            container.innerHTML = `
                <div class="object-cards">
                    ${objects.map(obj => this.renderObjectCard(obj)).join('')}
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="object-grid">
                    ${objects.map(obj => this.renderObjectTile(obj)).join('')}
                </div>
            `;
        }
    }

    renderObjectCard(obj) {
        const id = obj.inventory_number || obj.id;
        const loc = typeof obj.location === 'object'
            ? `${obj.location.room}${obj.location.position ? ' / ' + obj.location.position : ''}`
            : obj.location || 'Kein Standort';

        return `
            <div class="object-card ${this.selectedObject === id ? 'selected' : ''}"
                 data-id="${id}" draggable="true">
                <div class="card-header">
                    <span class="card-id">${id}</span>
                </div>
                <div class="card-body">
                    <h4>${obj.title || '(Ohne Titel)'}</h4>
                    <p class="card-creator">${obj.creator || obj.artist || 'Unbekannt'}</p>
                </div>
                <div class="card-footer">
                    <span class="card-location">${loc}</span>
                </div>
            </div>
        `;
    }

    renderObjectTile(obj) {
        const id = obj.inventory_number || obj.id;

        return `
            <div class="object-tile ${this.selectedObject === id ? 'selected' : ''}"
                 data-id="${id}" draggable="true">
                <span class="tile-id">${id}</span>
                <span class="tile-title">${(obj.title || '').substring(0, 20)}</span>
            </div>
        `;
    }

    getObjectsAtBuilding(building) {
        return this.data.objects.filter(obj => {
            const loc = typeof obj.location === 'object' ? obj.location.building : obj.location;
            return loc === building || (loc && loc.includes(building));
        });
    }

    getObjectsAtRoom(building, room) {
        return this.data.objects.filter(obj => {
            const loc = typeof obj.location === 'object' ? obj.location : { room: obj.location };
            return loc.room === room;
        });
    }

    selectObject(id) {
        this.selectedObject = id;

        document.querySelectorAll('.object-card, .object-tile').forEach(el => {
            el.classList.toggle('selected', el.dataset.id === id);
        });

        const obj = this.data.objects.find(o => (o.inventory_number || o.id) === id);
        if (!obj) return;

        const panel = document.getElementById('selected-object');
        const content = document.getElementById('selected-content');

        if (panel && content) {
            panel.classList.remove('hidden');
            const loc = typeof obj.location === 'object'
                ? `${obj.location.building} / ${obj.location.room}`
                : obj.location || 'Kein Standort';

            content.innerHTML = `
                <dl>
                    <dt>Inv.-Nr.</dt>
                    <dd>${id}</dd>
                    <dt>Titel</dt>
                    <dd>${obj.title || '(Ohne Titel)'}</dd>
                    <dt>Standort</dt>
                    <dd>${loc}</dd>
                </dl>
            `;
        }
    }

    startMove(objectId) {
        this.moveSource = objectId;

        const movePanel = document.getElementById('move-panel');
        const sourceLabel = document.getElementById('move-source');
        const targetSelect = document.getElementById('move-target');

        if (movePanel && sourceLabel && targetSelect) {
            movePanel.classList.remove('hidden');
            sourceLabel.textContent = `Quelle: ${objectId}`;

            let options = '<option value="">Ziel waehlen...</option>';
            this.data.locations.forEach(loc => {
                (loc.rooms || []).forEach(room => {
                    options += `<option value="${loc.building}|${room}">${loc.building} / ${room}</option>`;
                });
            });
            targetSelect.innerHTML = options;
        }

        document.getElementById('drag-hint')?.classList.remove('hidden');
    }

    confirmMove(targetValue) {
        if (!this.moveSource || !targetValue) return;

        const [building, room] = targetValue.split('|');
        const objIndex = this.data.objects.findIndex(o =>
            (o.inventory_number || o.id) === this.moveSource
        );

        if (objIndex >= 0) {
            this.data.objects[objIndex].location = { building, room };
            console.log(`Objekt ${this.moveSource} verschoben nach ${building} / ${room}`);
        }

        this.cancelMove();
        this.render();
    }

    cancelMove() {
        this.moveSource = null;
        document.getElementById('move-panel')?.classList.add('hidden');
        document.getElementById('drag-hint')?.classList.add('hidden');
    }

    bindEvents() {
        document.getElementById('location-tree')?.addEventListener('click', (e) => {
            const toggle = e.target.closest('.tree-toggle');
            if (toggle) {
                const building = toggle.dataset.building;
                const roomsList = toggle.nextElementSibling;
                roomsList?.classList.toggle('hidden');
                toggle.querySelector('.toggle-icon').textContent =
                    roomsList?.classList.contains('hidden') ? '▸' : '▾';

                this.selectedLocation = building;
                this.renderLocationContent();
                return;
            }

            const room = e.target.closest('.tree-room');
            if (room) {
                this.selectedLocation = room.dataset.room;
                document.querySelectorAll('.tree-room, .tree-building').forEach(el => {
                    el.classList.remove('selected');
                });
                room.classList.add('selected');
                this.renderLocationContent();
            }
        });

        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.viewMode = btn.dataset.view;
                this.renderLocationContent();
            });
        });

        document.getElementById('location-content')?.addEventListener('click', (e) => {
            const card = e.target.closest('.object-card, .object-tile');
            if (card) {
                this.selectObject(card.dataset.id);
            }
        });

        document.getElementById('start-move')?.addEventListener('click', () => {
            if (this.selectedObject) {
                this.startMove(this.selectedObject);
            }
        });

        document.getElementById('confirm-move')?.addEventListener('click', () => {
            const target = document.getElementById('move-target').value;
            this.confirmMove(target);
        });

        document.getElementById('cancel-move')?.addEventListener('click', () => {
            this.cancelMove();
        });

        // Drag and Drop
        document.getElementById('location-content')?.addEventListener('dragstart', (e) => {
            const card = e.target.closest('[draggable="true"]');
            if (card) {
                e.dataTransfer.setData('text/plain', card.dataset.id);
                this.startMove(card.dataset.id);
            }
        });

        document.getElementById('location-tree')?.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.target.closest('.tree-room')?.classList.add('drag-over');
        });

        document.getElementById('location-tree')?.addEventListener('dragleave', (e) => {
            e.target.closest('.tree-room')?.classList.remove('drag-over');
        });

        document.getElementById('location-tree')?.addEventListener('drop', (e) => {
            e.preventDefault();
            const room = e.target.closest('.tree-room');
            if (room && this.moveSource) {
                this.confirmMove(`${room.dataset.building}|${room.dataset.room}`);
            }
            document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        });
    }

    bindKeyboard() {
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '4') {
                e.preventDefault();
                const modes = ['liste', 'karteikarte', 'standort', 'zustand'];
                window.location.href = `${modes[parseInt(e.key) - 1]}.html`;
            }

            if (e.key === 'Escape' && this.moveSource) {
                this.cancelMove();
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new RegistryStandort().init();
});

export default RegistryStandort;
