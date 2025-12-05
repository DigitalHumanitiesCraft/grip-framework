/**
 * Transcript Audio-Sync-Modus
 *
 * Transkript mit Audioquelle verbinden, Karaoke-Highlighting
 *
 * Benötigte Daten: interview{}, turns[], audio_url
 * Wissensbasis: 15-MODI#Transcript-Audio-Sync
 */

class TranscriptAudioSync {
    constructor(containerId, dataPath) {
        this.container = document.getElementById(containerId);
        this.dataPath = dataPath || '../data/reader-transcript.json';
        this.data = null;
        this.currentTime = 0;
        this.isPlaying = false;
        this.playbackSpeed = 1;
        this.loopTurn = false;
        this.loopStart = 0;
        this.loopEnd = 0;
        this.activeTurnId = null;
        this.updateInterval = null;

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

        this.renderAudioInfo();
        this.renderJumpSelect();
        this.renderSyncedTranscript();
        this.updateTimeDisplay();
        this.updateStats();
    }

    renderAudioInfo() {
        const interview = this.data.interview;
        if (!interview) return;

        document.getElementById('audio-file').textContent = interview.audio_url || 'Keine Audio-Datei';
        document.getElementById('audio-duration').textContent = this.formatTime(interview.duration_seconds * 1000);
        document.getElementById('sync-title').textContent = interview.title || 'Audio-Synchronisation';
        document.getElementById('time-total').textContent = this.formatTime(interview.duration_seconds * 1000);
    }

    renderJumpSelect() {
        const select = document.getElementById('jump-to-turn');
        if (!select) return;

        const turns = this.data.turns || [];
        const participants = this.data.interview?.participants || [];

        select.innerHTML = '<option value="">Turn auswählen...</option>' +
            turns.map(turn => {
                const speaker = participants.find(p => p.id === turn.speaker);
                return `<option value="${turn.id}">#${turn.id} ${speaker?.pseudonym || turn.speaker} [${this.formatTime(turn.start_ms)}]</option>`;
            }).join('');
    }

    renderSyncedTranscript() {
        const container = document.getElementById('synced-transcript');
        if (!container) return;

        const turns = this.data.turns || [];
        const participants = this.data.interview?.participants || [];

        container.innerHTML = turns.map(turn => {
            const speaker = participants.find(p => p.id === turn.speaker);
            const isPast = turn.end_ms < this.currentTime;
            const isActive = turn.start_ms <= this.currentTime && turn.end_ms >= this.currentTime;

            // Split text into words for karaoke effect
            const words = turn.text.split(' ').map((word, i) => {
                return `<span class="synced-word" data-word="${i}">${word}</span>`;
            }).join(' ');

            return `
                <div class="synced-turn ${isPast ? 'past' : ''} ${isActive ? 'active' : ''}"
                     data-turn="${turn.id}"
                     data-start="${turn.start_ms}"
                     data-end="${turn.end_ms}">
                    <div class="synced-turn-header">
                        <span class="synced-speaker" style="color: ${speaker?.color || '#333'}">
                            ${speaker?.pseudonym || turn.speaker}
                        </span>
                        <span class="synced-time">[${this.formatTime(turn.start_ms)}]</span>
                    </div>
                    <p class="synced-text">${words}</p>
                </div>
            `;
        }).join('');
    }

    updateTimeDisplay() {
        document.getElementById('time-current').textContent = this.formatTime(this.currentTime);
        document.getElementById('stat-position').textContent = this.formatTime(this.currentTime);

        const duration = (this.data.interview?.duration_seconds || 0) * 1000;
        const remaining = Math.max(0, duration - this.currentTime);
        document.getElementById('stat-remaining').textContent = this.formatTime(remaining);

        // Update waveform progress
        if (duration > 0) {
            const percent = (this.currentTime / duration) * 100;
            document.getElementById('waveform-progress').style.width = `${percent}%`;
        }
    }

    updateStats() {
        // Find current turn
        const turns = this.data.turns || [];
        const currentTurn = turns.find(t =>
            t.start_ms <= this.currentTime && t.end_ms >= this.currentTime
        );

        document.getElementById('stat-current-turn').textContent = currentTurn ? `#${currentTurn.id}` : '-';
    }

    updateActiveTurn() {
        const turns = this.data.turns || [];
        const currentTurn = turns.find(t =>
            t.start_ms <= this.currentTime && t.end_ms >= this.currentTime
        );

        if (currentTurn && currentTurn.id !== this.activeTurnId) {
            this.activeTurnId = currentTurn.id;
            this.showTurnInfo(currentTurn);

            // Update visual state
            document.querySelectorAll('.synced-turn').forEach(el => {
                const turnId = parseInt(el.dataset.turn);
                const start = parseInt(el.dataset.start);
                const end = parseInt(el.dataset.end);

                el.classList.toggle('past', end < this.currentTime);
                el.classList.toggle('active', turnId === this.activeTurnId);
            });

            // Scroll to active turn
            const activeTurnEl = document.querySelector(`.synced-turn[data-turn="${this.activeTurnId}"]`);
            activeTurnEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        // Karaoke highlighting within turn
        if (currentTurn) {
            this.updateKaraoke(currentTurn);
        }
    }

    updateKaraoke(turn) {
        const turnEl = document.querySelector(`.synced-turn[data-turn="${turn.id}"]`);
        if (!turnEl) return;

        const words = turnEl.querySelectorAll('.synced-word');
        const progress = (this.currentTime - turn.start_ms) / (turn.end_ms - turn.start_ms);
        const highlightIndex = Math.floor(progress * words.length);

        words.forEach((word, i) => {
            word.classList.toggle('spoken', i < highlightIndex);
            word.classList.toggle('highlighted', i === highlightIndex);
        });
    }

    showTurnInfo(turn) {
        const participants = this.data.interview?.participants || [];
        const speaker = participants.find(p => p.id === turn.speaker);
        const codebook = this.data.codebook || [];

        const prompt = document.getElementById('turn-prompt');
        const info = document.getElementById('turn-info');

        prompt?.classList.add('hidden');
        info?.classList.remove('hidden');

        document.getElementById('turn-speaker').textContent = speaker?.pseudonym || turn.speaker;
        document.getElementById('turn-speaker').style.color = speaker?.color || '#333';
        document.getElementById('turn-number').textContent = `#${turn.id}`;
        document.getElementById('turn-start').textContent = this.formatTime(turn.start_ms);
        document.getElementById('turn-end').textContent = this.formatTime(turn.end_ms);

        const duration = (turn.end_ms - turn.start_ms) / 1000;
        document.getElementById('turn-duration').textContent = `(${duration.toFixed(1)}s)`;

        // Codes
        const codesBadges = document.getElementById('turn-code-badges');
        const codes = turn.codes || [];
        codesBadges.innerHTML = codes.map(codeId => {
            const code = codebook.find(c => c.id === codeId);
            return `<span class="code-badge" style="background: ${code?.color || '#888'}">${code?.label || codeId}</span>`;
        }).join('') || '<span style="color: var(--color-ink-light)">Keine Codes</span>';
    }

    togglePlay() {
        this.isPlaying = !this.isPlaying;

        const playBtn = document.getElementById('play-pause');
        playBtn.textContent = this.isPlaying ? '⏸' : '▶';
        playBtn.classList.toggle('playing', this.isPlaying);

        if (this.isPlaying) {
            this.startPlayback();
        } else {
            this.stopPlayback();
        }
    }

    startPlayback() {
        const duration = (this.data.interview?.duration_seconds || 0) * 1000;

        this.updateInterval = setInterval(() => {
            this.currentTime += 100 * this.playbackSpeed;

            // Handle looping
            if (this.loopTurn && this.activeTurnId) {
                const turn = (this.data.turns || []).find(t => t.id === this.activeTurnId);
                if (turn && this.currentTime >= turn.end_ms) {
                    this.currentTime = turn.start_ms;
                }
            }

            // Handle end
            if (this.currentTime >= duration) {
                this.currentTime = 0;
                this.isPlaying = false;
                this.stopPlayback();
                document.getElementById('play-pause').textContent = '▶';
                document.getElementById('play-pause').classList.remove('playing');
            }

            this.updateTimeDisplay();
            this.updateActiveTurn();
            this.updateStats();
        }, 100);
    }

    stopPlayback() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    seekTo(ms) {
        const duration = (this.data.interview?.duration_seconds || 0) * 1000;
        this.currentTime = Math.max(0, Math.min(ms, duration));
        this.updateTimeDisplay();
        this.updateActiveTurn();
        this.updateStats();
    }

    skip(seconds) {
        this.seekTo(this.currentTime + seconds * 1000);
    }

    setSpeed(speed) {
        this.playbackSpeed = speed;
        document.querySelectorAll('.speed-btn').forEach(btn => {
            btn.classList.toggle('active', parseFloat(btn.dataset.speed) === speed);
        });
    }

    jumpToTurn(turnId) {
        const turn = (this.data.turns || []).find(t => t.id === turnId);
        if (turn) {
            this.seekTo(turn.start_ms);
        }
    }

    formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    bindEvents() {
        // Play/Pause
        document.getElementById('play-pause')?.addEventListener('click', () => this.togglePlay());

        // Skip buttons
        document.getElementById('skip-back')?.addEventListener('click', () => this.skip(-10));
        document.getElementById('skip-forward')?.addEventListener('click', () => this.skip(10));

        // Speed buttons
        document.querySelectorAll('.speed-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setSpeed(parseFloat(btn.dataset.speed));
            });
        });

        // Loop toggle
        document.getElementById('loop-turn')?.addEventListener('change', (e) => {
            this.loopTurn = e.target.checked;
            document.getElementById('loop-range-controls').classList.toggle('hidden', !this.loopTurn);
        });

        // Jump select
        document.getElementById('jump-to-turn')?.addEventListener('change', (e) => {
            const turnId = parseInt(e.target.value);
            if (turnId) {
                this.jumpToTurn(turnId);
            }
        });

        // Click on turn to seek
        document.getElementById('synced-transcript')?.addEventListener('click', (e) => {
            const turn = e.target.closest('.synced-turn');
            if (turn) {
                const startMs = parseInt(turn.dataset.start);
                this.seekTo(startMs);
            }
        });

        // Waveform click to seek
        document.getElementById('waveform')?.addEventListener('click', (e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            const duration = (this.data.interview?.duration_seconds || 0) * 1000;
            this.seekTo(percent * duration);
        });
    }

    bindKeyboard() {
        document.addEventListener('keydown', (e) => {
            // Mode switching
            if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '4') {
                e.preventDefault();
                const modes = ['partitur', 'fliesstext', 'codierung', 'audio-sync'];
                window.location.href = `${modes[parseInt(e.key) - 1]}.html`;
            }

            // Playback controls
            if (e.key === ' ') {
                e.preventDefault();
                this.togglePlay();
            }

            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                this.skip(-5);
            }

            if (e.key === 'ArrowRight') {
                e.preventDefault();
                this.skip(5);
            }

            if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateTurns(-1);
            }

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateTurns(1);
            }
        });
    }

    navigateTurns(direction) {
        const turns = this.data.turns || [];
        const currentIndex = turns.findIndex(t => t.id === this.activeTurnId);

        let newIndex = currentIndex + direction;
        if (newIndex < 0) newIndex = turns.length - 1;
        if (newIndex >= turns.length) newIndex = 0;

        this.jumpToTurn(turns[newIndex].id);
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    new TranscriptAudioSync('synced-transcript');
});

export default TranscriptAudioSync;
