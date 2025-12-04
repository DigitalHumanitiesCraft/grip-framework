/**
 * Citation Entry Point
 * Navigator-Spezialisierung für bibliometrische Netzwerke
 *
 * Erkennungsheuristik: publications, citations, authors, year, venue
 */

import { Citation } from './citation.js';

document.addEventListener('DOMContentLoaded', async () => {
    const citation = new Citation();
    await citation.init();
});
