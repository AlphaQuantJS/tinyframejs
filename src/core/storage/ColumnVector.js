// src/core/storage/ColumnVector.js
/**
 * Abstract interface for column vectors.
 * Concrete implementations (TypedArrayVector, ArrowVector, WasmVector …)
 * must implement each method. This layer hides storage details
 * from Series/DataFrame and provides a minimal set of primitives.
 */
export class ColumnVector {
  /** @type {number} Length of the vector */
  length;

  /**
   * Get element by index
   * @param {number} i
   * @returns {*}
   */
  get(i) {
    throw new Error('ColumnVector.get() not implemented');
  }

  /**
   * Copy to a regular JS array
   * @returns {any[]}
   */
  toArray() {
    // Base (slow) fallback — implementation may override
    const out = new Array(this.length);
    for (let i = 0; i < this.length; i++) out[i] = this.get(i);
    return out;
  }

  /**
   * Fast sum of elements (for numeric types).
   * Should return `undefined` for string / mixed data.
   */
  sum() {
    throw new Error('ColumnVector.sum() not implemented');
  }

  /**
   * Create a new ColumnVector by applying a function to each element
   * @param {(v:any, i:number)=>any} fn
   * @returns {ColumnVector}
   */
  map(fn) {
    throw new Error('ColumnVector.map() not implemented');
  }

  /**
   * Optionally: return Arrow.Vector or TypedArray — used
   * during serialization. Implementations may simply spread their backend.
   */
  toArrow() {
    return this._arrow ?? this._data ?? this.toArray();
  }

  /** JSON representation by default */
  toJSON() {
    return this.toArray();
  }
}
