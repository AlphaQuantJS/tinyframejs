/**
 * Finds the maximum value in a column.
 *
 * @param {Object} options - Options object
 * @param {Function} options.validateColumn - Function to validate column
 * @returns {Function} - Function that finds maximum value in a column
 */
export const max =
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

        const values = series.toArray();

        // If the array is empty, return null
        if (values.length === 0) return null;

        let maxValue = Number.NEGATIVE_INFINITY;
        let hasValidValue = false;

        for (let i = 0; i < values.length; i++) {
          const value = values[i];
          if (value === null || value === undefined || Number.isNaN(value))
            continue;

          const numValue = Number(value);
          if (!Number.isNaN(numValue)) {
            if (numValue > maxValue) {
              maxValue = numValue;
            }
            hasValidValue = true;
          }
        }

        return hasValidValue ? maxValue : null;
      } catch (error) {
      // In case of an error, return null
        return null;
      }
    };

/**
 * Registers the max method on DataFrame prototype
 * @param {Class} DataFrame - DataFrame class to extend
 */
export const register = (DataFrame) => {
  // Create a validator for checking column existence
  const validateColumn = (df, column) => {
    if (!df.columns.includes(column)) {
      throw new Error(`Column '${column}' not found`);
    }
  };

  // Create a function max with validator
  const maxFn = max({ validateColumn });

  // Register the max method in the DataFrame prototype
  DataFrame.prototype.max = function(column) {
    return maxFn(this, column);
  };
};

export default { max, register };
