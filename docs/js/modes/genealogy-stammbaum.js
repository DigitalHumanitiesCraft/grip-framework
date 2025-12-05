/**
 * Genealogy Stammbaum Mode
 * Abstammungsbaum vom Stammvater abwärts
 */

class GenealogyStammbaum {
    constructor() {
        this.data = null;
        this.persons = {};
        this.families = {};
        this.selectedPerson = null;
        this.rootPerson = null;
        this.generationDepth = 3;
        this.showDates = true;
        this.showPhotos = false;
        this.zoomLevel = 1;
    }

    async init() {
        try {
            const response = await fetch('../data/genealogy-data.json');
            this.data = await response.json();
            this.indexData();
            this.findRoot();
            this.render();
            this.bindEvents();
            this.bindKeyboard();
            this.updateStats();
        } catch (error) {
            console.error('Fehler beim Laden der Genealogie-Daten:', error);
            this.loadDemoData();
        }
    }

    loadDemoData() {
        // Demo-Daten falls keine JSON vorhanden
        this.data = {
            persons: [
                { id: 'P1', name: 'Johann Schmidt', birth: '1820', death: '1890', sex: 'M', familySpouse: ['F1'] },
                { id: 'P2', name: 'Maria Mueller', birth: '1825', death: '1895', sex: 'F', familySpouse: ['F1'] },
                { id: 'P3', name: 'Wilhelm Schmidt', birth: '1850', death: '1920', sex: 'M', familyChild: 'F1', familySpouse: ['F2'] },
                { id: 'P4', name: 'Anna Weber', birth: '1855', death: '1930', sex: 'F', familySpouse: ['F2'] },
                { id: 'P5', name: 'Karl Schmidt', birth: '1880', death: '1945', sex: 'M', familyChild: 'F2', familySpouse: ['F3'] },
                { id: 'P6', name: 'Elisabeth Braun', birth: '1885', death: '1960', sex: 'F', familySpouse: ['F3'] },
                { id: 'P7', name: 'Hans Schmidt', birth: '1910', death: '1980', sex: 'M', familyChild: 'F3' },
                { id: 'P8', name: 'Frieda Schmidt', birth: '1912', death: '1990', sex: 'F', familyChild: 'F3' }
            ],
            families: [
                { id: 'F1', husband: 'P1', wife: 'P2', children: ['P3'], marriage: '1848' },
                { id: 'F2', husband: 'P3', wife: 'P4', children: ['P5'], marriage: '1878' },
                { id: 'F3', husband: 'P5', wife: 'P6', children: ['P7', 'P8'], marriage: '1908' }
            ]
        };
        this.indexData();
        this.findRoot();
        this.render();
        this.updateStats();
    }

    indexData() {
        this.persons = {};
        this.families = {};

        (this.data.persons || []).forEach(p => {
            this.persons[p.id] = p;
        });

        (this.data.families || []).forEach(f => {
            this.families[f.id] = f;
        });
    }

    findRoot() {
        // Find person without parents (root of tree)
        for (const person of Object.values(this.persons)) {
            if (!person.familyChild) {
                this.rootPerson = person.id;
                return;
            }
        }
        // Fallback: first person
        const firstPerson = Object.values(this.persons)[0];
        if (firstPerson) {
            this.rootPerson = firstPerson.id;
        }
    }

    render() {
        const container = document.getElementById('tree-container');
        if (!container) return;

        if (!this.rootPerson) {
            container.innerHTML = '<p class="no-data">Keine Genealogie-Daten verfuegbar.</p>';
            return;
        }

        const tree = this.buildTree(this.rootPerson, 0);
        container.innerHTML = `
            <div class="tree-wrapper" style="transform: scale(${this.zoomLevel})">
                ${tree}
            </div>
        `;
    }

    buildTree(personId, generation) {
        if (generation >= this.generationDepth) return '';

        const person = this.persons[personId];
        if (!person) return '';

        const isSelected = this.selectedPerson === personId;
        const spouseFamilies = person.familySpouse || [];

        let childrenHtml = '';
        spouseFamilies.forEach(famId => {
            const family = this.families[famId];
            if (family?.children?.length > 0) {
                const childNodes = family.children.map(childId =>
                    this.buildTree(childId, generation + 1)
                ).join('');
                if (childNodes) {
                    childrenHtml += `<div class="children-row">${childNodes}</div>`;
                }
            }
        });

        // Get spouse
        let spouseHtml = '';
        if (spouseFamilies.length > 0) {
            const family = this.families[spouseFamilies[0]];
            const spouseId = family.husband === personId ? family.wife : family.husband;
            const spouse = this.persons[spouseId];
            if (spouse) {
                spouseHtml = `
                    <div class="spouse-connector">⚭</div>
                    <div class="person-node spouse ${spouse.sex === 'F' ? 'female' : 'male'}"
                         data-id="${spouseId}">
                        <span class="person-name">${spouse.name}</span>
                        ${this.showDates ? `<span class="person-dates">${spouse.birth || '?'}–${spouse.death || ''}</span>` : ''}
                    </div>
                `;
            }
        }

        return `
            <div class="tree-branch">
                <div class="couple-row">
                    <div class="person-node ${person.sex === 'F' ? 'female' : 'male'} ${isSelected ? 'selected' : ''}"
                         data-id="${personId}">
                        ${this.showPhotos && person.photo ? `<img src="${person.photo}" class="person-photo" alt="">` : ''}
                        <span class="person-name">${person.name}</span>
                        ${this.showDates ? `<span class="person-dates">${person.birth || '?'}–${person.death || ''}</span>` : ''}
                    </div>
                    ${spouseHtml}
                </div>
                ${childrenHtml ? `<div class="connector-line"></div>${childrenHtml}` : ''}
            </div>
        `;
    }

    bindEvents() {
        const container = document.getElementById('tree-container');

        // Person selection
        container?.addEventListener('click', (e) => {
            const node = e.target.closest('.person-node');
            if (node) {
                this.selectPerson(node.dataset.id);
            }
        });

        // Generation depth slider
        document.getElementById('generation-depth')?.addEventListener('input', (e) => {
            this.generationDepth = parseInt(e.target.value);
            document.getElementById('depth-value').textContent = this.generationDepth;
            this.render();
        });

        // Show dates checkbox
        document.getElementById('show-dates')?.addEventListener('change', (e) => {
            this.showDates = e.target.checked;
            this.render();
        });

        // Show photos checkbox
        document.getElementById('show-photos')?.addEventListener('change', (e) => {
            this.showPhotos = e.target.checked;
            this.render();
        });

        // Search
        document.getElementById('person-search')?.addEventListener('input', (e) => {
            this.searchPerson(e.target.value);
        });

        // Zoom controls
        document.getElementById('zoom-in')?.addEventListener('click', () => this.zoom(1.2));
        document.getElementById('zoom-out')?.addEventListener('click', () => this.zoom(0.8));
        document.getElementById('zoom-reset')?.addEventListener('click', () => {
            this.zoomLevel = 1;
            this.updateZoomDisplay();
            this.render();
        });
    }

    selectPerson(personId) {
        this.selectedPerson = personId;
        this.render();
        this.showPersonDetail(personId);
    }

    showPersonDetail(personId) {
        const person = this.persons[personId];
        if (!person) return;

        const detailSection = document.getElementById('person-detail');
        if (!detailSection) return;

        detailSection.classList.remove('hidden');

        document.getElementById('detail-name').textContent = person.name;
        document.getElementById('detail-dates').textContent =
            `${person.birth || '?'} – ${person.death || ''}`;
        document.getElementById('detail-birthplace').textContent = person.birthPlace || '–';
        document.getElementById('detail-occupation').textContent = person.occupation || '–';

        // Parents
        let parents = '–';
        if (person.familyChild) {
            const parentFamily = this.families[person.familyChild];
            if (parentFamily) {
                const father = this.persons[parentFamily.husband];
                const mother = this.persons[parentFamily.wife];
                parents = [father?.name, mother?.name].filter(Boolean).join(' & ') || '–';
            }
        }
        document.getElementById('detail-parents').textContent = parents;

        // Spouse
        let spouse = '–';
        if (person.familySpouse?.length > 0) {
            const family = this.families[person.familySpouse[0]];
            const spouseId = family.husband === personId ? family.wife : family.husband;
            spouse = this.persons[spouseId]?.name || '–';
        }
        document.getElementById('detail-spouse').textContent = spouse;

        // Children
        let children = '–';
        if (person.familySpouse?.length > 0) {
            const allChildren = [];
            person.familySpouse.forEach(famId => {
                const family = this.families[famId];
                (family?.children || []).forEach(childId => {
                    const child = this.persons[childId];
                    if (child) allChildren.push(child.name);
                });
            });
            children = allChildren.join(', ') || '–';
        }
        document.getElementById('detail-children').textContent = children;
    }

    searchPerson(query) {
        if (!query) {
            this.selectedPerson = null;
            this.render();
            return;
        }

        const lowerQuery = query.toLowerCase();
        for (const person of Object.values(this.persons)) {
            if (person.name.toLowerCase().includes(lowerQuery)) {
                this.selectPerson(person.id);
                return;
            }
        }
    }

    zoom(factor) {
        this.zoomLevel = Math.max(0.5, Math.min(2, this.zoomLevel * factor));
        this.updateZoomDisplay();
        this.render();
    }

    updateZoomDisplay() {
        const display = document.getElementById('zoom-level');
        if (display) {
            display.textContent = `${Math.round(this.zoomLevel * 100)}%`;
        }
    }

    updateStats() {
        document.getElementById('stat-persons').textContent = Object.keys(this.persons).length;
        document.getElementById('stat-families').textContent = Object.keys(this.families).length;

        // Calculate generations
        let maxGen = 0;
        const visited = new Set();
        const calcGen = (personId, gen) => {
            if (visited.has(personId) || !this.persons[personId]) return;
            visited.add(personId);
            maxGen = Math.max(maxGen, gen);

            const person = this.persons[personId];
            (person.familySpouse || []).forEach(famId => {
                const family = this.families[famId];
                (family?.children || []).forEach(childId => calcGen(childId, gen + 1));
            });
        };

        if (this.rootPerson) {
            calcGen(this.rootPerson, 1);
        }
        document.getElementById('stat-generations').textContent = maxGen;
    }

    bindKeyboard() {
        document.addEventListener('keydown', (e) => {
            // Mode switching
            if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '4') {
                e.preventDefault();
                const modes = ['stammbaum', 'ahnentafel', 'familienblatt', 'zeitstrahl'];
                window.location.href = `${modes[parseInt(e.key) - 1]}.html`;
            }

            // Zoom
            if (e.key === '+' || e.key === '=') {
                e.preventDefault();
                this.zoom(1.2);
            }
            if (e.key === '-') {
                e.preventDefault();
                this.zoom(0.8);
            }
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const app = new GenealogyStammbaum();
    app.init();
});

export default GenealogyStammbaum;
