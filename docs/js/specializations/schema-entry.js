/**
 * Schema Entry Point
 * Workbench-Spezialisierung für JSON-Schema-Editierung
 *
 * Erkennungsheuristik: $schema, properties, required, definitions
 */

import { Schema } from './schema.js';

document.addEventListener('DOMContentLoaded', async () => {
    const schema = new Schema();
    await schema.init();
});
