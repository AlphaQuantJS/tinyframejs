/**
 * Counts non-null, non-undefined, non-NaN values in a Series.
 *
 * @param {Series} series - Series instance
 * @returns {number} - Count of valid values
 */
export const count = (series) => {
  const values = series.toArray();

  let validCount = 0;
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (value !== null && value !== undefined && !Number.isNaN(value)) {
      validCount++;
    }
  }

  return validCount;
};

/**
 * Registers the count method on Series prototype
 * @param {Class} Series - Series class to extend
 */
export const register = (Series) => {
  Series.prototype.count = function() {
    return count(this);
  };
};

export default { count, register };
