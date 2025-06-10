/**
 * Between method for Series
 * Returns a new Series with values between lower and upper bounds (inclusive)
 */

/**
 * Creates a between method for Series
 * @returns {Function} - Function to be attached to Series prototype
 */
export function between() {
  /**
   * Returns a new Series with values between lower and upper bounds (inclusive)
   * @param {number} lower - Lower bound
   * @param {number} upper - Upper bound
   * @param {Object} [options] - Options object
   * @param {boolean} [options.inclusive=true] - Whether bounds are inclusive
   * @returns {Series} - New Series with filtered values
   */
  return function(lower, upper, options = {}) {
    const { inclusive = true } = options;

    if (lower === undefined || upper === undefined) {
      throw new Error('Both lower and upper bounds must be provided');
    }

    if (lower > upper) {
      throw new Error('Lower bound must be less than or equal to upper bound');
    }

    if (inclusive) {
      return this.filter((x) => {
        const numX = Number(x);
        return !isNaN(numX) && numX >= lower && numX <= upper;
      });
    } else {
      return this.filter((x) => {
        const numX = Number(x);
        return !isNaN(numX) && numX > lower && numX < upper;
      });
    }
  };
}

/**
 * Registers the between method on Series prototype
 * @param {Class} Series - Series class to extend
 */
export function register(Series) {
  if (!Series.prototype.between) {
    Series.prototype.between = between();
  }
}

export default between;
