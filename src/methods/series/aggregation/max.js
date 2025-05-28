/**
 * Finds the maximum value in a Series.
 *
 * @param {Series} series - Series instance
 * @returns {number} - Maximum value
 */
export const max = (series) => {
  const values = series.toArray();

  if (values.length === 0) return NaN;

  let maxValue = Number.NEGATIVE_INFINITY;
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (value === null || value === undefined || Number.isNaN(value)) continue;

    const numValue = Number(value);
    if (!Number.isNaN(numValue) && numValue > maxValue) {
      maxValue = numValue;
    }
  }

  return maxValue === Number.NEGATIVE_INFINITY ? NaN : maxValue;
};

/**
 * Registers the max method on Series prototype
 * @param {Class} Series - Series class to extend
 */
export const register = (Series) => {
  Series.prototype.max = function() {
    return max(this);
  };
};

export default { max, register };
