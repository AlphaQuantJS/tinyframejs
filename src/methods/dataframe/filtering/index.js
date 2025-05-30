/**
 * DataFrame filtering methods
 * @module methods/dataframe/filtering
 */

import { DataFrame } from '../../../core/dataframe/DataFrame.js';
import registerDataFrameFiltering from './register.js';

// Registration of all filtering methods
registerDataFrameFiltering(DataFrame);

// Export the registrar for possible direct use
export { registerDataFrameFiltering };

// Export individual filtering methods
export { filter } from './filter.js';
export { where } from './where.js';
export { expr$ } from './expr$.js';
export { select } from './select.js';
export { drop } from './drop.js';
export { at } from './at.js';
export { iloc } from './iloc.js';
export { stratifiedSample } from './stratifiedSample.js';
export { head } from './head.js';
export { tail } from './tail.js';
export { sample } from './sample.js';
export { selectByPattern } from './selectByPattern.js';
export { loc } from './loc.js';
export { query } from './query.js';
