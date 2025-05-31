/**
 * Shift values in a Series by a specified number of periods
 *
 * @param {Series} series - Series to shift
 * @param {number} periods - Number of periods to shift (positive for forward, negative for backward)
 * @param {*} fillValue - Value to use for new periods
 * @returns {Series} - Shifted Series
 */
export function shift(series, periods = 1, fillValue = null) {
  const values = series.toArray();
  const result = new Array(values.length).fill(fillValue);

  if (periods > 0) {
    // Forward shift (positive periods)
    for (let i = 0; i < values.length - periods; i++) {
      result[i + periods] = values[i];
    }
  } else if (periods < 0) {
    // Backward shift (negative periods)
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

  // Create a new Series with the shifted values
  return new series.constructor(result, {
    name: series.name,
  });
}

/**
 * Calculate percentage change between current and prior element
 *
 * @param {Series} series - Series to calculate percentage change
 * @param {number} periods - Periods to shift for calculating percentage change
 * @returns {Series} - Series with percentage changes
 */
export function pctChange(series, periods = 1) {
  const values = series.toArray();
  const result = new Array(values.length).fill(null);

  for (let i = periods; i < values.length; i++) {
    const current = values[i];
    const previous = values[i - periods];

    // Skip if either value is not a number or if previous is zero
    if (
      typeof current !== 'number' ||
      typeof previous !== 'number' ||
      Number.isNaN(current) ||
      Number.isNaN(previous) ||
      previous === 0 ||
      current === 0 // Also treat zero current values as null
    ) {
      continue;
    }

    result[i] = (current - previous) / previous;
  }

  // Create a new Series with the percentage changes
  return new series.constructor(result, {
    name: `${series.name}_pct_change`,
  });
}

export default {
  shift,
  pctChange,
};
