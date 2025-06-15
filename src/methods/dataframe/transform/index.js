/**
 * DataFrame transform methods
 *
 * This module provides a unified API for DataFrame transformation operations.
 * It imports and re-exports the register function from register.js.
 *
 * @module methods/dataframe/transform
 */
import { registerDataFrameTransform as registerMethods } from './register.js';

/**
 * Register all transform methods on DataFrame prototype
 *
 * @param {Function} DataFrame - DataFrame class
 */
export function register(DataFrame) {
  // Register all transform methods from register.js
  registerMethods(DataFrame);
}

export default register;
