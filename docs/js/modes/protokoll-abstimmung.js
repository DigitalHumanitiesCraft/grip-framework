/**
 * Protokoll Abstimmungs-Modus
 *
 * Entscheidungsfindung nachvollziehen, Fraktionsverhalten analysieren
 *
 * Benötigte Daten: votes[], attendance[], parties[]
 * Wissensbasis: 15-MODI#Protokoll-Abstimmung
 */

class ProtokollAbstimmung {
    constructor(containerId, dataPath) {
        this.container = document.getElementById(containerId);
        this.dataPath = dataPath || '../data/reader-protokoll.json';
        this.data = null;
        this.selectedVote = null;

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

        this.renderVotesList();
        this.renderPartyLegend();
        this.updateStats();

        // Erste Abstimmung automatisch auswählen
        const votes = this.data.votes || [];
        if (votes.length > 0 && !this.selectedVote) {
            this.selectVote(votes[0].id);
        }
    }

    renderVotesList() {
        const container = document.getElementById('votes-list');
        if (!container) return;

        const votes = this.data.votes || [];

        container.innerHTML = votes.map(vote => {
            const isActive = this.selectedVote === vote.id;
            const counts = vote.counts || {};

            return `
                <li class="vote-item ${isActive ? 'active' : ''}" data-vote="${vote.id}">
                    <div class="vote-item-title">${this.truncate(vote.motion, 40)}</div>
                    <div class="vote-item-result">
                        <span class="yes">${counts.yes || 0} Ja</span>
                        <span class="no">${counts.no || 0} Nein</span>
                    </div>
                </li>
            `;
        }).join('');
    }

    renderPartyLegend() {
        const container = document.getElementById('party-legend');
        if (!container) return;

        const parties = this.data.parties || [];

        container.innerHTML = parties.map(party => `
            <li>
                <span class="party-color" style="background: ${party.color}"></span>
                ${party.name} (${party.seats})
            </li>
        `).join('');
    }

    updateStats() {
        const votes = this.data.votes || [];

        document.getElementById('stat-votes').textContent = votes.length;

        const unanimous = votes.filter(v =>
            (v.counts?.no || 0) === 0 && (v.counts?.abstain || 0) === 0
        ).length;
        document.getElementById('stat-unanimous').textContent = unanimous;

        const rejected = votes.filter(v => v.result === 'rejected').length;
        document.getElementById('stat-rejected').textContent = rejected;
    }

    selectVote(voteId) {
        this.selectedVote = voteId;
        this.renderVotesList();
        this.renderVoteDetail(voteId);
        this.renderDebateContext(voteId);
    }

    renderVoteDetail(voteId) {
        const vote = (this.data.votes || []).find(v => v.id === voteId);
        if (!vote) return;

        const agenda = this.data.agenda || [];
        const agendaItem = agenda.find(a => a.number === vote.agenda_item);

        document.getElementById('vote-title').textContent = agendaItem
            ? `TOP ${agendaItem.number}: ${agendaItem.title}`
            : 'Abstimmung';
        document.getElementById('vote-motion').textContent = vote.motion;

        // Result Bar
        const counts = vote.counts || {};
        const total = (counts.yes || 0) + (counts.no || 0) + (counts.abstain || 0);

        const yesWidth = total > 0 ? ((counts.yes || 0) / total) * 100 : 0;
        const noWidth = total > 0 ? ((counts.no || 0) / total) * 100 : 0;
        const abstainWidth = total > 0 ? ((counts.abstain || 0) / total) * 100 : 0;

        document.getElementById('bar-yes').style.width = `${yesWidth}%`;
        document.getElementById('bar-no').style.width = `${noWidth}%`;
        document.getElementById('bar-abstain').style.width = `${abstainWidth}%`;

        document.getElementById('count-yes').textContent = counts.yes || 0;
        document.getElementById('count-no').textContent = counts.no || 0;
        document.getElementById('count-abstain').textContent = counts.abstain || 0;

        // Vote Matrix
        this.renderVoteMatrix(vote);

        // Party Breakdown
        this.renderPartyBreakdown(vote);
    }

    renderVoteMatrix(vote) {
        const container = document.getElementById('vote-matrix');
        if (!container) return;

        const attendees = this.data.attendance || [];
        const parties = this.data.parties || [];
        const partyColors = {};
        parties.forEach(p => partyColors[p.id] = p.color);

        const breakdown = vote.breakdown || {};

        container.innerHTML = attendees.map(person => {
            let voteType = 'absent';
            if (breakdown.yes?.includes(person.id)) voteType = 'yes';
            else if (breakdown.no?.includes(person.id)) voteType = 'no';
            else if (breakdown.abstain?.includes(person.id)) voteType = 'abstain';
            else if (!person.present) voteType = 'absent';

            const voteSymbol = {
                'yes': '✓',
                'no': '✗',
                'abstain': '–',
                'absent': '○'
            }[voteType];

            return `
                <div class="matrix-item">
                    <span class="matrix-vote ${voteType}">${voteSymbol}</span>
                    <span class="matrix-name">${person.name.split(' ').pop()}</span>
                    <span class="matrix-party" style="background: ${partyColors[person.party] || '#888'}">${person.party}</span>
                </div>
            `;
        }).join('');
    }

    renderPartyBreakdown(vote) {
        const container = document.getElementById('party-breakdown');
        if (!container) return;

        const parties = this.data.parties || [];
        const attendees = this.data.attendance || [];
        const breakdown = vote.breakdown || {};

        const partyBars = document.querySelector('.party-bars');
        if (!partyBars) return;

        partyBars.innerHTML = parties.map(party => {
            const partyMembers = attendees.filter(a => a.party === party.id);
            const present = partyMembers.filter(m => m.present);

            const yes = present.filter(m => breakdown.yes?.includes(m.id)).length;
            const no = present.filter(m => breakdown.no?.includes(m.id)).length;
            const abstain = present.filter(m => breakdown.abstain?.includes(m.id)).length;
            const total = present.length || 1;

            return `
                <div class="party-bar-row">
                    <span class="party-bar-name">
                        <span class="party-dot" style="background: ${party.color}"></span>
                        ${party.id}
                    </span>
                    <div class="party-bar-container">
                        <div class="party-bar-yes" style="width: ${(yes/total)*100}%">${yes > 0 ? yes : ''}</div>
                        <div class="party-bar-no" style="width: ${(no/total)*100}%">${no > 0 ? no : ''}</div>
                        <div class="party-bar-abstain" style="width: ${(abstain/total)*100}%">${abstain > 0 ? abstain : ''}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderDebateContext(voteId) {
        const vote = (this.data.votes || []).find(v => v.id === voteId);
        if (!vote) return;

        const prompt = document.getElementById('debate-prompt');
        const info = document.getElementById('debate-info');

        prompt?.classList.add('hidden');
        info?.classList.remove('hidden');

        // Finde Segmente, die zur Abstimmung gehören
        const agenda = this.data.agenda || [];
        const agendaItem = agenda.find(a => a.number === vote.agenda_item);

        if (!agendaItem) return;

        const segments = (this.data.segments || []).filter(s =>
            s.id >= agendaItem.start_segment &&
            s.id < (this.data.segments.find(seg => seg.vote_id === vote.id)?.id || agendaItem.end_segment) &&
            s.type === 'statement'
        );

        const attendees = this.data.attendance || [];
        const debateSegments = document.getElementById('debate-segments');

        debateSegments.innerHTML = segments.slice(-5).map(seg => {
            const speaker = attendees.find(a => a.id === seg.speaker);
            return `
                <div class="debate-segment">
                    <div class="debate-segment-speaker">${speaker?.name || 'Unbekannt'}</div>
                    <div class="debate-segment-text">${this.truncate(seg.text, 100)}</div>
                </div>
            `;
        }).join('');
    }

    truncate(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    bindEvents() {
        // Vote-Liste
        document.getElementById('votes-list')?.addEventListener('click', (e) => {
            const item = e.target.closest('.vote-item');
            if (item) {
                this.selectVote(item.dataset.vote);
            }
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
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault();
                this.navigateVotes(e.key === 'ArrowRight' ? 1 : -1);
            }
        });
    }

    navigateVotes(direction) {
        const votes = this.data.votes || [];
        const currentIndex = votes.findIndex(v => v.id === this.selectedVote);

        let newIndex = currentIndex + direction;
        if (newIndex < 0) newIndex = votes.length - 1;
        if (newIndex >= votes.length) newIndex = 0;

        this.selectVote(votes[newIndex].id);
    }
}

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    new ProtokollAbstimmung('vote-matrix');
});

export default ProtokollAbstimmung;
