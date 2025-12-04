// Reader Archetype - Sequential data with immersive reading experience
// GRIP Framework

export class AdaptiveReader {
    constructor(dataUrl) {
        this.dataUrl = dataUrl;
        this.data = null;
        this.currentIndex = 0;
        this.init();
    }

    async init() {
        try {
            const response = await fetch(this.dataUrl);
            this.data = await response.json();
            this.render();
            this.bindEvents();
        } catch (error) {
            console.error('Failed to load data:', error);
            document.getElementById('letter-body').innerHTML =
                '<p class="error">Daten konnten nicht geladen werden.</p>';
        }
    }

    render() {
        this.renderCorpusInfo();
        this.renderPersons();
        this.renderNavigation();
        this.renderTimeline();
        this.renderLetter(0);
    }

    renderCorpusInfo() {
        const { metadata } = this.data;
        document.getElementById('corpus-title').textContent = metadata.title.split(':')[0] || 'Korrespondenz';
        document.getElementById('corpus-description').textContent = metadata.description;
    }

    renderPersons() {
        const { persons } = this.data;
        const container = document.getElementById('persons-panel');

        let html = '<h3>Korrespondenten</h3><dl class="persons-list">';
        for (const [key, person] of Object.entries(persons)) {
            html += `
                <dt>${person.name}</dt>
                <dd>${person.born}–${person.died}, ${person.role}</dd>
            `;
        }
        html += '</dl>';
        container.innerHTML = html;
    }

    renderNavigation() {
        const { letters, persons } = this.data;
        const nav = document.getElementById('letter-nav');

        nav.innerHTML = letters.map((letter, index) => {
            const sender = persons[letter.from]?.name.split(' ').pop() || letter.from;
            const date = this.formatDate(letter.date);
            return `
                <button class="letter-btn ${index === 0 ? 'active' : ''}" data-index="${index}">
                    <span class="date">${date}</span>
                    <span class="preview">${sender}: ${letter.subject}</span>
                </button>
            `;
        }).join('');
    }

    renderTimeline() {
        const { letters, timeline } = this.data;
        const container = document.getElementById('timeline');

        if (!timeline?.periods) {
            container.style.display = 'none';
            return;
        }

        const years = letters.map(l => parseInt(l.date.split('-')[0]));
        const minYear = Math.min(...years);
        const maxYear = Math.max(...years);
        const range = maxYear - minYear || 1;

        let html = '<div class="timeline-periods">';
        timeline.periods.forEach(period => {
            const startYear = parseInt(period.start);
            const endYear = parseInt(period.end);
            const left = ((startYear - minYear) / range) * 100;
            const width = ((endYear - startYear) / range) * 100;
            html += `
                <div class="timeline-period"
                     style="left: ${left}%; width: ${width}%; background: ${period.color}20;"
                     title="${period.label}"
                     data-period="${period.label}">
                    <span class="period-label">${period.label}</span>
                </div>
            `;
        });
        html += '</div>';

        html += '<div class="timeline-track">';
        html += `<span class="timeline-year">${minYear}</span>`;
        html += '<div class="timeline-dots">';
        letters.forEach((letter, index) => {
            const year = parseInt(letter.date.split('-')[0]);
            const pos = ((year - minYear) / range) * 100;
            html += `
                <span class="timeline-dot ${index === 0 ? 'active' : ''}"
                      style="left: ${pos}%;"
                      data-index="${index}"
                      title="${this.formatDate(letter.date)}: ${letter.subject}">
                </span>
            `;
        });
        html += '</div>';
        html += `<span class="timeline-year">${maxYear}</span>`;
        html += '</div>';

        container.innerHTML = html;
    }

    renderLetter(index) {
        const { letters, persons, timeline } = this.data;
        const letter = letters[index];
        this.currentIndex = index;

        document.querySelectorAll('.letter-btn').forEach((btn, i) => {
            btn.classList.toggle('active', i === index);
        });
        document.querySelectorAll('.timeline-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });

        const sender = persons[letter.from];
        const recipient = persons[letter.to];
        document.getElementById('letter-sender').textContent = sender?.name || letter.from;
        document.getElementById('letter-recipient').textContent = recipient?.name || letter.to;
        document.getElementById('letter-location-from').textContent = `(${letter.location_from})`;
        document.getElementById('letter-location-to').textContent = `(${letter.location_to})`;
        document.getElementById('letter-date').textContent = this.formatDate(letter.date);
        document.getElementById('letter-subject').textContent = letter.subject;

        const bodyHtml = this.renderBodyWithAnnotations(letter.body, letter.annotations);
        document.getElementById('letter-body').innerHTML = bodyHtml;

        this.renderReferences(letter.references, letters);
        this.renderAnnotationsList(letter.annotations);

        document.getElementById('stat-words').textContent = letter.body.split(/\s+/).length;
        document.getElementById('stat-annotations').textContent = letter.annotations?.length || 0;
        document.getElementById('stat-references').textContent = letter.references?.length || 0;

        if (timeline?.periods) {
            const year = parseInt(letter.date.split('-')[0]);
            const period = timeline.periods.find(p =>
                year >= parseInt(p.start) && year <= parseInt(p.end)
            );
            if (period) {
                document.getElementById('period-label').textContent = period.label;
                document.getElementById('period-label').style.color = period.color;
            }
        }

        document.getElementById('letter-counter').textContent =
            `Brief ${index + 1} von ${letters.length}`;
        document.getElementById('prev-btn').disabled = index === 0;
        document.getElementById('next-btn').disabled = index === letters.length - 1;
    }

    renderBodyWithAnnotations(body, annotations) {
        if (!annotations || annotations.length === 0) {
            return this.formatBody(body);
        }

        const sorted = [...annotations].sort((a, b) => b.start - a.start);

        let result = body;
        sorted.forEach((ann, idx) => {
            const before = result.slice(0, ann.start);
            const text = result.slice(ann.start, ann.end);
            const after = result.slice(ann.end);

            result = before +
                `<span class="annotation" data-type="${ann.type}" data-note="${this.escapeHtml(ann.note)}" data-index="${idx}">${text}</span>` +
                after;
        });

        return this.formatBody(result);
    }

    formatBody(text) {
        const paragraphs = text.split('\n\n');
        return paragraphs.map(p => {
            if (p.startsWith('Sehr') || p.startsWith('Liebe') || p.startsWith('Liebste')) {
                return `<p class="salutation">${p.replace(/\n/g, '<br>')}</p>`;
            }
            if (p.startsWith('Mit') || p.startsWith('Ihre') || p.startsWith('Ihr ')) {
                return `<p class="closing">${p.replace(/\n/g, '<br>')}</p>`;
            }
            return `<p>${p.replace(/\n/g, '<br>')}</p>`;
        }).join('');
    }

    renderReferences(refs, allLetters) {
        const container = document.getElementById('references-panel');
        const list = document.getElementById('references-list');

        if (!refs || refs.length === 0) {
            container.style.display = 'none';
            return;
        }

        container.style.display = 'block';
        list.innerHTML = refs.map(refId => {
            const refLetter = allLetters.find(l => l.id === refId);
            if (!refLetter) return '';
            const refIndex = allLetters.indexOf(refLetter);
            return `
                <li>
                    <a href="#" class="reference-link" data-index="${refIndex}">
                        ${this.formatDate(refLetter.date)}: ${refLetter.subject}
                    </a>
                </li>
            `;
        }).join('');
    }

    renderAnnotationsList(annotations) {
        const list = document.getElementById('annotations-list');
        if (!annotations || annotations.length === 0) {
            list.innerHTML = '<li class="no-annotations">Keine Annotationen</li>';
            return;
        }

        list.innerHTML = annotations.map((ann, idx) => `
            <li class="annotation-item" data-index="${idx}">
                <span class="annotation-type ${ann.type}">${ann.type}</span>
                <span class="annotation-note">${ann.note}</span>
            </li>
        `).join('');
    }

    bindEvents() {
        document.querySelectorAll('.letter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.renderLetter(parseInt(btn.dataset.index));
            });
        });

        document.querySelectorAll('.timeline-dot').forEach(dot => {
            dot.addEventListener('click', () => {
                this.renderLetter(parseInt(dot.dataset.index));
            });
        });

        document.getElementById('prev-btn').addEventListener('click', () => {
            if (this.currentIndex > 0) {
                this.renderLetter(this.currentIndex - 1);
            }
        });

        document.getElementById('next-btn').addEventListener('click', () => {
            if (this.currentIndex < this.data.letters.length - 1) {
                this.renderLetter(this.currentIndex + 1);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' && this.currentIndex > 0) {
                this.renderLetter(this.currentIndex - 1);
            } else if (e.key === 'ArrowRight' && this.currentIndex < this.data.letters.length - 1) {
                this.renderLetter(this.currentIndex + 1);
            }
        });

        document.getElementById('letter-body').addEventListener('click', (e) => {
            const ann = e.target.closest('.annotation');
            if (ann) {
                this.showAnnotation(ann.dataset.note, ann.dataset.type);
                document.querySelectorAll('.annotation-item').forEach(item => {
                    item.classList.toggle('active', item.dataset.index === ann.dataset.index);
                });
            }
        });

        document.getElementById('annotations-list').addEventListener('click', (e) => {
            const item = e.target.closest('.annotation-item');
            if (item) {
                const idx = item.dataset.index;
                const ann = document.querySelector(`.annotation[data-index="${idx}"]`);
                if (ann) {
                    ann.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    ann.classList.add('highlight');
                    setTimeout(() => ann.classList.remove('highlight'), 2000);
                    this.showAnnotation(ann.dataset.note, ann.dataset.type);
                }
            }
        });

        document.getElementById('references-list').addEventListener('click', (e) => {
            const link = e.target.closest('.reference-link');
            if (link) {
                e.preventDefault();
                this.renderLetter(parseInt(link.dataset.index));
            }
        });
    }

    showAnnotation(note, type) {
        const panel = document.getElementById('annotation-panel');
        const text = document.getElementById('annotation-text');
        panel.className = `annotation-panel ${type}`;
        text.textContent = note;
    }

    formatDate(isoDate) {
        const [year, month, day] = isoDate.split('-');
        const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
                       'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
        return `${parseInt(day)}. ${months[parseInt(month) - 1]} ${year}`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML.replace(/"/g, '&quot;');
    }
}

// Default export for convenience
export default AdaptiveReader;
