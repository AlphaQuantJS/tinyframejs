/**
 * Registrar for DataFrame aggregation methods
 */

import { register as registerCount } from './count.js';
import { register as registerSum } from './sum.js';
import { register as registerMean } from './mean.js';
import { register as registerMedian } from './median.js';
import { register as registerMin } from './min.js';
import { register as registerMax } from './max.js';
import { register as registerFirst } from './first.js';
import { register as registerLast } from './last.js';
import { register as registerMode } from './mode.js';
import { register as registerVariance } from './variance.js';
import { register as registerStd } from './std.js';
// Файл sort.js не найден, поэтому импорт закомментирован
// import { register as registerSort } from './sort.js';

/**
 * Registers all aggregation methods on DataFrame prototype
 * @param {Class} DataFrame - DataFrame class to extend
 */
export const registerDataFrameAggregation = (DataFrame) => {
  registerCount(DataFrame);
  registerSum(DataFrame);
  registerMean(DataFrame);
  registerMedian(DataFrame);
  registerMin(DataFrame);
  registerMax(DataFrame);
  registerFirst(DataFrame);
  registerLast(DataFrame);
  registerMode(DataFrame);
  registerVariance(DataFrame);
  registerStd(DataFrame);
  // registerSort(DataFrame); // Закомментировано, так как файл sort.js отсутствует

  // Add additional aggregation methods here as they are implemented
};

export default registerDataFrameAggregation;
