/**
 * Survey Codebook-Modus
 *
 * Variablendokumentation mit Such-, Filter- und Export-Funktionen
 *
 * Benötigte Daten: items[], demographics[], scales[]
 * Wissensbasis: 15-MODI#Survey-Codebook, 12-STANDARDS#DDI
 */

class SurveyCodebook {
    constructor(containerId, dataPath) {
        this.container = document.getElementById(containerId);
        this.dataPath = dataPath || '../data/scope-survey.json';
        this.data = null;
        this.allVariables = [];
        this.filteredVariables = [];
        this.selectedVariable = null;
        this.searchTerm = '';
        this.typeFilters = new Set(['likert', 'numeric', 'categorical', 'binary', 'ordinal']);
        this.sortBy = 'order';

        this.init();
    }

    async init() {
        try {
            const response = await fetch(this.dataPath);
            this.data = await response.json();
            this.prepareVariables();
            this.render();
            this.bindEvents();
            this.bindKeyboard();
        } catch (error) {
            console.error('Fehler beim Laden der Daten:', error);
        }
    }

    prepareVariables() {
        // Kombiniere Items und Demographics
        this.allVariables = [
            ...(this.data.items || []).map((item, index) => ({
                ...item,
                order: index,
                category: 'item'
            })),
            ...(this.data.demographics || []).map((demo, index) => ({
                id: demo.id,
                text: demo.description || demo.id,
                type: demo.type,
                values: demo.values,
                order: 100 + index,
                category: 'demographic'
            }))
        ];

        this.filteredVariables = [...this.allVariables];
    }

    render() {
        if (!this.data) return;

        this.applyFilters();
        this.renderVariableList();
        this.updateStats();
    }

    applyFilters() {
        this.filteredVariables = this.allVariables.filter(v => {
            // Typ-Filter
            if (!this.typeFilters.has(v.type)) return false;

            // Suchfilter
            if (this.searchTerm) {
                const term = this.searchTerm.toLowerCase();
                const matchId = v.id.toLowerCase().includes(term);
                const matchText = v.text?.toLowerCase().includes(term);
                if (!matchId && !matchText) return false;
            }

            return true;
        });

        // Sortierung
        this.filteredVariables.sort((a, b) => {
            switch (this.sortBy) {
                case 'name':
                    return a.id.localeCompare(b.id);
                case 'type':
                    return a.type.localeCompare(b.type);
                case 'scale':
                    const scaleA = this.getParentScale(a.id);
                    const scaleB = this.getParentScale(b.id);
                    return (scaleA || 'zzz').localeCompare(scaleB || 'zzz');
                default:
                    return a.order - b.order;
            }
        });
    }

    getParentScale(itemId) {
        const scale = this.data.scales?.find(s => s.items?.includes(itemId));
        return scale?.label || null;
    }

    renderVariableList() {
        const container = document.getElementById('variable-list');
        if (!container) return;

        if (this.filteredVariables.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Keine Variablen gefunden.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.filteredVariables.map(variable =>
            this.renderVariableCard(variable)
        ).join('');
    }

    renderVariableCard(variable) {
        const isSelected = this.selectedVariable === variable.id;
        const parentScale = this.getParentScale(variable.id);
        const typeClass = `type-${variable.type}`;

        return `
            <div class="variable-card ${isSelected ? 'selected' : ''}"
                 data-variable="${variable.id}">
                <div class="var-header">
                    <code class="var-id">${variable.id}</code>
                    <span class="var-type ${typeClass}">${this.getTypeLabel(variable.type)}</span>
                </div>
                <p class="var-text">${variable.text}</p>
                ${parentScale ? `<span class="var-scale">Skala: ${parentScale}</span>` : ''}
                <div class="var-meta">
                    ${this.renderVariableMeta(variable)}
                </div>
            </div>
        `;
    }

    renderVariableMeta(variable) {
        if (variable.scale) {
            return `<span class="meta-range">${variable.scale.min}-${variable.scale.max}</span>`;
        }
        if (variable.values) {
            return `<span class="meta-values">${variable.values.length} Kategorien</span>`;
        }
        return '';
    }

    getTypeLabel(type) {
        const labels = {
            'likert': 'Likert',
            'numeric': 'Numerisch',
            'binary': 'Binär',
            'categorical': 'Kategorial',
            'ordinal': 'Ordinal'
        };
        return labels[type] || type || 'Unbekannt';
    }

    updateStats() {
        document.getElementById('stat-vars').textContent = this.allVariables.length;
        document.getElementById('stat-shown').textContent = this.filteredVariables.length;
    }

    selectVariable(varId) {
        this.selectedVariable = varId;

        document.querySelectorAll('.variable-card').forEach(el => {
            el.classList.toggle('selected', el.dataset.variable === varId);
        });

        this.showVariableDetail(varId);
    }

    showVariableDetail(varId) {
        const variable = this.allVariables.find(v => v.id === varId);
        if (!variable) return;

        const prompt = document.getElementById('var-prompt');
        const info = document.getElementById('var-info');

        prompt?.classList.add('hidden');
        info?.classList.remove('hidden');

        document.getElementById('var-label').textContent = variable.text;
        document.getElementById('var-id').textContent = variable.id;
        document.getElementById('var-question').textContent = variable.text;

        const typeEl = document.getElementById('var-type');
        if (typeEl) {
            typeEl.textContent = this.getTypeLabel(variable.type);
            typeEl.className = `type-badge type-${variable.type}`;
        }

        // Wertelabels
        this.renderValueLabels(variable);

        // Missing Values
        const missingDef = document.getElementById('missing-def');
        if (missingDef) {
            missingDef.textContent = variable.missing || '-99 = keine Angabe';
        }
    }

    renderValueLabels(variable) {
        const tbody = document.querySelector('#labels-table tbody');
        if (!tbody) return;

        if (variable.scale) {
            // Likert-Skala
            const labels = variable.scale.labels || [];
            tbody.innerHTML = '';
            for (let i = variable.scale.min; i <= variable.scale.max; i++) {
                const label = labels[i - variable.scale.min] || '';
                tbody.innerHTML += `
                    <tr>
                        <td>${i}</td>
                        <td>${label}</td>
                    </tr>
                `;
            }
        } else if (variable.values) {
            // Kategoriale Variable
            tbody.innerHTML = variable.values.map((v, i) => `
                <tr>
                    <td>${i + 1}</td>
                    <td>${v}</td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="2">Keine Wertelabels</td></tr>';
        }
    }

    exportDDI() {
        const ddi = this.generateDDI();
        this.downloadFile(ddi, 'codebook.xml', 'application/xml');
    }

    generateDDI() {
        const variables = this.filteredVariables.map(v => `
    <var ID="${v.id}" name="${v.id}">
      <labl>${this.escapeXML(v.text)}</labl>
      <varFormat type="${v.type}"/>
      ${v.scale ? `<valrng><range min="${v.scale.min}" max="${v.scale.max}"/></valrng>` : ''}
      ${v.values ? v.values.map((val, i) => `
        <catgry><catValu>${i + 1}</catValu><labl>${this.escapeXML(val)}</labl></catgry>
      `).join('') : ''}
    </var>`).join('\n');

        return `<?xml version="1.0" encoding="UTF-8"?>
<codeBook xmlns="ddi:codebook:2_5">
  <stdyDscr>
    <citation>
      <titlStmt>
        <titl>${this.escapeXML(this.data.survey_meta?.title || 'Survey')}</titl>
      </titlStmt>
    </citation>
  </stdyDscr>
  <dataDscr>
${variables}
  </dataDscr>
</codeBook>`;
    }

    exportSPSS() {
        const syntax = this.generateSPSS();
        this.downloadFile(syntax, 'codebook.sps', 'text/plain');
    }

    generateSPSS() {
        let syntax = '* SPSS Syntax generated from GRIP Survey Codebook.\n\n';

        // Variable Labels
        syntax += 'VARIABLE LABELS\n';
        this.filteredVariables.forEach(v => {
            syntax += `  ${v.id} "${v.text.replace(/"/g, "'")}"\n`;
        });
        syntax += '.\n\n';

        // Value Labels
        syntax += 'VALUE LABELS\n';
        this.filteredVariables.forEach(v => {
            if (v.scale?.labels) {
                syntax += `  ${v.id}\n`;
                v.scale.labels.forEach((label, i) => {
                    syntax += `    ${v.scale.min + i} "${label}"\n`;
                });
            } else if (v.values) {
                syntax += `  ${v.id}\n`;
                v.values.forEach((val, i) => {
                    syntax += `    ${i + 1} "${val}"\n`;
                });
            }
        });
        syntax += '.\n';

        return syntax;
    }

    exportStata() {
        const doFile = this.generateStata();
        this.downloadFile(doFile, 'codebook.do', 'text/plain');
    }

    generateStata() {
        let doFile = '* Stata Do-File generated from GRIP Survey Codebook\n\n';

        // Variable Labels
        this.filteredVariables.forEach(v => {
            doFile += `label variable ${v.id} "${v.text.replace(/"/g, "'")}"\n`;
        });

        doFile += '\n';

        // Value Labels
        this.filteredVariables.forEach(v => {
            if (v.scale?.labels) {
                doFile += `label define ${v.id}_lbl `;
                v.scale.labels.forEach((label, i) => {
                    doFile += `${v.scale.min + i} "${label}" `;
                });
                doFile += `\nlabel values ${v.id} ${v.id}_lbl\n`;
            } else if (v.values) {
                doFile += `label define ${v.id}_lbl `;
                v.values.forEach((val, i) => {
                    doFile += `${i + 1} "${val}" `;
                });
                doFile += `\nlabel values ${v.id} ${v.id}_lbl\n`;
            }
        });

        return doFile;
    }

    escapeXML(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    bindEvents() {
        // Suche
        document.getElementById('var-search')?.addEventListener('input', (e) => {
            this.searchTerm = e.target.value;
            this.render();
        });

        // Typ-Filter
        document.querySelectorAll('.type-filters input').forEach(input => {
            input.addEventListener('change', (e) => {
                const type = e.target.dataset.type;
                if (e.target.checked) {
                    this.typeFilters.add(type);
                } else {
                    this.typeFilters.delete(type);
                }
                this.render();
            });
        });

        // Sortierung
        document.getElementById('sort-by')?.addEventListener('change', (e) => {
            this.sortBy = e.target.value;
            this.render();
        });

        // Export
        document.getElementById('export-ddi')?.addEventListener('click', () => this.exportDDI());
        document.getElementById('export-spss')?.addEventListener('click', () => this.exportSPSS());
        document.getElementById('export-stata')?.addEventListener('click', () => this.exportStata());

        // Variable-Klick
        document.getElementById('variable-list')?.addEventListener('click', (e) => {
            const card = e.target.closest('.variable-card');
            if (card) {
                this.selectVariable(card.dataset.variable);
            }
        });
    }

    bindKeyboard() {
        document.addEventListener('keydown', (e) => {
            // Modi-Wechsel
            if ((e.metaKey || e.ctrlKey) && e.key >= '1' && e.key <= '4') {
                e.preventDefault();
                const modes = ['fragebogen', 'verteilung', 'skalen', 'codebook'];
                window.location.href = `${modes[parseInt(e.key) - 1]}.html`;
            }

            // Suche fokussieren
            if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
                e.preventDefault();
                document.getElementById('var-search')?.focus();
            }

            // Navigation
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                if (document.activeElement?.id !== 'var-search') {
                    e.preventDefault();
                    this.navigateVariables(e.key === 'ArrowDown' ? 1 : -1);
                }
            }
        });
    }

    navigateVariables(direction) {
        const cards = document.querySelectorAll('.variable-card');
        const currentIndex = Array.from(cards).findIndex(c =>
            c.classList.contains('selected')
        );

        let newIndex = currentIndex + direction;
        if (newIndex < 0) newIndex = cards.length - 1;
        if (newIndex >= cards.length) newIndex = 0;

        const newCard = cards[newIndex];
        if (newCard) {
            this.selectVariable(newCard.dataset.variable);
            newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

// Initialisierung
document.addEventListener('DOMContentLoaded', () => {
    new SurveyCodebook('variable-list');
});

export default SurveyCodebook;
