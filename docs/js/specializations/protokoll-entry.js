/**
 * Protokoll Entry Point
 * Reader-Spezialisierung für Sitzungsmitschriften und Verhandlungen
 *
 * Erkennungsheuristik: session, agenda, speaker, resolution
 */

import { Protokoll } from './protokoll.js';

document.addEventListener('DOMContentLoaded', async () => {
    const protokoll = new Protokoll();
    await protokoll.init();
});
