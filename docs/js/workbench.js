// Workbench Demo - Interaction Logic

document.addEventListener('DOMContentLoaded', () => {
    // View toggle
    const viewBtns = document.querySelectorAll('.tool-btn[data-view]');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            viewBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Editable cells
    const editableCells = document.querySelectorAll('td[contenteditable="true"]');
    editableCells.forEach(cell => {
        cell.addEventListener('focus', () => {
            // Update inspector
            updateInspector(cell);
        });

        cell.addEventListener('input', () => {
            // Mark as modified
            cell.classList.add('modified');
        });
    });

    function updateInspector(cell) {
        const row = cell.closest('tr');
        const headerCell = document.querySelector(`th:nth-child(${cell.cellIndex + 1})`);
        const fieldName = headerCell ? headerCell.textContent.toLowerCase() : 'unknown';

        document.getElementById('inspector-field').textContent = fieldName;
        document.getElementById('inspector-value').textContent = cell.textContent || '(leer)';

        // Update expected type based on field
        const expectedTypes = {
            'title': 'string (nicht leer)',
            'date': 'ISO 8601 (YYYY-MM-DD)',
            'author': 'string',
            'tags': 'string (kommagetrennt)'
        };
        document.getElementById('inspector-expected').textContent =
            expectedTypes[fieldName] || 'string';
    }

    // Quick fix button
    const fixBtn = document.querySelector('.fix-btn');
    if (fixBtn) {
        fixBtn.addEventListener('click', () => {
            // Find error cells with date format issues
            const errorCells = document.querySelectorAll('.cell-error');
            errorCells.forEach(cell => {
                const value = cell.textContent;
                // Simple date format conversion
                if (value.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
                    const parts = value.split('.');
                    cell.textContent = `${parts[2]}-${parts[1]}-${parts[0]}`;
                    cell.classList.remove('cell-error');
                    cell.closest('tr').querySelector('.status-dot').classList.remove('error');
                    cell.closest('tr').querySelector('.status-dot').classList.add('valid');
                }
            });
            updateValidationStats();
        });
    }

    // Batch operations
    const batchBtns = document.querySelectorAll('.batch-btn');
    batchBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Simulate batch operation
            btn.textContent = 'Ausgeführt!';
            btn.disabled = true;
            setTimeout(() => {
                btn.style.opacity = '0.5';
            }, 500);
        });
    });

    // Delete row
    const deleteButtons = document.querySelectorAll('.row-action.delete');
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('Zeile wirklich löschen?')) {
                btn.closest('tr').remove();
                updateValidationStats();
            }
        });
    });

    // Tree toggle
    const treeToggles = document.querySelectorAll('.tree-toggle');
    treeToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const node = toggle.closest('.tree-node');
            const children = node.nextElementSibling;
            if (children && children.classList.contains('tree-children')) {
                children.style.display =
                    children.style.display === 'none' ? 'block' : 'none';
                toggle.textContent = children.style.display === 'none' ? '+' : '-';
            }
        });
    });

    function updateValidationStats() {
        const errorCount = document.querySelectorAll('.status-dot.error').length;
        const warningCount = document.querySelectorAll('.status-dot.warning').length;
        const validCount = document.querySelectorAll('.status-dot.valid').length;

        const stats = document.querySelectorAll('.validation-stats .stat-value');
        if (stats.length >= 3) {
            stats[0].textContent = errorCount;
            stats[1].textContent = warningCount;
            stats[2].textContent = validCount;
        }
    }

    // Export buttons
    const exportBtns = document.querySelectorAll('.export-btn');
    exportBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            alert(`Export als ${btn.textContent} wird vorbereitet...`);
        });
    });
});
