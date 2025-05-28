/**
 * Registrar for Series filtering methods
 */

/**
 * Registers all filtering methods for Series
 * @param {Class} Series - Series class to extend
 */
export function registerSeriesFiltering(Series) {
  /**
   * Filters elements in a Series based on a predicate function
   * @param {Function} predicate - Function that takes a value and returns true/false
   * @returns {Series} - New Series with filtered values
   */
  Series.prototype.filter = function(predicate) {
    const values = this.toArray();
    const filteredValues = values.filter(predicate);
    return new this.constructor(filteredValues);
  };

  /**
   * Returns a new Series with values greater than the specified value
   * @param {number} value - Value to compare against
   * @returns {Series} - New Series with filtered values
   */
  Series.prototype.gt = function(value) {
    return this.filter((x) => x > value);
  };

  /**
   * Returns a new Series with values greater than or equal to the specified value
   * @param {number} value - Value to compare against
   * @returns {Series} - New Series with filtered values
   */
  Series.prototype.gte = function(value) {
    return this.filter((x) => x >= value);
  };

  /**
   * Returns a new Series with values less than the specified value
   * @param {number} value - Value to compare against
   * @returns {Series} - New Series with filtered values
   */
  Series.prototype.lt = function(value) {
    return this.filter((x) => x < value);
  };

  /**
   * Returns a new Series with values less than or equal to the specified value
   * @param {number} value - Value to compare against
   * @returns {Series} - New Series with filtered values
   */
  Series.prototype.lte = function(value) {
    return this.filter((x) => x <= value);
  };

  /**
   * Returns a new Series with values equal to the specified value
   * @param {*} value - Value to compare against
   * @returns {Series} - New Series with filtered values
   */
  Series.prototype.eq = function(value) {
    return this.filter((x) => x === value);
  };

  /**
   * Returns a new Series with values not equal to the specified value
   * @param {*} value - Value to compare against
   * @returns {Series} - New Series with filtered values
   */
  Series.prototype.ne = function(value) {
    return this.filter((x) => x !== value);
  };

  /**
   * Returns a new Series with non-null values
   * @returns {Series} - New Series with non-null values
   */
  Series.prototype.notNull = function() {
    return this.filter((x) => x !== null && x !== undefined);
  };

  /**
   * Returns a new Series with values in the specified array
   * @param {Array} values - Array of values to include
   * @returns {Series} - New Series with filtered values
   */
  Series.prototype.isin = function(values) {
    const valueSet = new Set(values);
    return this.filter((x) => valueSet.has(x));
  };
}

export default registerSeriesFiltering;
