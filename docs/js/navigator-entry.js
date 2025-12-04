// Navigator Demo Entry Point
import { AdaptiveNavigator } from './archetypes/navigator.js';

document.addEventListener('DOMContentLoaded', () => {
    new AdaptiveNavigator('data/navigator-citations.json');
});
