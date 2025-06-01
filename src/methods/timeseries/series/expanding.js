/**
 * Apply an expanding window function to Series values
 *
 * @param {Series} series - Series to apply expanding window to
 * @param {Object} options - Options object
 * @param {Function} options.aggregation - Aggregation function to apply
 * @param {number} [options.minPeriods=1] - Minimum number of observations required
 * @returns {Series} - Series with expanding window calculations
 */
export function expanding(options) {
  return function (series) {
    const { aggregation, minPeriods = 1 } = options || {};

    // Validate options
    if (!aggregation || typeof aggregation !== 'function') {
      throw new Error('aggregation must be a function');
    }

    const values = series.toArray();
    const result = new Array(values.length).fill(null);

    // Apply expanding window
    for (let i = 0; i < values.length; i++) {
      // Extract window values (all values from start to current position)
      const windowValues = values
        .slice(0, i + 1)
        .filter((v) => v !== null && v !== undefined && !isNaN(v));

      // Apply aggregation function if we have enough values
      if (windowValues.length >= minPeriods) {
        result[i] = aggregation(windowValues);
      }
    }

    // Create a new Series with the result
    return new series.constructor(result, {
      name: `${series.name}_expanding`,
    });
  };
}

export default expanding;
