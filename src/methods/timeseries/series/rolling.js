/**
 * Apply a rolling window function to Series values
 *
 * @param {Series} series - Series to apply rolling window to
 * @param {Object} options - Options object
 * @param {number} options.window - Size of the rolling window
 * @param {Function} options.aggregation - Aggregation function to apply
 * @param {number} [options.minPeriods=null] - Minimum number of observations required
 * @returns {Series} - Series with rolling window calculations
 */
export function rolling(options) {
  return function (series) {
    const { window, aggregation, minPeriods = null } = options || {};

    // Validate options
    if (!window || typeof window !== 'number' || window <= 0) {
      throw new Error('window must be a positive number');
    }

    if (!aggregation || typeof aggregation !== 'function') {
      throw new Error('aggregation must be a function');
    }

    const effectiveMinPeriods = minPeriods === null ? window : minPeriods;
    const values = series.toArray();
    const result = new Array(values.length).fill(null);

    // Apply rolling window
    for (let i = 0; i < values.length; i++) {
      // Extract window values (window size elements ending at current position)
      const start = Math.max(0, i - window + 1);
      const windowValues = values
        .slice(start, i + 1)
        .filter((v) => v !== null && v !== undefined && !isNaN(v));

      // Apply aggregation function if we have enough values
      if (windowValues.length >= effectiveMinPeriods) {
        result[i] = aggregation(windowValues);
      }
    }

    // Create a new Series with the result
    return new series.constructor(result, {
      name: `${series.name}_rolling`,
    });
  };
}

export default rolling;
