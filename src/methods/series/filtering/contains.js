/**
 * Contains method for Series
 * Returns a new Series with string values that contain the specified substring
 */

/**
 * Creates a contains method for Series
 * @returns {Function} - Function to be attached to Series prototype
 */
export function contains() {
  /**
   * Returns a new Series with string values that contain the specified substring
   * @param {string} substring - Substring to search for
   * @param {Object} [options] - Options object
   * @param {boolean} [options.caseSensitive=true] - Whether the search is case sensitive
   * @returns {Series} - New Series with filtered values
   */
  return function (substring, options = {}) {
    const { caseSensitive = true } = options;

    if (substring === undefined || substring === null) {
      throw new Error('Substring must be provided');
    }

    return this.filter((value) => {
      if (value === null || value === undefined) {
        return false;
      }

      const strValue = String(value);

      if (caseSensitive) {
        return strValue.includes(substring);
      } else {
        return strValue.toLowerCase().includes(substring.toLowerCase());
      }
    });
  };
}

/**
 * Registers the contains method on Series prototype
 * @param {Class} Series - Series class to extend
 */
export function register(Series) {
  if (!Series.prototype.contains) {
    Series.prototype.contains = contains();
  }
}

export default contains;
