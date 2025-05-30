/**
 * Removes specified columns from a DataFrame.
 *
 * @param {DataFrame} df - DataFrame instance
 * @param {string|string[]} columns - Column name or array of column names to drop
 * @returns {DataFrame} - New DataFrame without the dropped columns
 */
export const drop = (df, columns) => {
  // Ensure columns is an array
  const columnsArray = Array.isArray(columns) ? columns : [columns];

  // Get all column names
  const allColumns = df.columns;

  // Validate that all columns to drop exist
  for (const col of columnsArray) {
    if (!allColumns.includes(col)) {
      throw new Error(`Column '${col}' not found`);
    }
  }

  // Create a list of columns to keep
  const columnsToKeep = allColumns.filter((col) => !columnsArray.includes(col));

  // Create a new object with only the kept columns
  const keptData = {};
  for (const col of columnsToKeep) {
    keptData[col] = df.col(col).toArray();
  }

  // Create new DataFrame with kept columns
  return new df.constructor(keptData);
};

/**
 * Registers the drop method on DataFrame prototype
 * @param {Class} DataFrame - DataFrame class to extend
 */
export const register = (DataFrame) => {
  DataFrame.prototype.drop = function (columns) {
    return drop(this, columns);
  };
};

export default { drop, register };
