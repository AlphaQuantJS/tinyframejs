/**
 * Map method for Series
 * Maps each element in the Series using the provided function
 */

/**
 * Creates a map method for Series
 * @returns {Function} - Function to be attached to Series prototype
 */
export function map() {
  /**
   * Maps each element in the Series using the provided function
   * @param {Function} fn - Function to apply to each element
   * @returns {Series} - New Series with transformed values
   */
  return function (fn) {
    const data = this.values;
    const result = new Array(data.length);

    for (let i = 0; i < data.length; i++) {
      result[i] = fn(data[i], i, data);
    }

    return new this.constructor(result, { name: this.name });
  };
}

/**
 * Registers the map method on Series prototype
 * @param {Class} Series - Series class to extend
 */
export function register(Series) {
  if (!Series.prototype.map) {
    Series.prototype.map = map();
  }
}

export default { map, register };
