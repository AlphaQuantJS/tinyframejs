/**
 * Selects specified columns from a DataFrame.
 *
 * @param {DataFrame} df - DataFrame instance
 * @param {string[]} columns - Array of column names to select
 * @returns {DataFrame} - New DataFrame with only the selected columns
 */
export const select = (df, columns) => {
  // Validate that columns is an array
  if (!Array.isArray(columns)) {
    throw new Error('Columns must be an array');
  }

  // Validate that all columns exist
  for (const col of columns) {
    if (!df.columns.includes(col)) {
      throw new Error(`Column '${col}' not found`);
    }
  }

  // Create a new object with only the selected columns
  const selectedData = {};
  for (const col of columns) {
    selectedData[col] = df.col(col).toArray();
  }

  // Create new DataFrame with selected columns
  return new df.constructor(selectedData);
};

/**
 * Registers the select method on DataFrame prototype
 * @param {Class} DataFrame - DataFrame class to extend
 */
export const register = (DataFrame) => {
  DataFrame.prototype.select = function (...args) {
    // If not an array, convert arguments to an array
    const columnsArray =
      args.length > 1 ? args : Array.isArray(args[0]) ? args[0] : [args[0]];

    return select(this, columnsArray);
  };
};

export default { select, register };
