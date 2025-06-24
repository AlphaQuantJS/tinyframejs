/**
 * DataFrame indexing method pool
 *
 * This file re-exports all indexing methods for use with extendDataFrame
 *
 * @module methods/dataframe/indexing/pool
 */

// Row/column access methods
export { at } from './at.js';
export { iloc } from './iloc.js';
export { loc } from './loc.js';

// Row sampling methods
export { sample } from './sample.js';
export { head } from './head.js';
export { tail } from './tail.js';

// Index management
export { setIndex } from './setIndex.js';
