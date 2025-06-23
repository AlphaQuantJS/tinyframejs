/* -------------------------------------------------------------- *
 |  DataFrame  →  filtering  ·  drop()                            |
 * -------------------------------------------------------------- */

/**
 * Removes specified columns from a DataFrame.<br>
 * `df.drop(['age', 'name'])` → returns a new DataFrame without the specified columns.
 * Can accept either an array of column names or a single column name as string.
 *
 * @param {import('../../../data/model/DataFrame.js').DataFrame} df
 * @param {string|string[]} columns - Column name(s) to remove
 * @returns {DataFrame} - New DataFrame without the dropped columns
 * @throws {Error} If any column doesn't exist or if dropping all columns
 */
export function drop(df, columns) {
  // Convert columns to array if it's not already
  const columnsArray = Array.isArray(columns) ? columns : [columns];
  
  // Handle empty column list - return a copy
  if (columnsArray.length === 0) {
    // Create a shallow copy using toArray() and fromRecords
    const builder =
      typeof df.constructor.fromRecords === 'function'
        ? df.constructor.fromRecords
        : (rows) => new df.constructor(rows);
    return builder(df.toArray());
  }

  // Get all column names
  const allColumns = df.columns;

  // Check that all columns to drop exist
  for (const col of columnsArray) {
    if (!allColumns.includes(col)) {
      throw new Error(`Column not found: '${col}'`);
    }
  }

  // Create list of columns to keep
  const columnsToKeep = allColumns.filter(col => !columnsArray.includes(col));
  
  // Cannot drop all columns
  if (columnsToKeep.length === 0) {
    throw new Error('Cannot drop all columns');
  }

  // Create new data object with only the kept columns
  const rows = df.toArray();
  const result = {};
  
  // For each column to keep, extract its data
  for (const col of columnsToKeep) {
    // Use the public API to get column data
    const colData = df.col(col).toArray();
    result[col] = colData;
  }

  // Create a new DataFrame with the kept columns
  return new df.constructor(result, df._options);
}

/* -------------------------------------------------------------- *
 |  Pool for extendDataFrame                                       |
 * -------------------------------------------------------------- */
export default { drop };

