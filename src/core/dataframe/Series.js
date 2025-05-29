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

  static create(data, opts = {}) {
    return new Series(data, opts);
  }

  /* ------------------------------------------------------------------ *
   *  Getters and quick accessors                                       *
   * ------------------------------------------------------------------ */

  get length() {
    return this.vector.length;
  }

  get values() {
    return this.vector.toArray();
  }

  get(index) {
    return this.vector.get(index);
  }

  /* ------------------------------------------------------------------ *
   *  Data export                                                       *
   * ------------------------------------------------------------------ */

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
