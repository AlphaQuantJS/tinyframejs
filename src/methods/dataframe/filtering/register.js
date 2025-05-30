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
import { register as registerStratifiedSample } from './stratifiedSample.js';
import { register as registerHead } from './head.js';
import { register as registerTail } from './tail.js';
import { register as registerSample } from './sample.js';
import { register as registerSelectByPattern } from './selectByPattern.js';
import { register as registerLoc } from './loc.js';
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
  registerAt(DataFrame);
  registerIloc(DataFrame);
  registerStratifiedSample(DataFrame);
  registerHead(DataFrame);
  registerTail(DataFrame);
  registerSample(DataFrame);
  registerSelectByPattern(DataFrame);
  registerLoc(DataFrame);
  registerQuery(DataFrame);

  // Add additional filtering methods here as they are implemented
  // For example: head, tail, query, loc, sample, stratifiedSample, selectByPattern
}

export default registerDataFrameFiltering;
