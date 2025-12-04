// Workflows Module - Handles workflow visualization

export const workflows = {
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

export function initWorkflows() {
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
            pathHTML += `
                <a href="${phase.link}" class="workflow-phase ${phase.archetype}">
                    <div class="phase-icon">${phase.name.charAt(0)}</div>
                    <span class="phase-name">${phase.name}</span>
                    <span class="phase-action">${phase.action}</span>
                </a>
            `;

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
