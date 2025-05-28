// src/core/strategy/shouldUseArrow.js

/**
 * Heuristics that decide whether to store a column in Apache Arrow format.
 * Правила подобраны так, чтобы Arrow использовался только там,
 * где он действительно принесёт выгоду по памяти/скорости/совместимости.
 *
 * @param {Array|TypedArray|import('apache-arrow').Vector} data  – исходные данные колонки
 * @param {object} [opts]   – дополнительные флаги:
 *   { preferArrow?: boolean, alwaysArrow?: boolean, neverArrow?: boolean }
 * @returns {boolean}       – true → использовать ArrowVector, false → TypedArrayVector
 */
export function shouldUseArrow(data, opts = {}) {
  // ─────────────────────────────────────────────────────
  // 1. Явные флаги пользователя имеют наивысший приоритет
  // ─────────────────────────────────────────────────────
  if (opts.alwaysArrow) return true;
  if (opts.neverArrow) return false;
  if (typeof opts.preferArrow === 'boolean') return opts.preferArrow;

  // ─────────────────────────────────────────────────────
  // 2. Если это уже ArrowVector / Arrow.NativeVector
  // ─────────────────────────────────────────────────────
  if (data?._isArrowVector || data?.isArrow) return true;

  // ─────────────────────────────────────────────────────
  // 3. Если это TypedArray – уже оптимально, Arrow «не нужен»
  // ─────────────────────────────────────────────────────
  if (ArrayBuffer.isView(data)) return false;

  // ─────────────────────────────────────────────────────
  // 4. Обычный JS-массив – анализируем содержимое
  // ─────────────────────────────────────────────────────
  const size = data.length ?? 0;
  let hasNulls = false;
  let hasString = false;
  let numeric = true;

  for (const v of data) {
    if (v === null || v === undefined || Number.isNaN(v)) hasNulls = true;
    else if (typeof v === 'string') {
      hasString = true;
      numeric = false;
    } else if (typeof v !== 'number') numeric = false;

    // Быстрый выход, если уже нашли строку и null – Arrow точно нужен
    if (hasString && hasNulls) break;
  }

  // Основные условия:
  //  • очень большая колонка  (> 1e6)          → Arrow
  //  • строковые данные                       → Arrow
  //  • есть null/NaN при нечисловом типе      → Arrow
  //  • иначе – оставляем TypedArray (или Float64Array)
  return size > 1_000_000 || hasString || (hasNulls && !numeric);
}
