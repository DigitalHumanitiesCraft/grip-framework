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
            const response = await fetch('../examples/data/reader-transcript.json');
            this.data = await response.json();

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

    renderInterviewInfo() {
        const interview = this.data?.interview;
        if (!interview) return;

        document.getElementById('interview-id').textContent = interview.id;
        document.getElementById('interview-date').textContent = interview.date;
        document.getElementById('interview-duration').textContent = this.formatTime(interview.duration_seconds * 1000);

        // Update time display
        const timeDisplay = document.getElementById('time-display');
        if (timeDisplay) {
            timeDisplay.textContent = `00:00 / ${this.formatTime(interview.duration_seconds * 1000)}`;
        }
    }

    renderParticipants() {
        const list = document.getElementById('participants-list');
        if (!list || !this.data?.participants) return;

        list.innerHTML = this.data.participants.map(p => `
            <li class="participant-item participant-${p.role}">
                <span class="participant-id">${p.id}</span>
                <span class="participant-pseudonym">${p.pseudonym}</span>
                <span class="participant-role">${p.role}</span>
                ${p.demographics ? `
                    <span class="participant-demo">${p.demographics.age || ''}, ${p.demographics.profession || ''}</span>
                ` : ''}
            </li>
        `).join('');
    }

    renderCodebook() {
        const list = document.getElementById('code-list');
        const jumpSelect = document.getElementById('jump-to-code');
        const assignSelect = document.getElementById('assign-code');
        if (!this.data?.codebook) return;

        // Build codebook map
        this.data.codebook.forEach(c => {
            this.codebook.set(c.code, c);
        });

        // Count code occurrences
        const codeCounts = {};
        this.data.turns?.forEach(turn => {
            turn.codes?.forEach(code => {
                codeCounts[code] = (codeCounts[code] || 0) + 1;
            });
        });

        if (list) {
            list.innerHTML = this.data.codebook.map(c => `
                <li class="code-item" data-code="${c.code}">
                    <span class="code-color" style="background-color: ${c.color}"></span>
                    <span class="code-name">${c.code.replace(/_/g, ' ')}</span>
                    <span class="code-count">${codeCounts[c.code] || 0}</span>
                </li>
            `).join('');
        }

        // Populate selects
        const options = this.data.codebook.map(c =>
            `<option value="${c.code}">${c.code.replace(/_/g, ' ')}</option>`
        ).join('');

        if (jumpSelect) {
            jumpSelect.innerHTML = '<option value="">-- Auswählen --</option>' + options;
        }
        if (assignSelect) {
            assignSelect.innerHTML = '<option value="">-- Code wählen --</option>' + options;
        }
    }

    renderTurns() {
        const container = document.getElementById('turns-container');
        const turnCounter = document.getElementById('turn-counter');
        if (!container || !this.data?.turns) return;

        container.innerHTML = this.data.turns.map((turn, idx) => {
            // Process paralinguistics
            let text = turn.text;
            const paralinguistics = turn.paralinguistics || [];

            // Sort by position descending to not mess up indices
            const sortedPara = [...paralinguistics].sort((a, b) => b.position - a.position);
            sortedPara.forEach(p => {
                const marker = this.getParalinguisticMarker(p);
                text = text.slice(0, p.position) + marker + text.slice(p.position);
            });

            // Get participant info
            const participant = this.data.participants?.find(p => p.id === turn.speaker);
            const speakerName = participant?.pseudonym || turn.speaker;

            // Render codes
            const codesHtml = turn.codes?.map(code => {
                const codeInfo = this.codebook.get(code);
                return `<span class="code-tag" style="background-color: ${codeInfo?.color || '#888'}">${code.replace(/_/g, ' ')}</span>`;
            }).join('') || '';

            return `
                <div class="turn ${this.activeTurn === idx ? 'active' : ''}"
                     data-index="${idx}"
                     data-start="${turn.start_ms}"
                     data-end="${turn.end_ms}">
                    <div class="turn-header">
                        <span class="speaker speaker-${turn.speaker}">${turn.speaker}</span>
                        <span class="speaker-name">${speakerName}</span>
                        <span class="timestamp">${this.formatTime(turn.start_ms)}</span>
                    </div>
                    <div class="turn-text">${text}</div>
                    ${codesHtml ? `<div class="turn-codes">${codesHtml}</div>` : ''}
                </div>
            `;
        }).join('');

        if (turnCounter) {
            turnCounter.textContent = `Turn 0 / ${this.data.turns.length}`;
        }
    }

    getParalinguisticMarker(p) {
        switch (p.type) {
            case 'pause':
                if (p.duration === 'short') return '<span class="para para-pause">(.)</span>';
                if (p.duration === 'long') return `<span class="para para-pause">(${p.duration_sec || 2.0})</span>`;
                return '<span class="para para-pause">(.)</span>';
            case 'hesitation':
                return '<span class="para para-hesitation">äh</span>';
            case 'laugh':
                return '<span class="para para-laugh">((lacht))</span>';
            case 'emphasis':
                return '<span class="para para-emphasis">*</span>';
            default:
                return '';
        }
    }

    renderCodeChart() {
        const chart = document.getElementById('code-chart');
        if (!chart || !this.data?.codebook) return;

        // Count code occurrences
        const codeCounts = {};
        this.data.turns?.forEach(turn => {
            turn.codes?.forEach(code => {
                codeCounts[code] = (codeCounts[code] || 0) + 1;
            });
        });

        const maxCount = Math.max(...Object.values(codeCounts), 1);

        chart.innerHTML = this.data.codebook.map(c => {
            const count = codeCounts[c.code] || 0;
            return `
                <div class="code-bar-row">
                    <span class="code-bar-label">${c.code.replace(/_/g, ' ').slice(0, 12)}</span>
                    <div class="code-bar" style="width: ${(count / maxCount) * 100}%; background-color: ${c.color}">
                        <span class="code-bar-count">${count}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderStats() {
        const turns = this.data?.turns || [];
        const codedTurns = turns.filter(t => t.codes && t.codes.length > 0).length;
        const usedCodes = new Set(turns.flatMap(t => t.codes || [])).size;

        document.getElementById('stat-turns').textContent = turns.length;
        document.getElementById('stat-coded').textContent = codedTurns;
        document.getElementById('stat-codes-used').textContent = usedCodes;
    }

    selectTurn(index) {
        this.activeTurn = parseInt(index);
        const turn = this.data?.turns?.[this.activeTurn];
        if (!turn) return;

        // Highlight active turn
        document.querySelectorAll('.turn').forEach(el => el.classList.remove('active'));
        document.querySelector(`.turn[data-index="${index}"]`)?.classList.add('active');

        // Update detail panel
        const turnInfo = document.getElementById('turn-info');
        if (turnInfo) {
            turnInfo.classList.remove('hidden');
        }

        const participant = this.data.participants?.find(p => p.id === turn.speaker);
        document.getElementById('detail-speaker').textContent = participant?.pseudonym || turn.speaker;
        document.getElementById('detail-time').textContent =
            `${this.formatTime(turn.start_ms)} - ${this.formatTime(turn.end_ms)}`;
        document.getElementById('detail-codes').textContent =
            turn.codes?.map(c => c.replace(/_/g, ' ')).join(', ') || 'keine';

        // Paralinguistics
        const paraList = document.getElementById('paralinguistics-list');
        if (paraList) {
            if (turn.paralinguistics?.length > 0) {
                paraList.innerHTML = turn.paralinguistics.map(p =>
                    `<li class="para-item para-${p.type}">${p.type}${p.duration ? ` (${p.duration})` : ''}</li>`
                ).join('');
            } else {
                paraList.innerHTML = '<li class="para-none">keine</li>';
            }
        }

        // Update turn counter
        const turnCounter = document.getElementById('turn-counter');
        if (turnCounter) {
            turnCounter.textContent = `Turn ${this.activeTurn + 1} / ${this.data.turns.length}`;
        }

        // Enable assign button
        const assignBtn = document.getElementById('assign-btn');
        if (assignBtn) {
            assignBtn.disabled = false;
        }
    }

    filterCodes(query) {
        const items = document.querySelectorAll('.code-item');
        const lowerQuery = query.toLowerCase();

        items.forEach(item => {
            const code = item.dataset.code;
            const visible = code.toLowerCase().includes(lowerQuery);
            item.style.display = visible ? '' : 'none';
        });
    }

    jumpToCode(code) {
        // Find first turn with this code
        const turnIndex = this.data?.turns?.findIndex(t => t.codes?.includes(code));
        if (turnIndex >= 0) {
            this.selectTurn(turnIndex);
            const turnEl = document.querySelector(`.turn[data-index="${turnIndex}"]`);
            turnEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    assignCode() {
        if (this.activeTurn === null) return;

        const select = document.getElementById('assign-code');
        const code = select?.value;
        if (!code) return;

        const turn = this.data.turns[this.activeTurn];
        if (!turn.codes) turn.codes = [];

        if (!turn.codes.includes(code)) {
            turn.codes.push(code);
            this.renderTurns();
            this.renderCodeChart();
            this.renderStats();
            this.selectTurn(this.activeTurn);
        }
    }

    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}
