/**
 * Resamples time series data to a different frequency.
 * Similar to pandas resample method, this allows converting from higher frequency
 * to lower frequency (downsampling) or from lower frequency to higher frequency (upsampling).
 * @module methods/timeseries/resample
 */

import { createFrame } from '../../core/createFrame.js';
import {
  parseDate,
  truncateDate,
  dateRange,
  formatDateISO,
} from './dateUtils.js';

/**
 * Maps string aggregation function names to actual functions
 * @param {string|Function} aggFunc - Aggregation function name or function
 * @returns {Function} - Aggregation function
 * @throws {Error} - If the aggregation function name is unknown
 */
function getAggregationFunction(aggFunc) {
  if (typeof aggFunc === 'function') {
    return aggFunc;
  }

  const aggFunctions = {
    /**
     * Sum of values
     * @param {Array<number>} values - Array of values to sum
     * @returns {number} - Sum of values
     */
    sum: (values) => values.reduce((a, b) => a + b, 0),

    /**
     * Mean of values
     * @param {Array<number>} values - Array of values to average
     * @returns {number|null} - Mean of values or null if empty
     */
    mean: (values) =>
      values.length ? values.reduce((a, b) => a + b, 0) / values.length : null,

    /**
     * Minimum value
     * @param {Array<number>} values - Array of values
     * @returns {number|null} - Minimum value or null if empty
     */
    min: (values) => (values.length ? Math.min(...values) : null),

    /**
     * Maximum value
     * @param {Array<number>} values - Array of values
     * @returns {number|null} - Maximum value or null if empty
     */
    max: (values) => (values.length ? Math.max(...values) : null),

    /**
     * Count of values
     * @param {Array} values - Array of values
     * @returns {number} - Count of values
     */
    count: (values) => values.length,

    /**
     * First value in array
     * @param {Array} values - Array of values
     * @returns {*|null} - First value or null if empty
     */
    first: (values) => (values.length ? values[0] : null),

    /**
     * Last value in array
     * @param {Array} values - Array of values
     * @returns {*|null} - Last value or null if empty
     */
    last: (values) => (values.length ? values[values.length - 1] : null),

    /**
     * Median value
     * @param {Array<number>} values - Array of values
     * @returns {number|null} - Median value or null if empty
     */
    median: (values) => {
      if (!values.length) return null;
      const sorted = [...values].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2
        ? sorted[mid]
        : (sorted[mid - 1] + sorted[mid]) / 2;
    },
  };

  if (!aggFunctions[aggFunc]) {
    throw new Error(`Unknown aggregation function: ${aggFunc}`);
  }

  return aggFunctions[aggFunc];
}

/**
 * Resamples a DataFrame to a different time frequency
 * @returns {Function} - Function that resamples a DataFrame
 */
export const resample =
  () =>
  /**
   * @param {Object} frame - The DataFrame to resample
   * @param {Object} options - Options object
   * @param {string} options.dateColumn - Name of the column containing dates
   * @param {string} options.freq - Target frequency ('D' for day, 'W' for week, 'M' for month, 'Q' for quarter, 'Y' for year)
   * @param {Object} options.aggregations - Object mapping column names to aggregation functions
   * @param {boolean} [options.includeEmpty=false] - Whether to include empty periods
   * @returns {Object} - Resampled DataFrame
   * @throws {Error} - If required parameters are missing or invalid
   */
  (frame, options = {}) => {
    const {
      dateColumn,
      freq,
      aggregations = {},
      includeEmpty = false,
    } = options;

    // Validate inputs
    if (!dateColumn) {
      throw new Error('dateColumn parameter is required');
    }

    if (!freq) {
      throw new Error('freq parameter is required');
    }

    if (!frame.columns[dateColumn]) {
      throw new Error(`Date column '${dateColumn}' not found in DataFrame`);
    }

    if (Object.keys(aggregations).length === 0) {
      throw new Error('At least one aggregation must be specified');
    }

    // Parse dates and validate date column
    const dates = Array.from(frame.columns[dateColumn]).map((d) => {
      try {
        return parseDate(d);
      } catch (e) {
        throw new Error(`Failed to parse date: ${d}`);
      }
    });

    // Get min and max dates
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

    // Generate date range for the target frequency
    const periods = dateRange(minDate, maxDate, freq);

    // Create a map to group data by period
    const groupedData = {};

    // Initialize periods
    periods.forEach((period) => {
      const periodKey = formatDateISO(period);
      groupedData[periodKey] = {
        [dateColumn]: period,
        _count: 0,
      };

      // Initialize aggregation columns
      Object.keys(aggregations).forEach((column) => {
        groupedData[periodKey][column] = [];
      });
    });

    // Group data by period
    for (let i = 0; i < frame.rowCount; i++) {
      const date = dates[i];
      const truncatedDate = truncateDate(date, freq);
      const periodKey = formatDateISO(truncatedDate);

      // Skip if period not in range and we're not including empty periods
      if (!groupedData[periodKey] && !includeEmpty) {
        continue;
      }

      // Create period if it doesn't exist (should only happen if includeEmpty is true)
      if (!groupedData[periodKey]) {
        groupedData[periodKey] = {
          [dateColumn]: truncatedDate,
          _count: 0,
        };

        Object.keys(aggregations).forEach((column) => {
          groupedData[periodKey][column] = [];
        });
      }

      // Increment count
      groupedData[periodKey]._count++;

      // Add values to aggregation arrays
      Object.keys(aggregations).forEach((column) => {
        if (frame.columns[column]) {
          const value = frame.columns[column][i];
          if (value !== null && value !== undefined) {
            groupedData[periodKey][column].push(value);
          }
        }
      });
    }

    // Apply aggregation functions
    const result = {
      [dateColumn]: [],
    };

    // Initialize result columns
    Object.keys(aggregations).forEach((column) => {
      result[column] = [];
    });

    // Sort periods chronologically
    const sortedPeriods = Object.keys(groupedData).sort();

    // Apply aggregations
    sortedPeriods.forEach((periodKey) => {
      const periodData = groupedData[periodKey];

      // Skip empty periods if not including them
      if (periodData._count === 0 && !includeEmpty) {
        return;
      }

      // Add date
      result[dateColumn].push(periodData[dateColumn]);

      // Apply aggregations
      Object.entries(aggregations).forEach(([column, aggFunc]) => {
        const values = periodData[column];
        const aggFunction = getAggregationFunction(aggFunc);
        const aggregatedValue = values.length ? aggFunction(values) : null;
        result[column].push(aggregatedValue);
      });
    });

    return createFrame(result);
  };
