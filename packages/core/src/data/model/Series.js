/**
 * Класс Series для работы с одномерными данными
 *
 * @module data/model/Series
 */

import { VectorFactory } from '../storage/VectorFactory.js';
import { shouldUseArrow } from '../strategy/shouldUseArrow.js';

export class Series {
  /**
   * @param {Array|TypedArray|Vector} data - Source data array
   * @param {object} [opts] - Options: { name?: string, preferArrow?: boolean }
   */
  constructor(data, opts = {}) {
    this.name = opts.name || '';

    // Create vector from data
    if (data._isVector) {
      this.vector = data;
    } else {
      this.vector = VectorFactory.from(data, {
        preferArrow: opts.preferArrow ?? shouldUseArrow(data, opts),
      });
    }
  }

  /* ------------------------------------------------------------------ *
   *  Factories (static methods)                                        *
   * ------------------------------------------------------------------ */

  /**
   * Creates a new Series instance
   * @param {Array|TypedArray|Vector} data - Source data array
   * @param {object} [opts] - Options: { name?: string, preferArrow?: boolean }
   * @returns {Series} - New Series instance
   */
  static create(data, opts = {}) {
    return new Series(data, opts);
  }

  /* ------------------------------------------------------------------ *
   *  Getters and quick accessors                                       *
   * ------------------------------------------------------------------ */

  /**
   * Gets the length of the Series
   * @returns {number} - Number of elements in the Series
   */
  get length() {
    return this.vector.length;
  }

  /**
   * Gets the values of the Series as an array
   * @returns {Array} - Array of Series values
   */
  get values() {
    return this.vector.toArray();
  }

  /**
   * Gets the value at the specified index
   * @param {number} index - Index to retrieve
   * @returns {*} - Value at the specified index
   */
  get(index) {
    return this.vector.get(index);
  }

  /* ------------------------------------------------------------------ *
   *  Data export                                                       *
   * ------------------------------------------------------------------ */

  /**
   * Converts the Series to an array
   * @returns {Array} - Array representation of the Series
   */
  toArray() {
    return this.vector.toArray();
  }

  /* ------------------------------------------------------------------ *
   *  Series operations                                                 *
   * ------------------------------------------------------------------ */

  /**
   * Maps each value in the Series using a function
   * @param {Function} fn - Mapping function
   * @returns {Series} - New Series with mapped values
   */
  map(fn) {
    const data = this.toArray();
    const result = new Array(data.length);

    for (let i = 0; i < data.length; i++) {
      result[i] = fn(data[i], i, data);
    }

    return new Series(result, { name: this.name });
  }

  /**
   * Filters values in the Series using a predicate function
   * @param {Function} predicate - Filter function
   * @returns {Series} - New Series with filtered values
   */
  filter(predicate) {
    const data = this.toArray();
    const result = [];

    for (let i = 0; i < data.length; i++) {
      if (predicate(data[i], i, data)) {
        result.push(data[i]);
      }
    }

    return new Series(result, { name: this.name });
  }

  /* ------------------------------------------------------------------ *
   *  Visualization                                                     *
   * ------------------------------------------------------------------ */

  /**
   * Returns a string representation of the Series
   * @returns {string} - String representation
   */
  toString() {
    const values = this.toArray();
    const preview = values.slice(0, 5).join(', ');
    const suffix = values.length > 5 ? `, ... (${values.length} items)` : '';
    return `Series(${preview}${suffix})`;
  }
}
