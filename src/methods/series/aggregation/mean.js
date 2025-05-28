/**
 * Calculates the mean (average) of values in a Series.
 *
 * @param {Series} series - Series instance
 * @returns {number} - Mean value
 */
export const mean = (series) => {
  const values = series.toArray();

  if (values.length === 0) return NaN;

  let sum = 0;
  let count = 0;

  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    // Skip NaN, null, and undefined values
    if (value === null || value === undefined || Number.isNaN(value)) {
      continue;
    }

    // Ensure value is a number
    const numValue = Number(value);
    if (!Number.isNaN(numValue)) {
      sum += numValue;
      count++;
    }
  }

  return count > 0 ? sum / count : NaN;
};

/**
 * Registers the mean method on Series prototype
 * @param {Class} Series - Series class to extend
 */
export const register = (Series) => {
  Series.prototype.mean = function() {
    return mean(this);
  };
};

export default { mean, register };
