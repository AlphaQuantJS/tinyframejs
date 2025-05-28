/**
 * Filters elements in a Series based on a predicate function.
 *
 * @param {Series} series - Series instance
 * @param {Function} predicate - Function that takes a value and returns true/false
 * @returns {Series} - New Series with filtered values
 */
export const filter = (series, predicate) => {
  const values = series.toArray();
  const filteredValues = values.filter(predicate);
  return new series.constructor(filteredValues);
};

/**
 * Registers the filter method on Series prototype
 * @param {Class} Series - Series class to extend
 */
export const register = (Series) => {
  Series.prototype.filter = function(predicate) {
    return filter(this, predicate);
  };
};

export default { filter, register };
