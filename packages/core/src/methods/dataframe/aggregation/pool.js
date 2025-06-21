/**
 * DataFrame aggregation method pool
 *
 * This file re-exports all aggregation methods for use with extendDataFrame
 *
 * @module methods/dataframe/aggregation/pool
 */

// Individual method re-exports
export { min } from './min.js';
export { max } from './max.js';
export { sum } from './sum.js';
export { mean } from './mean.js';
export { count } from './count.js';
export { first } from './first.js';
export { last } from './last.js';
export { median } from './median.js';
export { mode } from './mode.js';
export { std } from './std.js';
export { variance } from './variance.js';

// Group methods re-exports
export {
  group,
  groupBy,
  groupAgg,
  groupSum,
  groupMean,
  groupMin,
  groupMax,
  groupCount,
} from './group.js';
