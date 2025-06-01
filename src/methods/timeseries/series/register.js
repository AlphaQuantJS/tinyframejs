/**
 * Registrar for Series time series methods
 */

/**
 * Registers all time series methods for Series
 * @param {Class} Series - Series class to extend
 */
export function registerSeriesTimeSeries(Series) {
  /**
   * Apply a rolling window function to Series values
   * @param {Object} options - Options object
   * @param {number} options.window - Size of the rolling window
   * @param {Function} options.aggregation - Aggregation function to apply
   * @param {number} [options.minPeriods=null] - Minimum number of observations required
   * @returns {Series} - Series with rolling window calculations
   */
  Series.prototype.rolling = function (options) {
    // Import the implementation dynamically to avoid circular dependencies
    const rollingModule = require('./rolling.js');
    return rollingModule.default(options)(this);
  };

  /**
   * Apply an expanding window function to Series values
   * @param {Object} options - Options object
   * @param {Function} options.aggregation - Aggregation function to apply
   * @param {number} [options.minPeriods=1] - Minimum number of observations required
   * @returns {Series} - Series with expanding window calculations
   */
  Series.prototype.expanding = function (options) {
    // Import the implementation dynamically to avoid circular dependencies
    const expandingModule = require('./expanding.js');
    return expandingModule.default(options)(this);
  };

  /**
   * Shift values in a Series by a specified number of periods
   * @param {number} [periods=1] - Number of periods to shift (positive for forward, negative for backward)
   * @param {*} [fillValue=null] - Value to use for new periods
   * @returns {Series} - Shifted Series
   */
  Series.prototype.shift = function (periods = 1, fillValue = null) {
    // Import the implementation dynamically to avoid circular dependencies
    const shiftModule = require('./shift.js');
    return shiftModule.shift(this, periods, fillValue);
  };

  /**
   * Calculate percentage change between current and prior element
   * @param {number} [periods=1] - Periods to shift for calculating percentage change
   * @returns {Series} - Series with percentage changes
   */
  Series.prototype.pctChange = function (periods = 1) {
    // Import the implementation dynamically to avoid circular dependencies
    const pctChangeModule = require('./shift.js');
    return pctChangeModule.pctChange(this, periods);
  };
}

export default registerSeriesTimeSeries;
