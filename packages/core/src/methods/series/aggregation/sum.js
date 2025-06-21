/**
 * Aggregation method: sum
 *
 * This file provides the sum aggregation method for Series
 *
 * @module methods/series/aggregation/sum
 */

/**
 * Returns the sum of all values in the Series
 *
 * @param {Object} series - Series instance or this when called as method
 * @returns {number} Sum of all values
 */
export function sum(series) {
  // If called as method (series.sum()), use this
  if (arguments.length === 0 && this && this.vector) {
    series = this;
  }

  // Check for data availability
  if (!series) return 0;

  // First try to use vector.__data (TypedArrayVector)
  if (series.vector && series.vector.__data) {
    const data = series.vector.__data;
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      if (!isNaN(data[i])) {
        sum += data[i];
      }
    }
    return sum;
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

  // Sum values
  return values.reduce((a, b) => a + Number(b), 0);
}
