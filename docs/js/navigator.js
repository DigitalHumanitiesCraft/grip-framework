// Navigator Demo - Interaction Logic

document.addEventListener('DOMContentLoaded', () => {
    const nodes = document.querySelectorAll('.node');
    const edges = document.querySelectorAll('.edge');
    const detailHint = document.querySelector('.detail-hint');
    const detailContent = document.getElementById('detail-content');

    // Node data
    const nodeData = {
        1: {
            title: 'Smith et al. (2020)',
            journal: 'Journal of Computational Methods',
            citedBy: 12,
            cites: 8,
            cluster: 'methods',
            abstract: 'This paper introduces a novel approach to network analysis that combines graph-theoretic methods with machine learning techniques for improved pattern recognition.',
            connections: [
                { dir: 'zitiert', target: 'Jones 2019' },
                { dir: 'zitiert', target: 'Lee 2019' },
                { dir: 'zitiert von', target: 'Chen 2021' },
                { dir: 'zitiert von', target: 'Kim 2021' }
            ]
        },
        2: {
            title: 'Jones et al. (2019)',
            journal: 'Computational Statistics',
            citedBy: 8,
            cites: 5,
            cluster: 'methods',
            abstract: 'A comprehensive review of statistical methods for network inference, with applications to social science data.',
            connections: [
                { dir: 'zitiert', target: 'Brown 2018' },
                { dir: 'zitiert', target: 'Davis 2017' },
                { dir: 'zitiert von', target: 'Smith 2020' }
            ]
        },
        3: {
            title: 'Lee et al. (2019)',
            journal: 'Theoretical Computer Science',
            citedBy: 9,
            cites: 6,
            cluster: 'theory',
            abstract: 'Formal foundations for graph clustering algorithms with provable guarantees on cluster quality.',
            connections: [
                { dir: 'zitiert', target: 'Wilson 2018' },
                { dir: 'zitiert', target: 'Taylor 2017' },
                { dir: 'zitiert von', target: 'Smith 2020' }
            ]
        }
    };

    // Node selection
    nodes.forEach(node => {
        node.addEventListener('click', () => {
            // Remove previous selection
            nodes.forEach(n => n.classList.remove('selected'));
            edges.forEach(e => e.classList.remove('highlighted'));

            // Select this node
            node.classList.add('selected');

            // Show detail panel
            const nodeId = node.dataset.id;
            const data = nodeData[nodeId] || nodeData[1];

            detailHint.style.display = 'none';
            detailContent.classList.remove('hidden');

            document.getElementById('detail-title').textContent = data.title;
            document.getElementById('detail-journal').textContent = data.journal;
            document.getElementById('detail-cited-by').textContent = `${data.citedBy} Paper`;
            document.getElementById('detail-cites').textContent = `${data.cites} Paper`;

            const clusterTag = document.querySelector('.cluster-tag');
            clusterTag.className = `cluster-tag ${data.cluster}`;
            clusterTag.textContent = data.cluster === 'methods' ? 'Methoden' :
                                     data.cluster === 'theory' ? 'Theorie' : 'Anwendung';

            document.getElementById('detail-abstract-text').textContent = data.abstract;

            const connectionList = document.getElementById('connection-list');
            connectionList.innerHTML = data.connections.map(c =>
                `<li><span class="connection-dir">${c.dir}</span> ${c.target}</li>`
            ).join('');

            // Highlight connected edges (simplified)
            highlightConnections(node);
        });
    });

    function highlightConnections(node) {
        const nodeTransform = node.getAttribute('transform');
        const match = nodeTransform.match(/translate\((\d+),\s*(\d+)\)/);
        if (!match) return;

        const x = parseInt(match[1]);
        const y = parseInt(match[2]);

        edges.forEach(edge => {
            const x1 = parseInt(edge.getAttribute('x1'));
            const y1 = parseInt(edge.getAttribute('y1'));
            const x2 = parseInt(edge.getAttribute('x2'));
            const y2 = parseInt(edge.getAttribute('y2'));

            if ((Math.abs(x1 - x) < 5 && Math.abs(y1 - y) < 5) ||
                (Math.abs(x2 - x) < 5 && Math.abs(y2 - y) < 5)) {
                edge.classList.add('highlighted');
            }
        });
    }

    // Range filters
    const yearFilter = document.getElementById('year-filter');
    const yearValue = document.getElementById('year-value');
    yearFilter.addEventListener('input', () => {
        yearValue.textContent = yearFilter.value;
    });

    const citationsFilter = document.getElementById('citations-filter');
    const citationsValue = document.getElementById('citations-value');
    citationsFilter.addEventListener('input', () => {
        citationsValue.textContent = citationsFilter.value;
    });

    // Cluster toggles
    const clusterBtns = document.querySelectorAll('.cluster-btn');
    clusterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active');
            const cluster = btn.dataset.cluster;

            nodes.forEach(node => {
                const circle = node.querySelector('.node-circle');
                if (circle.classList.contains(cluster)) {
                    node.style.display = btn.classList.contains('active') ? '' : 'none';
                }
            });
        });
    });

    // Layout buttons
    const layoutBtns = document.querySelectorAll('.layout-btn');
    layoutBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            layoutBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            // In a real app, this would trigger a layout change
        });
    });

    // Zoom controls
    let scale = 1;
    const svg = document.querySelector('.graph-svg');

    document.getElementById('zoom-in').addEventListener('click', () => {
        scale = Math.min(scale * 1.2, 3);
        svg.style.transform = `scale(${scale})`;
    });

    document.getElementById('zoom-out').addEventListener('click', () => {
        scale = Math.max(scale / 1.2, 0.5);
        svg.style.transform = `scale(${scale})`;
    });

    document.getElementById('reset-view').addEventListener('click', () => {
        scale = 1;
        svg.style.transform = 'scale(1)';
    });
});
