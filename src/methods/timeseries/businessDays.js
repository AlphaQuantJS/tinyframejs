/**
 * Implementation of business day functions for time series data
 * @module methods/timeseries/businessDays
 */

import { createFrame } from '../../core/createFrame.js';
import {
  parseDate,
  truncateDate,
  dateRange,
  formatDateISO,
  isWeekend,
  nextBusinessDay,
} from './dateUtils.js';

/**
 * Resamples time series data to business days (excluding weekends)
 * @param {Object} deps - Dependencies injected by the system
 * @returns {Function} - Function that resamples data to business days
 */
export const resampleBusinessDay =
  (deps) =>
  /**
   * @param {Object} frame - The DataFrame to operate on
   * @param {Object} options - Configuration options
   * @param {string} options.dateColumn - Name of the column containing dates
   * @param {Object} options.aggregations - Object mapping column names to aggregation functions
   * @param {boolean} options.includeEmpty - Whether to include empty periods (default: false)
   * @param {string} options.method - Method to use for filling missing values ('ffill', 'bfill', null)
   * @returns {Object} - New DataFrame with data resampled to business days
   */
  (frame, options = {}) => {
    const {
      dateColumn,
      aggregations = {},
      includeEmpty = false,
      method = null,
    } = options;

    // Validate inputs
    if (!dateColumn) {
      throw new Error('dateColumn parameter is required');
    }

    if (!frame.columns[dateColumn]) {
      throw new Error(`Date column '${dateColumn}' not found in DataFrame`);
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

    // Generate business day range
    const businessDays = [];
    const currentDate = new Date(minDate);
    currentDate.setHours(0, 0, 0, 0);

    // Iterate through dates from minDate to maxDate
    const tempDate = new Date(currentDate);
    while (tempDate.getTime() <= maxDate.getTime()) {
      if (!isWeekend(tempDate)) {
        businessDays.push(new Date(tempDate));
      }
      tempDate.setDate(tempDate.getDate() + 1);
    }

    // Create a map to group data by business day
    const groupedData = {};

    // Initialize business days
    businessDays.forEach((day) => {
      const dayKey = formatDateISO(day);
      groupedData[dayKey] = {
        [dateColumn]: day,
        _count: 0,
      };

      // Initialize aggregation columns
      Object.keys(aggregations).forEach((column) => {
        groupedData[dayKey][column] = [];
      });
    });

    // Group data by business day
    for (let i = 0; i < frame.rowCount; i++) {
      const date = dates[i];
      date.setHours(0, 0, 0, 0);
      const dayKey = formatDateISO(date);

      // Skip if day not in range or is a weekend
      if (!groupedData[dayKey]) {
        continue;
      }

      // Increment count
      groupedData[dayKey]._count++;

      // Add values to aggregation arrays
      Object.keys(aggregations).forEach((column) => {
        if (frame.columns[column]) {
          const value = frame.columns[column][i];
          if (value !== null && value !== undefined) {
            groupedData[dayKey][column].push(value);
          }
        }
      });
    }

    // Apply aggregation functions
    const result = {
      columns: {
        [dateColumn]: [],
      },
    };

    // Initialize result columns
    Object.keys(aggregations).forEach((column) => {
      result.columns[column] = [];
    });

    // Sort business days chronologically
    const sortedDays = Object.keys(groupedData).sort();

    // Get aggregation functions
    const getAggregationFunction = (aggFunc) => {
      if (typeof aggFunc === 'function') {
        return aggFunc;
      }

      const aggFunctions = {
        sum: (values) => values.reduce((a, b) => a + b, 0),
        mean: (values) =>
          values.length
            ? values.reduce((a, b) => a + b, 0) / values.length
            : null,
        min: (values) => (values.length ? Math.min(...values) : null),
        max: (values) => (values.length ? Math.max(...values) : null),
        count: (values) => values.length,
        first: (values) => (values.length ? values[0] : null),
        last: (values) => (values.length ? values[values.length - 1] : null),
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
    };

    // Apply aggregations
    sortedDays.forEach((dayKey) => {
      const dayData = groupedData[dayKey];

      // Skip empty days if not including them
      if (dayData._count === 0 && !includeEmpty) {
        return;
      }

      // Add date
      result.columns[dateColumn].push(formatDateISO(dayData[dateColumn]));

      // Apply aggregations
      Object.entries(aggregations).forEach(([column, aggFunc]) => {
        const values = dayData[column];
        const aggFunction = getAggregationFunction(aggFunc);
        const aggregatedValue = values.length ? aggFunction(values) : null;
        result.columns[column].push(aggregatedValue);
      });
    });

    // Проверяем, что все колонки содержат массивы
    for (const key in result.columns) {
      if (!Array.isArray(result.columns[key])) {
        result.columns[key] = Array.from(result.columns[key]);
      }
    }

    // Handle filling methods if specified
    if (method && (method === 'ffill' || method === 'bfill')) {
      Object.keys(aggregations).forEach((column) => {
        const values = result.columns[column];

        if (method === 'ffill') {
          // Forward fill
          let lastValidValue = null;
          for (let i = 0; i < values.length; i++) {
            if (values[i] !== null) {
              lastValidValue = values[i];
            } else if (lastValidValue !== null) {
              values[i] = lastValidValue;
            }
          }
        } else if (method === 'bfill') {
          // Backward fill
          let lastValidValue = null;
          for (let i = values.length - 1; i >= 0; i--) {
            if (values[i] !== null) {
              lastValidValue = values[i];
            } else if (lastValidValue !== null) {
              values[i] = lastValidValue;
            }
          }
        }
      });
    }

    return createFrame(result);
  };

/**
 * Checks if a date is a trading day (business day)
 * @param {Date} date - The date to check
 * @param {Array} holidays - Array of holiday dates (optional)
 * @returns {boolean} - True if the date is a trading day
 */
export function isTradingDay(date, holidays = []) {
  // Convert to Date objects if needed
  const holidayDates = holidays.map((h) =>
    h instanceof Date ? h : new Date(h),
  );

  // Check if it's a weekend
  if (isWeekend(date)) {
    return false;
  }

  // Check if it's a holiday
  const dateStr = formatDateISO(date);
  for (const holiday of holidayDates) {
    if (formatDateISO(holiday) === dateStr) {
      return false;
    }
  }

  return true;
}

/**
 * Gets the next trading day
 * @param {Date} date - The starting date
 * @param {Array} holidays - Array of holiday dates (optional)
 * @returns {Date} - The next trading day
 */
export function nextTradingDay(date, holidays = []) {
  const result = new Date(date);
  result.setDate(result.getDate() + 1);

  // Keep advancing until we find a trading day
  while (!isTradingDay(result, holidays)) {
    result.setDate(result.getDate() + 1);
  }

  return result;
}

/**
 * Generates a range of trading days
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {Array} holidays - Array of holiday dates (optional)
 * @returns {Date[]} - Array of trading days
 */
export function tradingDayRange(startDate, endDate, holidays = []) {
  const result = [];
  const currentDate = new Date(startDate);
  currentDate.setHours(0, 0, 0, 0);

  // Iterate through dates from currentDate to endDate
  const tempDate = new Date(currentDate);
  while (tempDate.getTime() <= endDate.getTime()) {
    if (isTradingDay(tempDate, holidays)) {
      result.push(new Date(tempDate));
    }
    tempDate.setDate(tempDate.getDate() + 1);
  }

  return result;
}
