/**
 * Registrar for Series filtering methods
 */

import { register as registerBetween } from './between.js';
import { register as registerContains } from './contains.js';
import { register as registerStartsWith } from './startsWith.js';
import { register as registerEndsWith } from './endsWith.js';
import { register as registerMatches } from './matches.js';
import { register as registerIsNull } from './isNull.js';

/**
 * Registers all filtering methods for Series
 * @param {Class} Series - Series class to extend
 */
export function registerSeriesFiltering(Series) {
  // Only register filter if it's not already registered
  if (!Series.prototype.filter) {
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
  }

  // Only register gt if it's not already registered
  if (!Series.prototype.gt) {
    /**
     * Returns a new Series with values greater than the specified value
     * @param {number} value - Value to compare against
     * @returns {Series} - New Series with filtered values
     */
    Series.prototype.gt = function(value) {
      return this.filter((x) => x > value);
    };
  }

  // Only register gte if it's not already registered
  if (!Series.prototype.gte) {
    /**
     * Returns a new Series with values greater than or equal to the specified value
     * @param {number} value - Value to compare against
     * @returns {Series} - New Series with filtered values
     */
    Series.prototype.gte = function(value) {
      return this.filter((x) => x >= value);
    };
  }

  // Only register lt if it's not already registered
  if (!Series.prototype.lt) {
    /**
     * Returns a new Series with values less than the specified value
     * @param {number} value - Value to compare against
     * @returns {Series} - New Series with filtered values
     */
    Series.prototype.lt = function(value) {
      return this.filter((x) => x < value);
    };
  }

  // Only register lte if it's not already registered
  if (!Series.prototype.lte) {
    /**
     * Returns a new Series with values less than or equal to the specified value
     * @param {number} value - Value to compare against
     * @returns {Series} - New Series with filtered values
     */
    Series.prototype.lte = function(value) {
      return this.filter((x) => x <= value);
    };
  }

  // Only register eq if it's not already registered
  if (!Series.prototype.eq) {
    /**
     * Returns a new Series with values equal to the specified value
     * @param {*} value - Value to compare against
     * @returns {Series} - New Series with filtered values
     */
    Series.prototype.eq = function(value) {
      return this.filter((x) => x === value);
    };
  }

  // Only register ne if it's not already registered
  if (!Series.prototype.ne) {
    /**
     * Returns a new Series with values not equal to the specified value
     * @param {*} value - Value to compare against
     * @returns {Series} - New Series with filtered values
     */
    Series.prototype.ne = function(value) {
      return this.filter((x) => x !== value);
    };
  }

  // Only register notNull if it's not already registered
  if (!Series.prototype.notNull) {
    /**
     * Returns a new Series with non-null values
     * @returns {Series} - New Series with non-null values
     */
    Series.prototype.notNull = function() {
      return this.filter((x) => x !== null && x !== undefined);
    };
  }

  // Only register isin if it's not already registered
  if (!Series.prototype.isin) {
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

  // Register additional filtering methods
  registerBetween(Series);
  registerContains(Series);
  registerStartsWith(Series);
  registerEndsWith(Series);
  registerMatches(Series);
  registerIsNull(Series);
}

export default registerSeriesFiltering;
