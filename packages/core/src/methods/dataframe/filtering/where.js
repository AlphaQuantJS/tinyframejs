/*-------------------------------------------------------------------------*
 |  DataFrame -› filtering · where()                                     |
 |                                                                         |
 |  df.where('price', '>', 100) → new DataFrame with only rows where the  |
 |  'price' column values are greater than 100.                           |
 *-------------------------------------------------------------------------*/
import { validateColumn } from '../../../data/utils/validators.js';

/** Operator → predicate map */
const OPS = {
  '==':  (a, b) => a == b,          // eslint-disable-line eqeqeq
  '===': (a, b) => a === b,
  '!=':  (a, b) => a != b,          // eslint-disable-line eqeqeq
  '!==': (a, b) => a !== b,
  '>':   (a, b) => a >  b,
  '>=':  (a, b) => a >= b,
  '<':   (a, b) => a <  b,
  '<=':  (a, b) => a <= b,
  in:          (a, b) => Array.isArray(b) && b.includes(a),
  contains:    (a, b) => String(a).includes(String(b)),
  startsWith:  (a, b) => String(a).startsWith(String(b)),
  startswith:  (a, b) => String(a).startsWith(String(b)),
  endsWith:    (a, b) => String(a).endsWith(String(b)),
  endswith:    (a, b) => String(a).endsWith(String(b)),
  matches:     (a, b) =>
    b instanceof RegExp ? b.test(String(a)) : new RegExp(b).test(String(a)),
};

/**
 * Returns a new DataFrame with only rows that match the condition.
 * `df.where('price', '>', 100)` → returns a new DataFrame with rows where price > 100.
 *
 * @param {import('../../../data/model/DataFrame.js').DataFrame} df
 * @param {string} column - Column name to filter on
 * @param {keyof typeof OPS} operator - Comparison operator
 * @param {*} value - Value to compare against
 * @returns {DataFrame} - New DataFrame with only matching rows
 * @throws {Error} If column doesn't exist or operator is not supported
 */
export function where(df, column, operator, value) {
  validateColumn(df, column);

  const pred = OPS[operator];
  if (!pred) throw new Error(`Unsupported operator: '${operator}'`);

  const colVals = df.col(column).toArray(); // safer than vector.get
  const srcRows = df.toArray();

  const outRows = [];
  for (let i = 0; i < colVals.length; i++) {
    if (pred(colVals[i], value)) outRows.push(srcRows[i]);
  }

  // Create options for the new DataFrame with column type information
  const newOptions = { ...df._options };
  
  // Create new DataFrame from filtered rows with preserved column types
  return df.constructor.fromRecords(outRows, newOptions);
}

// Export the where method directly
export { where };