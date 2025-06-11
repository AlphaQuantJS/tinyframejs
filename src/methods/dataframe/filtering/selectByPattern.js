/**
 * Selects columns from DataFrame that match a regular expression
 *
 * @param {DataFrame} df - DataFrame instance
 * @param {RegExp|string} pattern - Regular expression or string to search for
 * @returns {DataFrame} - New DataFrame with only the selected columns
 */
export const selectByPattern = (df, pattern) => {
  // Validate pattern type
  if (typeof pattern !== 'string' && !(pattern instanceof RegExp)) {
    throw new TypeError('Pattern must be a string or regular expression');
  }

  // Convert string to regular expression if necessary
  const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);

  // Find columns that match the pattern
  const matchedColumns = df.columns.filter((column) => regex.test(column));

  // If no columns are found, return an empty DataFrame
  if (matchedColumns.length === 0) {
    // Create an empty DataFrame
    return new df.constructor({});
  }

  // Create a new object with only the selected columns
  const selectedData = {};

  // Save array types
  for (const column of matchedColumns) {
    // Get data from original DataFrame
    selectedData[column] = df.col(column).toArray();
  }

  // Create a new DataFrame with selected columns, preserving array types
  return new df.constructor(selectedData);
};

/**
 * Registers the selectByPattern method on DataFrame prototype
 * @param {Class} DataFrame - DataFrame class to extend
 */
export const register = (DataFrame) => {
  DataFrame.prototype.selectByPattern = function (pattern) {
    return selectByPattern(this, pattern);
  };
};

export default { selectByPattern, register };
