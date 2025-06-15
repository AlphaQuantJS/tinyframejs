/**
 * Returns the last n rows of DataFrame
 *
 * @param {DataFrame} df - DataFrame instance
 * @param {number} [n=5] - Number of rows to return
 * @param {Object} [options] - Additional options
 * @param {boolean} [options.print=false] - Option for compatibility with other libraries
 * @returns {DataFrame} - New DataFrame with the last n rows
 */
export const tail = (df, n = 5, options = { print: false }) => {
  // Validate input parameters
  if (n <= 0) {
    throw new Error('Number of rows must be a positive number');
  }
  if (!Number.isInteger(n)) {
    throw new Error('Number of rows must be an integer');
  }

  // Get data from DataFrame
  const rows = df.toArray();

  // Select the last n rows (or all if there are fewer than n)
  const selectedRows = rows.slice(-n);

  // Create a new DataFrame from selected rows
  const result = df.constructor.fromRecords(selectedRows);

  // Note: the print option is preserved for API compatibility, but is not used in the current version
  // In the future, we can add the print method to DataFrame

  return result;
};

/**
 * Registers the tail method on DataFrame prototype
 * @param {Class} DataFrame - DataFrame class to extend
 */
export const register = (DataFrame) => {
  DataFrame.prototype.tail = function (n, options) {
    return tail(this, n, options);
  };
};

export default { tail, register };
