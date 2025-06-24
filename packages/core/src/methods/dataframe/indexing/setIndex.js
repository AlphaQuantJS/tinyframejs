/*-------------------------------------------------------------------------*
 |  DataFrame - indexing - setIndex()                                     |
 |                                                                         |
 |  df.setIndex('id') -> sets 'id' column as the index                     |
 *-------------------------------------------------------------------------*/

/**
 * Sets a column as the index for a DataFrame
 *
 * @param {Object} df - DataFrame instance
 * @param {string} columnName - Name of the column to use as index
 * @returns {Object} - DataFrame with the specified column set as index
 */
export function setIndex(df, columnName) {
  // For empty DataFrame, just set the index column name but don't create a map
  if (df.rowCount === 0) {
    df._index = columnName;
    df._indexMap = new Map();
    return df;
  }

  // Check if the column exists
  if (!df.columns.includes(columnName)) {
    throw new Error('Column not found');
  }

  // Set the index column
  df._index = columnName;

  // Create a map for fast lookup by index value
  df._indexMap = new Map();
  const rows = df.toArray();
  rows.forEach((row, i) => {
    df._indexMap.set(row[columnName], i);
  });

  return df;
}

// Export object with method for the pool
export default { setIndex };
