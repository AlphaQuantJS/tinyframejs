// src/core/utils/inferType.js
/**
 * Heuristic dtype inference for a JS array.
 * Возвращает один из кодов DType: 'f64' | 'i32' | 'bool' | 'str' | 'mixed'.
 *
 * • Пустой массив → 'str'
 * • Все boolean   → 'bool'
 * • Все number    → 'i32' (если все целые) или 'f64'
 * • Все string    → 'str'
 * • Иначе         → 'mixed'
 *
 * Пропуски (null/undefined/NaN) не влияют на инференс.
 * @param arr
 */
export function inferType(arr) {
  if (!arr || arr.length === 0) return 'str';

  let isNumber = true;
  let isInt = true;
  let isBoolean = true;
  let isString = true;

  for (const v of arr) {
    if (v === null || v === undefined) continue; // пропуски игнорируем

    isNumber &&= typeof v === 'number' && !Number.isNaN(v);
    isInt &&= isNumber && Number.isInteger(v);
    isBoolean &&= typeof v === 'boolean';
    isString &&= typeof v === 'string';
  }

  if (isBoolean) return 'bool';
  if (isNumber) return isInt ? 'i32' : 'f64';
  if (isString) return 'str';
  return 'mixed';
}
