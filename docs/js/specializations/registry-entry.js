/**
 * Registry Entry Point
 * Workbench-Spezialisierung für Sammlungsinventare
 *
 * Erkennungsheuristik: inventory_number, location, condition, controlled_vocabularies
 */

import { Registry } from './registry.js';

document.addEventListener('DOMContentLoaded', async () => {
    const registry = new Registry();
    await registry.init();
});
