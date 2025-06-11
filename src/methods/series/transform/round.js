/**
 * Round method for Series
 * Rounds all elements in the Series to specified number of decimals
 */

/**
 * Creates a round method for Series
 * @returns {Function} - Function to be attached to Series prototype
 */
export function round() {
  /**
   * Rounds all elements in the Series to specified number of decimals
   * @param {number} [decimals=0] - Number of decimal places
   * @returns {Series} - New Series with rounded values
   */
  return function (decimals = 0) {
    const factor = Math.pow(10, decimals);
    return this.map((x) => Math.round(x * factor) / factor);
  };
}

/**
 * Registers the round method on Series prototype
 * @param {Class} Series - Series class to extend
 */
export function register(Series) {
  if (!Series.prototype.round) {
    Series.prototype.round = round();
  }
}

export default { round, register };
