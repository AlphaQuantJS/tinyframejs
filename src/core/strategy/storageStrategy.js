// src/core/strategy/storageStrategy.js
import { VectorFactory } from '../storage/VectorFactory.js';
import { ArrowVector } from '../storage/ArrowVector.js';
import { TypedArrayVector } from '../storage/TypedArrayVector.js';

/**
 * Runtime-оптимизатор хранилища.
 * Переключает колонки DataFrame c Arrow ⇄ TypedArray в зависимости
 * от типа предстоящей операции (join, groupBy, heavy-math и т.д.).
 *
 * Эвристика (первая итерация):
 *   • "join" / "groupBy" / "string"  → ArrowVector
 *   • "numericAgg" / "rolling" / "math" → TypedArrayVector
 *
 * @param {import('../dataframe/DataFrame.js').DataFrame} df
 * @param {string} operation   "join" | "groupBy" | "numericAgg" | …
 */
export async function switchStorage(df, operation) {
  const wantsArrow = ['join', 'groupBy', 'string'].includes(operation);
  const wantsTA = ['numericAgg', 'rolling', 'math'].includes(operation);

  for (const name of df.columns) {
    const series = df.col(name);
    const vec = series.vector;

    /* ---------- 1. Перевод в Arrow, если нужно ---------- */
    if (wantsArrow && !(vec instanceof ArrowVector)) {
      const newVec = await VectorFactory.from(vec.toArray(), {
        preferArrow: true,
      });
      series.vector = newVec;
    }

    /* ---------- 2. Перевод в TypedArray, если heavy-math ---------- */
    if (wantsTA && vec instanceof ArrowVector) {
      const arr = vec.toArray();
      const numeric = arr.every(
        (v) => typeof v === 'number' && !Number.isNaN(v),
      );
      if (numeric) {
        series.vector = new TypedArrayVector(Float64Array.from(arr));
      }
    }
  }
}
