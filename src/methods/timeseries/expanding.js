/**
 * Implementation of expanding window functions for time series data
 * @module methods/timeseries/expanding
 */

import { createFrame } from '../../core/createFrame.js';
import {
  calculateMean,
  calculateSum,
  calculateMedian,
  calculateVariance,
  calculateStd,
} from './rolling.js';

/**
 * Applies an expanding window function to a column of data
 * @param {Object} deps - Dependencies injected by the system
 * @param {Function} deps.validateColumn - Function to validate column existence
 * @returns {Function} - Function that applies expanding window calculations
 */
export const expanding = (deps) => {
  const { validateColumn } = deps;

  /**
   * Calculates expanding window values for a column
   * @param {Object} frame - The DataFrame to operate on
   * @param {Object} options - Configuration options
   * @param {string} options.column - The column to apply the expanding function to
   * @param {string} [options.method='mean'] - The aggregation method ('mean', 'sum', 'min', 'max', 'median', 'std', 'var', 'count', 'custom')
   * @param {boolean} [options.fillNaN=true] - If true, values before the window is filled are NaN
   * @param {Function} [options.customFn=null] - Custom aggregation function for 'custom' method
   * @returns {Array} - Array of expanding values
   * @throws {Error} - If column doesn't exist, method is unsupported, or customFn is not provided for 'custom' method
   */
  return (frame, options = {}) => {
    const {
      column,
      method = 'mean',
      fillNaN = true,
      customFn = null,
    } = options;

    validateColumn(frame, column);

    const values = frame.columns[column];
    const result = new Array(values.length);

    for (let i = 0; i < values.length; i++) {
      // For expanding windows, we always start from the beginning
      const windowValues = values.slice(0, i + 1).filter((v) => !isNaN(v));

      if (windowValues.length === 0) {
        result[i] = NaN;
        continue;
      }

      // Apply the specified method
      switch (method) {
        case 'mean':
          result[i] = calculateMean(windowValues);
          break;
        case 'sum':
          result[i] = calculateSum(windowValues);
          break;
        case 'min':
          result[i] = Math.min(...windowValues);
          break;
        case 'max':
          result[i] = Math.max(...windowValues);
          break;
        case 'median':
          result[i] = calculateMedian(windowValues);
          break;
        case 'std':
          result[i] = calculateStd(windowValues);
          break;
        case 'var':
          result[i] = calculateVariance(windowValues);
          break;
        case 'count':
          result[i] = windowValues.length;
          break;
        case 'custom':
          if (typeof customFn !== 'function') {
            throw new Error(
              'customFn must be a function when method is "custom"',
            );
          }
          result[i] = customFn(windowValues);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
    }

    return result;
  };
};

/**
 * Creates a new DataFrame with expanding window calculations applied
 * @param {Object} deps - Dependencies injected by the system
 * @returns {Function} - Function that creates a new DataFrame with expanding window calculations
 */
export const expandingApply = (deps) => {
  const expandingFn = expanding(deps);

  /**
   * Creates a new DataFrame with expanding window calculations
   * @param {Object} frame - The DataFrame to operate on
   * @param {Object} options - Configuration options
   * @param {string} options.column - The column to apply the expanding function to
   * @param {string} [options.method='mean'] - The aggregation method ('mean', 'sum', 'min', 'max', 'median', 'std', 'var', 'count', 'custom')
   * @param {boolean} [options.fillNaN=true] - If true, values before the window is filled are NaN
   * @param {Function} [options.customFn=null] - Custom aggregation function for 'custom' method
   * @param {string} [options.targetColumn] - The name of the target column (default: column_method_expanding)
   * @returns {Object} - New DataFrame with expanding window calculations
   */
  return (frame, options = {}) => {
    const {
      column,
      method = 'mean',
      fillNaN = true,
      customFn = null,
      targetColumn = `${column}_${method}_expanding`,
    } = options;

    // Calculate expanding values
    const expandingValues = expandingFn(frame, {
      column,
      method,
      fillNaN,
      customFn,
    });

    // Create a new DataFrame with the original data plus the expanding values
    const newFrame = { ...frame };
    newFrame.columns = { ...frame.columns };
    newFrame.columns[targetColumn] = expandingValues;

    return newFrame;
  };
};
