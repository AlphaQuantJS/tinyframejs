/**
 * Time series methods for DataFrame
 *
 * This module provides a unified API for time series operations on DataFrame.
 * It imports and re-exports the register function from register.js.
 *
 * @module methods/timeseries/dataframe
 */
import { registerDataFrameTimeSeries } from './register.js';

/**
 * Register all time series methods on DataFrame prototype
 *
 * @param {Function} DataFrame - DataFrame class
 */
export function register(DataFrame) {
  // Register all time series methods from register.js
  registerDataFrameTimeSeries(DataFrame);
}

export default register;
