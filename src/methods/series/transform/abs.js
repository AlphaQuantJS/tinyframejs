/**
 * Abs method for Series
 * Returns absolute values of all elements in the Series
 */

/**
 * Creates an abs method for Series
 * @returns {Function} - Function to be attached to Series prototype
 */
export function abs() {
  /**
   * Returns absolute values of all elements in the Series
   * @returns {Series} - New Series with absolute values
   */
  return function () {
    return this.map(Math.abs);
  };
}

/**
 * Registers the abs method on Series prototype
 * @param {Class} Series - Series class to extend
 */
export function register(Series) {
  if (!Series.prototype.abs) {
    Series.prototype.abs = abs();
  }
}

export default { abs, register };
