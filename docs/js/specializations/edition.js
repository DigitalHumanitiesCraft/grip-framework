/**
 * Edition Module
 * Reader-Spezialisierung für kritische Textausgaben
 *
 * Kognitive Aufgabe: Vergleichendes Lesen mit Bewusstsein für Textgeschichte
 *
 * UI-Elemente:
 * - Variantenapparat unterhalb/neben dem Haupttext
 * - Zeilensynopse für parallele Textversionen
 * - Siglenliste für Handschriften und Drucke
 * - Lemma-Markierungen im Text mit Hover-Expansion
 * - Kritischer Apparat mit normierten Abkürzungen
 *
 * Datenstruktur (10-SPEZIALISIERUNGEN.md):
 * {
 *   witnesses: [{ siglum, description, repository }],
 *   apparatus: [{ lemma, start, end, readings: [{ witness, text, note }] }],
 *   editorial_notes: [{ position, type, text }]
 * }
 */

export class Edition {
    constructor() {
        this.data = null;
        this.currentWitness = null;
        this.activeVariant = null;
    }

    async init() {
        try {
            const response = await fetch('data/reader-edition.json');
            this.data = await response.json();

            this.setupEventListeners();
            this.render();

            console.log('Edition module initialized');
        } catch (error) {
            console.error('Error initializing Edition:', error);
        }
    }

    setupEventListeners() {
        // Witness selector
        const baseWitness = document.getElementById('base-witness');
        if (baseWitness) {
            baseWitness.addEventListener('change', (e) => this.setBaseWitness(e.target.value));
        }

        // Lemma click handlers (delegated)
        const editionText = document.getElementById('edition-text');
        if (editionText) {
            editionText.addEventListener('click', (e) => {
                if (e.target.classList.contains('lemma')) {
                    this.showVariant(e.target.dataset.apparatusIndex);
                }
            });
        }
    }

    render() {
        this.renderWitnessList();
        this.renderText();
        this.renderApparatus();
        this.renderEditorialNotes();
        this.renderStats();
    }

    renderWitnessList() {
        const witnessList = document.getElementById('witness-list');
        const siglenList = document.getElementById('siglen-list');
        const baseWitness = document.getElementById('base-witness');

        if (!this.data?.witnesses) return;

        // Witness list in sidebar
        if (witnessList) {
            witnessList.innerHTML = this.data.witnesses.map(w => `
                <li class="witness-item ${w.siglum === this.currentWitness ? 'active' : ''}"
                    data-siglum="${w.siglum}">
                    <span class="witness-siglum">${w.siglum}</span>
                    <span class="witness-name">${w.name}</span>
                    <span class="witness-date">${w.date}</span>
                </li>
            `).join('');
        }

        // Siglen legend
        if (siglenList) {
            siglenList.innerHTML = this.data.witnesses.map(w => `
                <dt>${w.siglum}</dt>
                <dd>${w.name} (${w.date})<br><small>${w.repository}</small></dd>
            `).join('');
        }

        // Base witness selector
        if (baseWitness) {
            baseWitness.innerHTML = this.data.witnesses.map(w => `
                <option value="${w.siglum}" ${w.siglum === this.currentWitness ? 'selected' : ''}>
                    ${w.siglum} – ${w.name}
                </option>
            `).join('');
        }

        // Set default witness
        if (!this.currentWitness && this.data.witnesses.length > 0) {
            this.currentWitness = this.data.witnesses[0].siglum;
        }
    }

    renderText() {
        const editionText = document.getElementById('edition-text');
        const editionTitle = document.getElementById('edition-title');
        const editionMeta = document.getElementById('edition-meta');

        if (!this.data?.text_flow) return;

        // Title and metadata
        if (editionTitle && this.data.metadata) {
            editionTitle.textContent = this.data.metadata.title || 'Edition';
        }
        if (editionMeta && this.data.metadata) {
            editionMeta.textContent = `${this.data.metadata.author || ''} • ${this.data.metadata.source_standard || ''}`;
        }

        // Build text with lemma markers
        if (editionText) {
            editionText.innerHTML = this.data.text_flow.map(segment => {
                let content = segment.content;

                // Find apparatus entries for this segment
                const apparatusEntries = (this.data.apparatus || []).filter(a => a.segment_id === segment.id);

                // Mark lemmas in text
                apparatusEntries.forEach((entry, idx) => {
                    const apparatusIndex = this.data.apparatus.indexOf(entry);
                    content = content.replace(
                        entry.lemma,
                        `<span class="lemma" data-apparatus-index="${apparatusIndex}">${entry.lemma}</span>`
                    );
                });

                // Check for editorial notes
                const notes = (this.data.editorial_notes || []).filter(n => n.segment_id === segment.id);
                const noteMarker = notes.length > 0 ? `<sup class="note-marker" title="${notes[0].text}">*</sup>` : '';

                return `
                    <div class="text-line" data-line="${segment.line}">
                        <span class="line-number">${segment.line}</span>
                        <span class="line-content">${content}${noteMarker}</span>
                    </div>
                `;
            }).join('');
        }
    }

    renderApparatus() {
        const apparatus = document.getElementById('apparatus');

        if (!apparatus || !this.data?.apparatus) return;

        apparatus.innerHTML = this.data.apparatus.map((entry, idx) => {
            const readings = entry.readings.map(r => {
                const typeClass = r.type === 'base' ? 'reading-base' :
                                  r.type === 'variant' ? 'reading-variant' : 'reading-other';
                return `<span class="${typeClass}">${r.siglum}: ${r.text}</span>`;
            }).join(' | ');

            return `
                <div class="apparatus-entry" data-index="${idx}">
                    <span class="apparatus-lemma">${entry.lemma}]</span>
                    <span class="apparatus-readings">${readings}</span>
                </div>
            `;
        }).join('');
    }

    renderStats() {
        const statWitnesses = document.getElementById('stat-witnesses');
        const statVariants = document.getElementById('stat-variants');
        const statNotes = document.getElementById('stat-notes');

        if (statWitnesses) {
            statWitnesses.textContent = this.data?.witnesses?.length || 0;
        }
        if (statVariants) {
            statVariants.textContent = this.data?.apparatus?.length || 0;
        }
        if (statNotes) {
            statNotes.textContent = this.data?.editorial_notes?.length || 0;
        }
    }

    renderEditorialNotes() {
        const notesList = document.getElementById('editorial-notes-list');

        if (!notesList || !this.data?.editorial_notes) return;

        notesList.innerHTML = this.data.editorial_notes.map(note => `
            <li class="editorial-note note-${note.type}">
                <span class="note-type">${note.type}</span>
                <span class="note-segment">Zeile ${this.data.text_flow.find(s => s.id === note.segment_id)?.line || '?'}</span>
                <p class="note-text">${note.text}</p>
            </li>
        `).join('');
    }

    setBaseWitness(siglum) {
        this.currentWitness = siglum;
        this.renderText();
        this.renderWitnessList();
    }

    showVariant(index) {
        this.activeVariant = parseInt(index);
        const entry = this.data?.apparatus?.[this.activeVariant];

        if (!entry) return;

        const variantInfo = document.getElementById('variant-info');
        const variantLemma = document.getElementById('variant-lemma');
        const readingsBody = document.getElementById('readings-body');

        if (variantInfo) {
            variantInfo.classList.remove('hidden');
        }

        if (variantLemma) {
            variantLemma.textContent = entry.lemma;
        }

        if (readingsBody) {
            readingsBody.innerHTML = entry.readings.map(r => `
                <tr class="reading-row reading-${r.type}">
                    <td class="reading-siglum">${r.siglum}</td>
                    <td class="reading-text">${r.text}</td>
                    <td class="reading-note">${r.note || '–'}</td>
                </tr>
            `).join('');
        }

        // Highlight active lemma in text
        document.querySelectorAll('.lemma').forEach(el => el.classList.remove('active'));
        document.querySelector(`.lemma[data-apparatus-index="${this.activeVariant}"]`)?.classList.add('active');
    }
}
