/**
 * Registrar for DataFrame filtering methods
 */

import { register as registerFilter } from './filter.js';
import { register as registerWhere } from './where.js';
import { register as registerExpr$ } from './expr$.js';
import { register as registerSelect } from './select.js';
import { register as registerDrop } from './drop.js';
import { register as registerAt } from './at.js';
import { register as registerIloc } from './iloc.js';

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
  registerAt(DataFrame);
  registerIloc(DataFrame);

  // Add additional filtering methods here as they are implemented
  // For example: head, tail, query, loc, sample, stratifiedSample, selectByPattern
}

export default registerDataFrameFiltering;
