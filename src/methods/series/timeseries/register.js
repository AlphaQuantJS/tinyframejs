/**
 * Registrar for Series time series methods
 */

/**
 * Registers all time series methods for Series
 * @param {Class} Series - Series class to extend
 */
export function registerSeriesTimeSeries(Series) {
  /**
   * Applies a rolling window function to Series values
   * @param {number} windowSize - Window size
   * @param {Object} options - Options object
   * @param {Function} [options.aggregation='mean'] - Aggregation function to apply
   * @param {boolean} [options.center=false] - Whether to center the window
   * @param {number} [options.minPeriods=null] - Minimum number of observations required
   * @returns {Promise<Series>} - Series with rolling window calculations
   */
  Series.prototype.rolling = function(windowSize, options = {}) {
    // Import the implementation dynamically to avoid circular dependencies
    return import('../../timeseries/rolling.js').then((module) => {
      const { rollingSeries } = module;
      return rollingSeries(this, windowSize, options);
    });
  };

  /**
   * Applies an expanding window function to Series values
   * @param {Object} options - Options object
   * @param {Function} [options.aggregation='mean'] - Aggregation function to apply
   * @param {number} [options.minPeriods=1] - Minimum number of observations required
   * @returns {Promise<Series>} - Series with expanding window calculations
   */
  Series.prototype.expanding = function(options = {}) {
    // Import the implementation dynamically to avoid circular dependencies
    return import('../../timeseries/expanding.js').then((module) => {
      const { expandingSeries } = module;
      return expandingSeries(this, options);
    });
  };

  /**
   * Shifts index by desired number of periods
   * @param {number} periods - Number of periods to shift (positive for forward, negative for backward)
   * @param {*} [fillValue=null] - Value to use for new periods
   * @returns {Promise<Series>} - Shifted Series
   */
  Series.prototype.shift = function(periods = 1, fillValue = null) {
    // Import the implementation dynamically to avoid circular dependencies
    return import('../../timeseries/shift.js').then((module) => {
      const { shiftSeries } = module;
      return shiftSeries(this, periods, fillValue);
    });
  };

  /**
   * Calculates percentage change between current and prior element
   * @param {number} [periods=1] - Periods to shift for calculating percentage change
   * @returns {Promise<Series>} - Series with percentage changes
   */
  Series.prototype.pctChange = function(periods = 1) {
    // Import the implementation dynamically to avoid circular dependencies
    return import('../../timeseries/shift.js').then((module) => {
      const { pctChangeSeries } = module;
      return pctChangeSeries(this, periods);
    });
  };
}

export default registerSeriesTimeSeries;
