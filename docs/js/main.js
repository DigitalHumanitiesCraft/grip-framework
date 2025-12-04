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
});
