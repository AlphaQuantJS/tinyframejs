// src/core/storage/VectorFactory.js
import { TypedArrayVector } from './TypedArrayVector.js';
import { ArrowVector } from './ArrowVector.js';
import { shouldUseArrow } from '../strategy/shouldUseArrow.js';

export const VectorFactory = {
  /**
   * Creates a ColumnVector from any input data.
   * @param {Array|TypedArray} data
   * @param {object} [opts]          { preferArrow?: boolean }
   * @returns {ColumnVector}
   */
  async from(data, opts = {}) {
    /* ------------------------------------------------- *
     *  1. If already Arrow/TypedArray - wrap it immediately  *
     * ------------------------------------------------- */
    if (data?._isArrowVector || data?.isArrow) return new ArrowVector(data);
    if (ArrayBuffer.isView(data)) return new TypedArrayVector(data);

    /* ------------------------------------------------- *
     *  2. Decide if Arrow is needed for a regular JS array *
     * ------------------------------------------------- */
    const useArrow = opts.preferArrow ?? shouldUseArrow(data, opts);

    if (useArrow) {
      // Dynamic import to avoid loading the entire lib when not needed
      try {
        const { vectorFromArray } = await import('apache-arrow/adapter');
        return new ArrowVector(vectorFromArray(data));
      } catch (error) {
        console.warn(
          'Apache Arrow adapter not available, falling back to TypedArray',
        );
        return new TypedArrayVector(
          Array.isArray(data) ? new Float64Array(data) : data,
        );
      }
    }

    // Fallback: convert numeric array to Float64Array
    return new TypedArrayVector(Float64Array.from(data));
  },
};
