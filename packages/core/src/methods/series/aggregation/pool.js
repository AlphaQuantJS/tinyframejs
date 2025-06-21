/**
 * Pool of all Series aggregation methods
 *
 * This file exports all Series aggregation methods to be registered on the Series prototype.
 * It serves as a central registry for all methods to facilitate tree-shaking.
 *
 * @module core/methods/series/aggregation/pool
 */

// Aggregation methods
export { sum } from './sum.js';
export { mean } from './mean.js';
export { min } from './min.js';
export { max } from './max.js';
export { count } from './count.js';
