/*-------------------------------------------------------------------------*
 |  DataFrame -› filtering · select()                                     |
 |                                                                         |
 |  df.select(['age', 'name']) → new DataFrame with only the specified   |
 |  columns.                                                              |
 *-------------------------------------------------------------------------*/

/**
 * Returns a new DataFrame with only the specified columns.
 * `df.select(['name', 'age'])` → returns a new DataFrame with only the 'name' and 'age' columns.
 *
 * @param {import('../../../data/model/DataFrame.js').DataFrame} df
 * @param {Array<string>} columns - Array of column names to select
 * @returns {DataFrame} - New DataFrame with only the specified columns
 * @throws {Error} If any column does not exist or if columns is empty
 */
export function select(df, columns) {
  // Validate input parameters
  if (!Array.isArray(columns)) {
    throw new Error('Columns must be an array');
  }
  
  if (columns.length === 0) {
    throw new Error('Column list cannot be empty');
  }

  // Validate that all columns exist
  for (const col of columns) {
    if (!df.columns.includes(col)) {
      throw new Error(`Column '${col}' not found`);
    }
  }

  // Create records with only the selected columns
  const records = df.toArray().map(row => {
    const newRow = {};
    for (const col of columns) {
      newRow[col] = row[col];
    }
    return newRow;
  });

  // Create options for the new DataFrame with column type information
  const newOptions = { ...df._options };
  
  // If there are column type definitions, filter them to include only selected columns
  if (newOptions.columns) {
    const filteredColumns = {};
    for (const col of columns) {
      if (newOptions.columns[col]) {
        filteredColumns[col] = newOptions.columns[col];
      }
    }
    newOptions.columns = filteredColumns;
  }
  
  // Create new DataFrame from records with preserved column types
  return df.constructor.fromRecords(records, newOptions);
}

// Export object with method for the pool
export default { select };
