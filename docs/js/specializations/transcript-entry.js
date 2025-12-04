/**
 * Transcript Entry Point
 * Reader-Spezialisierung für Interviewtranskripte
 *
 * Erkennungsheuristik: turns, start_ms, codes, paralinguistics
 */

import { Transcript } from './transcript.js';

document.addEventListener('DOMContentLoaded', async () => {
    const transcript = new Transcript();
    await transcript.init();
});
