/*-------------------------------------------------------------------------*
 |  DataFrame -› filtering · selectByPattern()                            |
 |                                                                         |
 |  df.selectByPattern(/^price/) → new DataFrame with only columns       |
 |  whose names match the regular expression.                             |
 *-------------------------------------------------------------------------*/

/**
 * Returns a new DataFrame with only columns whose names match the pattern.
 * `df.selectByPattern(/^price/)` → returns a new DataFrame with columns that start with 'price'.
 *
 * @param {import('../../../data/model/DataFrame.js').DataFrame} df
 * @param {RegExp|string} pattern - Regular expression or string pattern to match
 * @returns {DataFrame} - New DataFrame with only the matched columns
 * @throws {Error} If no columns match the pattern
 * @throws {TypeError} If pattern is not a string or regular expression
 */
export function selectByPattern(df, pattern) {
  // Validate pattern type
  if (typeof pattern !== 'string' && !(pattern instanceof RegExp)) {
    throw new TypeError('Pattern must be a string or regular expression');
  }

  // Convert string to regular expression if needed
  const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);

  // Find columns matching the pattern
  const matchedColumns = df.columns.filter((column) => regex.test(column));

  // If no columns match, throw an error
  if (matchedColumns.length === 0) {
    throw new Error('No columns match the pattern');
  }

  // Create records with only the matched columns
  const records = df.toArray().map(row => {
    const newRow = {};
    for (const col of matchedColumns) {
      newRow[col] = row[col];
    }
    return newRow;
  });

  // Create options for the new DataFrame with column type information
  const newOptions = { ...df._options };
  
  // If there are column type definitions, filter them to include only matched columns
  if (newOptions.columns) {
    const filteredColumns = {};
    for (const col of matchedColumns) {
      if (newOptions.columns[col]) {
        filteredColumns[col] = newOptions.columns[col];
      }
    }
    newOptions.columns = filteredColumns;
  }
  
  // Create new DataFrame from records with preserved column types
  return df.constructor.fromRecords(records, newOptions);
}

/* -------------------------------------------------------------- *
 |  Pool for extendDataFrame                                       |
 * -------------------------------------------------------------- */
export default { selectByPattern };
