/**
 * TinyFrameJS - Lightweight, high-performance tabular data engine for JavaScript
 *
 * Main entry point for the library
 * @module tinyframejs
 */

// Export core components
export { DataFrame } from './core/DataFrame.js';
export { createFrame, cloneFrame } from './core/createFrame.js';
export * from './core/types.js';
export * from './core/validators.js';

// Initialize automatic extension of DataFrame methods
import './methods/autoExtend.js';

// Export IO functions
export * from './io/index.js';

// Export aggregation and transformation methods
export * from './methods/raw.js';

// Export utilities
export * from './utils/index.js';

// Export display functions
export * from './display/index.js';
