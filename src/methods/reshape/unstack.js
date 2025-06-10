/**
 * Unstack method for DataFrame
 * Transforms data from long format to wide format
 * @module methods/reshape/unstack
 */

/**
 * Registers the unstack method in the DataFrame prototype
 * @param {Class} DataFrame - DataFrame class to extend
 */
export function register(DataFrame) {
  /**
   * Transforms DataFrame from long format to wide format
   * @param {string|string[]} indexColumns - Column name or array of column names to use as index
   * @param {string} columnToUnstack - Column name whose values will be transformed into column headers
   * @param {string} valueColumn - Column name whose values will be used to fill cells
   * @returns {DataFrame} New DataFrame in wide format
   * @throws {Error} If required parameters are not specified or columns don't exist
   */
  DataFrame.prototype.unstack = function (
    indexColumns,
    columnToUnstack,
    valueColumn,
  ) {
    // Check for all required parameters
    if (!indexColumns) {
      throw new Error('Index columns not specified');
    }
    if (!columnToUnstack) {
      throw new Error('Column to unstack not specified');
    }
    if (!valueColumn) {
      throw new Error('Value column not specified');
    }

    // Convert indexColumns to array if a string is passed
    const indexColumnsArray = Array.isArray(indexColumns)
      ? indexColumns
      : [indexColumns];

    // Check existence of all specified columns
    for (const col of indexColumnsArray) {
      if (!this.columns.includes(col)) {
        throw new Error(`Column '${col}' not found in DataFrame`);
      }
    }
    if (!this.columns.includes(columnToUnstack)) {
      throw new Error(`Column '${columnToUnstack}' not found in DataFrame`);
    }
    if (!this.columns.includes(valueColumn)) {
      throw new Error(`Column '${valueColumn}' not found in DataFrame`);
    }

    // Get data from DataFrame
    const data = this.toArray();

    // Get unique values of the column to unstack
    const uniqueColumnValues = [
      ...new Set(data.map((row) => row[columnToUnstack])),
    ];

    // Create structure for new DataFrame
    const result = {};

    // Initialize index columns
    for (const col of indexColumnsArray) {
      result[col] = [];
    }

    // Initialize value columns
    for (const val of uniqueColumnValues) {
      result[val] = [];
    }

    // Create index for fast row lookup
    const indexMap = new Map();

    // Fill index and index columns
    data.forEach((row) => {
      // Create key based on index column values
      const indexKey = indexColumnsArray.map((col) => row[col]).join('|');

      // If this key hasn't been seen yet, add it to the result
      if (!indexMap.has(indexKey)) {
        indexMap.set(indexKey, indexMap.size);

        // Add index column values
        for (const col of indexColumnsArray) {
          result[col].push(row[col]);
        }

        // Initialize values for all value columns as null
        for (const val of uniqueColumnValues) {
          result[val].push(null);
        }
      }

      // Get row index
      const rowIndex = indexMap.get(indexKey);

      // Fill value for corresponding column
      // If there are duplicates, the last value overwrites previous ones
      result[row[columnToUnstack]][rowIndex] = row[valueColumn];
    });

    // Convert object to array of rows
    const resultRows = [];

    // Get the number of rows in the result
    const rowCount = result[indexColumnsArray[0]].length;

    // Create rows with proper structure
    for (let i = 0; i < rowCount; i++) {
      const row = {};

      // Add index columns
      for (const col of indexColumnsArray) {
        row[col] = result[col][i];
      }

      // Add value columns
      for (const val of uniqueColumnValues) {
        row[val] = result[val][i];
      }

      resultRows.push(row);
    }

    // Create new DataFrame with resulting data
    return this.constructor.fromRows(resultRows);
  };
}

export default register;
