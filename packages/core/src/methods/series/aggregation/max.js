/**
 * Aggregation method: max
 *
 * This file provides the max aggregation method for Series
 *
 * @module methods/series/aggregation/max
 */

/**
 * Returns the maximum value in the Series
 *
 * @param {Object} series - Series instance or this when called as method
 * @returns {number} Maximum value or null if empty
 */
export function max(series) {
  // If called as method (series.max()), use this
  if (arguments.length === 0 && this && this.vector) {
    series = this;
  }
  // Check for data availability
  if (!series) return null;

  // First try to use vector.__data (TypedArrayVector)
  if (series.vector && series.vector.__data) {
    const data = series.vector.__data;
    if (data.length === 0) return null;

    let max = -Infinity;
    for (let i = 0; i < data.length; i++) {
      if (!isNaN(data[i]) && data[i] > max) {
        max = data[i];
      }
    }
    return max === -Infinity ? null : max;
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

  // Find maximum
  if (values.length === 0) return null;

  let max = -Infinity;
  for (let i = 0; i < values.length; i++) {
    const val = Number(values[i]);
    if (!isNaN(val) && val > max) {
      max = val;
    }
  }

  return max === -Infinity ? null : max;
}
