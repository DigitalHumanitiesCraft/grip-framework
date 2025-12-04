// Workbench Demo Entry Point
import { AdaptiveWorkbench } from './archetypes/workbench.js';

document.addEventListener('DOMContentLoaded', () => {
    new AdaptiveWorkbench('data/workbench-metadata.json');
});
