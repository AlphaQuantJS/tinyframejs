/**
 * Apply a rolling window function to DataFrame columns
 *
 * @param {Object} options - Options object
 * @param {number} options.window - Window size
 * @param {Object} options.aggregations - Object mapping column names to aggregation functions
 * @param {boolean} [options.center=false] - Whether to center the window
 * @param {number} [options.minPeriods=null] - Minimum number of observations required
 * @returns {Function} - Function that takes a DataFrame and returns a DataFrame with rolling window calculations
 */
export const rolling = (options) => (df) => {
  const {
    window,
    aggregations = {},
    center = false,
    minPeriods = null,
  } = options || {};

  // Validate options
  if (!window || typeof window !== 'number' || window <= 0) {
    throw new Error('window must be a positive number');
  }

  if (Object.keys(aggregations).length === 0) {
    throw new Error('At least one aggregation must be specified');
  }

  // Create a new object to hold the result columns
  const resultColumns = {};

  // Copy all original columns
  for (const colName of df.columns) {
    resultColumns[colName] = df.col(colName).toArray();
  }

  // Apply rolling window to each column with aggregation
  for (const [colName, aggFunc] of Object.entries(aggregations)) {
    if (!df.columns.includes(colName)) {
      throw new Error(`Column '${colName}' not found in DataFrame`);
    }

    const series = df.col(colName);
    const values = series.toArray();
    const result = new Array(values.length).fill(null);

    // Calculate effective min periods
    const effectiveMinPeriods =
      minPeriods === null ? window : Math.min(minPeriods, window);

    // Apply rolling window
    for (let i = 0; i < values.length; i++) {
      // Calculate window bounds
      let start, end;

      if (center) {
        // Center the window
        start = Math.max(0, i - Math.floor(window / 2));
        end = Math.min(values.length, i + Math.ceil(window / 2));
      } else {
        // Right-aligned window
        start = Math.max(0, i - window + 1);
        end = i + 1;
      }

      // Skip if not enough observations
      if (end - start < effectiveMinPeriods) {
        continue;
      }

      // Extract window values
      const windowValues = values
        .slice(start, end)
        .filter((v) => v !== null && v !== undefined && !Number.isNaN(v));

      // Apply aggregation function
      if (windowValues.length >= effectiveMinPeriods) {
        try {
          result[i] = aggFunc(windowValues);
        } catch (e) {
          console.error('Error applying aggregation function:', e);
          result[i] = null;
        }
      }
    }

    // Add result to output columns
    resultColumns[`${colName}_rolling`] = result;
  }

  // Create a new DataFrame with the result columns
  return df.constructor.create(resultColumns);
};

export default rolling;
