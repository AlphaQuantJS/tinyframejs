/**
 * Shifts the values in a Series by the specified number of periods
 * @module methods/series/timeseries/shift
 */

import { Series } from '../../../core/dataframe/Series.js';

/**
 * Shifts the values in the Series by the specified number of periods
 * @param {number} periods - Number of periods to shift (positive = forward, negative = backward)
 * @param {*} fillValue - Value to use for filling new positions (default: null)
 * @returns {Promise<Series>} - New Series with shifted values
 */
export async function shift(periods = 1, fillValue = null) {
  const data = this.toArray();
  const result = new Array(data.length);

  if (periods === 0) {
    // No shift, return a copy of the original series
    return new Series([...data], { name: this.name });
  }

  if (periods > 0) {
    // Shift forward
    for (let i = 0; i < data.length; i++) {
      if (i < periods) {
        result[i] = fillValue;
      } else {
        result[i] = data[i - periods];
      }
    }
  } else {
    // Shift backward
    const absPeriods = Math.abs(periods);
    for (let i = 0; i < data.length; i++) {
      if (i >= data.length - absPeriods) {
        result[i] = fillValue;
      } else {
        result[i] = data[i + absPeriods];
      }
    }
  }

  return new Series(result, { name: this.name });
}

// Add the method to Series prototype
Series.prototype.shift = shift;
