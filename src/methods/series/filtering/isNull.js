/**
 * IsNull method for Series
 * Returns a new Series with only null or undefined values
 */

/**
 * Creates an isNull method for Series
 * @returns {Function} - Function to be attached to Series prototype
 */
export function isNull() {
  /**
   * Returns a new Series with only null or undefined values
   * @returns {Series} - New Series with filtered values
   */
  return function() {
    return this.filter((x) => x === null || x === undefined);
  };
}

/**
 * Registers the isNull method on Series prototype
 * @param {Class} Series - Series class to extend
 */
export function register(Series) {
  if (!Series.prototype.isNull) {
    Series.prototype.isNull = isNull();
  }
}

export default isNull;
