/**
 * Registrar for Series transformation methods
 */

/**
 * Registers all transformation methods for Series
 * @param {Class} Series - Series class to extend
 */
export function registerSeriesTransform(Series) {
  /**
   * Maps each element in the Series using the provided function
   * @param {Function} fn - Function to apply to each element
   * @returns {Series} - New Series with transformed values
   */
  Series.prototype.map = function(fn) {
    const data = this.values;
    const result = new Array(data.length);

    for (let i = 0; i < data.length; i++) {
      result[i] = fn(data[i], i, data);
    }

    return new Series(result, { name: this.name });
  };

  /**
   * Filters Series elements using the provided predicate
   * @param {Function} predicate - Function that returns true for elements to keep
   * @returns {Series} - New Series with filtered values
   */
  Series.prototype.filter = function(predicate) {
    const data = this.values;
    const result = [];

    for (let i = 0; i < data.length; i++) {
      if (predicate(data[i], i, data)) {
        result.push(data[i]);
      }
    }

    return new Series(result, { name: this.name });
  };

  /**
   * Returns absolute values of all elements in the Series
   * @returns {Series} - New Series with absolute values
   */
  Series.prototype.abs = function() {
    return this.map(Math.abs);
  };

  /**
   * Rounds all elements in the Series to specified number of decimals
   * @param {number} [decimals=0] - Number of decimal places
   * @returns {Series} - New Series with rounded values
   */
  Series.prototype.round = function(decimals = 0) {
    const factor = Math.pow(10, decimals);
    return this.map((x) => Math.round(x * factor) / factor);
  };

  /**
   * Returns cumulative sum of the Series
   * @returns {Series} - New Series with cumulative sum
   */
  Series.prototype.cumsum = function() {
    const data = this.values;
    const result = new Array(data.length);
    let sum = 0;

    for (let i = 0; i < data.length; i++) {
      if (data[i] !== null && data[i] !== undefined && !Number.isNaN(data[i])) {
        sum += data[i];
      }
      result[i] = sum;
    }

    return new Series(result, { name: this.name });
  };

  /**
   * Returns Series with values normalized to range [0, 1]
   * @returns {Series} - Normalized Series
   */
  Series.prototype.normalize = function() {
    const min = this.min();
    const max = this.max();

    if (min === max) {
      return this.map(() => 0);
    }

    const range = max - min;
    return this.map((x) => (x - min) / range);
  };

  /**
   * Applies a function to each element and returns a new Series
   * @param {Function} fn - Function to apply
   * @returns {Series} - New Series with transformed values
   */
  Series.prototype.apply = function(fn) {
    return this.map(fn);
  };

  // Here you can add other transformation methods
}

export default registerSeriesTransform;
