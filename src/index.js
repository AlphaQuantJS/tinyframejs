/**
 * TinyFrameJS - Lightweight, high-performance tabular data engine for JavaScript
 *
 * Main entry point for the library
 * @module tinyframejs
 */

// Export core components
export { DataFrame } from './core/dataframe/DataFrame.js';
export { createFrame, cloneFrame } from './core/createFrame.js';
export * from './core/types.js';
export * from './core/utils/validators.js';

// Initialize automatic extension of DataFrame methods
import './methods/autoExtend.js';

// Export IO functions
export * from './io/index.js';

// Export aggregation and transformation methods
export * from './methods/raw.js';

// Note: Utility and display functions will be added in future versions
