/**
 * Aggregation method: count
 *
 * This file provides the count aggregation method for Series
 *
 * @module methods/series/aggregation/count
 */

/**
 * Returns the count of elements in the Series
 *
 * @param {Object} series - Series instance or this when called as method
 * @returns {number} Count of elements
 */
export function count(series) {
  // If called as method (series.count()), use this
  if (arguments.length === 0 && this && this.vector) {
    series = this;
  }
  // Check for data availability
  if (!series) return 0;

  // First try to use vector.__data (TypedArrayVector)
  if (series.vector && series.vector.__data) {
    return series.vector.__data.length;
  }

  // Then try to get length from other sources
  if (typeof series.length === 'number') {
    return series.length;
  }

  if (series.values && series.values.length) {
    return series.values.length;
  }

  if (typeof series.toArray === 'function') {
    return series.toArray().length;
  }

  if (series.vector && typeof series.vector.length === 'number') {
    return series.vector.length;
  }

  return series.size ?? 0;
}
