/**
 * Registrar for DataFrame filtering methods
 */

import { register as registerFilter } from './filter.js';
import { register as registerWhere } from './where.js';
import { register as registerExpr$ } from './expr$.js';
import { register as registerSelect } from './select.js';
import { register as registerDrop } from './drop.js';
import { register as registerStratifiedSample } from './stratifiedSample.js';
import { register as registerSelectByPattern } from './selectByPattern.js';
import { register as registerQuery } from './query.js';

/**
 * Registers all filtering methods for DataFrame
 * @param {Class} DataFrame - DataFrame class to extend
 */
export function registerDataFrameFiltering(DataFrame) {
  // Register individual filtering methods
  registerFilter(DataFrame);
  registerWhere(DataFrame);
  registerExpr$(DataFrame);
  registerSelect(DataFrame);
  registerDrop(DataFrame);
  registerStratifiedSample(DataFrame);
  registerSelectByPattern(DataFrame);
  registerQuery(DataFrame);

  // Add additional filtering methods here as they are implemented
  // For example: query, stratifiedSample, selectByPattern
}

export default registerDataFrameFiltering;
