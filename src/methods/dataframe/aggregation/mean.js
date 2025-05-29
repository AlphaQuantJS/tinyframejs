/**
 * Calculates the mean (average) of values in a column.
 *
 * @param {Object} options - Options object
 * @param {Function} options.validateColumn - Function to validate column
 * @returns {Function} - Function that calculates mean of values in a column
 */
export const mean =
  ({ validateColumn }) =>
    (df, column) => {
    // For empty frames, return NaN
      if (!df || !df.columns || df.columns.length === 0) {
        return NaN;
      }

      // Validate that the column exists - this will throw an error for non-existent columns
      validateColumn(df, column);

      try {
      // Get Series for the column and extract values
        const series = df.col(column);

        // If the series does not exist, return NaN
        if (!series) return NaN;

        const values = series.toArray();

        let sum = 0;
        let count = 0;

        for (let i = 0; i < values.length; i++) {
          const value = values[i];
          if (value !== null && value !== undefined && !Number.isNaN(value)) {
            sum += Number(value);
            count++;
          }
        }

        return count > 0 ? sum / count : NaN;
      } catch (error) {
      // In case of an error, return NaN
        return NaN;
      }
    };

/**
 * Registers the mean method on DataFrame prototype
 * @param {Class} DataFrame - DataFrame class to extend
 */
export const register = (DataFrame) => {
  // Create a validator for checking column existence
  const validateColumn = (df, column) => {
    if (!df.columns.includes(column)) {
      throw new Error(`Column '${column}' not found`);
    }
  };

  // Create a function mean with validator
  const meanFn = mean({ validateColumn });

  // Register the mean method in the DataFrame prototype
  DataFrame.prototype.mean = function(column) {
    return meanFn(this, column);
  };
};

export default { mean, register };
