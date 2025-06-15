// src/core/storage/SimpleVector.js
import { ColumnVector } from './ColumnVector.js';
import { TypedArrayVector } from './TypedArrayVector.js';

/**
 * Simple implementation of ColumnVector for working with non-numeric data.
 * Used as fallback, when Arrow is not available and data is not numeric.
 */
export class SimpleVector extends ColumnVector {
  /**
   * @param {Array} data - Array of any type
   */
  constructor(data) {
    super();
    this._data = Array.isArray(data) ? [...data] : [];
    this.length = this._data.length;
    this._isVector = true;
  }

  /**
   * Get element by index
   * @param {number} i - Index of the element
   * @returns {*} Value of the element
   */
  get(i) {
    return this._data[i];
  }

  /**
   * Convert to a regular JavaScript array
   * @returns {Array} Copy of the internal array
   */
  toArray() {
    return [...this._data];
  }

  /**
   * Create a new vector by applying a function to each element.
   * Preserves numeric backend for numeric results.
   * @param {Function} fn - Conversion function (value, index) => newValue
   * @returns {ColumnVector} New vector with transformed values
   */
  map(fn) {
    const mapped = this._data.map(fn);
    const numeric = mapped.every(
      (v) => typeof v === 'number' && !Number.isNaN(v),
    );
    return numeric
      ? new TypedArrayVector(Float64Array.from(mapped))
      : new SimpleVector(mapped);
  }

  /**
   * Create a new vector with a subset of elements
   * @param {number} start - Start index (inclusive)
   * @param {number} end - End index (exclusive)
   * @returns {SimpleVector} New vector with a subset of elements
   */
  slice(start, end) {
    return new SimpleVector(this._data.slice(start, end));
  }

  /**
   * Calculate the sum of elements (only for numeric data)
   * @returns {number|undefined} Sum or undefined for non-numeric data
   */
  sum() {
    // Optimization: check only the first few elements
    // to determine if the column is numeric
    const sampleSize = Math.min(10, this.length);
    const sample = this._data.slice(0, sampleSize);

    if (sample.every((v) => typeof v === 'number')) {
      return this._data.reduce(
        (a, b) => a + (typeof b === 'number' ? b : 0),
        0,
      );
    }
    return undefined;
  }

  /**
   * JSON representation of the vector
   * @returns {Array} Array for JSON serialization
   */
  toJSON() {
    return this.toArray();
  }

  /**
   * For compatibility with ColumnVector.toArrow()
   * @returns {Array} Internal data array
   */
  toArrow() {
    return this._data;
  }
}
