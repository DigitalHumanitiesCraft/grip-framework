/**
 * Protokoll Chronologie-Modus
 *
 * Sitzungsverlauf in Echtzeit-Abfolge mit Timeline-Scrubber
 *
 * Benötigte Daten: session{}, segments[], attendance[]
 * Wissensbasis: 15-MODI#Protokoll-Chronologie
 */

class ProtokollChronologie {
    constructor(containerId, dataPath) {
        this.container = document.getElementById(containerId);
        this.dataPath = dataPath || '../data/reader-protokoll.json';
        this.data = null;
        this.segments = [];
        this.filteredSegments = [];
        this.selectedSegment = null;
        this.visibleTypes = new Set(['statement', 'procedural', 'vote', 'resolution', 'report', 'response']);
        this.isPlaying = false;
        this.playInterval = null;

        this.init();
    }

    async init() {
        try {
            const response = await fetch(this.dataPath);
            this.data = await response.json();
            this.segments = this.data.segments || [];
            this.filteredSegments = [...this.segments];
            this.render();
            this.bindEvents();
            this.bindKeyboard();
        } catch (error) {
            console.error('Fehler beim Laden der Daten:', error);
        }
    }

    render() {
        if (!this.data) return;

        this.renderSessionInfo();
        this.renderSpeakingTimeBar();
        this.renderSegments();
        this.updateStats();
    }

    renderSessionInfo() {
        const session = this.data.session;
        if (!session) return;

        document.getElementById('session-date').textContent = this.formatDate(session.date);
        document.getElementById('session-number').textContent = `#${session.number}`;
        document.getElementById('session-chair').textContent = session.chair?.name || '-';

        document.getElementById('time-start').textContent = session.start_time || '14:00';
        document.getElementById('time-end').textContent = session.end_time || '17:45';
    }

    renderSpeakingTimeBar() {
        const container = document.getElementById('speaking-time-bar');
        if (!container) return;

        const speakerTimes = this.data.statistics?.speaking_time_minutes || {};
        const totalTime = Object.values(speakerTimes).reduce((a, b) => a + b, 0);

        if (totalTime === 0) {
            container.innerHTML = '<div class="time-segment" style="width: 100%; background: #ccc;">Keine Daten</div>';
            return;
        }

        const attendees = this.data.attendance || [];
        const parties = this.data.parties || [];
        const partyColors = {};
        parties.forEach(p => partyColors[p.id] = p.color);

        container.innerHTML = Object.entries(speakerTimes)
            .sort((a, b) => b[1] - a[1])
            .map(([speakerId, minutes]) => {
                const speaker = attendees.find(a => a.id === speakerId);
                const width = (minutes / totalTime) * 100;
                const color = speaker ? partyColors[speaker.party] || '#888' : '#888';
                const name = speaker?.name?.split(' ').pop() || speakerId;

                return `
                    <div class="time-segment"
                         style="width: ${width}%; background: ${color}"
                         data-speaker="${speakerId}"
                         title="${speaker?.name || speakerId}: ${minutes} Min.">
                        <span>${width > 8 ? name : ''}</span>
                    </div>
                `;
            }).join('');
    }

    renderSegments() {
        const container = document.getElementById('segments-list');
        if (!container) return;

        this.filteredSegments = this.segments.filter(seg =>
            this.visibleTypes.has(seg.type)
        );

        const attendees = this.data.attendance || [];
        const parties = this.data.parties || [];
        const partyColors = {};
        parties.forEach(p => partyColors[p.id] = p.color);

        container.innerHTML = this.filteredSegments.map(segment => {
            const speaker = segment.speaker ? attendees.find(a => a.id === segment.speaker) : null;
            const partyColor = speaker ? partyColors[speaker.party] || '#888' : '#888';
            const isSelected = this.selectedSegment === segment.id;

            return `
                <div class="segment-card ${isSelected ? 'selected' : ''}" data-segment="${segment.id}">
                    <div class="segment-timestamp">${segment.timestamp}</div>
                    <div class="segment-body">
                        <div class="segment-header">
                            ${speaker ? `
                                <span class="segment-speaker">${speaker.name}</span>
                                <span class="segment-party-badge" style="background: ${partyColor}">${speaker.party}</span>
                            ` : '<span class="segment-speaker">Protokoll</span>'}
                            <span class="segment-type-badge ${segment.type}">${this.getTypeLabel(segment.type)}</span>
                        </div>
                        <p class="segment-text">${segment.text}</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    getTypeLabel(type) {
        const labels = {
            'statement': 'Aussage',
            'procedural': 'Verfahren',
            'vote': 'Abstimmung',
            'resolution': 'Beschluss',
            'report': 'Bericht',
            'response': 'Antwort'
        };
        return labels[type] || type;
    }

    updateStats() {
        const stats = this.data.statistics || {};

        document.getElementById('stat-duration').textContent = `${stats.duration_minutes || 0} Min.`;
        document.getElementById('stat-segments').textContent = stats.total_segments || this.segments.length;

        const speakerCount = Object.keys(stats.speakers || {}).length;
        document.getElementById('stat-speakers').textContent = speakerCount;
    }

    selectSegment(segmentId) {
        this.selectedSegment = segmentId;
        this.renderSegments();
        this.showSegmentDetail(segmentId);
    }

    showSegmentDetail(segmentId) {
        const segment = this.segments.find(s => s.id === segmentId);
        if (!segment) return;

        const prompt = document.getElementById('segment-prompt');
        const info = document.getElementById('segment-info');

        prompt?.classList.add('hidden');
        info?.classList.remove('hidden');

        document.getElementById('seg-time').textContent = segment.timestamp;
        document.getElementById('seg-type').textContent = this.getTypeLabel(segment.type);

        const attendees = this.data.attendance || [];
        const speaker = segment.speaker ? attendees.find(a => a.id === segment.speaker) : null;

        document.getElementById('seg-speaker').textContent = speaker?.name || 'Protokoll';
        document.getElementById('seg-party').textContent = speaker ? `${speaker.party} - ${speaker.role}` : '';
        document.getElementById('seg-text').textContent = segment.text;

        // Tagesordnung finden
        const agenda = this.data.agenda || [];
        const agendaItem = agenda.find(a =>
            segmentId >= a.start_segment && segmentId <= a.end_segment
        );
        document.getElementById('seg-agenda').textContent = agendaItem
            ? `TOP ${agendaItem.number}: ${agendaItem.title}`
            : '-';
    }

    formatDate(dateStr) {
        if (!dateStr) return '-';
        const [year, month, day] = dateStr.split('-');
        return `${day}.${month}.${year}`;
    }

    updateTimeline(value) {
        const slider = document.getElementById('timeline-slider');
        const currentTime = document.getElementById('current-time');

        // Berechne Zeit basierend auf Slider-Position
        const startMinutes = this.parseTime(this.data.session?.start_time || '14:00');
        const endMinutes = this.parseTime(this.data.session?.end_time || '17:45');
        const currentMinutes = startMinutes + (endMinutes - startMinutes) * (value / 100);

        const hours = Math.floor(currentMinutes / 60);
        const mins = Math.floor(currentMinutes % 60);
        currentTime.textContent = `${hours}:${mins.toString().padStart(2, '0')}`;

        // Scroll zum passenden Segment
        const targetTime = `${hours}:${mins.toString().padStart(2, '0')}`;
        const targetSegment = this.filteredSegments.find(s => s.timestamp >= targetTime);

        if (targetSegment) {
            const card = document.querySelector(`[data-segment="${targetSegment.id}"]`);
            if (card) {
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }

    parseTime(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    togglePlay() {
        this.isPlaying = !this.isPlaying;

        if (this.isPlaying) {
            const slider = document.getElementById('timeline-slider');
            this.playInterval = setInterval(() => {
                let value = parseInt(slider.value) + 1;
                if (value > 100) {
                    value = 0;
                    this.isPlaying = false;
                    clearInterval(this.playInterval);
                }
                slider.value = value;
                this.updateTimeline(value);
            }, 500);
        } else {
            clearInterval(this.playInterval);
        }
    }

    bindEvents() {
        // Segment-Klick
        document.getElementById('segments-list')?.addEventListener('click', (e) => {
            const card = e.target.closest('.segment-card');
            if (card) {
                this.selectSegment(parseInt(card.dataset.segment));
            }
        });

        // Timeline-Slider
        document.getElementById('timeline-slider')?.addEventListener('input', (e) => {
            this.updateTimeline(parseInt(e.target.value));
        });

        // Speaking-Time-Bar Klick
        document.getElementById('speaking-time-bar')?.addEventListener('click', (e) => {
            const segment = e.target.closest('.time-segment');
            if (segment) {
                const speakerId = segment.dataset.speaker;
                // Filter auf diesen Sprecher
                const firstSegment = this.segments.find(s => s.speaker === speakerId);
                if (firstSegment) {
                    this.selectSegment(firstSegment.id);
                }
            }
        });

        // Filter-Checkboxen
        document.querySelectorAll('.segment-filter input').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const type = e.target.dataset.type;
                if (e.target.checked) {
                    this.visibleTypes.add(type);
                } else {
                    this.visibleTypes.delete(type);
                }
                this.renderSegments();
            });
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
                this.navigateSegments(e.key === 'ArrowDown' ? 1 : -1);
            }

            // Play/Pause
            if (e.key === ' ') {
                e.preventDefault();
                this.togglePlay();
            }
        });
    }

    navigateSegments(direction) {
        const currentIndex = this.filteredSegments.findIndex(s => s.id === this.selectedSegment);
        let newIndex = currentIndex + direction;

        if (newIndex < 0) newIndex = this.filteredSegments.length - 1;
        if (newIndex >= this.filteredSegments.length) newIndex = 0;

        const newSegment = this.filteredSegments[newIndex];
        if (newSegment) {
            this.selectSegment(newSegment.id);
            const card = document.querySelector(`[data-segment="${newSegment.id}"]`);
            card?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    new ProtokollChronologie('segments-list');
});

export default ProtokollChronologie;
