/**
 * Aggregation methods for DataFrame
 *
 * This module provides a unified API for DataFrame aggregation operations.
 * It imports and re-exports the register function from register.js.
 *
 * @module methods/dataframe/aggregation
 */
import { register as registerMethods } from './register.js';

/**
 * Register all aggregation methods on DataFrame prototype
 *
 * @param {Function} DataFrame - DataFrame class
 */
export function register(DataFrame) {
  // Register all aggregation methods from register.js
  registerMethods(DataFrame);
}

export default register;
