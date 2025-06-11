/**
 * Apply method for Series
 * Applies a function to each element and returns a new Series
 */

/**
 * Creates an apply method for Series
 * @returns {Function} - Function to be attached to Series prototype
 */
export function apply() {
  /**
   * Applies a function to each element and returns a new Series
   * @param {Function} fn - Function to apply
   * @returns {Series} - New Series with transformed values
   */
  return function (fn) {
    return this.map(fn);
  };
}

/**
 * Registers the apply method on Series prototype
 * @param {Class} Series - Series class to extend
 */
export function register(Series) {
  if (!Series.prototype.apply) {
    Series.prototype.apply = apply();
  }
}

export default { apply, register };
