/**
 * Aggregation method: last
 *
 * This file provides the last aggregation method for DataFrame columns
 *
 * @module methods/dataframe/aggregation/last
 */

import { validateColumn } from '../../../data/utils/index.js';

/**
 * Returns the last value in a column
 *
 * @param {Object} df - DataFrame instance
 * @param {string} column - Column name to get last value
 * @returns {*} Last value in the column or undefined if no values
 */
export function last(df, column) {
  // 1) Validation
  if (!df || !df.columns?.length || df.rowCount === 0) return undefined;
  validateColumn(df, column);

  // 2) Data processing
  const values = df.col(column).toArray();

  // Return the last value, even if it is null, undefined, or NaN
  return values.length > 0 ? values[values.length - 1] : undefined;
}

// This file is side-effect free for tree-shaking support
