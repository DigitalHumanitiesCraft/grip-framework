/**
 * Concept Entry Point
 * Navigator-Spezialisierung für Ontologien und semantische Netze
 *
 * Erkennungsheuristik: concepts, broader, narrower, relation_types
 */

import { Concept } from './concept.js';

document.addEventListener('DOMContentLoaded', async () => {
    const concept = new Concept();
    await concept.init();
});
