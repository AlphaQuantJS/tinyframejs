/**
 * Calculates the cumulative product of values in a Series.
 *
 * @param {Series} series - Series instance
 * @returns {Series} - New Series with cumulative product values
 */
export function cumprod(series) {
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

  // Calculate cumulative product
  const result = [];
  let product = 1;
  for (let i = 0; i < numericValues.length; i++) {
    const value = numericValues[i];
    if (value !== null) {
      product *= value;
      result.push(product);
    } else {
      // Preserve null values in the result
      result.push(null);
    }
  }

  // Create a new Series with the cumulative product values
  return new series.constructor(result);
}

/**
 * Registers the cumprod method on Series prototype
 * @param {Class} Series - Series class to extend
 */
export function register(Series) {
  if (!Series.prototype.cumprod) {
    Series.prototype.cumprod = function () {
      return cumprod(this);
    };
  }
}

export default { cumprod, register };
