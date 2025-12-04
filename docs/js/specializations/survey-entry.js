/**
 * Survey Entry Point
 * Scope-Spezialisierung für Umfragedaten mit Likert-Skalen
 *
 * Erkennungsheuristik: scales, items, likert, demographics, cronbach_alpha
 */

import { Survey } from './survey.js';

document.addEventListener('DOMContentLoaded', async () => {
    const survey = new Survey();
    await survey.init();
});
