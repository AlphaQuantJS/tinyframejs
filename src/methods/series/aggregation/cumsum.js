/**
 * Calculates the cumulative sum of values in a Series.
 *
 * @param {Series} series - Series instance
 * @returns {Series} - New Series with cumulative sum values
 */
export function cumsum(series) {
  const values = series.toArray();
  if (values.length === 0) return new series.constructor([]);

  // Convert all values to numbers, filtering out non-numeric values
  const numericValues = values.map((value) => {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return null;
    }
    const num = Number(value);
    return Number.isNaN(num) ? null : num;
  });

  // Calculate cumulative sum
  const result = [];
  let sum = 0;
  for (let i = 0; i < numericValues.length; i++) {
    const value = numericValues[i];
    if (value !== null) {
      sum += value;
      result.push(sum);
    } else {
      // Preserve null values in the result
      result.push(null);
    }
  }

  // Create a new Series with the cumulative sum values
  return new series.constructor(result);
}

/**
 * Registers the cumsum method on Series prototype
 * @param {Class} Series - Series class to extend
 */
export function register(Series) {
  if (!Series.prototype.cumsum) {
    Series.prototype.cumsum = function () {
      return cumsum(this);
    };
  }
}

export default { cumsum, register };
