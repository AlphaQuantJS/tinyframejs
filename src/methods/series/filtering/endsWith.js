/**
 * EndsWith method for Series
 * Returns a new Series with string values that end with the specified suffix
 */

/**
 * Creates an endsWith method for Series
 * @returns {Function} - Function to be attached to Series prototype
 */
export function endsWith() {
  /**
   * Returns a new Series with string values that end with the specified suffix
   * @param {string} suffix - Suffix to search for
   * @param {Object} [options] - Options object
   * @param {boolean} [options.caseSensitive=true] - Whether the search is case sensitive
   * @returns {Series} - New Series with filtered values
   */
  return function(suffix, options = {}) {
    const { caseSensitive = true } = options;

    if (suffix === undefined || suffix === null) {
      throw new Error('Suffix must be provided');
    }

    return this.filter((value) => {
      if (value === null || value === undefined) {
        return false;
      }

      const strValue = String(value);
      
      if (caseSensitive) {
        // В режиме чувствительности к регистру проверяем точное совпадение
        return strValue.endsWith(suffix);
      } else {
        return strValue.toLowerCase().endsWith(suffix.toLowerCase());
      }
    });
  };
}

/**
 * Registers the endsWith method on Series prototype
 * @param {Class} Series - Series class to extend
 */
export function register(Series) {
  if (!Series.prototype.endsWith) {
    Series.prototype.endsWith = endsWith();
  }
}

export default endsWith;
