/* -------------------------------------------------------------- *
 |  DataFrame  →  filtering  ·  head()                             |
 * -------------------------------------------------------------- */

/**
 * Returns the first n rows of a DataFrame.<br>
 * `df.head(5)` → returns a new DataFrame with the first 5 rows.
 * Similar to pandas' head() function.
 *
 * @param {import('../../../data/model/DataFrame.js').DataFrame} df
 * @param {number} [n=5] - Number of rows to return
 * @param {Object} [options] - Additional options
 * @param {boolean} [options.print=false] - Option for compatibility with other libraries
 * @returns {DataFrame} - New DataFrame with the first n rows
 * @throws {Error} If n is not a positive integer
 */
export function head(df, n = 5, options = { print: false }) {
  // Validate input parameters
  if (n <= 0) {
    throw new Error('Number of rows must be a positive integer');
  }
  if (!Number.isInteger(n)) {
    throw new Error('Number of rows must be an integer');
  }

  // Get data from DataFrame
  const rows = df.toArray();

  // Select first n rows (or all if there are fewer than n)
  const selectedRows = rows.slice(0, n);

  // Create a new DataFrame from the selected rows
  const builder =
    typeof df.constructor.fromRecords === 'function'
      ? df.constructor.fromRecords
      : (rows) => new df.constructor(rows);

  return builder(selectedRows);
}

/* -------------------------------------------------------------- *
 |  Pool for extendDataFrame                                       |
 * -------------------------------------------------------------- */
export default { head };

