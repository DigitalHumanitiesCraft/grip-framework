/**
 * Matrix Entry Point
 * Scope-Spezialisierung für Kreuzvergleiche und Häufigkeitsanalysen
 *
 * Erkennungsheuristik: dimensions.rows, dimensions.columns, cells, chi_square
 */

import { Matrix } from './matrix.js';

document.addEventListener('DOMContentLoaded', async () => {
    const matrix = new Matrix();
    await matrix.init();
});
