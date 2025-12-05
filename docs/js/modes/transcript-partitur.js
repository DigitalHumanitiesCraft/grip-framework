/**
 * Transcript Partitur-Modus
 *
 * Mehrspur-Darstellung wie Notensystem mit überlappender Rede
 *
 * Benötigte Daten: interview{}, turns[], participants[]
 * Wissensbasis: 15-MODI#Transcript-Partitur
 */

class TranscriptPartitur {
    constructor(containerId, dataPath) {
        this.container = document.getElementById(containerId);
        this.dataPath = dataPath || '../data/reader-transcript.json';
        this.data = null;
        this.selectedTurn = null;
        this.zoomLevel = 100;
        this.pixelsPerSecond = 50;

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

        this.renderInterviewInfo();
        this.renderSpeakerList();
        this.renderTimeline();
        this.renderPartiturTracks();
        this.updateStats();
    }

    renderInterviewInfo() {
        const interview = this.data.interview;
        if (!interview) return;

        document.getElementById('interview-id').textContent = interview.id;
        document.getElementById('interview-title').textContent = interview.title;
        document.getElementById('interview-date').textContent = this.formatDate(interview.date);

        const totalSeconds = interview.duration_seconds || 0;
        document.getElementById('total-time').textContent = this.formatTime(totalSeconds * 1000);
    }

    renderSpeakerList() {
        const container = document.getElementById('speaker-list');
        if (!container) return;

        const participants = this.data.interview?.participants || [];
        const turns = this.data.turns || [];

        // Count turns per speaker
        const turnCounts = {};
        turns.forEach(turn => {
            turnCounts[turn.speaker] = (turnCounts[turn.speaker] || 0) + 1;
        });

        container.innerHTML = participants.map(p => `
            <li class="speaker-track-item" data-speaker="${p.id}">
                <span class="speaker-color" style="background: ${p.color}"></span>
                <span class="speaker-name">${p.pseudonym}</span>
                <span class="speaker-turns">${turnCounts[p.id] || 0}</span>
            </li>
        `).join('');
    }

    renderTimeline() {
        const container = document.getElementById('partitur-timeline');
        if (!container) return;

        const duration = this.data.interview?.duration_seconds || 240;
        const intervals = Math.ceil(duration / 30); // 30-second intervals

        let ticksHTML = '';
        for (let i = 0; i <= intervals; i++) {
            const seconds = i * 30;
            const position = (seconds / duration) * 100;
            ticksHTML += `
                <div class="timeline-tick" style="left: calc(100px + ${position}%)">
                    ${this.formatTime(seconds * 1000)}
                </div>
            `;
        }

        container.innerHTML = ticksHTML;
    }

    renderPartiturTracks() {
        const container = document.getElementById('partitur-tracks');
        if (!container) return;

        const participants = this.data.interview?.participants || [];
        const turns = this.data.turns || [];
        const duration = (this.data.interview?.duration_seconds || 240) * 1000;

        container.innerHTML = participants.map(participant => {
            const speakerTurns = turns.filter(t => t.speaker === participant.id);

            const segmentsHTML = speakerTurns.map(turn => {
                const left = (turn.start_ms / duration) * 100;
                const width = ((turn.end_ms - turn.start_ms) / duration) * 100;
                const isOverlap = turn.overlap_with !== undefined;
                const isSelected = this.selectedTurn === turn.id;

                return `
                    <div class="turn-segment ${isOverlap ? 'overlap' : ''} ${isSelected ? 'selected' : ''}"
                         data-turn="${turn.id}"
                         style="left: ${left}%; width: ${width}%; background: ${participant.color}20; border-color: ${participant.color}">
                        <span class="turn-text-preview">${this.truncate(turn.text, 30)}</span>
                    </div>
                `;
            }).join('');

            return `
                <div class="partitur-track" data-speaker="${participant.id}">
                    <div class="track-label" style="border-color: ${participant.color}">
                        <span class="speaker-color" style="background: ${participant.color}"></span>
                        ${participant.pseudonym}
                    </div>
                    <div class="track-content">
                        ${segmentsHTML}
                    </div>
                </div>
            `;
        }).join('');
    }

    updateStats() {
        const turns = this.data.turns || [];
        const stats = this.data.statistics || {};

        document.getElementById('stat-turns').textContent = turns.length;
        document.getElementById('stat-words').textContent = stats.word_count || 0;

        // Count overlaps
        const overlaps = turns.filter(t => t.overlap_with !== undefined).length;
        document.getElementById('stat-overlaps').textContent = overlaps;
    }

    selectTurn(turnId) {
        this.selectedTurn = turnId;
        this.renderPartiturTracks();
        this.showTurnDetail(turnId);
    }

    showTurnDetail(turnId) {
        const turn = (this.data.turns || []).find(t => t.id === turnId);
        if (!turn) return;

        const participants = this.data.interview?.participants || [];
        const speaker = participants.find(p => p.id === turn.speaker);

        const prompt = document.getElementById('turn-prompt');
        const info = document.getElementById('turn-info');

        prompt?.classList.add('hidden');
        info?.classList.remove('hidden');

        document.getElementById('turn-speaker').textContent = speaker?.pseudonym || turn.speaker;
        document.getElementById('turn-speaker').style.color = speaker?.color || '#333';
        document.getElementById('turn-time').textContent =
            `${this.formatTime(turn.start_ms)} – ${this.formatTime(turn.end_ms)}`;
        document.getElementById('turn-text').textContent = turn.text;

        // Paralinguistics
        const paraList = document.getElementById('turn-paralinguistics');
        const paralinguistics = turn.paralinguistics || [];

        if (paralinguistics.length > 0) {
            paraList.innerHTML = paralinguistics.map(p => `
                <li>
                    <span class="para-type">${this.getParaLabel(p.type)}</span>
                    <span class="para-symbol">${p.symbol || ''}</span>
                </li>
            `).join('');
        } else {
            paraList.innerHTML = '<li>Keine Markierungen</li>';
        }

        // Codes
        const codesContainer = document.getElementById('turn-codes');
        const codebook = this.data.codebook || [];
        const codes = turn.codes || [];

        codesContainer.innerHTML = codes.map(codeId => {
            const code = codebook.find(c => c.id === codeId);
            return `<span class="code-badge" style="background: ${code?.color || '#888'}">${code?.label || codeId}</span>`;
        }).join('');
    }

    getParaLabel(type) {
        const labels = {
            'pause': 'Pause',
            'hesitation': 'Zögern',
            'repair': 'Reparatur',
            'emphasis': 'Betonung',
            'lengthening': 'Dehnung',
            'laughter': 'Lachen',
            'voice_quality': 'Stimmqualität',
            'trail_off': 'Abbruch'
        };
        return labels[type] || type;
    }

    formatDate(dateStr) {
        if (!dateStr) return '-';
        const [year, month, day] = dateStr.split('-');
        return `${day}.${month}.${year}`;
    }

    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    truncate(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    updateTimeSlider(value) {
        const duration = (this.data.interview?.duration_seconds || 240) * 1000;
        const currentMs = (value / 100) * duration;
        document.getElementById('current-time').textContent = this.formatTime(currentMs);
    }

    setZoom(delta) {
        this.zoomLevel = Math.max(50, Math.min(200, this.zoomLevel + delta));
        document.getElementById('zoom-level').textContent = `${this.zoomLevel}%`;
        this.pixelsPerSecond = 50 * (this.zoomLevel / 100);
        // Re-render would adjust track widths
    }

    bindEvents() {
        // Turn clicks
        document.getElementById('partitur-tracks')?.addEventListener('click', (e) => {
            const segment = e.target.closest('.turn-segment');
            if (segment) {
                this.selectTurn(parseInt(segment.dataset.turn));
            }
        });

        // Speaker list clicks
        document.getElementById('speaker-list')?.addEventListener('click', (e) => {
            const item = e.target.closest('.speaker-track-item');
            if (item) {
                const speakerId = item.dataset.speaker;
                const turns = this.data.turns || [];
                const firstTurn = turns.find(t => t.speaker === speakerId);
                if (firstTurn) {
                    this.selectTurn(firstTurn.id);
                }
            }
        });

        // Time slider
        document.getElementById('time-slider')?.addEventListener('input', (e) => {
            this.updateTimeSlider(parseInt(e.target.value));
        });

        // Zoom controls
        document.getElementById('zoom-in')?.addEventListener('click', () => this.setZoom(25));
        document.getElementById('zoom-out')?.addEventListener('click', () => this.setZoom(-25));
    }

    bindKeyboard() {
        document.addEventListener('keydown', (e) => {
            // Mode switching
            if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '4') {
                e.preventDefault();
                const modes = ['partitur', 'fliesstext', 'codierung', 'audio-sync'];
                window.location.href = `${modes[parseInt(e.key) - 1]}.html`;
            }

            // Navigation
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                this.navigateTurns(e.key === 'ArrowRight' ? 1 : -1);
            }

            // Zoom
            if (e.key === '+' || e.key === '=') {
                this.setZoom(25);
            }
            if (e.key === '-') {
                this.setZoom(-25);
            }
        });
    }

    navigateTurns(direction) {
        const turns = this.data.turns || [];
        const currentIndex = turns.findIndex(t => t.id === this.selectedTurn);

        let newIndex = currentIndex + direction;
        if (newIndex < 0) newIndex = turns.length - 1;
        if (newIndex >= turns.length) newIndex = 0;

        this.selectTurn(turns[newIndex].id);
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    new TranscriptPartitur('partitur-tracks');
});

export default TranscriptPartitur;
