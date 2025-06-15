/**
 * Calculates the median value in a Series.
 *
 * @param {Series} series - Series instance
 * @returns {number|null} - Median value or null for empty series
 */
export function median(series) {
  const values = series
    .toArray()
    .filter((v) => v !== null && v !== undefined && !Number.isNaN(v))
    .map(Number)
    .filter((v) => !Number.isNaN(v))
    .sort((a, b) => a - b);

  // Return null for empty series (not NaN) according to guidelines
  if (values.length === 0) return null;

  const mid = Math.floor(values.length / 2);

  if (values.length % 2 === 0) {
    // Even number of elements - average the middle two
    return (values[mid - 1] + values[mid]) / 2;
  } else {
    // Odd number of elements - return the middle one
    return values[mid];
  }
}

/**
 * Registers the median method on Series prototype
 * @param {Class} Series - Series class to extend
 */
export function register(Series) {
  if (!Series.prototype.median) {
    Series.prototype.median = function () {
      return median(this);
    };
  }
}

export default { median, register };
