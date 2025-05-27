// src/core/utils/cloneDeep.js

/**
 * Fast and relatively safe deep-clone
 * for regular objects, arrays, TypedArray and Date.
 * (Arrow vectors and other "exotic" structures are copied by reference,
 *  as they usually don't need to be cloned.)
 *
 * ⚠️  Does not clone functions and prototyped classes (leaves a reference).
 * ✅  Correctly handles circular references.
 *
 * @param {*} value - Value to clone
 * @param {Map} [cache] - Cache for handling circular references
 * @returns {*}
 */
export function cloneDeep(value, cache = new Map()) {
  /* ---------- Primitives ---------- */
  if (value === null || typeof value !== 'object') return value;

  /* ---------- Check for circular references ---------- */
  if (cache.has(value)) {
    return cache.get(value);
  }

  /* ---------- Date ---------- */
  if (value instanceof Date) return new Date(value.getTime());

  /* ---------- TypedArray ---------- */
  if (ArrayBuffer.isView(value)) {
    return new value.constructor(value); // buffer copy
  }

  /* ---------- Array ---------- */
  if (Array.isArray(value)) {
    const result = [];
    cache.set(value, result);
    for (let i = 0; i < value.length; i++) {
      result[i] = cloneDeep(value[i], cache);
    }
    return result;
  }

  /* ---------- Plain Object ---------- */
  const result = {};
  cache.set(value, result);
  for (const [k, v] of Object.entries(value)) {
    result[k] = cloneDeep(v, cache);
  }
  return result;
}
