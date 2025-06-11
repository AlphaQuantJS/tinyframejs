/**
 * Registration of DataFrame indexing methods
 */

import { register as registerAt } from './at.js';
import { register as registerHead } from './head.js';
import { register as registerTail } from './tail.js';
import { register as registerIloc } from './iloc.js';
import { register as registerLoc } from './loc.js';
import { register as registerSample } from './sample.js';

/**
 * Register all indexing methods on DataFrame prototype
 * @param {object} DataFrame - DataFrame constructor
 */
export function registerDataFrameIndexing(DataFrame) {
  registerAt(DataFrame);
  registerHead(DataFrame);
  registerTail(DataFrame);
  registerIloc(DataFrame);
  registerLoc(DataFrame);
  registerSample(DataFrame);
}
