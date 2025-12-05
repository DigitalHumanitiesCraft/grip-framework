/**
 * Transcript Fließtext-Modus
 *
 * Lesbare Darstellung für Inhaltsanalyse mit optionalen Marginalien
 *
 * Benötigte Daten: interview{}, turns[], codebook[]
 * Wissensbasis: 15-MODI#Transcript-Fließtext
 */

class TranscriptFliesstext {
    constructor(containerId, dataPath) {
        this.container = document.getElementById(containerId);
        this.dataPath = dataPath || '../data/reader-transcript.json';
        this.data = null;
        this.visibleSpeakers = new Set();
        this.showTimestamps = true;
        this.showCodes = true;
        this.showParalinguistics = true;
        this.hoveredCodes = [];

        this.init();
    }

    async init() {
        try {
            const response = await fetch(this.dataPath);
            this.data = await response.json();
            this.visibleSpeakers = new Set((this.data.interview?.participants || []).map(p => p.id));
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
        this.renderSpeakerFilter();
        this.renderTranscript();
        this.renderCodeSummary();
        this.renderJumpSelect();
        this.updateStats();
    }

    renderInterviewInfo() {
        const interview = this.data.interview;
        if (!interview) return;

        document.getElementById('interview-id').textContent = interview.id;
        document.getElementById('interview-title').textContent = interview.title;
        document.getElementById('fliesstext-title').textContent = interview.title;
        document.getElementById('interview-date').textContent = this.formatDate(interview.date);

        const durationMins = Math.ceil((interview.duration_seconds || 0) / 60);
        document.getElementById('interview-duration').textContent = `${durationMins} Min.`;

        const participants = interview.participants || [];
        document.getElementById('interview-participants').textContent = `${participants.length} Teilnehmer`;
    }

    renderSpeakerFilter() {
        const container = document.getElementById('speaker-checkboxes');
        if (!container) return;

        const participants = this.data.interview?.participants || [];

        container.innerHTML = participants.map(p => `
            <label class="checkbox-label speaker-checkbox">
                <input type="checkbox" data-speaker="${p.id}" ${this.visibleSpeakers.has(p.id) ? 'checked' : ''}>
                <span class="speaker-dot" style="background: ${p.color}"></span>
                ${p.pseudonym}
            </label>
        `).join('');
    }

    renderTranscript() {
        const container = document.getElementById('transcript-text');
        if (!container) return;

        const turns = this.data.turns || [];
        const participants = this.data.interview?.participants || [];
        const codebook = this.data.codebook || [];

        container.innerHTML = turns.map(turn => {
            const speaker = participants.find(p => p.id === turn.speaker);
            const isHidden = !this.visibleSpeakers.has(turn.speaker);

            // Process text with paralinguistics
            let processedText = this.processText(turn.text, turn.paralinguistics || []);

            // Create code badges for marginal
            const codeBadges = (turn.codes || []).map(codeId => {
                const code = codebook.find(c => c.id === codeId);
                return `<span class="marginal-code" style="background: ${code?.color || '#888'}">${code?.label || codeId}</span>`;
            }).join('');

            return `
                <div class="turn ${isHidden ? 'hidden' : ''}" data-turn="${turn.id}" data-speaker="${turn.speaker}">
                    <div class="turn-header">
                        <span class="turn-speaker-name" style="color: ${speaker?.color || '#333'}">${speaker?.pseudonym || turn.speaker}:</span>
                        <span class="turn-timestamp ${this.showTimestamps ? '' : 'hidden'}">[${this.formatTime(turn.start_ms)}]</span>
                    </div>
                    <div class="turn-content">
                        <p class="turn-text">${processedText}</p>
                        <div class="turn-marginal ${this.showCodes ? '' : 'hidden'}">${codeBadges}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    processText(text, paralinguistics) {
        if (!text) return '';

        let result = text;

        // Highlight paralinguistics if enabled
        if (this.showParalinguistics) {
            // Sort by position descending to replace from end
            const sorted = [...paralinguistics].sort((a, b) => (b.position || 0) - (a.position || 0));

            sorted.forEach(para => {
                if (para.symbol) {
                    // Already in text, wrap in span
                    result = result.replace(
                        para.symbol,
                        `<span class="para-inline ${para.type}">${para.symbol}</span>`
                    );
                }
            });
        }

        return result;
    }

    renderCodeSummary() {
        const container = document.getElementById('code-summary');
        if (!container) return;

        const codebook = this.data.codebook || [];
        const turns = this.data.turns || [];

        // Count code occurrences
        const codeCounts = {};
        turns.forEach(turn => {
            (turn.codes || []).forEach(code => {
                codeCounts[code] = (codeCounts[code] || 0) + 1;
            });
        });

        // Sort by frequency
        const sortedCodes = Object.entries(codeCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        container.innerHTML = sortedCodes.map(([codeId, count]) => {
            const code = codebook.find(c => c.id === codeId);
            return `
                <li>
                    <span class="code-dot" style="background: ${code?.color || '#888'}"></span>
                    ${code?.label || codeId}
                    <span class="code-count">${count}</span>
                </li>
            `;
        }).join('');
    }

    renderJumpSelect() {
        const select = document.getElementById('jump-to-turn');
        if (!select) return;

        const turns = this.data.turns || [];
        const participants = this.data.interview?.participants || [];

        select.innerHTML = '<option value="">Turn auswählen...</option>' +
            turns.map(turn => {
                const speaker = participants.find(p => p.id === turn.speaker);
                return `<option value="${turn.id}">#${turn.id} ${speaker?.pseudonym || turn.speaker}</option>`;
            }).join('');
    }

    updateStats() {
        const turns = this.data.turns || [];
        const visibleTurns = turns.filter(t => this.visibleSpeakers.has(t.speaker));

        document.getElementById('stat-visible').textContent = visibleTurns.length;
        document.getElementById('stat-words').textContent = this.data.statistics?.word_count || 0;

        // Estimate reading time (200 words per minute)
        const words = this.data.statistics?.word_count || 0;
        const readingTime = Math.ceil(words / 200);
        document.getElementById('stat-reading-time').textContent = `${readingTime} min`;
    }

    showCodeInfo(codes) {
        const codebook = this.data.codebook || [];
        const prompt = document.getElementById('code-prompt');
        const info = document.getElementById('code-info');
        const list = document.getElementById('active-code-list');

        if (codes.length === 0) {
            prompt?.classList.remove('hidden');
            info?.classList.add('hidden');
            return;
        }

        prompt?.classList.add('hidden');
        info?.classList.remove('hidden');

        list.innerHTML = codes.map(codeId => {
            const code = codebook.find(c => c.id === codeId);
            return `
                <div class="active-code-item">
                    <span class="code-color" style="background: ${code?.color || '#888'}"></span>
                    <div>
                        <div class="code-label">${code?.label || codeId}</div>
                        <div class="code-definition">${code?.definition || ''}</div>
                    </div>
                </div>
            `;
        }).join('');
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

    exportTXT() {
        const turns = this.data.turns || [];
        const participants = this.data.interview?.participants || [];

        const text = turns.map(turn => {
            const speaker = participants.find(p => p.id === turn.speaker);
            return `${speaker?.pseudonym || turn.speaker}: ${turn.text}`;
        }).join('\n\n');

        this.downloadFile(text, 'transcript.txt', 'text/plain');
    }

    downloadFile(content, filename, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    bindEvents() {
        // Speaker filter
        document.getElementById('speaker-checkboxes')?.addEventListener('change', (e) => {
            const checkbox = e.target;
            if (checkbox.type === 'checkbox') {
                const speaker = checkbox.dataset.speaker;
                if (checkbox.checked) {
                    this.visibleSpeakers.add(speaker);
                } else {
                    this.visibleSpeakers.delete(speaker);
                }
                this.renderTranscript();
                this.updateStats();
            }
        });

        // Display options
        document.getElementById('show-timestamps')?.addEventListener('change', (e) => {
            this.showTimestamps = e.target.checked;
            document.querySelectorAll('.turn-timestamp').forEach(el => {
                el.classList.toggle('hidden', !this.showTimestamps);
            });
        });

        document.getElementById('show-codes')?.addEventListener('change', (e) => {
            this.showCodes = e.target.checked;
            document.querySelectorAll('.turn-marginal').forEach(el => {
                el.classList.toggle('hidden', !this.showCodes);
            });
        });

        document.getElementById('show-paralinguistics')?.addEventListener('change', (e) => {
            this.showParalinguistics = e.target.checked;
            this.renderTranscript();
        });

        // Jump to turn
        document.getElementById('jump-to-turn')?.addEventListener('change', (e) => {
            const turnId = e.target.value;
            if (turnId) {
                const turnEl = document.querySelector(`[data-turn="${turnId}"]`);
                turnEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });

        // Turn hover for codes
        document.getElementById('transcript-text')?.addEventListener('mouseover', (e) => {
            const turn = e.target.closest('.turn');
            if (turn) {
                const turnId = parseInt(turn.dataset.turn);
                const turnData = (this.data.turns || []).find(t => t.id === turnId);
                if (turnData?.codes?.length > 0) {
                    this.showCodeInfo(turnData.codes);
                }
            }
        });

        // Export buttons
        document.getElementById('export-txt')?.addEventListener('click', () => this.exportTXT());
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
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
                this.navigateTurns(e.key === 'ArrowDown' ? 1 : -1);
            }
        });
    }

    navigateTurns(direction) {
        const turns = document.querySelectorAll('.turn:not(.hidden)');
        const currentFocused = document.querySelector('.turn:focus');
        let currentIndex = -1;

        turns.forEach((turn, i) => {
            if (turn === currentFocused) currentIndex = i;
        });

        let newIndex = currentIndex + direction;
        if (newIndex < 0) newIndex = turns.length - 1;
        if (newIndex >= turns.length) newIndex = 0;

        turns[newIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    new TranscriptFliesstext('transcript-text');
});

export default TranscriptFliesstext;
