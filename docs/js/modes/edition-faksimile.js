/**
 * Edition Faksimile-Modus
 *
 * Text-Bild-Verknüpfung mit Zonen-Mapping
 *
 * Benötigte Daten: pages[], zones[], transcription
 * Wissensbasis: 15-MODI#Edition-Faksimile, 14-EPICS#Edition
 */

class EditionFaksimile {
    constructor(containerId, dataPath) {
        this.container = document.getElementById(containerId);
        this.dataPath = dataPath || '../../examples/data/reader-edition.json';
        this.data = null;
        this.currentPage = 0;
        this.currentZone = null;
        this.zoomLevel = 100;
        this.showOverlay = false;
        this.showZones = true;
        this.overlayOpacity = 50;

        this.init();
    }

    async init() {
        try {
            const response = await fetch(this.dataPath);
            this.data = await response.json();
            this.render();
            this.bindEvents();
            this.bindKeyboard();
            this.initResize();
        } catch (error) {
            console.error('Fehler beim Laden der Daten:', error);
        }
    }

    render() {
        if (!this.data) return;

        this.renderPageList();
        this.renderWitnessSelect();
        this.renderFacsimile();
        this.renderTranscription();
        this.updateStats();
    }

    renderPageList() {
        const container = document.getElementById('page-list');
        if (!container) return;

        const pages = this.data.pages || [
            { id: 1, label: '1r', thumb: '' },
            { id: 2, label: '1v', thumb: '' },
            { id: 3, label: '2r', thumb: '' }
        ];

        container.innerHTML = pages.map((page, index) => `
            <button class="page-thumb ${index === this.currentPage ? 'active' : ''}"
                    data-page="${index}">
                <div class="thumb-placeholder">${page.label}</div>
                <span>${page.label}</span>
            </button>
        `).join('');
    }

    renderWitnessSelect() {
        const select = document.getElementById('witness-select');
        if (!select || !this.data.witnesses) return;

        select.innerHTML = this.data.witnesses.map(w => `
            <option value="${w.siglum}">${w.siglum} - ${w.name || ''}</option>
        `).join('');
    }

    renderFacsimile() {
        const image = document.getElementById('facsimile-image');
        const zones = document.getElementById('zone-overlays');

        const page = this.getPage(this.currentPage);

        if (image) {
            if (page?.image_url) {
                image.src = page.image_url;
                image.alt = `Seite ${page.label}`;
            } else {
                // Placeholder für Demo
                image.src = 'data:image/svg+xml,' + encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" viewBox="0 0 400 600">
                        <rect fill="#f5f1eb" width="400" height="600"/>
                        <text x="200" y="300" text-anchor="middle" fill="#6b6b6b" font-family="serif" font-size="24">
                            Faksimile ${page?.label || ''}
                        </text>
                        <text x="200" y="340" text-anchor="middle" fill="#999" font-family="sans-serif" font-size="12">
                            (Bild nicht verfügbar)
                        </text>
                    </svg>
                `);
            }
        }

        if (zones && this.showZones) {
            this.renderZones(page);
        }
    }

    renderZones(page) {
        const container = document.getElementById('zone-overlays');
        if (!container) return;

        const pageZones = page?.zones || this.generateDemoZones();

        container.innerHTML = `
            <svg viewBox="0 0 400 600" preserveAspectRatio="none">
                ${pageZones.map((zone, i) => `
                    <rect class="zone ${zone.id === this.currentZone ? 'active' : ''}"
                          data-zone="${zone.id}"
                          x="${zone.x}" y="${zone.y}"
                          width="${zone.width}" height="${zone.height}"
                          rx="2"/>
                `).join('')}
            </svg>
        `;
    }

    generateDemoZones() {
        // Demo-Zonen für Darstellung ohne echte Daten
        return Array.from({ length: 10 }, (_, i) => ({
            id: `z${i + 1}`,
            x: 20,
            y: 50 + i * 50,
            width: 360,
            height: 40
        }));
    }

    renderTranscription() {
        const container = document.getElementById('transcription-text');
        const title = document.getElementById('page-title');
        const info = document.getElementById('page-info');

        const page = this.getPage(this.currentPage);

        if (title) title.textContent = `Seite ${page?.label || this.currentPage + 1}`;
        if (info) info.textContent = page?.info || '';

        if (!container) return;

        // Transkription aus text_flow oder page.lines
        const lines = page?.lines || this.data.text_flow?.slice(0, 10) || [];

        container.innerHTML = lines.map((line, i) => `
            <div class="line ${line.zone === this.currentZone ? 'active' : ''}"
                 data-zone="${line.zone || `z${i + 1}`}">
                <span class="line-number">${i + 1}</span>
                <span class="line-text">${line.content || line.text || line}</span>
            </div>
        `).join('');
    }

    getPage(index) {
        return this.data.pages?.[index] || {
            label: `${index + 1}`,
            zones: this.generateDemoZones()
        };
    }

    updateStats() {
        const page = this.getPage(this.currentPage);
        const lines = page?.lines?.length || this.data.text_flow?.length || 0;
        const zones = page?.zones?.length || 10;
        const words = (page?.lines || this.data.text_flow || [])
            .map(l => (l.content || l.text || l).split(/\s+/).length)
            .reduce((a, b) => a + b, 0);

        document.getElementById('stat-lines')?.textContent = lines;
        document.getElementById('stat-zones')?.textContent = zones;
        document.getElementById('stat-words')?.textContent = words;
    }

    bindEvents() {
        // Seiten-Navigation
        document.getElementById('page-list')?.addEventListener('click', (e) => {
            const thumb = e.target.closest('.page-thumb');
            if (thumb) {
                this.currentPage = parseInt(thumb.dataset.page);
                this.renderPageList();
                this.renderFacsimile();
                this.renderTranscription();
                this.updateStats();
            }
        });

        // Witness-Wechsel
        document.getElementById('witness-select')?.addEventListener('change', () => {
            this.renderFacsimile();
            this.renderTranscription();
        });

        // Overlay-Toggle
        document.getElementById('show-overlay')?.addEventListener('change', (e) => {
            this.showOverlay = e.target.checked;
            document.getElementById('text-overlay')?.classList.toggle('hidden', !this.showOverlay);
            document.getElementById('overlay-opacity-control')?.classList.toggle('hidden', !this.showOverlay);
        });

        // Zonen-Toggle
        document.getElementById('show-zones')?.addEventListener('change', (e) => {
            this.showZones = e.target.checked;
            document.getElementById('zone-overlays')?.classList.toggle('hidden', !this.showZones);
        });

        // Overlay-Opacity
        document.getElementById('overlay-opacity')?.addEventListener('input', (e) => {
            this.overlayOpacity = e.target.value;
            const overlay = document.getElementById('text-overlay');
            if (overlay) overlay.style.opacity = this.overlayOpacity / 100;
        });

        // Zoom-Controls
        document.getElementById('zoom-in')?.addEventListener('click', () => this.zoom(10));
        document.getElementById('zoom-out')?.addEventListener('click', () => this.zoom(-10));
        document.getElementById('zoom-reset')?.addEventListener('click', () => this.resetZoom());

        // Zone-Klick im Bild
        document.getElementById('zone-overlays')?.addEventListener('click', (e) => {
            const zone = e.target.closest('.zone');
            if (zone) {
                this.selectZone(zone.dataset.zone);
            }
        });

        // Zeilen-Klick in Transkription
        document.getElementById('transcription-text')?.addEventListener('click', (e) => {
            const line = e.target.closest('.line');
            if (line) {
                this.selectZone(line.dataset.zone);
            }
        });
    }

    selectZone(zoneId) {
        this.currentZone = zoneId;

        // Markierungen aktualisieren
        document.querySelectorAll('.zone, .line').forEach(el => {
            el.classList.toggle('active', el.dataset.zone === zoneId);
        });

        // Detail anzeigen
        this.showZoneDetail(zoneId);

        // Zur Zone scrollen
        const zoneSvg = document.querySelector(`.zone[data-zone="${zoneId}"]`);
        const line = document.querySelector(`.line[data-zone="${zoneId}"]`);

        line?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    showZoneDetail(zoneId) {
        const info = document.getElementById('zone-info');
        const prompt = document.getElementById('zone-prompt');

        prompt?.classList.add('hidden');
        info?.classList.remove('hidden');

        const zone = this.getPage(this.currentPage)?.zones?.find(z => z.id === zoneId);
        const line = document.querySelector(`.line[data-zone="${zoneId}"]`);

        document.getElementById('zone-line')?.textContent =
            line?.querySelector('.line-number')?.textContent || '-';

        document.getElementById('zone-coords')?.textContent =
            zone ? `${zone.x}, ${zone.y}, ${zone.width}×${zone.height}` : '-';

        document.getElementById('zone-text')?.textContent =
            line?.querySelector('.line-text')?.textContent || '';
    }

    zoom(delta) {
        this.zoomLevel = Math.max(50, Math.min(200, this.zoomLevel + delta));
        const image = document.getElementById('facsimile-image');
        if (image) {
            image.style.transform = `scale(${this.zoomLevel / 100})`;
        }
        document.getElementById('zoom-level')?.textContent = `${this.zoomLevel}%`;
    }

    resetZoom() {
        this.zoomLevel = 100;
        const image = document.getElementById('facsimile-image');
        if (image) image.style.transform = 'scale(1)';
        document.getElementById('zoom-level')?.textContent = '100%';
    }

    initResize() {
        const handle = document.getElementById('resize-handle');
        const splitView = document.querySelector('.split-view');
        if (!handle || !splitView) return;

        let isDragging = false;

        handle.addEventListener('mousedown', () => {
            isDragging = true;
            handle.classList.add('dragging');
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const rect = splitView.getBoundingClientRect();
            const percent = ((e.clientX - rect.left) / rect.width) * 100;
            const clamped = Math.max(20, Math.min(80, percent));

            const facsimile = document.querySelector('.facsimile-panel');
            const transcription = document.querySelector('.transcription-panel');

            if (facsimile && transcription) {
                facsimile.style.flex = `0 0 ${clamped}%`;
                transcription.style.flex = `0 0 ${100 - clamped}%`;
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            handle.classList.remove('dragging');
        });
    }

    bindKeyboard() {
        document.addEventListener('keydown', (e) => {
            // Modi-Wechsel
            if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '4') {
                e.preventDefault();
                const modes = ['synopse', 'apparat', 'genetik', 'faksimile'];
                window.location.href = `${modes[parseInt(e.key) - 1]}.html`;
            }

            // Zoom
            if (e.key === '+' || e.key === '=') this.zoom(10);
            if (e.key === '-') this.zoom(-10);

            // Seiten-Navigation
            if (e.key === 'ArrowLeft') this.prevPage();
            if (e.key === 'ArrowRight') this.nextPage();

            // Zonen-Navigation
            if (e.key === 'ArrowUp') this.prevZone();
            if (e.key === 'ArrowDown') this.nextZone();
        });
    }

    prevPage() {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.render();
        }
    }

    nextPage() {
        const maxPage = (this.data.pages?.length || 3) - 1;
        if (this.currentPage < maxPage) {
            this.currentPage++;
            this.render();
        }
    }

    prevZone() {
        const zones = document.querySelectorAll('.line');
        const currentIndex = Array.from(zones).findIndex(z => z.classList.contains('active'));
        if (currentIndex > 0) {
            this.selectZone(zones[currentIndex - 1].dataset.zone);
        }
    }

    nextZone() {
        const zones = document.querySelectorAll('.line');
        const currentIndex = Array.from(zones).findIndex(z => z.classList.contains('active'));
        if (currentIndex < zones.length - 1) {
            this.selectZone(zones[currentIndex + 1].dataset.zone);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new EditionFaksimile('facsimile-panel');
});

export default EditionFaksimile;
