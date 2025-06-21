/**
 * Pool of all DataFrame methods
 *
 * This file exports all DataFrame methods to be registered on the DataFrame prototype.
 * It serves as a central registry for all methods to facilitate tree-shaking.
 *
 * @module core/methods/dataframe/pool
 */

// Aggregation methods
export { count } from './aggregation/count.js';
export { first } from './aggregation/first.js';
export { last } from './aggregation/last.js';
export { max } from './aggregation/max.js';
export { mean } from './aggregation/mean.js';
export { median } from './aggregation/median.js';
export { min } from './aggregation/min.js';
export { mode } from './aggregation/mode.js';
export { std } from './aggregation/std.js';
export { sum } from './aggregation/sum.js';
export { variance } from './aggregation/variance.js';

// Group aggregation methods
export {
  group,
  groupBy,
  groupAgg,
  groupSum,
  groupMean,
  groupMin,
  groupMax,
  groupCount,
} from './aggregation/group.js';

// Display methods
export { display } from './display/display.js';
export { print } from './display/print.js';
export { renderTo } from './display/renderTo.js';
export { toHTML } from './display/toHTML.js';
export { toJupyter } from './display/toJupyter.js';
export { toMarkdown } from './display/toMarkdown.js';
