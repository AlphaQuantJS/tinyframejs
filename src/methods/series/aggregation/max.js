/**
 * Finds the maximum value in a Series.
 *
 * @param {Series} series - Series instance
 * @returns {number|null} - Maximum value or null for empty series
 */
export function max(series) {
  const values = series.toArray();

  // Return null for empty series (not NaN) according to guidelines
  if (values.length === 0) return null;

  let maxValue = Number.NEGATIVE_INFINITY;
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (value === null || value === undefined || Number.isNaN(value)) continue;

    const numValue = Number(value);
    if (!Number.isNaN(numValue) && numValue > maxValue) {
      maxValue = numValue;
    }
  }

  // Return null if no valid numeric values were found
  return maxValue === Number.NEGATIVE_INFINITY ? null : maxValue;
}

/**
 * Registers the max method on Series prototype
 * @param {Class} Series - Series class to extend
 */
export function register(Series) {
  if (!Series.prototype.max) {
    Series.prototype.max = function () {
      return max(this);
    };
  }
}

export default { max, register };
