// GRIP Framework - Main Entry Point
// ES6 Module Architecture

import { initMatrix } from './modules/matrix.js';
import { initWorkflows } from './modules/workflows.js';

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initMatrix();
    initWorkflows();
});
