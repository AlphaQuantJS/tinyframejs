/**
 * Creates a function that calculates the sum of values in a column.
 *
 * @param {Object} options - Options object
 * @param {Function} options.validateColumn - Function to validate column existence
 * @returns {Function} - Function that takes DataFrame and column name and returns sum
 */
export const sum =
  ({ validateColumn }) =>
    (frame, column) => {
    // Validate column existence using the provided validator
      validateColumn(frame, column);

      // Get Series for the column and its values
      const series = frame.col(column);
      const values = series.toArray();

      // Calculate sum of numeric values, ignoring null, undefined, and NaN
      let total = 0;
      for (let i = 0; i < values.length; i++) {
        const value = values[i];
        // Skip null, undefined, and NaN values
        if (value === null || value === undefined || Number.isNaN(value)) {
          continue;
        }
        // Convert to number and add to total if valid
        const num = Number(value);
        if (!isNaN(num)) {
          total += num;
        }
      }

      return total;
    };

/**
 * Registers the sum method on DataFrame prototype
 * @param {Class} DataFrame - DataFrame class to extend
 */
export const register = (DataFrame) => {
  // Define a validator function that checks if column exists in DataFrame
  const validateColumn = (frame, column) => {
    if (!frame.columns.includes(column)) {
      throw new Error(`Column '${column}' not found`);
    }
  };

  // Create the sum function with our validator
  const sumFn = sum({ validateColumn });

  // Register the sum method on DataFrame prototype
  DataFrame.prototype.sum = function(column) {
    return sumFn(this, column);
  };
};

export default { sum, register };
