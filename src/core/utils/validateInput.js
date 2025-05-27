// src/core/utils/validateInput.js

/**
 * Проверяет, что входные данные пригодны для создания DataFrame.
 * Допустимые форматы:
 *   • Array<Object>               — массив строк-объектов
 *   • Record<string, Array|TypedArray>
 *   • Уже существующий TinyFrame / DataFrame
 *
 * При ошибке выбрасывает информативный Error.
 *
 * @param {*} data
 * @throws {Error}
 */
export function validateInput(data) {
  // 1) null / undefined
  if (data === null || data === undefined) {
    throw new Error('Input data must not be null/undefined');
  }

  // 2) DataFrame / TinyFrame passthrough
  if (data?._columns && data?.rowCount !== undefined) return;

  // 3) Array of rows
  if (Array.isArray(data)) {
    if (data.length === 0) {
      throw new Error('Input array is empty');
    }
    if (
      !data.every(
        (row) => row && typeof row === 'object' && !Array.isArray(row),
      )
    ) {
      throw new Error('Each element of array must be a plain object (row)');
    }
    return;
  }

  // 4) Object of columns
  if (typeof data === 'object') {
    const values = Object.values(data);
    if (
      values.length > 0 &&
      values.every((col) => Array.isArray(col) || ArrayBuffer.isView(col))
    ) {
      // доп-проверка на одинаковую длину
      const len = values[0].length;
      const sameLen = values.every((col) => col.length === len);
      if (!sameLen) {
        throw new Error('All columns must have equal length');
      }
      return;
    }
  }

  // 5) Всё остальное — ошибка
  throw new Error(
    'Unsupported input format: expected array of objects or object of arrays',
  );
}
