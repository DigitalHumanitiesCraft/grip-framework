/**
 * Edition Entry Point
 * Reader-Spezialisierung für kritische Textausgaben mit Variantenapparaten
 *
 * Erkennungsheuristik: witnesses, apparatus, siglum, readings
 */

import { Edition } from './edition.js';

document.addEventListener('DOMContentLoaded', async () => {
    const edition = new Edition();
    await edition.init();
});
