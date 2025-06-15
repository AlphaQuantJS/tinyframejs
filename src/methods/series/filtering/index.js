/**
 * Series filtering methods
 *
 * This module provides a unified API for Series filtering operations.
 * It imports and re-exports the register function from register.js.
 *
 * @module methods/series/filtering
 */
import { registerSeriesFiltering } from './register.js';

/**
 * Register all filtering methods on Series prototype
 *
 * @param {Function} Series - Series class
 */
export function register(Series) {
  // Register all filtering methods from register.js
  registerSeriesFiltering(Series);
}

export default register;
