// src/core/storage/TypedArrayVector.js
import { ColumnVector } from './ColumnVector.js';

/**
 * Wrapper around any TypedArray, implementing ColumnVector interface.
 * Used for dense numeric data without null bitmask.
 */
export class TypedArrayVector extends ColumnVector {
  // Flag indicating that this is a vector
  _isVector = true;
  /**
   * @param {TypedArray} ta — Float64Array / Int32Array / …
   */
  constructor(ta) {
    super();
    this._data = ta;
    this.length = ta.length;
  }

  /* -------------------------------------------------- *
   *  Element access                                    *
   * -------------------------------------------------- */

  get(i) {
    // no bounds checks for speed (assume valid i)
    return this._data[i];
  }

  /* -------------------------------------------------- *
   *  Aggregates                                          *
   * -------------------------------------------------- */

  sum() {
    // branch-less linear summation
    let acc = 0;
    const d = this._data;
    for (let i = 0; i < d.length; i++) acc += d[i];
    return acc;
  }

  /* -------------------------------------------------- *
   *  Transformations                                     *
   * -------------------------------------------------- */

  /**
   * Returns a new TypedArrayVector with the function fn applied.
   * @param {(v:any, i:number)=>any} fn
   * @returns {TypedArrayVector}
   */
  map(fn) {
    const out = new this._data.constructor(this.length);
    for (let i = 0; i < this.length; i++) out[i] = fn(this._data[i], i);
    return new TypedArrayVector(out);
  }

  /**
   * Returns a new TypedArrayVector containing a subset of elements.
   * @param {number} start - Start index (inclusive)
   * @param {number} end - End index (exclusive)
   * @returns {TypedArrayVector}
   */
  slice(start, end) {
    const sliced = this._data.slice(start, end);
    return new TypedArrayVector(sliced);
  }

  /* -------------------------------------------------- *
   *  Serialization / export                            *
   * -------------------------------------------------- */

  /** Fast conversion to JS array */
  toArray() {
    return Array.from(this._data);
  }

  /** JSON.stringify(series) → plain array */
  toJSON() {
    return this.toArray();
  }

  /** For compatibility with ColumnVector.toArrow() */
  get _data() {
    return this.__data;
  }
  set _data(val) {
    this.__data = val;
  }
}
