// Reader Demo Entry Point
import { AdaptiveReader } from './archetypes/reader.js';

document.addEventListener('DOMContentLoaded', () => {
    new AdaptiveReader('data/reader-correspondence.json');
});
