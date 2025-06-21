/**
 * Register all methods on DataFrame and Series prototypes
 *
 * This module provides a centralized way to register all methods
 * on DataFrame and Series prototypes using the extendDataFrame and extendSeries utilities.
 *
 * @module core/registerMethods
 */

import { extendDataFrame } from './data/model/extendDataFrame.js';
import { extendSeries } from './data/model/extendSeries.js';

// Import all DataFrame methods from pool files
import * as dataframeMethods from './methods/dataframe/pool.js';
import * as seriesMethods from './methods/series/pool.js';
import * as reshapeMethods from './methods/reshape/pool.js';
import * as timeseriesMethods from './methods/timeseries/pool.js';

// Import Series methods registration function
import { registerSeriesMethods } from './methods/series/index.js';

/**
 * Register all methods on DataFrame and Series prototypes
 *
 * @param {Object} options - Registration options
 * @param {Class} options.DataFrame - DataFrame class
 * @param {Class} options.Series - Series class
 * @param {boolean} [options.strict=true] - Whether to use strict mode (prevent overwriting)
 */
export function registerAllMethods({ DataFrame, Series, strict = true } = {}) {
  if (!DataFrame || !Series) {
    throw new Error('Both DataFrame and Series classes are required');
  }

  const options = { strict };

  // Register DataFrame methods
  extendDataFrame(DataFrame.prototype, dataframeMethods, options);

  // Register Series methods
  registerSeriesMethods({ Series, strict });

  // Register reshape methods (applicable to both DataFrame and Series)
  extendDataFrame(DataFrame.prototype, reshapeMethods, options);
  extendDataFrame(Series.prototype, reshapeMethods, options);

  // Register timeseries methods
  extendDataFrame(DataFrame.prototype, timeseriesMethods, options);
  extendDataFrame(Series.prototype, timeseriesMethods, options);
}
