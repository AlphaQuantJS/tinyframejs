/**
 * Input and schema validation utilities for TinyFrameJS
 * All error messages in English for consistency
 */

/**
 * Checks that the column exists in TinyFrame
 * @param {TinyFrame} frame
 * @param {string} name
 * @throws {Error}
 */
export function validateColumn(frame, name) {
  if (!frame.columns[name]) throw new Error(`Column '${name}' not found`);
}

/**
 * Checks that all columns have the same length
 * @param {Record<string, Array<any>|TypedArray>} columns
 * @throws {Error}
 */
export function validateColumnLengths(columns) {
  const lengths = Object.values(columns).map((col) => col.length);
  if (lengths.length === 0) return;
  const first = lengths[0];
  for (const len of lengths) {
    if (len !== first) throw new Error('All columns must have the same length');
  }
}

/**
 * Checks that column names are valid (strings, not empty, unique)
 * @param {string[]} columnNames
 * @throws {Error}
 */
export function validateColumnNames(columnNames) {
  const seen = new Set();
  for (const name of columnNames) {
    if (typeof name !== 'string' || !name.trim())
      throw new Error('Column names must be non-empty strings');
    if (seen.has(name)) throw new Error(`Duplicate column name: '${name}'`);
    seen.add(name);
  }
}

/**
 * Checks that the input data is a valid source for TinyFrame
 * @param {any} data
 * @throws {Error}
 */
export function validateInputData(data) {
  if (Array.isArray(data)) {
    if (data.length === 0) return;
    if (typeof data[0] !== 'object' || data[0] === null)
      throw new Error('Array elements must be objects');
  } else if (data && typeof data === 'object') {
    if (!('columns' in data) && !Object.values(data).every(Array.isArray)) {
      throw new Error('Object must have array values or be a TinyFrame');
    }
  } else {
    throw new Error(
      'Input data must be an array of objects or object of arrays',
    );
  }
}

/**
 * Checks that options object is valid
 * @param {TinyFrameOptions} options
 * @throws {Error}
 */
export function validateOptions(options) {
  if (!options || typeof options !== 'object')
    throw new Error('Options must be an object');
  if (options.copy && !['none', 'shallow', 'deep'].includes(options.copy)) {
    throw new Error(`Invalid copy option: '${options.copy}'`);
  }
}

/**
 * Checks that dtype is supported
 * @param {string} dtype
 * @throws {Error}
 */
export function validateDType(dtype) {
  const valid = [
    'f64',
    'f32',
    'i32',
    'i16',
    'i8',
    'u32',
    'u16',
    'u8',
    'bool',
    'str',
  ];
  if (!valid.includes(dtype)) throw new Error(`Unsupported dtype: '${dtype}'`);
}

/**
 * Checks that array is numeric or TypedArray
 * @param {Array<any>|TypedArray} arr
 * @throws {Error}
 */
export function validateNumericArray(arr) {
  if (!Array.isArray(arr) && !ArrayBuffer.isView(arr))
    throw new Error('Value is not array-like');
  if (
    !arr.every(
      (v) =>
        typeof v === 'number' ||
        v === null ||
        v === undefined ||
        Number.isNaN(v),
    )
  ) {
    throw new Error('Array contains non-numeric values');
  }
}
