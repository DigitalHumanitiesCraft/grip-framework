/**
 * Genealogy Ahnentafel Mode
 * Vorfahrentafel mit Kekule-Nummerierung
 */

class GenealogyAhnentafel {
    constructor() {
        this.data = null;
        this.persons = {};
        this.families = {};
        this.probandId = null;
        this.generationDepth = 4;
        this.displayFormat = 'tree'; // 'tree' or 'list'
        this.ancestors = {};
    }

    async init() {
        try {
            const response = await fetch('../data/genealogy-data.json');
            this.data = await response.json();
            this.indexData();
            this.populateProbandSelect();
            this.render();
            this.bindEvents();
            this.bindKeyboard();
        } catch (error) {
            console.error('Fehler beim Laden der Genealogie-Daten:', error);
            this.loadDemoData();
        }
    }

    loadDemoData() {
        this.data = {
            persons: [
                { id: 'P1', name: 'Johann Schmidt', birth: '1820', death: '1890', sex: 'M', familySpouse: ['F1'] },
                { id: 'P2', name: 'Maria Mueller', birth: '1825', death: '1895', sex: 'F', familySpouse: ['F1'] },
                { id: 'P3', name: 'Wilhelm Schmidt', birth: '1850', death: '1920', sex: 'M', familyChild: 'F1', familySpouse: ['F2'] },
                { id: 'P4', name: 'Anna Weber', birth: '1855', death: '1930', sex: 'F', familySpouse: ['F2'] },
                { id: 'P5', name: 'Karl Schmidt', birth: '1880', death: '1945', sex: 'M', familyChild: 'F2', familySpouse: ['F3'] },
                { id: 'P6', name: 'Elisabeth Braun', birth: '1885', death: '1960', sex: 'F', familySpouse: ['F3'] },
                { id: 'P7', name: 'Hans Schmidt', birth: '1910', death: '1980', sex: 'M', familyChild: 'F3' }
            ],
            families: [
                { id: 'F1', husband: 'P1', wife: 'P2', children: ['P3'], marriage: '1848' },
                { id: 'F2', husband: 'P3', wife: 'P4', children: ['P5'], marriage: '1878' },
                { id: 'F3', husband: 'P5', wife: 'P6', children: ['P7'], marriage: '1908' }
            ]
        };
        this.indexData();
        this.populateProbandSelect();
        this.probandId = 'P7';
        this.render();
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

    populateProbandSelect() {
        const select = document.getElementById('proband-select');
        if (!select) return;

        select.innerHTML = '<option value="">Waehlen...</option>';
        Object.values(this.persons).forEach(person => {
            const option = document.createElement('option');
            option.value = person.id;
            option.textContent = `${person.name} (${person.birth || '?'})`;
            select.appendChild(option);
        });
    }

    buildAncestorTree() {
        this.ancestors = {};
        if (!this.probandId) return;

        const build = (personId, kekule) => {
            if (!personId || kekule > Math.pow(2, this.generationDepth + 1) - 1) return;

            const person = this.persons[personId];
            if (!person) {
                this.ancestors[kekule] = null; // Mark as missing
                return;
            }

            this.ancestors[kekule] = {
                ...person,
                kekule,
                generation: Math.floor(Math.log2(kekule))
            };

            // Find parents
            if (person.familyChild) {
                const family = this.families[person.familyChild];
                if (family) {
                    build(family.husband, kekule * 2);     // Father
                    build(family.wife, kekule * 2 + 1);    // Mother
                }
            } else {
                // Mark parents as missing
                if (kekule * 2 <= Math.pow(2, this.generationDepth + 1) - 1) {
                    this.ancestors[kekule * 2] = null;
                    this.ancestors[kekule * 2 + 1] = null;
                }
            }
        };

        build(this.probandId, 1);
    }

    render() {
        this.buildAncestorTree();

        if (this.displayFormat === 'tree') {
            this.renderTree();
        } else {
            this.renderList();
        }

        this.updateStats();
    }

    renderTree() {
        const container = document.getElementById('ahnentafel-container');
        if (!container) return;

        if (!this.probandId) {
            container.innerHTML = '<p class="no-selection">Bitte waehlen Sie einen Probanden.</p>';
            return;
        }

        let html = '<div class="ahnentafel-tree">';

        // Render by generation
        for (let gen = 0; gen <= this.generationDepth; gen++) {
            const startKekule = Math.pow(2, gen);
            const endKekule = Math.pow(2, gen + 1) - 1;

            html += `<div class="generation-row" data-generation="${gen}">`;
            html += `<span class="generation-label">Gen. ${gen}</span>`;

            for (let k = startKekule; k <= endKekule; k++) {
                const ancestor = this.ancestors[k];
                if (ancestor) {
                    html += `
                        <div class="ancestor-cell ${ancestor.sex === 'F' ? 'female' : 'male'}"
                             data-kekule="${k}" data-id="${ancestor.id}">
                            <span class="kekule-num">${k}</span>
                            <span class="ancestor-name">${ancestor.name}</span>
                            <span class="ancestor-dates">${ancestor.birth || '?'}–${ancestor.death || ''}</span>
                        </div>
                    `;
                } else {
                    html += `
                        <div class="ancestor-cell missing" data-kekule="${k}">
                            <span class="kekule-num">${k}</span>
                            <span class="ancestor-name">?</span>
                        </div>
                    `;
                }
            }

            html += '</div>';
        }

        html += '</div>';
        container.innerHTML = html;
    }

    renderList() {
        const container = document.getElementById('ahnentafel-container');
        if (!container) return;

        if (!this.probandId) {
            container.innerHTML = '<p class="no-selection">Bitte waehlen Sie einen Probanden.</p>';
            return;
        }

        const sortedKekules = Object.keys(this.ancestors)
            .map(Number)
            .sort((a, b) => a - b);

        let html = '<ol class="ahnentafel-list">';

        sortedKekules.forEach(k => {
            const ancestor = this.ancestors[k];
            const relation = this.getRelation(k);

            if (ancestor) {
                html += `
                    <li class="ancestor-item ${ancestor.sex === 'F' ? 'female' : 'male'}"
                        data-kekule="${k}" data-id="${ancestor.id}">
                        <span class="kekule-badge">${k}</span>
                        <span class="ancestor-name">${ancestor.name}</span>
                        <span class="ancestor-dates">${ancestor.birth || '?'}–${ancestor.death || ''}</span>
                        <span class="relation">${relation}</span>
                    </li>
                `;
            } else if (this.ancestors.hasOwnProperty(k)) {
                html += `
                    <li class="ancestor-item missing" data-kekule="${k}">
                        <span class="kekule-badge">${k}</span>
                        <span class="ancestor-name">Unbekannt</span>
                        <span class="relation">${relation}</span>
                    </li>
                `;
            }
        });

        html += '</ol>';
        container.innerHTML = html;
    }

    getRelation(kekule) {
        if (kekule === 1) return 'Proband';
        if (kekule === 2) return 'Vater';
        if (kekule === 3) return 'Mutter';

        const generation = Math.floor(Math.log2(kekule));
        const isPaternal = this.isPaternal(kekule);
        const isMale = kekule % 2 === 0;

        let prefix = '';
        for (let i = 2; i < generation; i++) {
            prefix += 'Ur';
        }

        if (generation === 2) {
            return isMale ? (isPaternal ? 'Großvater (v)' : 'Großvater (m)') :
                          (isPaternal ? 'Großmutter (v)' : 'Großmutter (m)');
        }

        return prefix + (isMale ? 'großvater' : 'großmutter') + (isPaternal ? ' (v)' : ' (m)');
    }

    isPaternal(kekule) {
        // Check if ancestor is on father's side
        while (kekule > 3) {
            kekule = Math.floor(kekule / 2);
        }
        return kekule === 2;
    }

    bindEvents() {
        // Proband selection
        document.getElementById('proband-select')?.addEventListener('change', (e) => {
            this.probandId = e.target.value || null;
            this.render();
        });

        // Generation depth
        document.getElementById('generation-depth')?.addEventListener('input', (e) => {
            this.generationDepth = parseInt(e.target.value);
            document.getElementById('depth-value').textContent = this.generationDepth;
            this.render();
        });

        // Display format
        document.querySelectorAll('.format-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.format-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.displayFormat = btn.dataset.format;
                this.render();
            });
        });

        // Ancestor selection
        document.getElementById('ahnentafel-container')?.addEventListener('click', (e) => {
            const cell = e.target.closest('.ancestor-cell, .ancestor-item');
            if (cell && !cell.classList.contains('missing')) {
                this.showAncestorDetail(parseInt(cell.dataset.kekule));
            }
        });
    }

    showAncestorDetail(kekule) {
        const ancestor = this.ancestors[kekule];
        if (!ancestor) return;

        const detailSection = document.getElementById('ancestor-detail');
        if (!detailSection) return;

        detailSection.classList.remove('hidden');

        document.getElementById('detail-kekule').textContent = kekule;
        document.getElementById('detail-name').textContent = ancestor.name;
        document.getElementById('detail-generation').textContent = `Generation ${ancestor.generation}`;
        document.getElementById('detail-dates').textContent =
            `${ancestor.birth || '?'} – ${ancestor.death || ''}`;
        document.getElementById('detail-birthplace').textContent = ancestor.birthPlace || '–';
        document.getElementById('detail-relation').textContent = this.getRelation(kekule);
    }

    updateStats() {
        const total = Object.keys(this.ancestors).length;
        const known = Object.values(this.ancestors).filter(a => a !== null).length;
        const missing = total - known;
        const completeness = total > 0 ? Math.round((known / total) * 100) : 0;

        document.getElementById('stat-ancestors').textContent = known;
        document.getElementById('stat-missing').textContent = missing;
        document.getElementById('stat-completeness').textContent = `${completeness}%`;
    }

    bindKeyboard() {
        document.addEventListener('keydown', (e) => {
            // Mode switching
            if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '4') {
                e.preventDefault();
                const modes = ['stammbaum', 'ahnentafel', 'familienblatt', 'zeitstrahl'];
                window.location.href = `${modes[parseInt(e.key) - 1]}.html`;
            }

            // Toggle list view
            if (e.key === 'l' || e.key === 'L') {
                this.displayFormat = this.displayFormat === 'tree' ? 'list' : 'tree';
                document.querySelectorAll('.format-btn').forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.format === this.displayFormat);
                });
                this.render();
            }
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const app = new GenealogyAhnentafel();
    app.init();
});

export default GenealogyAhnentafel;
