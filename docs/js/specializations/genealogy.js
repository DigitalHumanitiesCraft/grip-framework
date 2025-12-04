/**
 * Genealogy Module
 * Navigator-Spezialisierung für Verwandtschaftsnetzwerke
 *
 * Kognitive Aufgabe: Rekonstruktion von Linien und Verzweigungen
 *
 * UI-Elemente:
 * - Generationen-Layout (horizontal geschichtet)
 * - Geschlechts-Symbole oder Farbkodierung
 * - Partner-Verbindungen (horizontal) vs. Abstammung (vertikal)
 * - Ahnentafel-Ansicht (aufsteigend) und Nachkommentafel (absteigend)
 * - Lebensdaten-Timeline
 */

export class Genealogy {
    constructor() {
        this.data = null;
        this.persons = [];
        this.relations = [];
        this.viewMode = 'tree'; // tree, ancestors, descendants
        this.selectedPerson = null;
        this.generationDepth = 3;
    }

    async init() {
        try {
            const response = await fetch('data/navigator-genealogy.json');
            this.data = await response.json();

            this.persons = this.data.persons || [];
            this.relations = this.data.relations || [];

            this.setupEventListeners();
            this.render();

            console.log('Genealogy module initialized');
        } catch (error) {
            console.error('Error initializing Genealogy:', error);
        }
    }

    setupEventListeners() {
        document.getElementById('person-search')?.addEventListener('input', (e) => {
            this.searchPersons(e.target.value);
        });

        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setViewMode(e.target.dataset.view);
            });
        });

        document.getElementById('generation-depth')?.addEventListener('input', (e) => {
            this.generationDepth = parseInt(e.target.value);
            document.getElementById('generation-depth-value').textContent = this.generationDepth;
            this.renderTree();
        });

        // Zoom controls
        document.getElementById('zoom-in')?.addEventListener('click', () => this.zoom(1.2));
        document.getElementById('zoom-out')?.addEventListener('click', () => this.zoom(0.8));
        document.getElementById('fit-view')?.addEventListener('click', () => this.fitView());
        document.getElementById('center-root')?.addEventListener('click', () => this.centerRoot());
    }

    render() {
        this.renderSearchResults();
        this.renderLineages();
        this.renderTree();
        this.renderTimeline();
        this.renderStats();
    }

    renderSearchResults() {
        const container = document.getElementById('search-results');
        if (!container) return;

        container.innerHTML = this.persons.slice(0, 10).map(p => `
            <li class="search-result" data-id="${p.id}">
                <span class="result-name">${p.name}</span>
                <span class="result-dates">${this.extractYear(p.birth?.date)}–${this.extractYear(p.death?.date)}</span>
            </li>
        `).join('');

        container.querySelectorAll('.search-result').forEach(li => {
            li.addEventListener('click', () => this.selectPerson(li.dataset.id));
        });
    }

    renderLineages() {
        const container = document.getElementById('lineages-list');
        if (!container || !this.data?.lineages) return;

        container.innerHTML = this.data.lineages.map(l => `
            <div class="lineage-item" style="border-left-color: ${l.color}">
                <span class="lineage-name">${l.name}</span>
                <span class="lineage-desc">${l.description}</span>
            </div>
        `).join('');
    }

    renderTree() {
        const container = document.getElementById('tree-canvas');
        if (!container) return;

        const width = container.clientWidth || 800;
        const height = container.clientHeight || 500;

        // Group persons by generation
        const generations = {};
        this.persons.forEach(p => {
            const gen = p.generation || 0;
            if (!generations[gen]) generations[gen] = [];
            generations[gen].push(p);
        });

        const genKeys = Object.keys(generations).sort((a, b) => a - b);
        const genHeight = height / (genKeys.length + 1);

        // Position persons
        const positions = new Map();
        genKeys.forEach((gen, genIdx) => {
            const persons = generations[gen];
            const genY = (genIdx + 1) * genHeight;
            const spacing = width / (persons.length + 1);

            persons.forEach((p, idx) => {
                positions.set(p.id, { x: (idx + 1) * spacing, y: genY });
            });
        });

        // Draw connections
        const connectionsHtml = this.relations
            .filter(r => r.type === 'parent_child')
            .map(r => {
                const parentPos = positions.get(r.parent);
                const childPos = positions.get(r.child);
                if (!parentPos || !childPos) return '';

                return `<line class="parent-child-line"
                    x1="${parentPos.x}" y1="${parentPos.y + 20}"
                    x2="${childPos.x}" y2="${childPos.y - 20}"
                    stroke="#888" stroke-width="1.5"/>`;
            }).join('');

        const spouseHtml = this.relations
            .filter(r => r.type === 'spouse')
            .map(r => {
                const pos1 = positions.get(r.person1);
                const pos2 = positions.get(r.person2);
                if (!pos1 || !pos2) return '';

                return `<line class="spouse-line"
                    x1="${pos1.x}" y1="${pos1.y}"
                    x2="${pos2.x}" y2="${pos2.y}"
                    stroke="#C4705A" stroke-width="2" stroke-dasharray="4,2"/>`;
            }).join('');

        // Draw persons
        const personsHtml = this.persons.map(p => {
            const pos = positions.get(p.id);
            if (!pos) return '';

            const isSelected = this.selectedPerson?.id === p.id;
            const genderColor = p.gender === 'male' ? '#5A8DB8' : '#C4875A';

            return `
                <g class="person-node ${isSelected ? 'selected' : ''}" data-id="${p.id}" transform="translate(${pos.x},${pos.y})">
                    <rect x="-50" y="-20" width="100" height="40" rx="4"
                          fill="${isSelected ? genderColor : '#fff'}"
                          stroke="${genderColor}" stroke-width="2"/>
                    <text dy="5" text-anchor="middle" font-size="11" fill="${isSelected ? '#fff' : '#333'}">
                        ${p.name.split(' ').pop()}
                    </text>
                </g>
            `;
        }).join('');

        container.innerHTML = `
            <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}">
                <g class="connections">${connectionsHtml}${spouseHtml}</g>
                <g class="persons">${personsHtml}</g>
            </svg>
        `;

        container.querySelectorAll('.person-node').forEach(node => {
            node.addEventListener('click', () => this.selectPerson(node.dataset.id));
        });
    }

    renderTimeline() {
        const container = document.getElementById('timeline-display');
        if (!container) return;

        const sortedPersons = [...this.persons]
            .filter(p => p.birth?.date)
            .sort((a, b) => this.extractYear(a.birth?.date) - this.extractYear(b.birth?.date));

        const years = sortedPersons.flatMap(p => [
            this.extractYear(p.birth?.date),
            this.extractYear(p.death?.date)
        ]).filter(y => y);

        const minYear = Math.min(...years);
        const maxYear = Math.max(...years);
        const range = maxYear - minYear;

        container.innerHTML = `
            <div class="timeline-axis">
                <span class="axis-start">${minYear}</span>
                <span class="axis-end">${maxYear}</span>
            </div>
            ${sortedPersons.map(p => {
                const birthYear = this.extractYear(p.birth?.date);
                const deathYear = this.extractYear(p.death?.date) || maxYear;
                const left = ((birthYear - minYear) / range) * 100;
                const width = ((deathYear - birthYear) / range) * 100;
                const genderColor = p.gender === 'male' ? '#5A8DB8' : '#C4875A';

                return `
                    <div class="timeline-person" data-id="${p.id}">
                        <span class="timeline-name">${p.name}</span>
                        <div class="timeline-bar-bg">
                            <div class="timeline-bar" style="left: ${left}%; width: ${width}%; background: ${genderColor}">
                                <span class="bar-years">${birthYear}–${deathYear}</span>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        `;
    }

    renderStats() {
        const statsEl = document.getElementById('genealogy-stats');
        if (!statsEl) return;

        const maleCount = this.persons.filter(p => p.gender === 'male').length;
        const femaleCount = this.persons.filter(p => p.gender === 'female').length;
        const generations = new Set(this.persons.map(p => p.generation)).size;

        statsEl.innerHTML = `
            <dt>Personen</dt><dd>${this.persons.length}</dd>
            <dt>Generationen</dt><dd>${generations}</dd>
            <dt>Männlich</dt><dd>${maleCount}</dd>
            <dt>Weiblich</dt><dd>${femaleCount}</dd>
        `;
    }

    renderPersonDetail() {
        const panel = document.getElementById('person-detail');
        if (!panel || !this.selectedPerson) return;

        const p = this.selectedPerson;

        panel.classList.remove('hidden');
        panel.innerHTML = `
            <h3>${p.name}</h3>
            <dl class="person-meta">
                <dt>Geboren</dt>
                <dd>${p.birth?.date || '?'} in ${p.birth?.place || '?'}</dd>
                <dt>Gestorben</dt>
                <dd>${p.death?.date || '?'} in ${p.death?.place || '?'}</dd>
                ${p.occupation ? `<dt>Beruf</dt><dd>${p.occupation}</dd>` : ''}
                ${p.note ? `<dt>Anmerkung</dt><dd>${p.note}</dd>` : ''}
            </dl>
        `;

        this.renderRelations();
    }

    renderRelations() {
        const container = document.getElementById('relations-list');
        if (!container || !this.selectedPerson) return;

        const parents = this.getParents(this.selectedPerson.id);
        const children = this.getChildren(this.selectedPerson.id);
        const spouses = this.getSpouses(this.selectedPerson.id);
        const siblings = this.getSiblings(this.selectedPerson.id);

        container.innerHTML = `
            ${parents.length ? `<h4>Eltern</h4><ul>${parents.map(p => `<li>${p?.name || '?'}</li>`).join('')}</ul>` : ''}
            ${spouses.length ? `<h4>Partner</h4><ul>${spouses.map(p => `<li>${p?.name || '?'}</li>`).join('')}</ul>` : ''}
            ${children.length ? `<h4>Kinder</h4><ul>${children.map(p => `<li>${p?.name || '?'}</li>`).join('')}</ul>` : ''}
            ${siblings.length ? `<h4>Geschwister</h4><ul>${siblings.map(p => `<li>${p?.name || '?'}</li>`).join('')}</ul>` : ''}
        `;
    }

    extractYear(dateStr) {
        if (!dateStr) return null;
        const match = dateStr.match(/\d{4}/);
        return match ? parseInt(match[0]) : null;
    }

    searchPersons(query) {
        const container = document.getElementById('search-results');
        if (!container) return;

        const lowerQuery = query.toLowerCase();
        const results = this.persons.filter(p =>
            p.name.toLowerCase().includes(lowerQuery)
        );

        container.innerHTML = results.slice(0, 10).map(p => `
            <li class="search-result" data-id="${p.id}">
                <span class="result-name">${p.name}</span>
                <span class="result-dates">${this.extractYear(p.birth?.date)}–${this.extractYear(p.death?.date)}</span>
            </li>
        `).join('');

        container.querySelectorAll('.search-result').forEach(li => {
            li.addEventListener('click', () => this.selectPerson(li.dataset.id));
        });
    }
    setViewMode(mode) {
        this.viewMode = mode;
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === mode);
        });
        this.renderTree();
    }

    selectPerson(personId) {
        this.selectedPerson = this.persons.find(p => p.id === personId);
        this.renderPersonDetail();
        this.renderRelations();
    }

    zoom(factor) {}
    fitView() {}
    centerRoot() {}

    getParents(personId) {
        return this.relations
            .filter(r => r.type === 'parent_child' && r.child === personId)
            .map(r => this.persons.find(p => p.id === r.parent));
    }

    getChildren(personId) {
        return this.relations
            .filter(r => r.type === 'parent_child' && r.parent === personId)
            .map(r => this.persons.find(p => p.id === r.child));
    }

    getSpouses(personId) {
        return this.relations
            .filter(r => r.type === 'spouse' && (r.person1 === personId || r.person2 === personId))
            .map(r => {
                const spouseId = r.person1 === personId ? r.person2 : r.person1;
                return this.persons.find(p => p.id === spouseId);
            });
    }

    getSiblings(personId) {
        const parents = this.getParents(personId);
        if (parents.length === 0) return [];

        const siblings = new Set();
        parents.forEach(parent => {
            this.getChildren(parent.id).forEach(child => {
                if (child.id !== personId) siblings.add(child);
            });
        });
        return [...siblings];
    }
}
