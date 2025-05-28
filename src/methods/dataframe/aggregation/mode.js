/**
 * Returns the most frequent value in a column.
 *
 * @param {Object} options - Options object
 * @param {Function} options.validateColumn - Function to validate column
 * @returns {Function} - Function that returns the most frequent value in a column
 */
export const mode =
  ({ validateColumn }) =>
    (df, column) => {
    // For empty frames, immediately return null
      if (!df || !df.columns || df.columns.length === 0) {
        return null;
      }

      // Validate that the column exists - this will throw an error for a non-existent column
      validateColumn(df, column);

      const series = df.col(column);
      if (!series) return null;

      const values = series.toArray();
      if (values.length === 0) return null;

      // Count the frequency of each value
      const frequency = new Map();
      let maxFreq = 0;
      let modeValue = null;
      let hasValidValue = false;

      for (const value of values) {
      // Skip null, undefined and NaN
        if (
          value === null ||
        value === undefined ||
        (typeof value === 'number' && Number.isNaN(value))
        ) {
          continue;
        }

        hasValidValue = true;

        // Use string representation for Map to correctly compare objects
        const valueKey =
        typeof value === 'object' ? JSON.stringify(value) : value;

        const count = (frequency.get(valueKey) || 0) + 1;
        frequency.set(valueKey, count);

        // Update the mode if the current value occurs more frequently
        if (count > maxFreq) {
          maxFreq = count;
          modeValue = value;
        }
      }

      // If there are no valid values, return null
      return hasValidValue ? modeValue : null;
    };

/**
 * Registers the mode method on DataFrame prototype
 * @param {Class} DataFrame - DataFrame class to extend
 */
export const register = (DataFrame) => {
  // Create a validator to check column existence
  const validateColumn = (df, column) => {
    if (!df.columns.includes(column)) {
      throw new Error(`Column '${column}' not found`);
    }
  };

  // Create the mode function with the validator
  const modeFn = mode({ validateColumn });

  // Register the mode method in the DataFrame prototype
  DataFrame.prototype.mode = function(column) {
    return modeFn(this, column);
  };
};

export default { mode, register };
