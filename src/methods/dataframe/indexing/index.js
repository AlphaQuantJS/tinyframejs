/**
 * DataFrame indexing methods
 *
 * This module provides a unified API for DataFrame indexing operations.
 * It imports and re-exports the register function from register.js.
 *
 * @module methods/dataframe/indexing
 */
import { registerDataFrameIndexing as registerMethods } from './register.js';

/**
 * Register all indexing methods on DataFrame prototype
 *
 * @param {Function} DataFrame - DataFrame class
 */
export function register(DataFrame) {
  // Register all indexing methods from register.js
  registerMethods(DataFrame);
}

export default register;

// Export nothing as methods are attached to DataFrame prototype
export {};
