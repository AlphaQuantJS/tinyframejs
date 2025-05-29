// src/core/storage/ArrowVector.js
import { ColumnVector } from './ColumnVector.js';
import { Vector } from 'apache-arrow';

/**
 * Wrapper around Apache Arrow Vector.
 * Supports get / sum / map and serialization.
 */
export class ArrowVector extends ColumnVector {
  /**
   * @param {Vector} arrowVec
   */
  constructor(arrowVec) {
    super();
    this._arrow = arrowVec;
    this.length = arrowVec.length;
  }

  /* -------------------------------------------------- *
   *  Element access                                    *
   * -------------------------------------------------- */

  get(i) {
    return this._arrow.get(i);
  }

  /* -------------------------------------------------- *
   *  Aggregates                                          *
   * -------------------------------------------------- */

  sum() {
    // Arrow Vector has reduce
    return this._arrow.reduce((acc, v) => acc + (v ?? 0), 0);
  }

  /* -------------------------------------------------- *
   *  Transformations                                     *
   * -------------------------------------------------- */

  /**
   * Returns a new ArrowVector with the function fn applied.
   * Arrow JS Vector already has a map method that creates a new Vector.
   * @param fn
   */
  map(fn) {
    const mapped = this._arrow.map(fn);
    return new ArrowVector(mapped);
  }

  /* -------------------------------------------------- *
   *  Serialization / export                            *
   * -------------------------------------------------- */

  /** Fast conversion to JS array */
  toArray() {
    return this._arrow.toArray();
  }

  /** Support for JSON.stringify(series) */
  toJSON() {
    return this.toArray();
  }

  /** Compatibility with ColumnVector.toArrow() */
  toArrow() {
    return this._arrow;
  }

  /** Marker, that this is Arrow backend (for internal logic) */
  get isArrow() {
    return true;
  }
}
