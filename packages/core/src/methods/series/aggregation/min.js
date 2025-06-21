/**
 * Aggregation method: min
 *
 * This file provides the min aggregation method for Series
 *
 * @module methods/series/aggregation/min
 */

/**
 * Returns the minimum value in the Series
 *
 * @param {Object} series - Series instance or this when called as method
 * @returns {number} Minimum value or null if empty
 */
export function min(series) {
  // If called as method (series.min()), use this
  if (arguments.length === 0 && this && this.vector) {
    series = this;
  }
  // Check for data availability
  if (!series) return null;

  // First try to use vector.__data (TypedArrayVector)
  if (series.vector && series.vector.__data) {
    const data = series.vector.__data;
    if (data.length === 0) return null;

    let min = Infinity;
    for (let i = 0; i < data.length; i++) {
      if (!isNaN(data[i]) && data[i] < min) {
        min = data[i];
      }
    }
    return min === Infinity ? null : min;
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

  // Find minimum
  if (values.length === 0) return null;

  let min = Infinity;
  for (let i = 0; i < values.length; i++) {
    const val = Number(values[i]);
    if (!isNaN(val) && val < min) {
      min = val;
    }
  }

  return min === Infinity ? null : min;
}
