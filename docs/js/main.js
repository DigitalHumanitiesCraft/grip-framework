// GRIP Framework - Matrix Interactivity

const matrixData = {
    // Archetypen
    reader: {
        title: "The Reader",
        description: "Ein Interface für lineare Daten, bei denen Kontext und narrative Abfolge im Vordergrund stehen. Fokus auf Immersion und vertieftes Verstehen.",
        examples: "Transkripte, Zeitstrahlen, annotierte Quellentexte, DNA-Sequenzen."
    },
    scope: {
        title: "The Scope",
        description: "Ein analytisches Dashboard für multidimensionale Daten. Optimiert für Mustererkennung, Vergleich und Trendanalyse.",
        examples: "Messwerte, Statistiken, Umfragedaten, Zeitreihenvergleiche."
    },
    navigator: {
        title: "The Navigator",
        description: "Eine topologische Ansicht für vernetzte Daten. Visualisiert Beziehungen, Pfade und Strukturen.",
        examples: "Zitationsnetzwerke, Korrespondenzen, Dependency-Graphen, Ontologien."
    },
    workbench: {
        title: "The Workbench",
        description: "Eine Arbeitsumgebung für hierarchische oder rohe Daten. Fokus auf Manipulation, Bereinigung und Kuratierung.",
        examples: "JSON-Dumps, unbereinigte Tabellen, Metadaten-Exporte, Kategoriesysteme."
    },

    // Ambige Fälle mit Rückfragen
    "ambig-seq-rekon": {
        title: "Rückfrage erforderlich",
        description: "Sequenzielle Daten mit Rekonstruktions-Intention sind ambig. Verweise zwischen Elementen können unterschiedlich priorisiert werden.",
        reasoning: "Rückfrage: Wollen Sie den chronologischen Fluss verstehen (dann Reader mit Querverweisen) oder die Verweisstruktur analysieren (dann Navigator mit Zeitfilter)?",
        isAmbig: true
    },
    "ambig-net-verst": {
        title: "Rückfrage erforderlich",
        description: "Vernetzte Daten mit Verstehens-Intention sind ambig. 'Verstehen' kann lokal (einzelne Knoten) oder global (Gesamtstruktur) gemeint sein.",
        reasoning: "Rückfrage: Wollen Sie einzelne Elemente im Kontext ihrer Verbindungen lesen (dann Reader mit Links) oder die Netzwerkstruktur als Ganzes erfassen (dann Navigator)?",
        isAmbig: true
    },
    "ambig-net-vergl": {
        title: "Rückfrage erforderlich",
        description: "Vernetzte Daten mit Vergleichs-Intention sind ambig. Netzwerke können metrisch oder strukturell verglichen werden.",
        reasoning: "Rückfrage: Wollen Sie Kennzahlen der Netzwerke vergleichen (dann Scope mit Netzwerk-Metriken) oder Strukturen visuell nebeneinanderlegen (dann Navigator mit Small Multiples)?",
        isAmbig: true
    },
    "ambig-hier-verst": {
        title: "Rückfrage erforderlich",
        description: "Hierarchische Daten mit Verstehens-Intention sind ambig. Die Hierarchie kann Container oder Analysegegenstand sein.",
        reasoning: "Rückfrage: Wollen Sie ein verschachteltes Dokument linear durcharbeiten (dann Reader mit Navigation) oder die Hierarchiestruktur selbst analysieren (dann Navigator)?",
        isAmbig: true
    }
};

// Begründungen für Sekundärfälle
const reasonings = {
    "sequenziell-vergleich": "Mehrere Zeitreihen überlagern ist eine Vergleichsoperation. Das erfordert visuelle Abstraktion durch Charts, nicht lineares Lesen.",
    "sequenziell-kuratierung": "Transkripte bereinigen erfordert Inline-Editing und atomaren Datenzugriff, nicht Immersion.",
    "multidimensional-verstehen": "Einzelfälle in Tabellen verstehen heißt filtern und inspizieren. Das bleibt ein Dashboard mit Detailansicht.",
    "multidimensional-rekonstruktion": "Wenn in Tabellen Beziehungen stecken (Fremdschlüssel), ist die Strukturfrage eine Graph-Frage.",
    "multidimensional-kuratierung": "Fehlerhafte Tabelleneinträge korrigieren erfordert direkten Datenzugriff.",
    "vernetzt-kuratierung": "Kanten bereinigen oder Knoten zusammenführen erfordert atomaren Datenzugriff, nicht Visualisierung.",
    "hierarchisch-vergleich": "Kategorien vergleichen (etwa per Treemap) ist eine Aggregationsaufgabe.",
    "hierarchisch-rekonstruktion": "Hierarchien sind gerichtete Graphen. Strukturanalyse ist Graph-Analyse."
};

document.addEventListener('DOMContentLoaded', () => {
    const cells = document.querySelectorAll('.decision-matrix .cell');
    const resultBox = document.getElementById('matrix-result');
    const resultTitle = document.getElementById('result-title');
    const resultDescription = document.getElementById('result-description');
    const resultReasoning = document.getElementById('result-reasoning');

    cells.forEach(cell => {
        cell.addEventListener('click', () => {
            // Remove active class from all cells
            cells.forEach(c => c.classList.remove('active'));
            cell.classList.add('active');

            const archetype = cell.dataset.archetype;
            const type = cell.dataset.type;
            const data = matrixData[archetype];

            if (!data) return;

            // Get row and column for reasoning lookup
            const row = cell.parentElement;
            const rowIndex = Array.from(row.parentElement.children).indexOf(row);
            const cellIndex = Array.from(row.children).indexOf(cell) - 1; // -1 for th

            const topologies = ['sequenziell', 'multidimensional', 'vernetzt', 'hierarchisch'];
            const intentions = ['verstehen', 'vergleich', 'rekonstruktion', 'kuratierung'];
            const reasoningKey = `${topologies[rowIndex]}-${intentions[cellIndex]}`;

            // Update result box
            resultTitle.textContent = data.title;
            resultDescription.textContent = data.description;

            // Set reasoning
            if (data.isAmbig) {
                resultReasoning.textContent = data.reasoning;
            } else if (type === 'primary') {
                resultReasoning.textContent = `Primäre Zuordnung: Dies ist der Kernfall für diesen Archetyp.`;
            } else if (reasonings[reasoningKey]) {
                resultReasoning.textContent = `Begründung: ${reasonings[reasoningKey]}`;
            } else {
                resultReasoning.textContent = '';
            }

            // Update styling
            resultBox.className = 'matrix-result';
            if (data.isAmbig) {
                resultBox.classList.add('ambig');
            } else {
                resultBox.classList.add(archetype);
            }

            resultBox.classList.remove('hidden');
        });
    });

    // Workflow Visualization
    initWorkflows();
});

// Workflow Data
const workflows = {
    qualitative: {
        name: "Qualitative Analyse",
        phases: [
            { archetype: "reader", name: "Reader", action: "Lesen", link: "examples/reader.html" },
            { archetype: "workbench", name: "Workbench", action: "Codieren", link: "examples/workbench.html" },
            { archetype: "navigator", name: "Navigator", action: "Vernetzen", link: "examples/navigator.html" },
            { archetype: "scope", name: "Scope", action: "Vergleichen", link: "examples/scope.html" }
        ],
        iteration: "Reader ↔ Workbench ↔ Navigator",
        summary: "Sie lesen erst, codieren dann, vernetzen die Codes, vergleichen schließlich Fälle.",
        userStory: "Als qualitative Forscherin möchte ich Interview-Material systematisch analysieren, indem ich iterativ zwischen Lesen, Codieren, Vernetzen und Vergleichen wechsle, um eine datengestützte Theorie zu entwickeln."
    },
    review: {
        name: "Systematisches Literaturreview",
        phases: [
            { archetype: "navigator", name: "Navigator", action: "Kartieren", link: "examples/navigator.html" },
            { archetype: "reader", name: "Reader", action: "Lesen", link: "examples/reader.html" },
            { archetype: "workbench", name: "Workbench", action: "Extrahieren", link: "examples/workbench.html" },
            { archetype: "scope", name: "Scope", action: "Synthesieren", link: "examples/scope.html" }
        ],
        iteration: "Navigator ↔ Reader",
        summary: "Sie kartieren erst das Feld, lesen dann gezielt, extrahieren Daten, synthesieren am Ende.",
        userStory: "Als Wissenschaftlerin möchte ich den Forschungsstand systematisch aufarbeiten, indem ich die Literaturlandschaft kartiere, gezielt lese und extrahiere, um eine fundierte Synthese zu erstellen."
    },
    cleaning: {
        name: "Datenbereinigung",
        phases: [
            { archetype: "scope", name: "Scope", action: "Analysieren", link: "examples/scope.html" },
            { archetype: "workbench", name: "Workbench", action: "Bereinigen", link: "examples/workbench.html" },
            { archetype: "scope", name: "Scope", action: "Validieren", link: "examples/scope.html" }
        ],
        iteration: "Workbench ↔ Scope",
        summary: "Sie analysieren erst die Qualität, bereinigen dann, validieren abschließend.",
        userStory: "Als Datenmanagerin möchte ich einen Datenexport für die Migration vorbereiten, indem ich die Qualität analysiere, systematisch bereinige und abschließend validiere."
    },
    edition: {
        name: "Digitale Edition",
        phases: [
            { archetype: "reader", name: "Reader", action: "Transkribieren", link: "examples/reader.html" },
            { archetype: "workbench", name: "Workbench", action: "Normalisieren", link: "examples/workbench.html" },
            { archetype: "navigator", name: "Navigator", action: "Verknüpfen", link: "examples/navigator.html" },
            { archetype: "reader", name: "Reader", action: "Publizieren", link: "examples/reader.html" }
        ],
        iteration: "Reader ↔ Workbench",
        summary: "Sie transkribieren, normalisieren, verknüpfen, publizieren.",
        userStory: "Als Editorin möchte ich einen historischen Briefwechsel digital edieren, indem ich transkribiere, normalisiere, verknüpfe und publiziere, um die Quellen zugänglich zu machen."
    },
    survey: {
        name: "Survey-Forschung",
        phases: [
            { archetype: "workbench", name: "Workbench", action: "Codebook", link: "examples/workbench.html" },
            { archetype: "scope", name: "Scope", action: "Auswerten", link: "examples/scope.html" },
            { archetype: "navigator", name: "Navigator", action: "Zusammenhänge", link: "examples/navigator.html" },
            { archetype: "reader", name: "Reader", action: "Berichten", link: "examples/reader.html" }
        ],
        iteration: null,
        summary: "Sie definieren das Codebook, werten aus, analysieren Zusammenhänge, berichten.",
        userStory: "Als empirische Sozialforscherin möchte ich Survey-Daten auswerten, indem ich vom strukturierten Codebook über deskriptive Analysen zu Zusammenhangsanalysen fortschreite."
    }
};

function initWorkflows() {
    const workflowBtns = document.querySelectorAll('.workflow-btn');
    const workflowPath = document.getElementById('workflow-path');
    const workflowSummary = document.getElementById('workflow-summary');
    const workflowUserStory = document.getElementById('workflow-user-story');

    if (!workflowPath) return; // Not on main page

    // Render initial workflow
    renderWorkflow('qualitative');

    // Add click handlers
    workflowBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            workflowBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderWorkflow(btn.dataset.workflow);
        });
    });

    function renderWorkflow(workflowId) {
        const workflow = workflows[workflowId];
        if (!workflow) return;

        // Build path HTML
        let pathHTML = '';
        workflow.phases.forEach((phase, index) => {
            // Phase element
            pathHTML += `
                <a href="${phase.link}" class="workflow-phase ${phase.archetype}">
                    <div class="phase-icon">${phase.name.charAt(0)}</div>
                    <span class="phase-name">${phase.name}</span>
                    <span class="phase-action">${phase.action}</span>
                </a>
            `;

            // Arrow between phases (not after last)
            if (index < workflow.phases.length - 1) {
                pathHTML += '<span class="workflow-arrow">→</span>';
            }
        });

        // Iteration indicator
        if (workflow.iteration) {
            pathHTML += `
                <span class="workflow-iteration">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 1l4 4-4 4"></path>
                        <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                        <path d="M7 23l-4-4 4-4"></path>
                        <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                    </svg>
                    ${workflow.iteration}
                </span>
            `;
        }

        workflowPath.innerHTML = pathHTML;
        workflowSummary.textContent = workflow.summary;
        workflowUserStory.textContent = workflow.userStory;
    }
}
