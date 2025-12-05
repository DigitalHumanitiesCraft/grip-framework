/**
 * Genealogy Zeitstrahl Mode
 * Chronologische Parallelansicht von Lebensläufen
 */

class GenealogyZeitstrahl {
    constructor() {
        this.data = null;
        this.persons = {};
        this.families = {};
        this.yearFrom = 1800;
        this.yearTo = 2024;
        this.zoomLevel = 10; // years per 100px
        this.filters = {
            direct: true,
            siblings: false,
            spouses: true
        };
        this.eventTypes = {
            birth: true,
            marriage: true,
            death: true,
            other: false
        };
        this.selectedEvent = null;
    }

    async init() {
        try {
            const response = await fetch('../data/genealogy-data.json');
            this.data = await response.json();
            this.indexData();
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
        this.data = {
            persons: [
                { id: 'P1', name: 'Johann Schmidt', birth: '1820', death: '1890', sex: 'M' },
                { id: 'P2', name: 'Maria Mueller', birth: '1825', death: '1895', sex: 'F' },
                { id: 'P3', name: 'Wilhelm Schmidt', birth: '1850', death: '1920', sex: 'M', familyChild: 'F1' },
                { id: 'P4', name: 'Anna Weber', birth: '1855', death: '1930', sex: 'F' },
                { id: 'P5', name: 'Karl Schmidt', birth: '1880', death: '1945', sex: 'M', familyChild: 'F2' },
                { id: 'P6', name: 'Elisabeth Braun', birth: '1885', death: '1960', sex: 'F' },
                { id: 'P7', name: 'Hans Schmidt', birth: '1910', death: '1980', sex: 'M', familyChild: 'F3' }
            ],
            families: [
                { id: 'F1', husband: 'P1', wife: 'P2', children: ['P3'], marriage: '1848' },
                { id: 'F2', husband: 'P3', wife: 'P4', children: ['P5'], marriage: '1878' },
                { id: 'F3', husband: 'P5', wife: 'P6', children: ['P7'], marriage: '1908' }
            ]
        };
        this.indexData();
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

    getFilteredPersons() {
        // In a real implementation, this would filter based on family relationships
        return Object.values(this.persons);
    }

    getEvents(person) {
        const events = [];

        if (this.eventTypes.birth && person.birth) {
            events.push({
                type: 'birth',
                year: this.parseYear(person.birth),
                date: person.birth,
                person: person,
                label: 'Geburt'
            });
        }

        if (this.eventTypes.death && person.death) {
            events.push({
                type: 'death',
                year: this.parseYear(person.death),
                date: person.death,
                person: person,
                label: 'Tod'
            });
        }

        // Marriage events
        if (this.eventTypes.marriage && person.familySpouse) {
            person.familySpouse.forEach(famId => {
                const family = this.families[famId];
                if (family?.marriage) {
                    events.push({
                        type: 'marriage',
                        year: this.parseYear(family.marriage),
                        date: family.marriage,
                        person: person,
                        label: 'Heirat'
                    });
                }
            });
        }

        return events;
    }

    parseYear(dateStr) {
        if (!dateStr) return null;
        const match = dateStr.match(/\d{4}/);
        return match ? parseInt(match[0]) : null;
    }

    render() {
        this.renderHeader();
        this.renderBody();
    }

    renderHeader() {
        const header = document.getElementById('timeline-header');
        if (!header) return;

        const years = [];
        const step = this.zoomLevel >= 20 ? 50 : this.zoomLevel >= 10 ? 20 : 10;

        for (let year = Math.ceil(this.yearFrom / step) * step; year <= this.yearTo; year += step) {
            years.push(year);
        }

        const pixelsPerYear = 100 / this.zoomLevel;
        const totalWidth = (this.yearTo - this.yearFrom) * pixelsPerYear;

        header.innerHTML = `
            <div class="header-content" style="width: ${totalWidth}px">
                ${years.map(year => `
                    <span class="year-marker" style="left: ${(year - this.yearFrom) * pixelsPerYear}px">
                        ${year}
                    </span>
                `).join('')}
            </div>
        `;
    }

    renderBody() {
        const body = document.getElementById('timeline-body');
        if (!body) return;

        const persons = this.getFilteredPersons();
        const pixelsPerYear = 100 / this.zoomLevel;
        const totalWidth = (this.yearTo - this.yearFrom) * pixelsPerYear;

        body.innerHTML = `
            <div class="body-content" style="width: ${totalWidth}px">
                ${persons.map(person => this.renderPersonRow(person, pixelsPerYear)).join('')}
            </div>
        `;
    }

    renderPersonRow(person, pixelsPerYear) {
        const birthYear = this.parseYear(person.birth);
        const deathYear = this.parseYear(person.death) || this.yearTo;

        if (!birthYear) return '';

        const left = (birthYear - this.yearFrom) * pixelsPerYear;
        const width = (deathYear - birthYear) * pixelsPerYear;
        const events = this.getEvents(person);

        return `
            <div class="timeline-row" data-person-id="${person.id}">
                <div class="person-label">${person.name}</div>
                <div class="life-bar ${person.sex === 'F' ? 'female' : 'male'}"
                     style="left: ${left}px; width: ${width}px"
                     data-person-id="${person.id}">
                    ${events.map(event => {
                        const eventLeft = (event.year - birthYear) * pixelsPerYear;
                        return `
                            <span class="event-marker ${event.type}"
                                  style="left: ${eventLeft}px"
                                  data-type="${event.type}"
                                  data-year="${event.year}"
                                  data-person="${person.id}"
                                  title="${event.label}: ${event.date}">
                            </span>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }

    bindEvents() {
        // Time range inputs
        document.getElementById('year-from')?.addEventListener('change', (e) => {
            this.yearFrom = parseInt(e.target.value);
            this.render();
            this.updateStats();
        });

        document.getElementById('year-to')?.addEventListener('change', (e) => {
            this.yearTo = parseInt(e.target.value);
            this.render();
            this.updateStats();
        });

        // Filters
        document.getElementById('filter-direct')?.addEventListener('change', (e) => {
            this.filters.direct = e.target.checked;
            this.render();
        });

        document.getElementById('filter-siblings')?.addEventListener('change', (e) => {
            this.filters.siblings = e.target.checked;
            this.render();
        });

        document.getElementById('filter-spouses')?.addEventListener('change', (e) => {
            this.filters.spouses = e.target.checked;
            this.render();
        });

        // Event type filters
        document.querySelectorAll('.event-types input').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.eventTypes[e.target.dataset.event] = e.target.checked;
                this.render();
                this.updateStats();
            });
        });

        // Zoom controls
        document.getElementById('zoom-in')?.addEventListener('click', () => this.zoom(0.7));
        document.getElementById('zoom-out')?.addEventListener('click', () => this.zoom(1.4));
        document.getElementById('zoom-fit')?.addEventListener('click', () => this.zoomToFit());

        // Event selection
        document.getElementById('timeline-body')?.addEventListener('click', (e) => {
            const marker = e.target.closest('.event-marker');
            if (marker) {
                this.showEventDetail(marker);
            }
        });
    }

    zoom(factor) {
        this.zoomLevel = Math.max(2, Math.min(50, this.zoomLevel * factor));
        this.updateZoomInfo();
        this.render();
    }

    zoomToFit() {
        const container = document.getElementById('timeline-container');
        if (!container) return;

        const containerWidth = container.clientWidth - 150; // Account for labels
        const yearSpan = this.yearTo - this.yearFrom;
        this.zoomLevel = (yearSpan * 100) / containerWidth;
        this.updateZoomInfo();
        this.render();
    }

    updateZoomInfo() {
        const info = document.getElementById('zoom-info');
        if (info) {
            info.textContent = `${Math.round(this.zoomLevel)} Jahre/100px`;
        }
    }

    showEventDetail(marker) {
        const personId = marker.dataset.person;
        const eventType = marker.dataset.type;
        const year = marker.dataset.year;

        const person = this.persons[personId];
        if (!person) return;

        const detailSection = document.getElementById('event-detail');
        if (!detailSection) return;

        detailSection.classList.remove('hidden');

        const typeLabels = {
            birth: 'Geburt',
            marriage: 'Heirat',
            death: 'Tod',
            other: 'Ereignis'
        };

        document.getElementById('detail-type').textContent = typeLabels[eventType] || eventType;
        document.getElementById('detail-type').className = `event-type-badge ${eventType}`;
        document.getElementById('detail-person').textContent = person.name;
        document.getElementById('detail-date').textContent = year;

        // Get place based on event type
        let place = '–';
        if (eventType === 'birth') place = person.birthPlace || '–';
        if (eventType === 'death') place = person.deathPlace || '–';
        if (eventType === 'marriage') {
            const family = Object.values(this.families).find(f =>
                (f.husband === personId || f.wife === personId) &&
                this.parseYear(f.marriage) === parseInt(year)
            );
            place = family?.marriagePlace || '–';
        }
        document.getElementById('detail-place').textContent = place;
        document.getElementById('detail-info').textContent = '–';
    }

    updateStats() {
        const span = this.yearTo - this.yearFrom;
        document.getElementById('stat-span').textContent = `${span} Jahre`;

        const persons = this.getFilteredPersons();
        document.getElementById('stat-persons').textContent = persons.length;

        let eventCount = 0;
        persons.forEach(p => {
            eventCount += this.getEvents(p).length;
        });
        document.getElementById('stat-events').textContent = eventCount;
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
                this.zoom(0.7);
            }
            if (e.key === '-') {
                e.preventDefault();
                this.zoom(1.4);
            }

            // Scroll
            const container = document.getElementById('timeline-container');
            if (e.key === 'ArrowLeft') {
                container.scrollLeft -= 100;
            }
            if (e.key === 'ArrowRight') {
                container.scrollLeft += 100;
            }
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const app = new GenealogyZeitstrahl();
    app.init();
});

export default GenealogyZeitstrahl;
