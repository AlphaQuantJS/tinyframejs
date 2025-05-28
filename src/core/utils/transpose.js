// src/core/utils/transpose.js

/**
 * Транспонирует «массив строк» в «объект колонок».
 *
 * Пример:
 *   const rows = [
 *     { a: 1, b: 2 },
 *     { a: 3, b: 4 }
 *   ];
 *   transpose(rows);
 *   // 👉 { a: [1, 3], b: [2, 4] }
 *
 * ⚠️  Предполагает, что все объекты имеют одинаковый набор ключей.
 *
 * @template T extends Record<string, any>
 * @param {T[]} rows  Массив объектов-строк
 * @returns {Record<keyof T, any[]>}  Объект “колонка → массив”
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
