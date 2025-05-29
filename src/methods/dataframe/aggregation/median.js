/**
 * Calculates the median value in a column.
 *
 * @param {Object} options - Options object
 * @param {Function} options.validateColumn - Function to validate column
 * @returns {Function} - Function that calculates median of values in a column
 */
export const median =
  ({ validateColumn }) =>
    (df, column) => {
    // For empty frames, return null
      if (!df || !df.columns || df.columns.length === 0) {
        return null;
      }

      // Validate that the column exists - this will throw an error for non-existent columns
      validateColumn(df, column);

      try {
      // Get Series for the column and extract values
        const series = df.col(column);

        // If the series does not exist, return null
        if (!series) return null;

        const values = series
          .toArray()
          .filter((v) => v !== null && v !== undefined && !Number.isNaN(v))
          .map(Number)
          .filter((v) => !Number.isNaN(v))
          .sort((a, b) => a - b);

        // Handle empty array case
        if (values.length === 0) return null;

        const mid = Math.floor(values.length / 2);

        if (values.length % 2 === 0) {
        // Even number of elements - average the middle two
          return (values[mid - 1] + values[mid]) / 2;
        } else {
        // Odd number of elements - return the middle one
          return values[mid];
        }
      } catch (error) {
      // In case of an error, return null
        return null;
      }
    };

/**
 * Registers the median method on DataFrame prototype
 * @param {Class} DataFrame - DataFrame class to extend
 */
export const register = (DataFrame) => {
  // Create a validator for checking column existence
  const validateColumn = (df, column) => {
    if (!df.columns.includes(column)) {
      throw new Error(`Column '${column}' not found`);
    }
  };

  // Create a function median with validator
  const medianFn = median({ validateColumn });

  // Register the median method in the DataFrame prototype
  DataFrame.prototype.median = function(column) {
    return medianFn(this, column);
  };
};

export default { median, register };
