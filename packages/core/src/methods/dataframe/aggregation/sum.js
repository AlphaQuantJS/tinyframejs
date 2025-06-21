/**
 * Aggregation method: sum
 *
 * This file provides the sum aggregation method for DataFrame columns
 *
 * @module methods/dataframe/aggregation/sum
 */

import { validateColumn } from '../../../data/utils/index.js';

/**
 * Returns the sum of numeric values in a column
 *
 * @param {Object} df - DataFrame instance
 * @param {string} column - Column name to sum values
 * @returns {number} Sum of all numeric values in the column
 */
export function sum(df, column) {
  // 1) Validation
  if (!df || !df.columns?.length) return 0;
  validateColumn(df, column);

  // 2) Data processing
  const values = df.col(column).toArray();
  let total = 0;

  for (const v of values) {
    if (v === null || v === undefined || Number.isNaN(v)) continue;
    const num = Number(v);
    if (!Number.isNaN(num)) {
      total += num;
    }
  }

  return total;
}
