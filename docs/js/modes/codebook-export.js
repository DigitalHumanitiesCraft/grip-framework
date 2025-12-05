/**
 * Codebook Export Mode
 * Dokumentation in verschiedenen Formaten generieren
 */

class CodebookExport {
    constructor() {
        this.data = null;
        this.variables = [];
        this.format = 'ddi';
        this.options = {
            metadata: true,
            variables: true,
            values: true,
            stats: false,
            frequencies: false
        };
    }

    async init() {
        try {
            const response = await fetch('../data/codebook-data.json');
            this.data = await response.json();
            this.variables = this.data.variables || [];
            this.renderPreview();
            this.updateFormatInfo();
            this.bindEvents();
            this.bindKeyboard();
        } catch (error) {
            console.error('Fehler beim Laden der Codebook-Daten:', error);
            this.loadDemoData();
        }
    }

    loadDemoData() {
        this.data = {
            metadata: {
                title: 'Beispiel-Umfrage 2024',
                creator: 'Forschungsinstitut XYZ',
                date: '2024-01-15',
                description: 'Eine Beispielumfrage zur Demonstration des GRIP Frameworks.'
            },
            variables: [
                { position: 1, name: 'id', label: 'Fallnummer', type: 'numeric', validN: 1000, missingN: 0 },
                { position: 2, name: 'age', label: 'Alter', type: 'numeric', validN: 985, missingN: 15, min: 18, max: 99 },
                { position: 3, name: 'gender', label: 'Geschlecht', type: 'categorical', validN: 998, missingN: 2,
                  values: [{ code: 1, label: 'männlich' }, { code: 2, label: 'weiblich' }, { code: 3, label: 'divers' }] }
            ]
        };
        this.variables = this.data.variables;
        this.renderPreview();
        this.updateFormatInfo();
    }

    renderPreview() {
        const container = document.getElementById('preview-container');
        if (!container) return;

        switch (this.format) {
            case 'ddi':
                container.innerHTML = this.renderDDIPreview();
                break;
            case 'pdf':
                container.innerHTML = this.renderPDFPreview();
                break;
            case 'html':
                container.innerHTML = this.renderHTMLPreview();
                break;
            case 'csv':
                container.innerHTML = this.renderCSVPreview();
                break;
        }
    }

    renderDDIPreview() {
        const xml = this.generateDDI();
        return `
            <div class="code-preview ddi-preview">
                <pre><code>${this.escapeHtml(xml)}</code></pre>
            </div>
        `;
    }

    generateDDI() {
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<DDIInstance xmlns="ddi:instance:3_2">
  <StudyUnit>`;

        if (this.options.metadata && this.data.metadata) {
            xml += `
    <Citation>
      <Title>${this.data.metadata.title || ''}</Title>
      <Creator>${this.data.metadata.creator || ''}</Creator>
      <PublicationDate>${this.data.metadata.date || ''}</PublicationDate>
    </Citation>
    <Abstract>${this.data.metadata.description || ''}</Abstract>`;
        }

        if (this.options.variables) {
            xml += `
    <LogicalProduct>
      <VariableScheme>`;

            this.variables.forEach(v => {
                xml += `
        <Variable>
          <VariableName>${v.name}</VariableName>
          <Label>${v.label || ''}</Label>
          <RepresentationType>${v.type}</RepresentationType>`;

                if (this.options.values && v.values) {
                    xml += `
          <CodeScheme>`;
                    v.values.forEach(val => {
                        xml += `
            <Code>
              <Value>${val.code}</Value>
              <Label>${val.label}</Label>
            </Code>`;
                    });
                    xml += `
          </CodeScheme>`;
                }

                xml += `
        </Variable>`;
            });

            xml += `
      </VariableScheme>
    </LogicalProduct>`;
        }

        xml += `
  </StudyUnit>
</DDIInstance>`;

        return xml;
    }

    renderPDFPreview() {
        return `
            <div class="pdf-preview">
                <div class="pdf-page">
                    <h1 class="pdf-title">${this.data.metadata?.title || 'Codebook'}</h1>
                    <p class="pdf-meta">${this.data.metadata?.creator || ''} | ${this.data.metadata?.date || ''}</p>

                    ${this.options.metadata ? `
                        <section class="pdf-section">
                            <h2>Studienbeschreibung</h2>
                            <p>${this.data.metadata?.description || ''}</p>
                        </section>
                    ` : ''}

                    ${this.options.variables ? `
                        <section class="pdf-section">
                            <h2>Variablenübersicht</h2>
                            <table class="pdf-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Name</th>
                                        <th>Label</th>
                                        <th>Typ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${this.variables.map(v => `
                                        <tr>
                                            <td>${v.position}</td>
                                            <td>${v.name}</td>
                                            <td>${v.label || '–'}</td>
                                            <td>${v.type}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </section>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderHTMLPreview() {
        return `
            <div class="html-preview">
                <div class="html-frame">
                    <nav class="html-nav">
                        <a href="#" class="active">Übersicht</a>
                        <a href="#">Variablen</a>
                        <a href="#">Wertelabels</a>
                    </nav>
                    <main class="html-content">
                        <h1>${this.data.metadata?.title || 'Codebook'}</h1>
                        <p class="lead">${this.data.metadata?.description || ''}</p>

                        <div class="var-cards">
                            ${this.variables.slice(0, 3).map(v => `
                                <div class="var-card">
                                    <h3>${v.name}</h3>
                                    <p>${v.label || ''}</p>
                                    <span class="type-tag">${v.type}</span>
                                </div>
                            `).join('')}
                        </div>
                    </main>
                </div>
            </div>
        `;
    }

    renderCSVPreview() {
        const csv = this.generateCSV();
        const lines = csv.split('\n').slice(0, 10);

        return `
            <div class="csv-preview">
                <table class="csv-table">
                    ${lines.map((line, i) => `
                        <tr class="${i === 0 ? 'header-row' : ''}">
                            ${line.split(',').map(cell =>
                                `<td>${this.escapeHtml(cell.replace(/^"|"$/g, ''))}</td>`
                            ).join('')}
                        </tr>
                    `).join('')}
                </table>
                ${csv.split('\n').length > 10 ? '<p class="truncated">... und weitere Zeilen</p>' : ''}
            </div>
        `;
    }

    generateCSV() {
        const headers = ['Position', 'Name', 'Label', 'Type', 'Valid N', 'Missing N'];
        const rows = this.variables.map(v => [
            v.position,
            v.name,
            `"${(v.label || '').replace(/"/g, '""')}"`,
            v.type,
            v.validN,
            v.missingN
        ]);

        return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    updateFormatInfo() {
        const info = document.getElementById('format-info');
        if (!info) return;

        const formatInfos = {
            ddi: {
                title: 'DDI-Lifecycle 3.2',
                description: 'Data Documentation Initiative Standard für sozialwissenschaftliche Metadaten.',
                features: ['Maschinenlesbar', 'Archivierungsstandard', 'Interoperabel']
            },
            pdf: {
                title: 'PDF-Dokument',
                description: 'Druckbares Codebook im PDF-Format.',
                features: ['Druckoptimiert', 'Universell lesbar', 'Archivierbar']
            },
            html: {
                title: 'HTML-Dokumentation',
                description: 'Interaktive Web-Dokumentation mit Navigation.',
                features: ['Interaktiv', 'Durchsuchbar', 'Verlinkbar']
            },
            csv: {
                title: 'CSV-Export',
                description: 'Tabellenformat für Weiterverarbeitung.',
                features: ['Excel-kompatibel', 'Einfach', 'Portabel']
            }
        };

        const current = formatInfos[this.format];
        info.innerHTML = `
            <h4>${current.title}</h4>
            <p>${current.description}</p>
            <ul>
                ${current.features.map(f => `<li>${f}</li>`).join('')}
            </ul>
        `;
    }

    escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    download() {
        let content, filename, mimeType;

        switch (this.format) {
            case 'ddi':
                content = this.generateDDI();
                filename = 'codebook.xml';
                mimeType = 'application/xml';
                break;
            case 'csv':
                content = this.generateCSV();
                filename = 'codebook.csv';
                mimeType = 'text/csv';
                break;
            case 'html':
                content = this.generateFullHTML();
                filename = 'codebook.html';
                mimeType = 'text/html';
                break;
            case 'pdf':
                alert('PDF-Export würde hier eine PDF-Bibliothek erfordern.');
                return;
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    generateFullHTML() {
        return `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>${this.data.metadata?.title || 'Codebook'}</title>
    <style>
        body { font-family: system-ui, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; }
        h1 { color: #1F2937; }
        table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
        th, td { border: 1px solid #E5E7EB; padding: 0.5rem; text-align: left; }
        th { background: #F9FAFB; }
    </style>
</head>
<body>
    <h1>${this.data.metadata?.title || 'Codebook'}</h1>
    <p>${this.data.metadata?.description || ''}</p>
    <h2>Variablen</h2>
    <table>
        <thead><tr><th>#</th><th>Name</th><th>Label</th><th>Typ</th></tr></thead>
        <tbody>
            ${this.variables.map(v => `<tr><td>${v.position}</td><td>${v.name}</td><td>${v.label || ''}</td><td>${v.type}</td></tr>`).join('')}
        </tbody>
    </table>
</body>
</html>`;
    }

    bindEvents() {
        // Format selection
        document.querySelectorAll('input[name="format"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.format = e.target.value;
                this.renderPreview();
                this.updateFormatInfo();
            });
        });

        // Content options
        document.getElementById('include-metadata')?.addEventListener('change', (e) => {
            this.options.metadata = e.target.checked;
            this.renderPreview();
        });

        document.getElementById('include-variables')?.addEventListener('change', (e) => {
            this.options.variables = e.target.checked;
            this.renderPreview();
        });

        document.getElementById('include-values')?.addEventListener('change', (e) => {
            this.options.values = e.target.checked;
            this.renderPreview();
        });

        document.getElementById('include-stats')?.addEventListener('change', (e) => {
            this.options.stats = e.target.checked;
            this.renderPreview();
        });

        document.getElementById('include-frequencies')?.addEventListener('change', (e) => {
            this.options.frequencies = e.target.checked;
            this.renderPreview();
        });

        // Refresh preview
        document.getElementById('refresh-preview')?.addEventListener('click', () => {
            this.renderPreview();
        });

        // Download
        document.getElementById('download-export')?.addEventListener('click', () => {
            this.download();
        });
    }

    bindKeyboard() {
        document.addEventListener('keydown', (e) => {
            // Mode switching
            if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '4') {
                e.preventDefault();
                const modes = ['variablenliste', 'variablendetail', 'validierung', 'export'];
                window.location.href = `${modes[parseInt(e.key) - 1]}.html`;
            }

            // Download
            if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                e.preventDefault();
                this.download();
            }

            // Refresh
            if (e.key === 'r' || e.key === 'R') {
                if (!e.target.matches('input')) {
                    this.renderPreview();
                }
            }
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const app = new CodebookExport();
    app.init();
});

export default CodebookExport;
