/**
 * Aggregation method: min
 *
 * This file provides the min aggregation method for DataFrame columns
 *
 * @module methods/dataframe/aggregation/min
 */

import { validateColumn } from '../../../data/utils/index.js';

/**
 * Returns the minimum numeric value in a column, or null if no valid values
 *
 * @param {Object} df - DataFrame instance
 * @param {string} column - Column name to find minimum value
 * @returns {number|null} Minimum value or null if no valid numeric values found
 */
export function min(df, column) {
  // 1) Validation
  if (!df || !df.columns?.length) return null;
  validateColumn(df, column);

  // 2) Data processing
  const values = df.col(column).toArray();
  let best = Number.POSITIVE_INFINITY;
  let found = false;

  for (const v of values) {
    if (v === null || v === undefined || Number.isNaN(v)) continue;
    const num = Number(v);
    if (!Number.isNaN(num)) {
      if (num < best) best = num;
      found = true;
    }
  }
  return found ? best : null;
}
