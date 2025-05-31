/**
 * Registrar for DataFrame time series methods
 */

/**
 * Registers all time series methods for DataFrame
 * @param {Class} DataFrame - DataFrame class to extend
 */
export function registerDataFrameTimeSeries(DataFrame) {
  /**
   * Resamples a DataFrame to a different time frequency
   * @param {Object} options - Options object
   * @param {string} options.dateColumn - Name of the column containing dates
   * @param {string} options.freq - Target frequency ('D' for day, 'W' for week, 'M' for month, 'Q' for quarter, 'Y' for year)
   * @param {Object} options.aggregations - Object mapping column names to aggregation functions
   * @param {boolean} [options.includeEmpty=false] - Whether to include empty periods
   * @returns {DataFrame} - Resampled DataFrame
   */
  DataFrame.prototype.resample = function (options) {
    // Validate required options
    const { dateColumn, freq, aggregations = {} } = options || {};

    if (!dateColumn) {
      throw new Error('dateColumn parameter is required');
    }

    if (!freq) {
      throw new Error('freq parameter is required');
    }

    if (!this.columns.includes(dateColumn)) {
      throw new Error(`Date column '${dateColumn}' not found in DataFrame`);
    }

    if (Object.keys(aggregations).length === 0) {
      throw new Error('At least one aggregation must be specified');
    }

    // Import the implementation dynamically to avoid circular dependencies
    const resampleModule = require('./resample.js');
    return resampleModule.default(options)(this);
  };

  /**
   * Applies a rolling window function to DataFrame columns
   * @param {Object} options - Options object
   * @param {number} options.window - Window size
   * @param {Object} options.aggregations - Object mapping column names to aggregation functions
   * @param {boolean} [options.center=false] - Whether to center the window
   * @param {number} [options.minPeriods=null] - Minimum number of observations required
   * @returns {DataFrame} - DataFrame with rolling window calculations
   */
  DataFrame.prototype.rolling = function (options) {
    // Import the implementation dynamically to avoid circular dependencies
    const rollingModule = require('./rolling.js');
    return rollingModule.default(options)(this);
  };

  /**
   * Applies an expanding window function to DataFrame columns
   * @param {Object} options - Options object
   * @param {Object} options.aggregations - Object mapping column names to aggregation functions
   * @param {number} [options.minPeriods=1] - Minimum number of observations required
   * @returns {DataFrame} - DataFrame with expanding window calculations
   */
  DataFrame.prototype.expanding = function (options) {
    // Import the implementation dynamically to avoid circular dependencies
    const expandingModule = require('./expanding.js');
    return expandingModule.default(options)(this);
  };

  /**
   * Shifts index by desired number of periods
   * @param {number} periods - Number of periods to shift (positive for forward, negative for backward)
   * @param {*} [fillValue=null] - Value to use for new periods
   * @returns {DataFrame} - Shifted DataFrame
   */
  DataFrame.prototype.shift = function (periods = 1, fillValue = null) {
    // Import the implementation dynamically to avoid circular dependencies
    const shiftModule = require('./shift.js');
    return shiftModule.shift(this, periods, fillValue);
  };

  /**
   * Calculates percentage change between current and prior element
   * @param {number} [periods=1] - Periods to shift for calculating percentage change
   * @returns {DataFrame} - DataFrame with percentage changes
   */
  DataFrame.prototype.pctChange = function (periods = 1) {
    // Import the implementation dynamically to avoid circular dependencies
    const pctChangeModule = require('./shift.js');
    return pctChangeModule.pctChange(this, periods);
  };
}

export default registerDataFrameTimeSeries;
