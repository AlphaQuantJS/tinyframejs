/**
 * Calculates the sum of values in a Series.
 *
 * @param {Series} series - Series instance
 * @returns {number} - Sum of values
 */
export function sum(series) {
  const values = series.toArray();

  // For empty series, return 0 (consistent with mathematical sum of empty set)
  if (values.length === 0) return 0;

  let total = 0;
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    // Skip NaN, null, and undefined values
    if (value === null || value === undefined || Number.isNaN(value)) {
      continue;
    }

    // Ensure value is a number
    const numValue = Number(value);
    if (!Number.isNaN(numValue)) {
      total += numValue;
    }
  }

  return total;
}

/**
 * Registers the sum method on Series prototype
 * @param {Class} Series - Series class to extend
 */
export function register(Series) {
  if (!Series.prototype.sum) {
    Series.prototype.sum = function () {
      return sum(this);
    };
  }
}

export default { sum, register };
