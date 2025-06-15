/**
 * DataFrame filtering methods
 *
 * This module provides a unified API for DataFrame filtering operations.
 * It imports and re-exports the register function from register.js.
 *
 * @module methods/dataframe/filtering
 */
import { registerDataFrameFiltering } from './register.js';

// Import individual filtering methods for direct use
import { filter } from './filter.js';
import { where } from './where.js';
import { expr$ } from './expr$.js';
import { select } from './select.js';
import { drop } from './drop.js';
import { stratifiedSample } from './stratifiedSample.js';
import { selectByPattern } from './selectByPattern.js';
import { query } from './query.js';

// Re-export individual filtering methods for direct use
export {
  filter,
  where,
  expr$,
  select,
  drop,
  stratifiedSample,
  selectByPattern,
  query,
};

/**
 * Register all filtering methods on DataFrame prototype
 *
 * @param {Function} DataFrame - DataFrame class
 */
export function register(DataFrame) {
  // Register all filtering methods from register.js
  registerDataFrameFiltering(DataFrame);
}

export default register;

// Export the registrar for possible direct use
export { registerDataFrameFiltering };
