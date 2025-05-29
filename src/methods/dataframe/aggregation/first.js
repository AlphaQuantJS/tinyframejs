/**
 * Returns the first value in a column.
 *
 * @param {Object} options - Options object
 * @param {Function} options.validateColumn - Function to validate column
 * @returns {Function} - Function that returns the first value in a column
 */
export const first =
  ({ validateColumn }) =>
    (df, column) => {
    // For empty frames, return undefined
      if (!df || !df.columns || df.columns.length === 0 || df.rowCount === 0) {
        return undefined;
      }

      // Validate that the column exists - this will throw an error for non-existent columns
      validateColumn(df, column);

      try {
      // Get Series for the column and extract values
        const series = df.col(column);

        // If the series does not exist, return undefined
        if (!series) return undefined;

        const values = series.toArray();

        // If the array is empty, return undefined
        if (values.length === 0) return undefined;

        // Return the first value, even if it is null, undefined, or NaN
        return values[0];
      } catch (error) {
      // In case of an error, return undefined
        return undefined;
      }
    };

/**
 * Registers the first method on DataFrame prototype
 * @param {Class} DataFrame - DataFrame class to extend
 */
export const register = (DataFrame) => {
  // Create a validator for checking column existence
  const validateColumn = (df, column) => {
    if (!df.columns.includes(column)) {
      throw new Error(`Column '${column}' not found`);
    }
  };

  // Create a function first with validator
  const firstFn = first({ validateColumn });

  // Register the first method in the DataFrame prototype
  DataFrame.prototype.first = function(column) {
    return firstFn(this, column);
  };
};

export default { first, register };
