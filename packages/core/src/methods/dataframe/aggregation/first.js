/**
 * Aggregation method: first
 *
 * This file provides the first aggregation method for DataFrame columns
 *
 * @module methods/dataframe/aggregation/first
 */

import { validateColumn } from '../../../data/utils/index.js';

/**
 * Returns the first value in a column
 *
 * @param {Object} df - DataFrame instance
 * @param {string} column - Column name to get first value
 * @returns {*} First value in the column or undefined if no values
 */
export function first(df, column) {
  // 1) Validation
  if (!df || !df.columns?.length || df.rowCount === 0) return undefined;
  validateColumn(df, column);

  // 2) Data processing
  const values = df.col(column).toArray();

  // Return the first value, even if it is null, undefined, or NaN
  return values.length > 0 ? values[0] : undefined;
}
