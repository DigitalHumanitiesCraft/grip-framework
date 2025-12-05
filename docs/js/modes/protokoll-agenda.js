/**
 * Protokoll Agenda-Modus
 *
 * Strukturierter Zugang über Tagesordnung
 *
 * Benötigte Daten: agenda[], segments[], resolutions[]
 * Wissensbasis: 15-MODI#Protokoll-Agenda
 */

class ProtokollAgenda {
    constructor(containerId, dataPath) {
        this.container = document.getElementById(containerId);
        this.dataPath = dataPath || '../data/reader-protokoll.json';
        this.data = null;
        this.selectedTOP = null;

        this.init();
    }

    async init() {
        try {
            const response = await fetch(this.dataPath);
            this.data = await response.json();
            this.render();
            this.bindEvents();
            this.bindKeyboard();
        } catch (error) {
            console.error('Fehler beim Laden der Daten:', error);
        }
    }

    render() {
        if (!this.data) return;

        this.renderAgendaList();
        this.updateProgress();

        // Ersten TOP automatisch auswählen
        const agenda = this.data.agenda || [];
        if (agenda.length > 0 && !this.selectedTOP) {
            this.selectTOP(agenda[0].number);
        }
    }

    renderAgendaList() {
        const container = document.getElementById('agenda-list');
        if (!container) return;

        const agenda = this.data.agenda || [];

        container.innerHTML = agenda.map(item => {
            const isActive = this.selectedTOP === item.number;

            return `
                <li class="agenda-item ${isActive ? 'active' : ''}" data-top="${item.number}">
                    <div class="agenda-item-content">
                        <div class="agenda-item-title">${item.title}</div>
                        <span class="agenda-item-status ${item.status}">${this.getStatusLabel(item.status)}</span>
                    </div>
                </li>
            `;
        }).join('');
    }

    getStatusLabel(status) {
        const labels = {
            'approved': 'Angenommen',
            'rejected': 'Abgelehnt',
            'deferred': 'Vertagt',
            'noted': 'Kenntnisnahme'
        };
        return labels[status] || status;
    }

    updateProgress() {
        const agenda = this.data.agenda || [];
        const completed = agenda.filter(a => ['approved', 'rejected', 'noted'].includes(a.status)).length;
        const total = agenda.length;

        const fill = document.getElementById('progress-fill');
        const text = document.getElementById('progress-text');

        if (fill) {
            fill.style.width = `${(completed / total) * 100}%`;
        }
        if (text) {
            text.textContent = `${completed} / ${total} TOP`;
        }
    }

    selectTOP(topNumber) {
        this.selectedTOP = topNumber;
        this.renderAgendaList();
        this.renderTOPDetail(topNumber);
        this.showTOPSummary(topNumber);
    }

    renderTOPDetail(topNumber) {
        const agenda = this.data.agenda || [];
        const item = agenda.find(a => a.number === topNumber);
        if (!item) return;

        document.getElementById('top-number').textContent = `TOP ${item.number}`;
        document.getElementById('top-title').textContent = item.title;

        const statusEl = document.getElementById('top-status');
        statusEl.textContent = this.getStatusLabel(item.status);
        statusEl.className = `top-status ${item.status}`;

        // Segmente für diesen TOP
        const segments = (this.data.segments || []).filter(s =>
            s.id >= item.start_segment && s.id <= item.end_segment
        );

        const attendees = this.data.attendance || [];
        const topSegments = document.getElementById('top-segments');

        topSegments.innerHTML = segments.map(seg => {
            const speaker = seg.speaker ? attendees.find(a => a.id === seg.speaker) : null;

            return `
                <div class="top-segment">
                    <span class="top-segment-time">${seg.timestamp}</span>
                    <div class="top-segment-content">
                        <div class="top-segment-speaker">${speaker?.name || 'Protokoll'}</div>
                        <p class="top-segment-text">${seg.text}</p>
                    </div>
                </div>
            `;
        }).join('');

        // Resolution
        const resolutions = this.data.resolutions || [];
        const resolution = resolutions.find(r => r.agenda_item === topNumber);
        const resolutionEl = document.getElementById('top-resolution');

        if (resolution) {
            resolutionEl.innerHTML = `
                <h4>Beschluss</h4>
                <p>${resolution.text}</p>
            `;
            resolutionEl.style.display = 'block';
        } else {
            resolutionEl.style.display = 'none';
        }
    }

    showTOPSummary(topNumber) {
        const agenda = this.data.agenda || [];
        const item = agenda.find(a => a.number === topNumber);
        if (!item) return;

        const prompt = document.getElementById('summary-prompt');
        const info = document.getElementById('summary-info');

        prompt?.classList.add('hidden');
        info?.classList.remove('hidden');

        // Segmente für diesen TOP
        const segments = (this.data.segments || []).filter(s =>
            s.id >= item.start_segment && s.id <= item.end_segment
        );

        // Dauer berechnen
        const firstTime = segments[0]?.timestamp || '00:00';
        const lastTime = segments[segments.length - 1]?.timestamp || '00:00';
        const duration = this.calculateDuration(firstTime, lastTime);

        document.getElementById('sum-duration').textContent = `${duration} Min.`;
        document.getElementById('sum-segments').textContent = segments.length;

        // Sprecher zählen
        const speakerCounts = {};
        const attendees = this.data.attendance || [];

        segments.forEach(seg => {
            if (seg.speaker) {
                speakerCounts[seg.speaker] = (speakerCounts[seg.speaker] || 0) + 1;
            }
        });

        document.getElementById('sum-speakers').textContent = Object.keys(speakerCounts).length;

        // Sprecher-Liste
        const speakerList = document.getElementById('sum-speaker-list');
        speakerList.innerHTML = Object.entries(speakerCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([id, count]) => {
                const speaker = attendees.find(a => a.id === id);
                return `<li>${speaker?.name || id} <span>(${count})</span></li>`;
            }).join('');

        // Ergebnis
        document.getElementById('sum-result').textContent = this.getStatusLabel(item.status);
    }

    calculateDuration(start, end) {
        const [startH, startM] = start.split(':').map(Number);
        const [endH, endM] = end.split(':').map(Number);

        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;

        return Math.max(0, endMinutes - startMinutes);
    }

    bindEvents() {
        // Agenda-Liste
        document.getElementById('agenda-list')?.addEventListener('click', (e) => {
            const item = e.target.closest('.agenda-item');
            if (item) {
                this.selectTOP(parseInt(item.dataset.top));
            }
        });
    }

    bindKeyboard() {
        document.addEventListener('keydown', (e) => {
            // Modi-Wechsel
            if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '4') {
                e.preventDefault();
                const modes = ['chronologie', 'sprecher', 'abstimmung', 'agenda'];
                window.location.href = `${modes[parseInt(e.key) - 1]}.html`;
            }

            // Navigation
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateTOPs(e.key === 'ArrowDown' ? 1 : -1);
            }

            // Enter zum Springen
            if (e.key === 'Enter') {
                const content = document.getElementById('top-segments');
                content?.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    navigateTOPs(direction) {
        const agenda = this.data.agenda || [];
        const currentIndex = agenda.findIndex(a => a.number === this.selectedTOP);

        let newIndex = currentIndex + direction;
        if (newIndex < 0) newIndex = agenda.length - 1;
        if (newIndex >= agenda.length) newIndex = 0;

        this.selectTOP(agenda[newIndex].number);
    }
}

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    new ProtokollAgenda('top-segments');
});

export default ProtokollAgenda;
