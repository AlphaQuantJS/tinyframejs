/**
 * TinyFrameJS - Lightweight, high-performance tabular data engine for JavaScript
 *
 * Main entry point for the library
 * @module tinyframejs
 */

// Export core components
export { DataFrame } from './core/dataframe/DataFrame.js';
export { Series } from './core/dataframe/Series.js';
// Removed reference to non-existent createFrame.js
export * from './core/types.js';
export * from './core/utils/validators.js';

// Initialize automatic extension of DataFrame and Series methods
import './methods/autoExtend.js';
import './methods/index.js';

// Export IO functions
export * from './io/index.js';

// Methods for aggregation and transformation are now registered automatically
// through registerAll.js and are not exported directly

// Note: Utility and display functions will be added in future versions
