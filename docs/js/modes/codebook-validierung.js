/**
 * Codebook Validierung Mode
 * Qualitätsprüfung und Konsistenzvalidierung
 */

class CodebookValidierung {
    constructor() {
        this.data = null;
        this.variables = [];
        this.issues = [];
        this.filteredIssues = [];
        this.selectedIssue = null;
        this.activeFilter = 'all';
        this.activeCategories = {
            completeness: true,
            consistency: true,
            format: true,
            range: true
        };
    }

    async init() {
        try {
            const response = await fetch('../data/codebook-data.json');
            this.data = await response.json();
            this.variables = this.data.variables || [];
            this.render();
            this.bindEvents();
            this.bindKeyboard();
        } catch (error) {
            console.error('Fehler beim Laden der Codebook-Daten:', error);
            this.loadDemoData();
        }
    }

    loadDemoData() {
        this.variables = [
            { position: 1, name: 'id', label: 'Fallnummer', type: 'numeric', validN: 1000, missingN: 0 },
            { position: 2, name: 'age', label: 'Alter in Jahren', type: 'numeric', validN: 985, missingN: 15, min: 18, max: 99 },
            { position: 3, name: 'gender', label: '', type: 'categorical', validN: 998, missingN: 2 },
            { position: 4, name: 'VAR004', label: 'Unnamed variable', type: 'numeric', validN: 900, missingN: 100 },
            { position: 5, name: 'income', label: 'Einkommen', type: 'numeric', validN: 850, missingN: 150, min: -500, max: 25000 }
        ];
        this.render();
    }

    runValidation() {
        this.issues = [];

        this.variables.forEach(variable => {
            // Completeness checks
            if (this.activeCategories.completeness) {
                if (!variable.label || variable.label.trim() === '') {
                    this.issues.push({
                        severity: 'error',
                        category: 'completeness',
                        rule: 'Label fehlt',
                        variable: variable.name,
                        expected: 'Beschreibendes Label',
                        found: 'Kein Label',
                        suggestion: 'Fügen Sie ein aussagekräftiges Label hinzu.'
                    });
                }

                if (!variable.description) {
                    this.issues.push({
                        severity: 'warning',
                        category: 'completeness',
                        rule: 'Beschreibung fehlt',
                        variable: variable.name,
                        expected: 'Variablenbeschreibung',
                        found: 'Keine Beschreibung',
                        suggestion: 'Ergänzen Sie eine detaillierte Beschreibung.'
                    });
                }
            }

            // Consistency checks
            if (this.activeCategories.consistency) {
                const missingRate = variable.missingN / (variable.validN + variable.missingN);
                if (missingRate > 0.1) {
                    this.issues.push({
                        severity: missingRate > 0.3 ? 'error' : 'warning',
                        category: 'consistency',
                        rule: 'Hohe Missing-Rate',
                        variable: variable.name,
                        expected: '< 10% fehlende Werte',
                        found: `${(missingRate * 100).toFixed(1)}% fehlen`,
                        suggestion: 'Prüfen Sie die Datenerhebung oder dokumentieren Sie den Grund.'
                    });
                }
            }

            // Format checks
            if (this.activeCategories.format) {
                if (/^VAR\d+$/.test(variable.name)) {
                    this.issues.push({
                        severity: 'warning',
                        category: 'format',
                        rule: 'Generischer Variablenname',
                        variable: variable.name,
                        expected: 'Sprechender Name',
                        found: variable.name,
                        suggestion: 'Verwenden Sie einen aussagekräftigen Variablennamen.'
                    });
                }
            }

            // Range checks
            if (this.activeCategories.range) {
                if (variable.type === 'numeric' && variable.min < 0 && variable.name.includes('income')) {
                    this.issues.push({
                        severity: 'warning',
                        category: 'range',
                        rule: 'Negativer Wert bei Einkommen',
                        variable: variable.name,
                        expected: 'Werte >= 0',
                        found: `Min = ${variable.min}`,
                        suggestion: 'Prüfen Sie negative Werte auf Plausibilität.'
                    });
                }
            }
        });

        // Add some OK items for demonstration
        this.variables.forEach(variable => {
            if (!this.issues.some(i => i.variable === variable.name)) {
                this.issues.push({
                    severity: 'ok',
                    category: 'all',
                    rule: 'Alle Prüfungen bestanden',
                    variable: variable.name,
                    expected: '–',
                    found: '–',
                    suggestion: '–'
                });
            }
        });

        this.applyFilter();
        this.renderResults();
        this.updateStats();
    }

    applyFilter() {
        if (this.activeFilter === 'all') {
            this.filteredIssues = this.issues;
        } else {
            this.filteredIssues = this.issues.filter(i => i.severity === this.activeFilter);
        }
    }

    render() {
        // Initial empty state
        const results = document.getElementById('validation-results');
        if (results) {
            results.innerHTML = `
                <div class="empty-state">
                    <p>Klicken Sie "Validierung starten" um die Prüfung durchzuführen.</p>
                </div>
            `;
        }
    }

    renderResults() {
        const container = document.getElementById('validation-results');
        if (!container) return;

        if (this.filteredIssues.length === 0) {
            container.innerHTML = '<div class="no-issues"><p>Keine Issues gefunden.</p></div>';
            return;
        }

        container.innerHTML = `
            <div class="issues-list">
                ${this.filteredIssues.map((issue, index) => `
                    <div class="issue-item ${issue.severity}" data-index="${index}">
                        <div class="issue-icon">${this.getSeverityIcon(issue.severity)}</div>
                        <div class="issue-content">
                            <span class="issue-variable">${issue.variable}</span>
                            <span class="issue-rule">${issue.rule}</span>
                        </div>
                        <span class="issue-category">${issue.category}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    getSeverityIcon(severity) {
        const icons = {
            error: '✗',
            warning: '⚠',
            ok: '✓'
        };
        return icons[severity] || '?';
    }

    showIssueDetail(index) {
        const issue = this.filteredIssues[index];
        if (!issue) return;

        this.selectedIssue = issue;

        const detail = document.getElementById('issue-detail');
        if (!detail) return;

        detail.classList.remove('hidden');

        const severityBadge = document.getElementById('detail-severity');
        severityBadge.textContent = issue.severity === 'ok' ? 'OK' :
                                   issue.severity === 'error' ? 'Fehler' : 'Warnung';
        severityBadge.className = `severity-badge ${issue.severity}`;

        document.getElementById('detail-rule').textContent = issue.rule;
        document.getElementById('detail-variable').textContent = issue.variable;
        document.getElementById('detail-expected').textContent = issue.expected;
        document.getElementById('detail-found').textContent = issue.found;
        document.getElementById('detail-suggestion').textContent = issue.suggestion;

        const fixBtn = document.getElementById('fix-issue');
        fixBtn.style.display = issue.severity === 'ok' ? 'none' : 'block';
    }

    updateStats() {
        const errors = this.issues.filter(i => i.severity === 'error').length;
        const warnings = this.issues.filter(i => i.severity === 'warning').length;
        const ok = this.issues.filter(i => i.severity === 'ok').length;

        document.getElementById('stat-checked').textContent = this.variables.length;
        document.getElementById('stat-errors').textContent = errors;
        document.getElementById('stat-warnings').textContent = warnings;
        document.getElementById('stat-ok').textContent = ok;
    }

    bindEvents() {
        // Run validation
        document.getElementById('run-validation')?.addEventListener('click', () => {
            this.runValidation();
        });

        // Category filters
        document.querySelectorAll('.rule-categories input').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.activeCategories[e.target.dataset.category] = e.target.checked;
            });
        });

        // Severity filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.activeFilter = btn.dataset.filter;
                this.applyFilter();
                this.renderResults();
            });
        });

        // Issue selection
        document.getElementById('validation-results')?.addEventListener('click', (e) => {
            const item = e.target.closest('.issue-item');
            if (item) {
                document.querySelectorAll('.issue-item').forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
                this.showIssueDetail(parseInt(item.dataset.index));
            }
        });

        // Search
        document.getElementById('issue-search')?.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            if (!query) {
                this.applyFilter();
            } else {
                this.filteredIssues = this.issues.filter(i =>
                    i.variable.toLowerCase().includes(query) ||
                    i.rule.toLowerCase().includes(query)
                );
            }
            this.renderResults();
        });

        // Fix issue (demo)
        document.getElementById('fix-issue')?.addEventListener('click', () => {
            if (this.selectedIssue) {
                alert(`Fix für "${this.selectedIssue.variable}": ${this.selectedIssue.suggestion}`);
            }
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

            // Run validation
            if (e.key === 'Enter' && !e.target.matches('input')) {
                this.runValidation();
            }

            // Fix
            if (e.key === 'f' || e.key === 'F') {
                document.getElementById('fix-issue')?.click();
            }
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const app = new CodebookValidierung();
    app.init();
});

export default CodebookValidierung;
