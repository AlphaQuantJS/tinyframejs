/**
 * Pool of all Series methods
 *
 * This file exports all Series methods to be registered on the Series prototype.
 * It serves as a central registry for all methods to facilitate tree-shaking.
 *
 * @module core/methods/series/pool
 */

// Aggregation methods
export { sum } from './aggregation/sum.js';
export { mean } from './aggregation/mean.js';
export { min } from './aggregation/min.js';
export { max } from './aggregation/max.js';
export { count } from './aggregation/count.js';

// Display methods
export { display } from './display/display.js';
export { print } from './display/print.js';
export { toHTML } from './display/toHTML.js';
export { toMarkdown } from './display/toMarkdown.js';
