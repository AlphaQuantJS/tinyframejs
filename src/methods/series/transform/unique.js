/**
 * Unique method for Series
 * Returns a new Series with unique values
 */

/**
 * Creates a unique method for Series
 * @returns {Function} - Function to be attached to Series prototype
 */
export function unique() {
  /**
   * Returns a new Series with unique values
   * @param {Object} [options] - Options object
   * @param {boolean} [options.keepNull=true] - Whether to keep null/undefined values
   * @returns {Series} - New Series with unique values
   */
  return function(options = {}) {
    const { keepNull = true } = options;
    
    const values = this.toArray();
    const uniqueValues = [];
    const seen = new Set();
    
    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      
      // Handle null/undefined values separately
      if (value === null) {
        if (keepNull && !seen.has('__NULL__')) {
          uniqueValues.push(value);
          seen.add('__NULL__');
        }
        continue;
      }
      if (value === undefined) {
        if (keepNull && !seen.has('__UNDEFINED__')) {
          uniqueValues.push(value);
          seen.add('__UNDEFINED__');
        }
        continue;
      }
      
      // For regular values
      const valueKey = typeof value === 'object' ? JSON.stringify(value) : value;
      if (!seen.has(valueKey)) {
        uniqueValues.push(value);
        seen.add(valueKey);
      }
    }
    
    return new this.constructor(uniqueValues, { name: this.name });
  };
}

/**
 * Registers the unique method on Series prototype
 * @param {Class} Series - Series class to extend
 */
export function register(Series) {
  if (!Series.prototype.unique) {
    Series.prototype.unique = unique();
  }
}

export default unique;
