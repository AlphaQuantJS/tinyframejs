/**
 * Reshape methods for DataFrame and Series
 *
 * This module provides a unified API for reshaping operations.
 * It imports and re-exports the register function from register.js.
 *
 * @module methods/reshape
 */
import { registerReshapeMethods } from './register.js';

/**
 * Register all reshape methods on DataFrame and Series prototypes
 *
 * @param {Function} DataFrame - DataFrame class
 * @param {Function} Series - Series class
 */
export function register(DataFrame, Series) {
  // Register all reshape methods from register.js
  registerReshapeMethods(DataFrame, Series);
}

export default register;
