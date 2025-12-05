/**
 * Protokoll Sprecher-Modus
 *
 * Wer sagt was? Akteuranalyse und Positionsvergleich
 *
 * Benötigte Daten: segments[], attendance[], parties[]
 * Wissensbasis: 15-MODI#Protokoll-Sprecher
 */

class ProtokollSprecher {
    constructor(containerId, dataPath) {
        this.container = document.getElementById(containerId);
        this.dataPath = dataPath || '../data/reader-protokoll.json';
        this.data = null;
        this.selectedSpeaker = null;
        this.activeParties = new Set();

        this.init();
    }

    async init() {
        try {
            const response = await fetch(this.dataPath);
            this.data = await response.json();
            this.activeParties = new Set((this.data.parties || []).map(p => p.id));
            this.render();
            this.bindEvents();
            this.bindKeyboard();
        } catch (error) {
            console.error('Fehler beim Laden der Daten:', error);
        }
    }

    render() {
        if (!this.data) return;

        this.renderSpeakersList();
        this.renderPartyFilter();
        this.renderComparisonChart();
        this.renderSpeakerSegments();
    }

    renderSpeakersList() {
        const container = document.getElementById('speakers-list');
        if (!container) return;

        const speakerStats = this.data.statistics?.speakers || {};
        const attendees = this.data.attendance || [];
        const parties = this.data.parties || [];
        const partyColors = {};
        parties.forEach(p => partyColors[p.id] = p.color);

        // Sortiere nach Anzahl der Wortmeldungen
        const speakerData = Object.entries(speakerStats)
            .map(([id, count]) => {
                const speaker = attendees.find(a => a.id === id);
                return { id, count, speaker };
            })
            .filter(s => s.speaker && this.activeParties.has(s.speaker.party))
            .sort((a, b) => b.count - a.count);

        container.innerHTML = speakerData.map(({ id, count, speaker }) => {
            const color = partyColors[speaker.party] || '#888';
            const isActive = this.selectedSpeaker === id;

            return `
                <li class="speaker-item ${isActive ? 'active' : ''}" data-speaker="${id}">
                    <span class="speaker-color" style="background: ${color}"></span>
                    <span class="speaker-name">${speaker.name}</span>
                    <span class="speaker-count">${count}</span>
                </li>
            `;
        }).join('');
    }

    renderPartyFilter() {
        const container = document.getElementById('party-checkboxes');
        if (!container) return;

        const parties = this.data.parties || [];

        container.innerHTML = parties.map(party => `
            <label class="checkbox-label party-checkbox">
                <input type="checkbox" data-party="${party.id}"
                       ${this.activeParties.has(party.id) ? 'checked' : ''}>
                <span class="party-dot" style="background: ${party.color}"></span>
                ${party.name}
            </label>
        `).join('');
    }

    renderComparisonChart() {
        const container = document.getElementById('comparison-chart');
        if (!container) return;

        const speakerTimes = this.data.statistics?.speaking_time_minutes || {};
        const attendees = this.data.attendance || [];
        const parties = this.data.parties || [];
        const partyColors = {};
        parties.forEach(p => partyColors[p.id] = p.color);

        const maxTime = Math.max(...Object.values(speakerTimes), 1);

        const chartData = Object.entries(speakerTimes)
            .map(([id, minutes]) => {
                const speaker = attendees.find(a => a.id === id);
                return { id, minutes, speaker };
            })
            .filter(s => s.speaker && this.activeParties.has(s.speaker.party))
            .sort((a, b) => b.minutes - a.minutes);

        container.innerHTML = chartData.map(({ id, minutes, speaker }) => {
            const width = (minutes / maxTime) * 100;
            const color = partyColors[speaker.party] || '#888';

            return `
                <div class="chart-row" data-speaker="${id}">
                    <span class="chart-name">${speaker.name.split(' ').pop()}</span>
                    <div class="chart-bar-container">
                        <div class="chart-bar" style="width: ${width}%; background: ${color}"></div>
                    </div>
                    <span class="chart-value">${minutes} min</span>
                </div>
            `;
        }).join('');
    }

    renderSpeakerSegments() {
        const container = document.getElementById('speaker-segments');
        if (!container) return;

        if (!this.selectedSpeaker) {
            container.innerHTML = '<p class="empty-state">Wählen Sie einen Sprecher aus der Liste.</p>';
            return;
        }

        const segments = (this.data.segments || []).filter(s => s.speaker === this.selectedSpeaker);
        const agenda = this.data.agenda || [];

        container.innerHTML = segments.map(segment => {
            const agendaItem = agenda.find(a =>
                segment.id >= a.start_segment && segment.id <= a.end_segment
            );

            return `
                <div class="speaker-segment-card" data-segment="${segment.id}">
                    <div class="speaker-segment-header">
                        <span class="speaker-segment-time">${segment.timestamp}</span>
                        <span class="speaker-segment-agenda">${agendaItem ? `TOP ${agendaItem.number}` : ''}</span>
                    </div>
                    <p class="speaker-segment-text">${segment.text}</p>
                </div>
            `;
        }).join('');
    }

    selectSpeaker(speakerId) {
        this.selectedSpeaker = speakerId;
        this.renderSpeakersList();
        this.renderSpeakerSegments();
        this.showSpeakerDetail(speakerId);
    }

    showSpeakerDetail(speakerId) {
        const attendees = this.data.attendance || [];
        const speaker = attendees.find(a => a.id === speakerId);
        if (!speaker) return;

        const prompt = document.getElementById('speaker-prompt');
        const info = document.getElementById('speaker-info');

        prompt?.classList.add('hidden');
        info?.classList.remove('hidden');

        document.getElementById('spk-name').textContent = speaker.name;
        document.getElementById('spk-party').textContent = speaker.party;
        document.getElementById('spk-role').textContent = speaker.role;

        const stats = this.data.statistics || {};
        const count = stats.speakers?.[speakerId] || 0;
        const time = stats.speaking_time_minutes?.[speakerId] || 0;
        const totalTime = Object.values(stats.speaking_time_minutes || {}).reduce((a, b) => a + b, 0);
        const share = totalTime > 0 ? ((time / totalTime) * 100).toFixed(1) : 0;

        document.getElementById('spk-count').textContent = count;
        document.getElementById('spk-time').textContent = `${time} Min.`;
        document.getElementById('spk-share').textContent = `${share}%`;

        // Themen (Agenda-Punkte)
        const segments = (this.data.segments || []).filter(s => s.speaker === speakerId);
        const agenda = this.data.agenda || [];
        const topics = new Set();

        segments.forEach(seg => {
            const item = agenda.find(a => seg.id >= a.start_segment && seg.id <= a.end_segment);
            if (item) topics.add(item);
        });

        const topicsList = document.getElementById('spk-topics');
        topicsList.innerHTML = Array.from(topics).map(item =>
            `<li>TOP ${item.number}: ${item.title}</li>`
        ).join('') || '<li>Keine Themen</li>';
    }

    bindEvents() {
        // Sprecher-Liste
        document.getElementById('speakers-list')?.addEventListener('click', (e) => {
            const item = e.target.closest('.speaker-item');
            if (item) {
                this.selectSpeaker(item.dataset.speaker);
            }
        });

        // Chart-Klick
        document.getElementById('comparison-chart')?.addEventListener('click', (e) => {
            const row = e.target.closest('.chart-row');
            if (row) {
                this.selectSpeaker(row.dataset.speaker);
            }
        });

        // Partei-Filter
        document.getElementById('party-checkboxes')?.addEventListener('change', (e) => {
            const checkbox = e.target;
            if (checkbox.type === 'checkbox') {
                const party = checkbox.dataset.party;
                if (checkbox.checked) {
                    this.activeParties.add(party);
                } else {
                    this.activeParties.delete(party);
                }
                this.render();
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
                this.navigateSpeakers(e.key === 'ArrowDown' ? 1 : -1);
            }
        });
    }

    navigateSpeakers(direction) {
        const items = document.querySelectorAll('.speaker-item');
        const currentIndex = Array.from(items).findIndex(i => i.classList.contains('active'));

        let newIndex = currentIndex + direction;
        if (newIndex < 0) newIndex = items.length - 1;
        if (newIndex >= items.length) newIndex = 0;

        const newItem = items[newIndex];
        if (newItem) {
            this.selectSpeaker(newItem.dataset.speaker);
        }
    }
}

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    new ProtokollSprecher('speaker-segments');
});

export default ProtokollSprecher;
