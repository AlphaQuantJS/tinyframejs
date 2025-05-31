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
    const values = df.col(colName).toArray();
    const result = new Array(values.length).fill(fillValue);

    if (periods > 0) {
      // Shift forward (positive periods)
      for (let i = 0; i < values.length - periods; i++) {
        result[i + periods] = values[i];
      }
    } else if (periods < 0) {
      // Shift backward (negative periods)
      const absShift = Math.abs(periods);
      for (let i = absShift; i < values.length; i++) {
        result[i - absShift] = values[i];
      }
    } else {
      // No shift (periods = 0)
      for (let i = 0; i < values.length; i++) {
        result[i] = values[i];
      }
    }

    shiftedColumns[colName] = result;
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
    // Manual calculation: (current - previous) / previous
    const values = df.col(colName).toArray();
    const result = new Array(values.length).fill(null);

    for (let i = periods; i < values.length; i++) {
      const current = values[i];
      const previous = values[i - periods];

      // Skip if either value is not a number
      if (
        typeof current !== 'number' ||
        typeof previous !== 'number' ||
        Number.isNaN(current) ||
        Number.isNaN(previous) ||
        previous === 0
      ) {
        continue;
      }

      result[i] = (current - previous) / previous;
    }

    pctChangeColumns[colName] = result;
  }

  // Create a new DataFrame with the percentage change columns
  return new df.constructor(pctChangeColumns);
}

export default {
  shift,
  pctChange,
};
