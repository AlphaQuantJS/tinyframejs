/**
 * Returns the most frequent value in a Series.
 *
 * @param {Series} series - Series instance
 * @returns {*|null} - Most frequent value or null if no valid values
 */
export function mode(series) {
  const values = series.toArray();
  if (values.length === 0) return null;

  // Count the frequency of each value
  const frequency = new Map();
  let maxFreq = 0;
  let modeValue = null;
  let hasValidValue = false;

  for (const value of values) {
    // Skip null, undefined and NaN
    if (
      value === null ||
      value === undefined ||
      (typeof value === 'number' && Number.isNaN(value))
    ) {
      continue;
    }

    hasValidValue = true;

    // Use string representation for Map to correctly compare objects
    const valueKey = typeof value === 'object' ? JSON.stringify(value) : value;

    const count = (frequency.get(valueKey) || 0) + 1;
    frequency.set(valueKey, count);

    // Update the mode if the current value occurs more frequently
    if (count > maxFreq) {
      maxFreq = count;
      modeValue = value;
    }
  }

  // If there are no valid values, return null
  return hasValidValue ? modeValue : null;
}

/**
 * Registers the mode method on Series prototype
 * @param {Class} Series - Series class to extend
 */
export function register(Series) {
  if (!Series.prototype.mode) {
    Series.prototype.mode = function () {
      return mode(this);
    };
  }
}

export default { mode, register };
