/**
 * Genealogy Entry Point
 * Navigator-Spezialisierung für Verwandtschaftsnetzwerke
 *
 * Erkennungsheuristik: persons, parent_child, spouse, generation
 */

import { Genealogy } from './genealogy.js';

document.addEventListener('DOMContentLoaded', async () => {
    const genealogy = new Genealogy();
    await genealogy.init();
});
