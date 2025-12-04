/**
 * Protokoll Module
 * Reader-Spezialisierung für Sitzungsmitschriften
 *
 * Kognitive Aufgabe: Nachvollziehen von Entscheidungsprozessen
 *
 * UI-Elemente:
 * - Sprecherwechsel-Markierungen mit Farbkodierung
 * - Beschluss-Highlighting mit separater Beschlussliste
 * - Tagesordnungspunkt-Navigation
 * - Anwesenheitsliste mit Filtermöglichkeit
 * - Verweis auf frühere Sitzungen
 *
 * Datenstruktur (10-SPEZIALISIERUNGEN.md):
 * {
 *   session: { date, number, location, chair },
 *   attendance: [{ name, role, present }],
 *   agenda: [{ number, title, start_segment }],
 *   segments: [{ speaker, text, type, resolution_id? }],
 *   resolutions: [{ id, text, vote }]
 * }
 */

export class Protokoll {
    constructor() {
        this.data = null;
        this.speakerColors = new Map();
        this.activeSegment = null;
    }

    async init() {
        try {
            const response = await fetch('../examples/data/reader-protokoll.json');
            this.data = await response.json();

            this.setupEventListeners();
            this.render();

            console.log('Protokoll module initialized');
        } catch (error) {
            console.error('Error initializing Protokoll:', error);
        }
    }

    setupEventListeners() {
        // Attendance filter
        document.getElementById('filter-present')?.addEventListener('change', () => this.filterAttendance());
        document.getElementById('filter-absent')?.addEventListener('change', () => this.filterAttendance());

        // Agenda navigation
        document.getElementById('agenda-nav')?.addEventListener('click', (e) => {
            if (e.target.dataset.top) {
                this.jumpToAgendaItem(e.target.dataset.top);
            }
        });

        // Segment click
        document.getElementById('segments-container')?.addEventListener('click', (e) => {
            const segment = e.target.closest('.segment');
            if (segment) {
                this.selectSegment(segment.dataset.index);
            }
        });
    }

    render() {
        this.renderSessionInfo();
        this.renderAttendance();
        this.renderAgenda();
        this.renderSegments();
        this.renderResolutions();
        this.renderSpeakerLegend();
    }

    renderSessionInfo() {
        const session = this.data?.session;
        if (!session) return;

        document.getElementById('session-date').textContent = session.date;
        document.getElementById('session-number').textContent = session.number;
        document.getElementById('session-location').textContent = session.location;
        document.getElementById('session-chair').textContent = session.chair;

        document.getElementById('protokoll-title').textContent = session.body || 'Sitzungsprotokoll';
        document.getElementById('protokoll-subtitle').textContent =
            `${session.number}. Sitzung vom ${session.date}`;
    }

    renderAttendance() {
        const list = document.getElementById('attendance-list');
        if (!list || !this.data?.attendance) return;

        const showPresent = document.getElementById('filter-present')?.checked ?? true;
        const showAbsent = document.getElementById('filter-absent')?.checked ?? false;

        const filtered = this.data.attendance.filter(p =>
            (showPresent && p.present) || (showAbsent && !p.present)
        );

        list.innerHTML = filtered.map(p => `
            <li class="attendance-item ${p.present ? 'present' : 'absent'}">
                <span class="person-name">${p.name}</span>
                <span class="person-role">${p.role}</span>
                <span class="person-party">${p.party || ''}</span>
                ${!p.present ? `<span class="excuse">${p.excuse || 'entschuldigt'}</span>` : ''}
            </li>
        `).join('');
    }

    renderAgenda() {
        const nav = document.getElementById('agenda-nav');
        if (!nav || !this.data?.agenda) return;

        nav.innerHTML = this.data.agenda.map(item => `
            <a href="#top-${item.top_id}" class="agenda-item" data-top="${item.top_id}">
                <span class="top-number">TOP ${item.top_id}</span>
                <span class="top-title">${item.title}</span>
                <span class="top-status status-${item.status}">${item.status}</span>
            </a>
        `).join('');
    }

    renderSegments() {
        const container = document.getElementById('segments-container');
        if (!container || !this.data?.segments) return;

        // Assign colors to speakers
        const speakers = [...new Set(this.data.segments.filter(s => s.speaker).map(s => s.speaker))];
        const colors = ['#4A7C59', '#7B68A6', '#C4875A', '#5A8DB8', '#B85450', '#6B6B6B'];
        speakers.forEach((speaker, i) => {
            this.speakerColors.set(speaker, colors[i % colors.length]);
        });

        let currentTop = null;
        container.innerHTML = this.data.segments.map((seg, idx) => {
            let topHeader = '';
            if (seg.top_id !== currentTop) {
                currentTop = seg.top_id;
                const agenda = this.data.agenda.find(a => a.top_id === seg.top_id);
                topHeader = `<div class="top-header" id="top-${seg.top_id}">
                    <span class="top-number">TOP ${seg.top_id}</span>
                    <span class="top-title">${agenda?.title || ''}</span>
                </div>`;
            }

            const speakerColor = seg.speaker ? this.speakerColors.get(seg.speaker) : '#888';
            const isResolution = seg.type === 'resolution';

            return `
                ${topHeader}
                <div class="segment ${isResolution ? 'segment-resolution' : ''} segment-${seg.type}"
                     data-index="${idx}">
                    ${seg.speaker ? `
                        <span class="speaker" style="border-left-color: ${speakerColor}">
                            ${seg.speaker}${seg.role ? ` (${seg.role})` : ''}
                        </span>
                    ` : ''}
                    <p class="segment-text">${seg.text}</p>
                    <span class="segment-type type-${seg.type}">${this.getTypeLabel(seg.type)}</span>
                    ${seg.resolution_id ? `<span class="resolution-link">${seg.resolution_id}</span>` : ''}
                </div>
            `;
        }).join('');

        // Update resolution count
        const resCount = document.getElementById('resolution-count');
        if (resCount) {
            resCount.textContent = this.data.resolutions?.length || 0;
        }
    }

    getTypeLabel(type) {
        const labels = {
            procedure: 'Verfahren',
            speech: 'Rede',
            question: 'Frage',
            answer: 'Antwort',
            statement: 'Stellungnahme',
            resolution: 'Beschluss'
        };
        return labels[type] || type;
    }

    renderResolutions() {
        const tbody = document.getElementById('resolutions-body');
        if (!tbody || !this.data?.resolutions) return;

        tbody.innerHTML = this.data.resolutions.map(res => `
            <tr class="resolution-row outcome-${res.outcome}">
                <td class="res-id">${res.id}</td>
                <td class="res-text">${res.text}</td>
                <td class="res-vote">
                    <span class="vote-yes">${res.vote.yes} Ja</span>
                    <span class="vote-no">${res.vote.no} Nein</span>
                    <span class="vote-abstain">${res.vote.abstain} Enth.</span>
                </td>
                <td class="res-top">TOP ${res.related_top}</td>
            </tr>
        `).join('');
    }

    renderSpeakerLegend() {
        const legend = document.getElementById('speaker-legend');
        const chart = document.getElementById('speaker-chart');
        if (!legend || !this.data?.segments) return;

        // Count speaker turns
        const speakerCounts = {};
        this.data.segments.forEach(seg => {
            if (seg.speaker) {
                speakerCounts[seg.speaker] = (speakerCounts[seg.speaker] || 0) + 1;
            }
        });

        const maxCount = Math.max(...Object.values(speakerCounts));

        legend.innerHTML = Array.from(this.speakerColors.entries()).map(([speaker, color]) => `
            <div class="speaker-legend-item">
                <span class="speaker-color" style="background-color: ${color}"></span>
                <span class="speaker-name">${speaker}</span>
            </div>
        `).join('');

        if (chart) {
            chart.innerHTML = Object.entries(speakerCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([speaker, count]) => `
                    <div class="speaker-bar-row">
                        <span class="speaker-bar-label">${speaker.split(' ').pop()}</span>
                        <div class="speaker-bar" style="width: ${(count / maxCount) * 100}%; background-color: ${this.speakerColors.get(speaker)}">
                            <span class="speaker-bar-count">${count}</span>
                        </div>
                    </div>
                `).join('');
        }
    }

    filterAttendance() {
        this.renderAttendance();
    }

    jumpToAgendaItem(top) {
        const topElement = document.getElementById(`top-${top}`);
        if (topElement) {
            topElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    selectSegment(index) {
        const segment = this.data?.segments?.[index];
        if (!segment) return;

        // Highlight active segment
        document.querySelectorAll('.segment').forEach(el => el.classList.remove('active'));
        document.querySelector(`.segment[data-index="${index}"]`)?.classList.add('active');

        // Update detail panel
        const segmentInfo = document.getElementById('segment-info');
        if (segmentInfo) {
            segmentInfo.classList.remove('hidden');
        }

        document.getElementById('detail-speaker').textContent = segment.speaker || '–';
        document.getElementById('detail-type').textContent = this.getTypeLabel(segment.type);
        document.getElementById('detail-top').textContent = `TOP ${segment.top_id}`;
    }
}
