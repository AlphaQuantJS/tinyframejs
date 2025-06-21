/**
 * Register all Series methods
 *
 * This module provides a centralized way to register all methods
 * on Series prototype using the extendSeries utility.
 *
 * @module methods/series/index
 */

import { extendSeries } from '../../data/model/extendSeries.js';
import * as seriesMethods from './pool.js';

/**
 * Register all Series methods
 *
 * @param {Object} options - Registration options
 * @param {Class} options.Series - Series class
 * @param {boolean} [options.strict=true] - Whether to use strict mode (prevent overwriting)
 */
export function registerSeriesMethods({ Series, strict = true } = {}) {
  if (!Series) {
    throw new Error('Series class is required');
  }

  const options = { strict };

  // Register Series methods
  extendSeries(Series.prototype, seriesMethods, options);
}
