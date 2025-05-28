/**
 * Display module for TinyFrameJS
 * Provides functions for displaying DataFrame in different environments
 */

// Console display functions
export { print, formatTable } from './console/index.js';

// Web display functions
export { toHTML, display, renderTo } from './web/index.js';
export { toJupyter, registerJupyterDisplay } from './web/index.js';
