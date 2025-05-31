/**
 * Apply an expanding window function to DataFrame columns
 *
 * @param {DataFrame} df - DataFrame to apply expanding window to
 * @param {Object} options - Options object
 * @param {Object} options.aggregations - Object mapping column names to aggregation functions
 * @param {number} [options.minPeriods=1] - Minimum number of observations required
 * @returns {DataFrame} - DataFrame with expanding window calculations
 */
export function expanding(options) {
  return function (df) {
    const { aggregations = {}, minPeriods = 1 } = options || {};

    // Validate options
    if (Object.keys(aggregations).length === 0) {
      throw new Error('At least one aggregation must be specified');
    }

    // Create a new object to hold the result columns
    const resultColumns = {};

    // First copy all original columns
    for (const colName of df.columns) {
      resultColumns[colName] = df.col(colName).toArray();
    }

    // Apply expanding window to each column with aggregation
    for (const [colName, aggFunc] of Object.entries(aggregations)) {
      if (!df.columns.includes(colName)) {
        throw new Error(`Column '${colName}' not found in DataFrame`);
      }

      const series = df.col(colName);
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
          result[i] = aggFunc(windowValues);
        }
      }

      // Add result to output columns
      resultColumns[`${colName}_expanding`] = result;
    }

    // Create a new DataFrame with the result columns
    return new df.constructor(resultColumns);
  };
}

export default expanding;
