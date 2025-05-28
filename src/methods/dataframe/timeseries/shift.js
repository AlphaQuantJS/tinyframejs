/**
 * Shift values in a DataFrame by a specified number of periods
 *
 * @param {DataFrame} df - DataFrame to shift
 * @param {number} periods - Number of periods to shift (positive for forward, negative for backward)
 * @param {*} fillValue - Value to use for new periods
 * @returns {DataFrame} - Shifted DataFrame
 */
export function shift(df, periods = 1, fillValue = null) {
  // Create a new object to hold the shifted columns
  const shiftedColumns = {};

  // Shift each column
  for (const colName of df.columns) {
    const series = df.col(colName);
    shiftedColumns[colName] = series.shift(periods, fillValue);
  }

  // Create a new DataFrame with the shifted columns
  return new df.constructor(shiftedColumns);
}

/**
 * Calculate percentage change between current and prior element
 *
 * @param {DataFrame} df - DataFrame to calculate percentage change
 * @param {number} periods - Periods to shift for calculating percentage change
 * @returns {DataFrame} - DataFrame with percentage changes
 */
export function pctChange(df, periods = 1) {
  // Create a new object to hold the percentage change columns
  const pctChangeColumns = {};

  // Calculate percentage change for each column
  for (const colName of df.columns) {
    const series = df.col(colName);
    // Use the series pctChange method if available, otherwise calculate manually
    if (typeof series.pctChange === 'function') {
      pctChangeColumns[colName] = series.pctChange(periods);
    } else {
      // Manual calculation: (current - previous) / previous
      const values = series.toArray();
      const result = new Array(values.length).fill(null);

      for (let i = periods; i < values.length; i++) {
        const current = values[i];
        const previous = values[i - periods];

        // Skip if either value is not a number
        if (
          typeof current !== 'number' ||
          typeof previous !== 'number' ||
          isNaN(current) ||
          isNaN(previous) ||
          previous === 0
        ) {
          continue;
        }

        result[i] = (current - previous) / previous;
      }

      pctChangeColumns[colName] = result;
    }
  }

  // Create a new DataFrame with the percentage change columns
  return new df.constructor(pctChangeColumns);
}

export default {
  shift,
  pctChange,
};
