/**
 * Aggregation method: mode
 *
 * This file provides the mode aggregation method for DataFrame columns
 *
 * @module methods/dataframe/aggregation/mode
 */

import { validateColumn } from '../../../data/utils/index.js';

/**
 * Returns the most frequent value in a column
 *
 * @param {Object} df - DataFrame instance
 * @param {string} column - Column name to find mode
 * @returns {*|null} Most frequent value or null if no valid values
 */
export function mode(df, column) {
  // 1) Validation
  if (!df || !df.columns?.length) return null;
  validateColumn(df, column);

  // 2) Data processing
  const values = df.col(column).toArray();
  if (values.length === 0) return null;

  // Count the frequency of each value
  const frequency = new Map();
  let maxFreq = 0;
  let modeValue = null;
  let hasValidValue = false;

  for (const value of values) {
    // Skip null, undefined and NaN
    if (
      value === null ||
      value === undefined ||
      (typeof value === 'number' && Number.isNaN(value))
    ) {
      continue;
    }

    hasValidValue = true;

    // Use string representation for Map to correctly compare objects
    const valueKey = typeof value === 'object' ? JSON.stringify(value) : value;

    const count = (frequency.get(valueKey) || 0) + 1;
    frequency.set(valueKey, count);

    // Update the mode if the current value occurs more frequently
    if (count > maxFreq) {
      maxFreq = count;
      modeValue = value;
    }
  }

  // If there are no valid values, return null
  return hasValidValue ? modeValue : null;
}
