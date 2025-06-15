/**
 * Series aggregation methods
 *
 * This module provides a unified API for Series aggregation operations.
 * It imports and re-exports the register function from register.js.
 *
 * @module methods/series/aggregation
 */
import { registerSeriesAggregation } from './register.js';

/**
 * Register all aggregation methods on Series prototype
 *
 * @param {Function} Series - Series class
 */
export function register(Series) {
  // Register all aggregation methods from register.js
  registerSeriesAggregation(Series);
}

export default register;
