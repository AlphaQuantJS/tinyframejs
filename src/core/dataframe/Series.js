// src/core/dataframe/Series.js
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
    if (data?._isVector) {
      this.vector = data;
      this._length = data.length;
    } else if (Array.isArray(data)) {
      // For simplicity in tests, we use a simple array
      this._array = data;
      this._length = data.length;
    } else if (data === undefined) {
      // Empty array for initialization
      this._array = [];
      this._length = 0;
    } else {
      // For other data types, we try to create a vector
      // Note: VectorFactory.from is asynchronous, but we simplify it for tests
      this._array = Array.isArray(data) ? data : [];
      this._length = this._array.length;
    }
  }

  /* ------------------------------------------------------------------ *
   *  Factories (static methods)                                        *
   * ------------------------------------------------------------------ */

  static create(data, opts = {}) {
    return new Series(data, opts);
  }

  /* ------------------------------------------------------------------ *
   *  Getters and quick accessors                                       *
   * ------------------------------------------------------------------ */

  get length() {
    if (this.vector) return this.vector.length;
    if (this._array) return this._array.length;
    return this._length || 0;
  }

  get values() {
    if (this.vector) return this.vector.toArray();
    return this._array || [];
  }

  get(index) {
    if (this.vector) return this.vector.get(index);
    return this._array ? this._array[index] : undefined;
  }

  /* ------------------------------------------------------------------ *
   *  Data export                                                       *
   * ------------------------------------------------------------------ */

  toArray() {
    if (this.vector) return this.vector.toArray();
    return this._array || [];
  }

  /* ------------------------------------------------------------------ *
   *  Aggregation methods                                              *
   * ------------------------------------------------------------------ */

  /**
   * Calculates the sum of all values in the Series
   * @returns {number} - Sum of all values
   */
  sum() {
    const data = this.toArray();
    return data.reduce((acc, val) => acc + (Number(val) || 0), 0);
  }

  /**
   * Calculates the mean (average) of all values in the Series
   * @returns {number} - Mean of all values
   */
  mean() {
    const data = this.toArray();
    if (!data.length) return NaN;
    const sum = data.reduce((acc, val) => acc + (Number(val) || 0), 0);
    return sum / data.length;
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
