/**
 * Transcript Module
 * Reader-Spezialisierung für Interviewtranskripte
 *
 * Kognitive Aufgabe: Qualitative Analyse von Gesprochenem
 *
 * UI-Elemente:
 * - Turn-Taking-Visualisierung mit Überlappungen
 * - Code-Margin für qualitative Codes
 * - Timestamp-Syncing mit Audio/Video
 * - Parasprachliche Markierungen (Pausen, Betonungen)
 * - Code-Häufigkeitsanzeige am Rand
 *
 * Datenstruktur (10-SPEZIALISIERUNGEN.md):
 * {
 *   interview: { id, date, duration_seconds, participants },
 *   turns: [{ speaker, start_ms, end_ms, text, codes, paralinguistics }],
 *   codebook: [{ code, definition }]
 * }
 */

export class Transcript {
    constructor() {
        this.data = null;
        this.codebook = new Map();
        this.activeTurn = null;
        this.mediaElement = null;
    }

    async init() {
        try {
            this.setupEventListeners();
            this.render();

            console.log('Transcript module initialized');
        } catch (error) {
            console.error('Error initializing Transcript:', error);
        }
    }

    setupEventListeners() {
        // Turn click
        document.getElementById('turns-container')?.addEventListener('click', (e) => {
            const turn = e.target.closest('.turn');
            if (turn) {
                this.selectTurn(turn.dataset.index);
            }
        });

        // Code search
        document.getElementById('code-search')?.addEventListener('input', (e) => {
            this.filterCodes(e.target.value);
        });

        // Jump to code
        document.getElementById('jump-to-code')?.addEventListener('change', (e) => {
            if (e.target.value) {
                this.jumpToCode(e.target.value);
            }
        });

        // Code assignment
        document.getElementById('assign-btn')?.addEventListener('click', () => {
            this.assignCode();
        });
    }

    render() {
        this.renderInterviewInfo();
        this.renderParticipants();
        this.renderCodebook();
        this.renderTurns();
        this.renderCodeChart();
        this.renderStats();
    }

    renderInterviewInfo() {}
    renderParticipants() {}
    renderCodebook() {}
    renderTurns() {}
    renderCodeChart() {}
    renderStats() {}

    selectTurn(index) {}
    filterCodes(query) {}
    jumpToCode(code) {}
    assignCode() {}

    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}
