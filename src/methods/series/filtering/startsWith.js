/**
 * StartsWith method for Series
 * Returns a new Series with string values that start with the specified prefix
 */

/**
 * Creates a startsWith method for Series
 * @returns {Function} - Function to be attached to Series prototype
 */
export function startsWith() {
  /**
   * Returns a new Series with string values that start with the specified prefix
   * @param {string} prefix - Prefix to search for
   * @param {Object} [options] - Options object
   * @param {boolean} [options.caseSensitive=true] - Whether the search is case sensitive
   * @returns {Series} - New Series with filtered values
   */
  return function(prefix, options = {}) {
    const { caseSensitive = true } = options;

    if (prefix === undefined || prefix === null) {
      throw new Error('Prefix must be provided');
    }

    return this.filter((value) => {
      if (value === null || value === undefined) {
        return false;
      }

      const strValue = String(value);
      
      if (caseSensitive) {
        return strValue.startsWith(prefix);
      } else {
        return strValue.toLowerCase().startsWith(prefix.toLowerCase());
      }
    });
  };
}

/**
 * Registers the startsWith method on Series prototype
 * @param {Class} Series - Series class to extend
 */
export function register(Series) {
  if (!Series.prototype.startsWith) {
    Series.prototype.startsWith = startsWith();
  }
}

export default startsWith;
