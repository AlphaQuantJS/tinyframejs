// src/core/utils/transpose.js

/**
 * Transposes an array of objects into an object of arrays.
 *
 * Example:
 *   const rows = [
 *     { a: 1, b: 2 },
 *     { a: 3, b: 4 }
 *   ];
 *   transpose(rows);
 *   // 👉 { a: [1, 3], b: [2, 4] }
 *
 * ⚠️  Assumes all objects have the same set of keys.
 *
 * @template T extends Record<string, any>
 * @param {T[]} rows  Array of objects
 * @returns {Record<keyof T, any[]>}  Object “column → array”
 */
export function transpose(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error('transpose(): input must be a non-empty array of objects');
  }

  const keys = Object.keys(rows[0]);
  const out = {};

  for (const k of keys) out[k] = new Array(rows.length);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    for (const k of keys) out[k][i] = row[k];
  }

  return out;
}
