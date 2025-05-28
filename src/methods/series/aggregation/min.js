/**
 * Finds the minimum value in a Series.
 *
 * @param {Series} series - Series instance
 * @returns {number} - Minimum value
 */
export const min = (series) => {
  const values = series.toArray();

  if (values.length === 0) return NaN;

  let minValue = Number.POSITIVE_INFINITY;
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (value === null || value === undefined || Number.isNaN(value)) continue;

    const numValue = Number(value);
    if (!Number.isNaN(numValue) && numValue < minValue) {
      minValue = numValue;
    }
  }

  return minValue === Number.POSITIVE_INFINITY ? NaN : minValue;
};

/**
 * Registers the min method on Series prototype
 * @param {Class} Series - Series class to extend
 */
export const register = (Series) => {
  Series.prototype.min = function() {
    return min(this);
  };
};

export default { min, register };
