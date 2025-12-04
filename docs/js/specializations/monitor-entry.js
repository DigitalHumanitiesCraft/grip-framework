/**
 * Monitor Entry Point
 * Scope-Spezialisierung für Echtzeit-/Zeitreihendaten mit Schwellwerten
 *
 * Erkennungsheuristik: thresholds, alerts, anomaly_score, readings
 */

import { Monitor } from './monitor.js';

document.addEventListener('DOMContentLoaded', async () => {
    const monitor = new Monitor();
    await monitor.init();
});
