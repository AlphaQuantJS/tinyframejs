import { validateColumn } from './validators.js';

/** @typedef {import('./types').DType} DType */
/** @typedef {import('./types').TinyFrameOptions} TinyFrameOptions */
/** @typedef {import('./types').TinyFrame} TinyFrame */

/**
 * createFrame.js – TinyFrame ⚡
 * -------------------------------------------------------------
 * High‑performance, zero‑dependency data container for AlphaQuant.
 * Optimised for V8: dense Struct‑of‑Arrays layout, TypedArray back‑end,
 * optional zero‑copy semantics and lazy rawColumns materialisation.
 *
 * Design goals
 *  1.  **Speed first** – minimise allocations & hidden‑class churn.
 *  2.  **Memory aware** – choose the most compact numeric TypedArray.
 *  3.  **Inter‑op** – plain JS object so WASM kernels / WebWorkers / Arrow
 *      can consume it without magic.
 *  4.  **DX** – keep JSDoc typedefs; fully type‑safe under TS ‑‑check.
 * -------------------------------------------------------------
 */

/** -----------------------------------------------------------
 * Public API
 * -----------------------------------------------------------*/
export { createFrame, cloneFrame };

/**
 * Create a TinyFrame from rows, columns or an existing frame.
 * @param {Object[]|Record<string,any[]|TypedArray>|TinyFrame} data
 * @param {TinyFrameOptions|number} [options]
 * @returns {TinyFrame}
 */
function createFrame(data, options = {}) {
  /** @type {TinyFrameOptions} */
  let opts;
  if (typeof options === 'number') {
    opts = {
      useTypedArrays: true,
      copy: 'shallow',
      saveRawData: false,
      freeze: false,
    };
  } else {
    const {
      useTypedArrays = true,
      saveRawData = false,
      copy = 'shallow',
      freeze = false,
    } = options;
    opts = { useTypedArrays, saveRawData, copy, freeze };
  }

  let frame;
  if (Array.isArray(data)) {
    frame = createFrameFromRows(data, opts);
  } else if (data && typeof data === 'object') {
    if ('columns' in data && 'rowCount' in data) {
      frame = cloneFrame(data, opts);
    } else {
      frame = createFrameFromColumns(
        /** @type {Record<string,any[]>} */ (data),
        null,
        opts,
      );
    }
  } else {
    throw new Error('Input data cannot be null or undefined');
  }

  if (opts.freeze) Object.freeze(frame);
  return frame;
}

/** -----------------------------------------------------------
 * Internals
 * -----------------------------------------------------------*/

/**
 * @param {TinyFrame} src @param {TinyFrameOptions} opts
 * @param opts
 * @returns {TinyFrame} A cloned TinyFrame object
 */
function cloneFrame(src, opts) {
  /** @type {Record<string,any[]|TypedArray>} */ const cols = {};
  const names = src.columnNames;
  for (const name of names) {
    const col = src.columns[name];
    if (opts.copy === 'none') {
      cols[name] = col; // share reference
    } else if (opts.copy === 'shallow' && col instanceof Float64Array) {
      cols[name] = new Float64Array(col);
    } else if (opts.copy === 'shallow' && Array.isArray(col)) {
      cols[name] = [...col];
    } else {
      // deep copy (handles nested objects if ever)
      cols[name] = JSON.parse(JSON.stringify(col));
    }
  }
  return {
    columns: cols,
    rowCount: src.rowCount,
    columnNames: [...names],
    dtypes: { ...src.dtypes },
    ...(opts.saveRawData ? { rawColumns: materialiseRaw(cols) } : {}),
  };
}

/**
 * @param {Object[]} rows
 * @param {TinyFrameOptions} opts
 * @returns {TinyFrame}
 */
function createFrameFromRows(rows, opts) {
  if (rows.length === 0) {
    return { columns: {}, rowCount: 0, columnNames: [], dtypes: {} };
  }
  const columnNames = Object.keys(rows[0]);
  /** @type {Record<string,any[]|TypedArray>} */ const columns = {};
  /** @type {Record<string,DType>} */ const dtypes = {};

  for (const name of columnNames) {
    const values = rows.map((r) => r[name]);
    const dt = detectDType(values);
    dtypes[name] = dt;
    columns[name] =
      opts.useTypedArrays && isNumericDType(dt) ? toTyped(values, dt) : values;
  }

  return {
    columns,
    rowCount: rows.length,
    columnNames,
    dtypes,
    ...(opts.saveRawData ? { rawColumns: materialiseRaw(columns) } : {}),
  };
}

/**
 * @param {Record<string,any[]|TypedArray>} columnData
 * @param {number|null} rowCount
 * @param {TinyFrameOptions} opts
 * @returns {TinyFrame}
 */
function createFrameFromColumns(columnData, rowCount, opts) {
  const columnNames = Object.keys(columnData);
  if (columnNames.length === 0) {
    return { columns: {}, rowCount: 0, columnNames: [], dtypes: {} };
  }

  /** @type {Record<string,any[]|TypedArray>} */ const columns = {};
  /** @type {Record<string,DType>} */ const dtypes = {};

  // Determine row count if not provided
  let len = rowCount;
  if (len === null) {
    len = Math.max(...columnNames.map((k) => getLength(columnData[k])));
  }

  for (const name of columnNames) {
    const col = columnData[name];

    // Handle TypedArrays
    if (ArrayBuffer.isView(col)) {
      dtypes[name] = mapTAtoDType(col);
      columns[name] = opts.copy === 'none' ? col : cloneTA(col);
      continue;
    }

    // Handle arrays
    const dt = detectDType(col);
    dtypes[name] = dt;
    columns[name] =
      opts.useTypedArrays && isNumericDType(dt) ? toTyped(col, dt) : [...col];
  }

  return {
    columns,
    rowCount: len,
    columnNames,
    dtypes,
    ...(opts.saveRawData ? { rawColumns: materialiseRaw(columns) } : {}),
  };
}

function getLength(arr) {
  return ArrayBuffer.isView(arr) ? arr.length : arr.length || 0;
}

/** -----------------------------------------------------------
 * Helper: dtype detection & conversion
 * -----------------------------------------------------------*/

/**
 * Detects the most suitable DType for an array
 * @param {any[]} arr
 * @returns {DType} Detected data type
 */
function detectDType(arr) {
  if (!arr || arr.length === 0) return 'str';
  let numeric = false;
  let int = true;
  let unsigned = true;
  let max = 0;

  for (const v of arr) {
    if (v === null || v === undefined || Number.isNaN(v)) continue;
    numeric = true;
    // eslint-disable eqeqeq
    if (v === null || v === undefined || Number.isNaN(v)) continue;
    // eslint-enable eqeqeq
    if (typeof v !== 'number') return 'str';
    if (!Number.isInteger(v)) int = false;
    if (v < 0) unsigned = false;
    if (Math.abs(v) > max) max = Math.abs(v);
  }
  if (!numeric) return 'str';
  if (!int) return 'f64'; // keep float64 for mixed / float
  // choose minimal signed/unsigned width
  if (unsigned) {
    if (max <= 0xff) return 'u8';
    if (max <= 0xffff) return 'u16';
    if (max <= 0xffffffff) return 'u32';
  }
  if (max <= 0x7f) return 'i8';
  if (max <= 0x7fff) return 'i16';
  if (max <= 0x7fffffff) return 'i32';
  return 'f64';
}

/**
 * Checks if dtype is numeric
 * @param {DType} dt
 * @returns {boolean} True if dtype is numeric
 */
function isNumericDType(dt) {
  return dt !== 'str';
}

/**
 * Converts array to TypedArray by dtype
 * @param {any[]} arr
 * @param {DType} dt
 * @returns {TypedArray} Converted typed array
 */
function toTyped(arr, dt) {
  switch (dt) {
  case 'f64':
    return Float64Array.from(arr, safeNum);

  case 'i32':
    return Int32Array.from(arr, safeNum);

  case 'i16':
    return Int16Array.from(arr, safeNum);

  case 'i8':
    return Int8Array.from(arr, safeNum);

  case 'u32':
    return Uint32Array.from(arr, safeNum);

  case 'u16':
    return Uint16Array.from(arr, safeNum);

  case 'u8':
    return Uint8Array.from(arr, safeNum);

  default:
    return Float64Array.from(arr, safeNum);
  }
}

function safeNum(v) {
  return v === null ? NaN : v;
}

function mapTAtoDType(ta) {
  if (ta instanceof Float64Array) return 'f64';
  if (ta instanceof Float32Array) return 'f32';
  if (ta instanceof Int32Array) return 'i32';
  if (ta instanceof Int16Array) return 'i16';
  if (ta instanceof Int8Array) return 'i8';
  if (ta instanceof Uint32Array) return 'u32';
  if (ta instanceof Uint16Array) return 'u16';
  if (ta instanceof Uint8Array) return 'u8';
  return 'str';
}

function cloneTA(ta) {
  // shallow copy: new buffer but same dtype
  return new ta.constructor(ta);
}

/** -----------------------------------------------------------
 * Lazy rawColumns – materialised only when accessed
 * @param frame
 * @param source
 * -----------------------------------------------------------*/
function defineLazyRaw(frame, source) {
  let cached;
  Object.defineProperty(frame, 'rawColumns', {
    enumerable: false,
    configurable: false,
    get() {
      if (!cached) cached = materialiseRaw(source);
      return cached;
    },
  });
}

function materialiseRaw(obj) {
  /** @type {Record<string,Array<any>>} */ const out = {};
  for (const k of Object.keys(obj)) {
    const col = obj[k];
    out[k] = ArrayBuffer.isView(col) ? Array.from(col) : [...col];
  }
  return out;
}
