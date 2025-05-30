// src/core/storage/VectorFactory.js
import { TypedArrayVector } from './TypedArrayVector.js';
import { ArrowVector } from './ArrowVector.js';
import { ColumnVector } from './ColumnVector.js';
import { shouldUseArrow } from '../strategy/shouldUseArrow.js';
import { SimpleVector } from './SimpleVector.js';

// Импортируем адаптер Apache Arrow
import {
  vectorFromArray as arrowVectorFromArray,
  isArrowAvailable,
  Arrow,
} from './ArrowAdapter.js';

// Переменная для хранения доступности Arrow
let arrowAvailable = false;

// Инициализация интеграции с Apache Arrow
try {
  // Проверяем доступность Arrow через адаптер
  arrowAvailable = isArrowAvailable();

  if (arrowAvailable) {
    console.log('Apache Arrow integration initialized successfully');
  } else {
    console.warn(
      'Apache Arrow not available or vectorFromArray function not found',
    );
  }
} catch (e) {
  console.warn('Apache Arrow initialization failed:', e.message);
  arrowAvailable = false;
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

    if (useArrow && arrowAvailable) {
      try {
        // Используем синхронный вызов arrowVectorFromArray из адаптера
        return new ArrowVector(arrowVectorFromArray(data));
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
