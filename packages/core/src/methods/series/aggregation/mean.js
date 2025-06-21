/**
 * Aggregation method: mean
 *
 * This file provides the mean (average) aggregation method for Series
 *
 * @module methods/series/aggregation/mean
 */

/**
 * Returns the arithmetic mean of all values in the Series
 *
 * @param {Object} series - Series instance or this when called as method
 * @returns {number} Arithmetic mean of all values
 */
export function mean(series) {
  // If called as method (series.mean()), use this
  if (arguments.length === 0 && this && this.vector) {
    series = this;
  }
  // Check for data availability
  if (!series) return 0;

  // First try to use vector.__data (TypedArrayVector)
  if (series.vector && series.vector.__data) {
    const data = series.vector.__data;
    let sum = 0;
    let count = 0;
    for (let i = 0; i < data.length; i++) {
      if (!isNaN(data[i])) {
        sum += data[i];
        count++;
      }
    }
    return count > 0 ? sum / count : 0;
  }

  // Then try to get values through values or toArray
  let values = [];
  if (series.values && series.values.length) {
    values = series.values;
  } else if (typeof series.toArray === 'function') {
    values = series.toArray();
  } else if (series.vector) {
    try {
      values = Array.from(series.vector);
    } catch (e) {
      values = [];
    }
  }

  // Calculate mean
  if (!values.length) return 0;

  let sum = 0;
  let count = 0;
  for (let i = 0; i < values.length; i++) {
    const val = Number(values[i]);
    if (!isNaN(val)) {
      sum += val;
      count++;
    }
  }

  return count > 0 ? sum / count : 0;
}
