/**
 * DropNA method for Series
 * Returns a new Series with null/undefined values removed
 */

/**
 * Creates a dropna method for Series
 * @returns {Function} - Function to be attached to Series prototype
 */
export function dropna() {
  /**
   * Returns a new Series with null/undefined values removed
   * @returns {Series} - New Series without null/undefined values
   */
  return function() {
    return this.filter((value) => value !== null && value !== undefined);
  };
}

/**
 * Registers the dropna method on Series prototype
 * @param {Class} Series - Series class to extend
 */
export function register(Series) {
  if (!Series.prototype.dropna) {
    Series.prototype.dropna = dropna();
  }
}

export default dropna;
