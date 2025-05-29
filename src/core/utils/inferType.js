// src/core/utils/inferType.js
/**
 * Heuristic dtype inference for a JS array.
 * Returns one of the DType codes: 'f64' | 'i32' | 'bool' | 'str' | 'mixed'.
 *
 * • Empty array → 'str'
 * • All boolean   → 'bool'
 * • All number    → 'i32' (if all integers) or 'f64'
 * • All string    → 'str'
 * • Otherwise         → 'mixed'
 *
 * Nulls (null/undefined/NaN) do not affect inference.
 * @param arr
 */
export function inferType(arr) {
  if (!arr || arr.length === 0) return 'str';

  let isNumber = true;
  let isInt = true;
  let isBoolean = true;
  let isString = true;

  for (const v of arr) {
    if (v === null || v === undefined) continue; // ignore nulls

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
