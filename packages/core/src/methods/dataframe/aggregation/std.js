/**
 * Aggregation method: std
 *
 * This file provides the standard deviation aggregation method for DataFrame columns
 *
 * @module methods/dataframe/aggregation/std
 */

import { validateColumn } from '../../../data/utils/index.js';

/**
 * Calculates the standard deviation of values in a column
 *
 * @param {Object} df - DataFrame instance
 * @param {string} column - Column name to calculate standard deviation
 * @param {Object} [options={}] - Options object
 * @param {boolean} [options.population=false] - If true, calculate population standard deviation (divide by n)
 *                                              If false, calculate sample standard deviation (divide by n-1)
 * @returns {number|null} Standard deviation or null if no valid values
 */
export function std(df, column, options = {}) {
  // 1) Validation
  if (!df || !df.columns?.length) return null;
  validateColumn(df, column);

  // 2) Data processing
  const values = df.col(column).toArray();
  if (values.length === 0) return null;

  // Filter only numeric values (not null, not undefined, not NaN)
  const numericValues = values
    .filter(
      (value) =>
        value !== null && value !== undefined && !Number.isNaN(Number(value)),
    )
    .map((value) => Number(value));

  // If there are no numeric values, return null
  if (numericValues.length === 0) return null;

  // If there is only one value, the standard deviation is 0
  if (numericValues.length === 1) return 0;

  // Calculate the mean value
  const mean =
    numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length;

  // Calculate the sum of squared differences from the mean
  const sumSquaredDiffs = numericValues.reduce((sum, value) => {
    const diff = value - mean;
    return sum + diff * diff;
  }, 0);

  // Calculate the variance
  // If population=true, use n (biased estimate for the population)
  // Otherwise, use n-1 (unbiased estimate for the sample)
  const divisor = options.population
    ? numericValues.length
    : numericValues.length - 1;
  const variance = sumSquaredDiffs / divisor;

  // Return the standard deviation (square root of variance)
  return Math.sqrt(variance);
}
