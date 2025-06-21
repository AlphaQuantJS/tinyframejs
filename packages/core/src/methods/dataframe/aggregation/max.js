/**
 * Aggregation method: max
 *
 * This file provides the max aggregation method for DataFrame columns
 *
 * @module methods/dataframe/aggregation/max
 */

import { validateColumn } from '../../../data/utils/index.js';

/**
 * Returns the maximum numeric value in a column, or null if no valid values
 *
 * @param {Object} df - DataFrame instance
 * @param {string} column - Column name to find maximum value
 * @returns {number|null} Maximum value or null if no valid numeric values found
 */
export function max(df, column) {
  // 1) Validation
  if (!df || !df.columns?.length) return null;
  validateColumn(df, column);

  // 2) Data processing
  const values = df.col(column).toArray();
  let best = Number.NEGATIVE_INFINITY;
  let found = false;

  for (const v of values) {
    if (v === null || Number.isNaN(v)) continue;
    const num = Number(v);
    if (!Number.isNaN(num)) {
      if (num > best) best = num;
      found = true;
    }
  }
  return found ? best : null;
}
