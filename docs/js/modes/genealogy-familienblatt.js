/**
 * Genealogy Familienblatt Mode
 * Detailansicht einer Kernfamilie
 */

class GenealogyFamilienblatt {
    constructor() {
        this.data = null;
        this.persons = {};
        this.families = {};
        this.currentFamilyId = null;
    }

    async init() {
        try {
            const response = await fetch('../data/genealogy-data.json');
            this.data = await response.json();
            this.indexData();
            this.populateFamilySelect();
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
                { id: 'P1', name: 'Johann Schmidt', birth: '1820-03-15', death: '1890-11-22', sex: 'M', birthPlace: 'Berlin', occupation: 'Schmied', familySpouse: ['F1'] },
                { id: 'P2', name: 'Maria Mueller', birth: '1825-07-08', death: '1895-02-14', sex: 'F', birthPlace: 'Hamburg', familySpouse: ['F1'] },
                { id: 'P3', name: 'Wilhelm Schmidt', birth: '1850-01-20', death: '1920-06-30', sex: 'M', birthPlace: 'Berlin', occupation: 'Tischler', familyChild: 'F1', familySpouse: ['F2'] },
                { id: 'P4', name: 'Anna Weber', birth: '1855-09-12', death: '1930-04-18', sex: 'F', birthPlace: 'Dresden', familySpouse: ['F2'] },
                { id: 'P5', name: 'Karl Schmidt', birth: '1880-05-25', death: '1945-12-01', sex: 'M', birthPlace: 'Berlin', occupation: 'Lehrer', familyChild: 'F2', familySpouse: ['F3'] },
                { id: 'P6', name: 'Frieda Schmidt', birth: '1882-11-03', sex: 'F', birthPlace: 'Berlin', familyChild: 'F2' }
            ],
            families: [
                { id: 'F1', husband: 'P1', wife: 'P2', children: ['P3'], marriage: '1848-05-10', marriagePlace: 'Berlin', notes: 'Erste dokumentierte Generation' },
                { id: 'F2', husband: 'P3', wife: 'P4', children: ['P5', 'P6'], marriage: '1878-08-15', marriagePlace: 'Berlin', sources: ['Kirchenbuch St. Marien'] }
            ]
        };
        this.indexData();
        this.populateFamilySelect();
        this.currentFamilyId = 'F1';
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

    populateFamilySelect() {
        const select = document.getElementById('family-select');
        if (!select) return;

        select.innerHTML = '<option value="">Familie waehlen...</option>';
        Object.values(this.families).forEach(family => {
            const husband = this.persons[family.husband];
            const wife = this.persons[family.wife];
            const label = [husband?.name, wife?.name].filter(Boolean).join(' & ');

            const option = document.createElement('option');
            option.value = family.id;
            option.textContent = label || family.id;
            select.appendChild(option);
        });
    }

    render() {
        if (!this.currentFamilyId) {
            this.renderEmpty();
            return;
        }

        const family = this.families[this.currentFamilyId];
        if (!family) {
            this.renderEmpty();
            return;
        }

        this.renderHeader(family);
        this.renderCouple(family);
        this.renderChildren(family);
        this.renderNotes(family);
        this.renderSources(family);
        this.renderNavigation(family);
    }

    renderEmpty() {
        const sheet = document.getElementById('family-sheet');
        if (sheet) {
            sheet.innerHTML = `
                <div class="empty-state">
                    <p>Waehlen Sie eine Familie aus der Liste.</p>
                </div>
            `;
        }
    }

    renderHeader(family) {
        const husband = this.persons[family.husband];
        const wife = this.persons[family.wife];
        const title = [husband?.name?.split(' ').pop(), wife?.name?.split(' ').pop()]
            .filter(Boolean).join(' / ');

        document.getElementById('family-title').textContent = `Familie ${title}`;
        document.getElementById('family-id').textContent = family.id;
    }

    renderCouple(family) {
        // Husband
        const husband = this.persons[family.husband];
        document.getElementById('husband-info').innerHTML = husband ?
            this.renderPersonInfo(husband) : '<p class="unknown">Unbekannt</p>';

        // Wife
        const wife = this.persons[family.wife];
        document.getElementById('wife-info').innerHTML = wife ?
            this.renderPersonInfo(wife) : '<p class="unknown">Unbekannt</p>';

        // Marriage
        document.getElementById('marriage-info').innerHTML = `
            <p class="marriage-date">${this.formatDate(family.marriage) || 'Datum unbekannt'}</p>
            <p class="marriage-place">${family.marriagePlace || ''}</p>
        `;
    }

    renderPersonInfo(person) {
        return `
            <p class="person-name">${person.name}</p>
            <dl class="person-details">
                <dt>Geboren</dt>
                <dd>${this.formatDate(person.birth) || '?'} ${person.birthPlace ? `in ${person.birthPlace}` : ''}</dd>
                <dt>Gestorben</dt>
                <dd>${this.formatDate(person.death) || (person.death === undefined ? 'lebend?' : '?')}</dd>
                ${person.occupation ? `<dt>Beruf</dt><dd>${person.occupation}</dd>` : ''}
            </dl>
        `;
    }

    renderChildren(family) {
        const tbody = document.getElementById('children-tbody');
        if (!tbody) return;

        const children = (family.children || []).map(id => this.persons[id]).filter(Boolean);

        if (children.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="no-children">Keine Kinder erfasst</td></tr>';
            return;
        }

        tbody.innerHTML = children.map((child, index) => {
            // Find spouse
            let spouse = '–';
            if (child.familySpouse?.length > 0) {
                const childFamily = this.families[child.familySpouse[0]];
                const spouseId = childFamily.husband === child.id ? childFamily.wife : childFamily.husband;
                spouse = this.persons[spouseId]?.name || '–';
            }

            return `
                <tr data-id="${child.id}" class="${child.familySpouse?.length ? 'has-family' : ''}">
                    <td>${index + 1}</td>
                    <td class="child-name">${child.name}</td>
                    <td>${this.formatDate(child.birth) || '?'}</td>
                    <td>${this.formatDate(child.death) || ''}</td>
                    <td>${spouse}</td>
                </tr>
            `;
        }).join('');
    }

    renderNotes(family) {
        const notesEl = document.getElementById('family-notes');
        if (!notesEl) return;

        notesEl.innerHTML = family.notes || '<em>Keine Anmerkungen</em>';
    }

    renderSources(family) {
        const sourcesEl = document.getElementById('family-sources');
        if (!sourcesEl) return;

        const sources = family.sources || [];
        if (sources.length === 0) {
            sourcesEl.innerHTML = '<li><em>Keine Quellen erfasst</em></li>';
            return;
        }

        sourcesEl.innerHTML = sources.map(s => `<li>${s}</li>`).join('');
    }

    renderNavigation(family) {
        // Parent family button
        const husband = this.persons[family.husband];
        const wife = this.persons[family.wife];
        const parentFamilyId = husband?.familyChild || wife?.familyChild;

        const parentBtn = document.getElementById('nav-parents');
        if (parentBtn) {
            parentBtn.disabled = !parentFamilyId;
            parentBtn.dataset.familyId = parentFamilyId || '';
        }

        // Children families
        const childrenNav = document.getElementById('children-nav');
        if (childrenNav) {
            const childFamilies = (family.children || [])
                .map(childId => {
                    const child = this.persons[childId];
                    if (child?.familySpouse?.length > 0) {
                        return {
                            familyId: child.familySpouse[0],
                            name: child.name
                        };
                    }
                    return null;
                })
                .filter(Boolean);

            if (childFamilies.length > 0) {
                childrenNav.innerHTML = `
                    <p>Kindfamilien:</p>
                    ${childFamilies.map(cf => `
                        <button class="nav-btn child-family" data-family-id="${cf.familyId}">
                            ↓ ${cf.name.split(' ')[0]}
                        </button>
                    `).join('')}
                `;
            } else {
                childrenNav.innerHTML = '';
            }
        }
    }

    formatDate(dateStr) {
        if (!dateStr) return null;
        // Handle both "1820" and "1820-03-15" formats
        if (dateStr.length === 4) return dateStr;
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            return `${parts[2]}.${parts[1]}.${parts[0]}`;
        }
        return dateStr;
    }

    bindEvents() {
        // Family selection
        document.getElementById('family-select')?.addEventListener('change', (e) => {
            this.currentFamilyId = e.target.value || null;
            this.render();
        });

        // Parent navigation
        document.getElementById('nav-parents')?.addEventListener('click', (e) => {
            const familyId = e.target.dataset.familyId;
            if (familyId) {
                this.currentFamilyId = familyId;
                document.getElementById('family-select').value = familyId;
                this.render();
            }
        });

        // Child family navigation
        document.getElementById('children-nav')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.child-family');
            if (btn) {
                this.currentFamilyId = btn.dataset.familyId;
                document.getElementById('family-select').value = this.currentFamilyId;
                this.render();
            }
        });

        // Children row click
        document.getElementById('children-tbody')?.addEventListener('click', (e) => {
            const row = e.target.closest('tr');
            if (row && row.dataset.id) {
                this.showPersonQuickview(row.dataset.id);
            }
        });

        // Print
        document.getElementById('print-sheet')?.addEventListener('click', () => {
            window.print();
        });

        // Export GEDCOM (simplified)
        document.getElementById('export-gedcom')?.addEventListener('click', () => {
            this.exportGEDCOM();
        });

        // Quickview goto
        document.getElementById('qv-goto')?.addEventListener('click', () => {
            // In a real app, this would navigate to person detail
            alert('Navigation zur Personenansicht nicht implementiert');
        });
    }

    showPersonQuickview(personId) {
        const person = this.persons[personId];
        if (!person) return;

        const quickview = document.getElementById('person-quickview');
        if (!quickview) return;

        quickview.classList.remove('hidden');
        document.getElementById('qv-name').textContent = person.name;
        document.getElementById('qv-dates').textContent =
            `${this.formatDate(person.birth) || '?'} – ${this.formatDate(person.death) || ''}`;
        document.getElementById('qv-occupation').textContent = person.occupation || '–';
    }

    exportGEDCOM() {
        // Simplified GEDCOM export
        const family = this.families[this.currentFamilyId];
        if (!family) return;

        let gedcom = '0 HEAD\n1 SOUR GRIP\n1 GEDC\n2 VERS 5.5.1\n1 CHAR UTF-8\n';

        // Export persons
        const personIds = new Set([family.husband, family.wife, ...(family.children || [])]);
        personIds.forEach(id => {
            const p = this.persons[id];
            if (p) {
                gedcom += `0 @${p.id}@ INDI\n`;
                gedcom += `1 NAME ${p.name}\n`;
                if (p.sex) gedcom += `1 SEX ${p.sex}\n`;
                if (p.birth) gedcom += `1 BIRT\n2 DATE ${p.birth}\n`;
                if (p.death) gedcom += `1 DEAT\n2 DATE ${p.death}\n`;
            }
        });

        // Export family
        gedcom += `0 @${family.id}@ FAM\n`;
        if (family.husband) gedcom += `1 HUSB @${family.husband}@\n`;
        if (family.wife) gedcom += `1 WIFE @${family.wife}@\n`;
        (family.children || []).forEach(childId => {
            gedcom += `1 CHIL @${childId}@\n`;
        });
        if (family.marriage) gedcom += `1 MARR\n2 DATE ${family.marriage}\n`;

        gedcom += '0 TRLR\n';

        // Download
        const blob = new Blob([gedcom], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `family-${this.currentFamilyId}.ged`;
        a.click();
        URL.revokeObjectURL(url);
    }

    bindKeyboard() {
        document.addEventListener('keydown', (e) => {
            // Mode switching
            if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '4') {
                e.preventDefault();
                const modes = ['stammbaum', 'ahnentafel', 'familienblatt', 'zeitstrahl'];
                window.location.href = `${modes[parseInt(e.key) - 1]}.html`;
            }

            // Print
            if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
                e.preventDefault();
                window.print();
            }

            // Navigate to parent
            if (e.key === 'ArrowUp') {
                const parentBtn = document.getElementById('nav-parents');
                if (parentBtn && !parentBtn.disabled) {
                    parentBtn.click();
                }
            }
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const app = new GenealogyFamilienblatt();
    app.init();
});

export default GenealogyFamilienblatt;
