/**
 * DataFrame method to drop rows with null or undefined values in specified columns
 */

/**
 * Creates a dropna method for DataFrame
 *
 * @returns {Function} - The dropna method
 */
export function dropna() {
  /**
   * Drop rows with null or undefined values in specified columns
   *
   * @param {string|string[]} columns - Column name or array of column names to check for null values
   * @returns {DataFrame} - New DataFrame with rows containing null values removed
   */
  return function (columns) {
    // If no columns specified, check all columns
    const colsToCheck = columns
      ? Array.isArray(columns)
        ? columns
        : [columns]
      : this.columns;

    // Filter rows that don't have null values in specified columns
    return this.filter((row) => {
      for (const col of colsToCheck) {
        if (row[col] === null || row[col] === undefined) {
          return false;
        }
      }
      return true;
    });
  };
}

/**
 * Registers the dropna method on DataFrame prototype
 *
 * @param {Class} DataFrame - The DataFrame class to extend
 */
export function register(DataFrame) {
  if (!DataFrame.prototype.dropna) {
    DataFrame.prototype.dropna = dropna();
  }
}

export default dropna;
