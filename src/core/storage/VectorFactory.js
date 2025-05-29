// src/core/storage/VectorFactory.js
import { TypedArrayVector } from './TypedArrayVector.js';
import { ArrowVector } from './ArrowVector.js';
import { ColumnVector } from './ColumnVector.js';
import { shouldUseArrow } from '../strategy/shouldUseArrow.js';
import { SimpleVector } from './SimpleVector.js';

// Статический импорт Arrow вместо динамического
// Для продакшена лучше использовать условный импорт на уровне пакера (import.meta.env)
let vectorFromArray;

// Попытка загрузить Arrow адаптер синхронно
try {
  // Для Node.js используем require
  const arrowAdapter = require('apache-arrow/adapter');
  vectorFromArray = arrowAdapter.vectorFromArray;
} catch (e) {
  try {
    // Для браузера можем попробовать использовать глобальный объект Arrow
    if (
      typeof window !== 'undefined' &&
      window.Arrow &&
      window.Arrow.vectorFromArray
    ) {
      vectorFromArray = window.Arrow.vectorFromArray;
    }
  } catch (e2) {
    console.warn('Apache Arrow adapter not available at startup');
    vectorFromArray = null;
  }
}

export const VectorFactory = {
  /**
   * Creates a ColumnVector from any input data.
   * @param {Array|TypedArray} data
   * @param {object} [opts]          { preferArrow?: boolean }
   * @returns {ColumnVector}
   */
  from(data, opts = {}) {
    /* ------------------------------------------------- *
     *  1. If already Arrow/TypedArray - wrap it immediately  *
     * ------------------------------------------------- */
    if (data?._isArrowVector || data?.isArrow) return new ArrowVector(data);
    if (ArrayBuffer.isView(data)) return new TypedArrayVector(data);

    /* ------------------------------------------------- *
     *  2. Decide if Arrow is needed for a regular JS array *
     * ------------------------------------------------- */
    const useArrow = opts.preferArrow ?? shouldUseArrow(data, opts);

    if (useArrow && vectorFromArray) {
      try {
        // Используем синхронный вызов vectorFromArray
        return new ArrowVector(vectorFromArray(data));
      } catch (error) {
        console.warn(
          'Error using Arrow adapter, falling back to TypedArray',
          error,
        );
      }
    } else if (useArrow) {
      console.warn(
        'Apache Arrow adapter not available, falling back to TypedArray',
      );
    }

    /* ------------------------------------------------- *
     *  3. Use TypedArray for numeric data  *
     * ------------------------------------------------- */
    if (Array.isArray(data) && data.every?.((v) => typeof v === 'number')) {
      return new TypedArrayVector(Float64Array.from(data));
    }

    /* ------------------------------------------------- *
     *  4. Use SimpleVector as fallback for everything else  *
     * ------------------------------------------------- */
    return new SimpleVector(data);
  },
};
