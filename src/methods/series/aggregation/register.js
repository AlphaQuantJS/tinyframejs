/**
 * Registrar for Series aggregation methods
 */

import { register as registerCount } from './count.js';
import { register as registerSum } from './sum.js';
import { register as registerMean } from './mean.js';
import { register as registerMin } from './min.js';
import { register as registerMax } from './max.js';
import { register as registerMedian } from './median.js';
import { register as registerMode } from './mode.js';
import { register as registerStd } from './std.js';
import { register as registerVariance } from './variance.js';
import { register as registerQuantile } from './quantile.js';
import { register as registerProduct } from './product.js';
import { register as registerCumsum } from './cumsum.js';
import { register as registerCumprod } from './cumprod.js';

/**
 * Registers all aggregation methods for Series
 * @param {Class} Series - Series class to extend
 */
export function registerSeriesAggregation(Series) {
  // Register individual aggregation methods
  registerCount(Series);
  registerSum(Series);
  registerMean(Series);
  registerMin(Series);
  registerMax(Series);
  registerMedian(Series);
  registerMode(Series);
  registerStd(Series);
  registerVariance(Series);
  registerQuantile(Series);
  registerProduct(Series);
  registerCumsum(Series);
  registerCumprod(Series);

  // Add additional aggregation methods here as they are implemented
}

export default registerSeriesAggregation;
