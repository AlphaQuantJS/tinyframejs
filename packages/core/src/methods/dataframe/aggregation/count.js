/**
 * Aggregation method: count
 *
 * This file provides the count aggregation method for DataFrame columns
 *
 * @module methods/dataframe/aggregation/count
 */

import { validateColumn } from '../../../data/utils/index.js';

/**
 * Returns the count of valid values in a column
 *
 * @param {Object} df - DataFrame instance
 * @param {string} column - Column name to count values
 * @returns {number} Count of valid values (non-null, non-undefined, non-NaN)
 */
export function count(df, column) {
  // 1) Validation
  if (!df || !df.columns?.length) return 0;
  validateColumn(df, column);

  // 2) Data processing
  const values = df.col(column).toArray();
  let validCount = 0;

  for (const v of values) {
    if (v !== null && v !== undefined && !Number.isNaN(v)) {
      validCount++;
    }
  }

  return validCount;
}
