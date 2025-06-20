/**
 * Aggregation method: median
 *
 * This file provides the median aggregation method for DataFrame columns
 *
 * @module methods/dataframe/aggregation/median
 */

import { validateColumn } from '../../../data/utils/index.js';

/**
 * Calculates the median value in a column
 *
 * @param {Object} df - DataFrame instance
 * @param {string} column - Column name to calculate median
 * @returns {number|null} Median value or null if no valid values
 */
export function median(df, column) {
  // 1) Validation
  if (!df || !df.columns?.length) return null;
  validateColumn(df, column);

  // 2) Data processing
  try {
    const values = df
      .col(column)
      .toArray()
      .filter((v) => v !== null && v !== undefined && !Number.isNaN(Number(v)))
      .map(Number)
      .filter((v) => !Number.isNaN(v))
      .sort((a, b) => a - b);

    // Handle empty array case
    if (values.length === 0) return null;

    // Calculate median
    const mid = Math.floor(values.length / 2);

    if (values.length % 2 === 0) {
      // Even number of elements - average the middle two
      return (values[mid - 1] + values[mid]) / 2;
    } else {
      // Odd number of elements - return the middle one
      return values[mid];
    }
  } catch (error) {
    // In case of an error, return null
    return null;
  }
}
