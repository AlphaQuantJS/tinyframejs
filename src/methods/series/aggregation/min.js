/**
 * Finds the minimum value in a Series.
 *
 * @param {Series} series - Series instance
 * @returns {number|null} - Minimum value or null for empty series
 */
export function min(series) {
  const values = series.toArray();

  // Return null for empty series (not NaN) according to guidelines
  if (values.length === 0) return null;

  let minValue = Number.POSITIVE_INFINITY;
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (value === null || value === undefined || Number.isNaN(value)) continue;

    const numValue = Number(value);
    if (!Number.isNaN(numValue) && numValue < minValue) {
      minValue = numValue;
    }
  }

  // Return null if no valid numeric values were found
  return minValue === Number.POSITIVE_INFINITY ? null : minValue;
}

/**
 * Registers the min method on Series prototype
 * @param {Class} Series - Series class to extend
 */
export function register(Series) {
  if (!Series.prototype.min) {
    Series.prototype.min = function () {
      return min(this);
    };
  }
}

export default { min, register };
