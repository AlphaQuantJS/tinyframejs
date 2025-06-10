/**
 * Matches method for Series
 * Returns a new Series with string values that match the specified regular expression
 */

/**
 * Creates a matches method for Series
 * @returns {Function} - Function to be attached to Series prototype
 */
export function matches() {
  /**
   * Returns a new Series with string values that match the specified regular expression
   * @param {RegExp|string} pattern - Regular expression pattern to match
   * @param {Object} [options] - Options object
   * @param {boolean} [options.flags] - Flags for the RegExp if pattern is a string
   * @returns {Series} - New Series with filtered values
   */
  return function(pattern, options = {}) {
    const { flags = '' } = options;

    if (pattern === undefined || pattern === null) {
      throw new Error('Regular expression pattern must be provided');
    }

    // Convert string pattern to RegExp if needed
    const regex = pattern instanceof RegExp 
      ? pattern 
      : new RegExp(pattern, flags);

    return this.filter((value) => {
      if (value === null || value === undefined) {
        return false;
      }

      const strValue = String(value);
      return regex.test(strValue);
    });
  };
}

/**
 * Registers the matches method on Series prototype
 * @param {Class} Series - Series class to extend
 */
export function register(Series) {
  if (!Series.prototype.matches) {
    Series.prototype.matches = matches();
  }
}

export default matches;
