/**
 * Series transform methods
 *
 * This module provides a unified API for Series transformation operations.
 * It imports and re-exports the register function from register.js.
 *
 * @module methods/series/transform
 */
import { registerSeriesTransform } from './register.js';

/**
 * Register all transform methods on Series prototype
 *
 * @param {Function} Series - Series class
 */
export function register(Series) {
  // Register all transform methods from register.js
  registerSeriesTransform(Series);
}

export default register;
