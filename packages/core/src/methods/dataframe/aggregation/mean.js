/**
 * Aggregation method: mean
 *
 * This file provides the mean aggregation method for DataFrame columns
 *
 * @module methods/dataframe/aggregation/mean
 */

import { validateColumn } from '../../../data/utils/index.js';

/**
 * Returns the arithmetic mean (average) of numeric values in a column
 *
 * @param {Object} df - DataFrame instance
 * @param {string} column - Column name to calculate mean
 * @returns {number} Mean value or NaN if no valid numeric values found
 */
export function mean(df, column) {
  // 1) Validation
  if (!df || !df.columns?.length) return NaN;
  validateColumn(df, column);

  // 2) Data processing
  const values = df.col(column).toArray();
  let sum = 0;
  let count = 0;

  for (const v of values) {
    if (v === null || v === undefined || Number.isNaN(v)) continue;
    const num = Number(v);
    if (!Number.isNaN(num)) {
      sum += num;
      count++;
    }
  }

  return count > 0 ? sum / count : NaN;
}
