/**
 * Codebook Entry Point
 * Workbench-Spezialisierung für Variablendefinitionen
 *
 * Erkennungsheuristik: variables, valid_values, missing_values, measurement_level
 */

import { Codebook } from './codebook.js';

document.addEventListener('DOMContentLoaded', async () => {
    const codebook = new Codebook();
    await codebook.init();
});
