/**
 * Time series methods for Series
 *
 * This module provides a unified API for time series operations on Series.
 * It imports and re-exports the register function from register.js.
 *
 * @module methods/timeseries/series
 */
import { registerSeriesTimeSeries } from './register.js';

/**
 * Register all time series methods on Series prototype
 *
 * @param {Function} Series - Series class
 */
export function register(Series) {
  // Register all time series methods from register.js
  registerSeriesTimeSeries(Series);
}

export default register;
