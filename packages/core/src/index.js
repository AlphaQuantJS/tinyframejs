/**
 * Main entry point for @tinyframejs/core
 * Exports all public classes and functions
 */

// Export core classes
export { DataFrame } from './data/model/DataFrame.js';
export { Series } from './data/model/Series.js';

// Export utility functions
export { extendDataFrame } from './data/model/extendDataFrame.js';

// Register all methods
import { registerAllMethods } from './registerMethods.js';
import { DataFrame } from './data/model/DataFrame.js';
import { Series } from './data/model/Series.js';

// Auto-register methods on DataFrame and Series prototypes
registerAllMethods({ DataFrame, Series });
