/**
 * Calculates the variance of values in a column.
 *
 * @param {Object} options - Options object
 * @param {Function} options.validateColumn - Function to validate column
 * @returns {Function} - Function that calculates the variance of values in a column
 */
export const variance =
  ({ validateColumn }) =>
    (df, column, options = {}) => {
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

      // Filter only numeric values (not null, not undefined, not NaN)
      const numericValues = values
        .filter(
          (value) =>
            value !== null && value !== undefined && !Number.isNaN(Number(value)),
        )
        .map((value) => Number(value));

      // If there are no numeric values, return null
      if (numericValues.length === 0) return null;

      // If there is only one value, the variance is 0
      if (numericValues.length === 1) return 0;

      // Calculate the mean value
      const mean =
      numericValues.reduce((sum, value) => sum + value, 0) /
      numericValues.length;

      // Calculate the sum of squared differences from the mean
      const sumSquaredDiffs = numericValues.reduce((sum, value) => {
        const diff = value - mean;
        return sum + diff * diff;
      }, 0);

      // Calculate the variance
      // If population=true, use n (biased estimate for the population)
      // Otherwise, use n-1 (unbiased estimate for the sample)
      const divisor = options.population ?
        numericValues.length :
        numericValues.length - 1;
      return sumSquaredDiffs / divisor;
    };

/**
 * Registers the variance method on DataFrame prototype
 * @param {Class} DataFrame - DataFrame class to extend
 */
export const register = (DataFrame) => {
  // Create a validator to check column existence
  const validateColumn = (df, column) => {
    if (!df.columns.includes(column)) {
      throw new Error(`Column '${column}' not found in DataFrame`);
    }
  };

  // Create the variance function with the validator
  const varianceFn = variance({ validateColumn });

  // Register the variance method in the DataFrame prototype
  DataFrame.prototype.variance = function(column, options) {
    return varianceFn(this, column, options);
  };
};

export default { variance, register };
