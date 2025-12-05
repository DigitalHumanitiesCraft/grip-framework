/**
 * Transcript Codierung-Modus
 *
 * Qualitative Analyse mit Drag-and-Drop-Codierung
 *
 * Benötigte Daten: interview{}, turns[], codebook[], code_categories[]
 * Wissensbasis: 15-MODI#Transcript-Codierung
 */

class TranscriptCodierung {
    constructor(containerId, dataPath) {
        this.container = document.getElementById(containerId);
        this.dataPath = dataPath || '../data/reader-transcript.json';
        this.data = null;
        this.selectedCode = null;
        this.selectedText = '';
        this.selectedTurnId = null;
        this.recentCodes = [];
        this.undoStack = [];
        this.redoStack = [];
        this.codeMode = false;

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

        this.renderCodebook();
        this.renderRecentCodes();
        this.renderTextColumn();
        this.renderMarginColumn();
        this.renderCoOccurrence();
        this.updateProgress();
    }

    renderCodebook() {
        const container = document.getElementById('codebook-tree');
        if (!container) return;

        const categories = this.data.code_categories || [];
        const codebook = this.data.codebook || [];

        container.innerHTML = categories.map(cat => {
            const categoryCodes = codebook.filter(c => c.category === cat.id);

            return `
                <div class="code-category" data-category="${cat.id}">
                    <div class="category-header">
                        <span class="category-toggle">▼</span>
                        <span class="category-dot" style="background: ${cat.color}"></span>
                        ${cat.label}
                    </div>
                    <div class="category-codes">
                        ${categoryCodes.map(code => `
                            <div class="code-item" data-code="${code.id}" draggable="true">
                                <span class="code-dot" style="background: ${code.color}"></span>
                                <span class="code-name">${code.label}</span>
                                <span class="code-count">${this.countCodeUsage(code.id)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    countCodeUsage(codeId) {
        const turns = this.data.turns || [];
        let count = 0;
        turns.forEach(turn => {
            if (turn.codes?.includes(codeId)) count++;
        });
        return count;
    }

    renderRecentCodes() {
        const container = document.getElementById('recent-codes');
        if (!container) return;

        const codebook = this.data.codebook || [];

        // Get 5 most recently used codes
        const recent = this.recentCodes.slice(0, 5);

        container.innerHTML = recent.map(codeId => {
            const code = codebook.find(c => c.id === codeId);
            return `
                <span class="quick-code" data-code="${codeId}" style="background: ${code?.color || '#888'}">
                    ${code?.label || codeId}
                </span>
            `;
        }).join('') || '<span style="color: var(--color-ink-light); font-size: 0.8rem;">Noch keine</span>';
    }

    renderTextColumn() {
        const container = document.getElementById('text-column');
        if (!container) return;

        const turns = this.data.turns || [];
        const participants = this.data.interview?.participants || [];
        const codebook = this.data.codebook || [];

        container.innerHTML = turns.map(turn => {
            const speaker = participants.find(p => p.id === turn.speaker);
            const isCoded = turn.codes && turn.codes.length > 0;

            // Highlight codes in text
            let displayText = turn.text;

            return `
                <div class="coding-turn ${isCoded ? 'coded' : ''}" data-turn="${turn.id}">
                    <div class="coding-turn-header">
                        <span class="coding-turn-speaker" style="color: ${speaker?.color || '#333'}">
                            ${speaker?.pseudonym || turn.speaker}
                        </span>
                        <span class="coding-turn-time">${this.formatTime(turn.start_ms)}</span>
                    </div>
                    <div class="coding-turn-text">${displayText}</div>
                </div>
            `;
        }).join('');
    }

    renderMarginColumn() {
        const container = document.getElementById('margin-column');
        if (!container) return;

        const turns = this.data.turns || [];
        const codebook = this.data.codebook || [];

        container.innerHTML = turns.map(turn => {
            const codes = turn.codes || [];

            return `
                <div class="margin-marker" data-turn="${turn.id}">
                    ${codes.map(codeId => {
                        const code = codebook.find(c => c.id === codeId);
                        return `
                            <span class="margin-code-tag" data-code="${codeId}" style="background: ${code?.color || '#888'}">
                                ${code?.label || codeId}
                                <span class="remove-code" data-turn="${turn.id}" data-code="${codeId}">×</span>
                            </span>
                        `;
                    }).join('')}
                </div>
            `;
        }).join('');
    }

    renderCoOccurrence() {
        const container = document.getElementById('co-occurrence-matrix');
        if (!container) return;

        const turns = this.data.turns || [];
        const codebook = this.data.codebook || [];

        // Calculate co-occurrences
        const coOccurrences = {};
        turns.forEach(turn => {
            const codes = turn.codes || [];
            for (let i = 0; i < codes.length; i++) {
                for (let j = i + 1; j < codes.length; j++) {
                    const key = [codes[i], codes[j]].sort().join('|');
                    coOccurrences[key] = (coOccurrences[key] || 0) + 1;
                }
            }
        });

        // Get top 5 co-occurrences
        const top = Object.entries(coOccurrences)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        container.innerHTML = top.map(([key, count]) => {
            const [code1, code2] = key.split('|');
            const c1 = codebook.find(c => c.id === code1);
            const c2 = codebook.find(c => c.id === code2);

            return `
                <div class="co-occurrence-row">
                    <div class="co-occurrence-codes">
                        <span style="color: ${c1?.color || '#888'}">${c1?.label || code1}</span>
                        +
                        <span style="color: ${c2?.color || '#888'}">${c2?.label || code2}</span>
                    </div>
                    <span class="co-occurrence-count">${count}</span>
                </div>
            `;
        }).join('') || '<p style="color: var(--color-ink-light);">Keine Kookkurrenzen</p>';
    }

    updateProgress() {
        const turns = this.data.turns || [];
        const coded = turns.filter(t => t.codes && t.codes.length > 0).length;
        const total = turns.length;

        const percent = total > 0 ? (coded / total) * 100 : 0;

        document.getElementById('progress-fill').style.width = `${percent}%`;
        document.getElementById('coded-segments').textContent = coded;
        document.getElementById('total-segments').textContent = total;
    }

    applyCode(turnId, codeId) {
        const turn = (this.data.turns || []).find(t => t.id === turnId);
        if (!turn) return;

        // Save for undo
        this.undoStack.push({
            type: 'add',
            turnId,
            codeId
        });
        this.redoStack = [];

        // Add code
        if (!turn.codes) turn.codes = [];
        if (!turn.codes.includes(codeId)) {
            turn.codes.push(codeId);

            // Update recent codes
            this.recentCodes = [codeId, ...this.recentCodes.filter(c => c !== codeId)];
        }

        this.render();
    }

    removeCode(turnId, codeId) {
        const turn = (this.data.turns || []).find(t => t.id === turnId);
        if (!turn || !turn.codes) return;

        // Save for undo
        this.undoStack.push({
            type: 'remove',
            turnId,
            codeId
        });
        this.redoStack = [];

        // Remove code
        turn.codes = turn.codes.filter(c => c !== codeId);

        this.render();
    }

    undo() {
        const action = this.undoStack.pop();
        if (!action) return;

        const turn = (this.data.turns || []).find(t => t.id === action.turnId);
        if (!turn) return;

        if (action.type === 'add') {
            turn.codes = turn.codes.filter(c => c !== action.codeId);
        } else {
            if (!turn.codes) turn.codes = [];
            turn.codes.push(action.codeId);
        }

        this.redoStack.push(action);
        this.render();
    }

    redo() {
        const action = this.redoStack.pop();
        if (!action) return;

        const turn = (this.data.turns || []).find(t => t.id === action.turnId);
        if (!turn) return;

        if (action.type === 'add') {
            if (!turn.codes) turn.codes = [];
            turn.codes.push(action.codeId);
        } else {
            turn.codes = turn.codes.filter(c => c !== action.codeId);
        }

        this.undoStack.push(action);
        this.render();
    }

    showSelectionInfo(turnId, text) {
        const prompt = document.getElementById('selection-prompt');
        const info = document.getElementById('selection-info');

        if (!text) {
            prompt?.classList.remove('hidden');
            info?.classList.add('hidden');
            return;
        }

        prompt?.classList.add('hidden');
        info?.classList.remove('hidden');

        document.getElementById('selected-text').textContent = text;

        // Show quick code buttons
        const codebook = this.data.codebook || [];
        const recent = this.recentCodes.slice(0, 8);

        const applyList = document.getElementById('apply-code-list');
        applyList.innerHTML = recent.map(codeId => {
            const code = codebook.find(c => c.id === codeId);
            return `
                <button class="apply-code-btn" data-code="${codeId}" style="background: ${code?.color || '#888'}">
                    ${code?.label || codeId}
                </button>
            `;
        }).join('');
    }

    exportCSV() {
        const turns = this.data.turns || [];
        const codebook = this.data.codebook || [];

        const rows = [['Turn', 'Speaker', 'Text', 'Codes'].join(',')];

        turns.forEach(turn => {
            const codes = (turn.codes || []).map(c => {
                const code = codebook.find(cb => cb.id === c);
                return code?.label || c;
            }).join(';');

            rows.push([
                turn.id,
                turn.speaker,
                `"${turn.text.replace(/"/g, '""')}"`,
                `"${codes}"`
            ].join(','));
        });

        this.downloadFile(rows.join('\n'), 'coding_export.csv', 'text/csv');
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

    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    bindEvents() {
        // Codebook search
        document.getElementById('code-search')?.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            document.querySelectorAll('.code-item').forEach(item => {
                const name = item.querySelector('.code-name')?.textContent.toLowerCase() || '';
                item.style.display = name.includes(query) ? 'flex' : 'none';
            });
        });

        // Category toggle
        document.getElementById('codebook-tree')?.addEventListener('click', (e) => {
            const header = e.target.closest('.category-header');
            if (header) {
                const codes = header.nextElementSibling;
                const toggle = header.querySelector('.category-toggle');
                if (codes.style.display === 'none') {
                    codes.style.display = 'block';
                    toggle.textContent = '▼';
                } else {
                    codes.style.display = 'none';
                    toggle.textContent = '▶';
                }
            }

            // Code selection
            const codeItem = e.target.closest('.code-item');
            if (codeItem) {
                this.selectedCode = codeItem.dataset.code;
                document.querySelectorAll('.code-item').forEach(i => i.classList.remove('selected'));
                codeItem.classList.add('selected');
            }
        });

        // Quick codes
        document.getElementById('recent-codes')?.addEventListener('click', (e) => {
            const quickCode = e.target.closest('.quick-code');
            if (quickCode && this.selectedTurnId) {
                this.applyCode(this.selectedTurnId, quickCode.dataset.code);
            }
        });

        // Text selection
        document.getElementById('text-column')?.addEventListener('mouseup', (e) => {
            const selection = window.getSelection();
            const text = selection?.toString().trim();
            const turn = e.target.closest('.coding-turn');

            if (turn && text) {
                this.selectedTurnId = parseInt(turn.dataset.turn);
                this.selectedText = text;
                this.showSelectionInfo(this.selectedTurnId, text);
            }
        });

        // Apply code buttons
        document.getElementById('apply-code-list')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.apply-code-btn');
            if (btn && this.selectedTurnId) {
                this.applyCode(this.selectedTurnId, btn.dataset.code);
            }
        });

        // Remove code
        document.getElementById('margin-column')?.addEventListener('click', (e) => {
            const removeBtn = e.target.closest('.remove-code');
            if (removeBtn) {
                const turnId = parseInt(removeBtn.dataset.turn);
                const codeId = removeBtn.dataset.code;
                this.removeCode(turnId, codeId);
            }
        });

        // Drag and drop
        document.getElementById('codebook-tree')?.addEventListener('dragstart', (e) => {
            const codeItem = e.target.closest('.code-item');
            if (codeItem) {
                e.dataTransfer.setData('text/plain', codeItem.dataset.code);
                codeItem.classList.add('dragging');
            }
        });

        document.getElementById('codebook-tree')?.addEventListener('dragend', (e) => {
            const codeItem = e.target.closest('.code-item');
            if (codeItem) {
                codeItem.classList.remove('dragging');
            }
        });

        document.getElementById('text-column')?.addEventListener('dragover', (e) => {
            e.preventDefault();
            const turn = e.target.closest('.coding-turn');
            if (turn) {
                turn.classList.add('drop-target');
            }
        });

        document.getElementById('text-column')?.addEventListener('dragleave', (e) => {
            const turn = e.target.closest('.coding-turn');
            if (turn) {
                turn.classList.remove('drop-target');
            }
        });

        document.getElementById('text-column')?.addEventListener('drop', (e) => {
            e.preventDefault();
            const turn = e.target.closest('.coding-turn');
            if (turn) {
                turn.classList.remove('drop-target');
                const codeId = e.dataTransfer.getData('text/plain');
                const turnId = parseInt(turn.dataset.turn);
                this.applyCode(turnId, codeId);
            }
        });

        // Toolbar buttons
        document.getElementById('undo-btn')?.addEventListener('click', () => this.undo());
        document.getElementById('redo-btn')?.addEventListener('click', () => this.redo());

        // Mode toggle
        document.getElementById('select-mode')?.addEventListener('click', () => {
            this.codeMode = false;
            document.getElementById('select-mode').classList.add('active');
            document.getElementById('code-mode').classList.remove('active');
        });

        document.getElementById('code-mode')?.addEventListener('click', () => {
            this.codeMode = true;
            document.getElementById('code-mode').classList.add('active');
            document.getElementById('select-mode').classList.remove('active');
        });

        // Export
        document.getElementById('export-csv')?.addEventListener('click', () => this.exportCSV());
    }

    bindKeyboard() {
        document.addEventListener('keydown', (e) => {
            // Mode switching
            if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '4') {
                e.preventDefault();
                const modes = ['partitur', 'fliesstext', 'codierung', 'audio-sync'];
                window.location.href = `${modes[parseInt(e.key) - 1]}.html`;
            }

            // Undo/Redo
            if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
                e.preventDefault();
                if (e.shiftKey) {
                    this.redo();
                } else {
                    this.undo();
                }
            }
        });
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    new TranscriptCodierung('text-column');
});

export default TranscriptCodierung;
