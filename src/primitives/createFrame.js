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

/* eslint-disable prefer-const */

/** @typedef {'f64'|'f32'|'i32'|'i16'|'i8'|'u32'|'u16'|'u8'|'bool'|'str'} DType */

/**
 * @typedef {Object} TinyFrameOptions
 * @property {boolean} [useTypedArrays=true]   Convert numeric columns to the tightest TypedArray
 * @property {boolean} [saveRawData=false]     Store a lazily materialised copy of raw input
 * @property {'none'|'shallow'|'deep'} [copy='shallow']   Control column copy policy
 * @property {boolean} [freeze=false]          Freeze resulting frame to prevent accidental mutation
 */

/**
 * @typedef {Object} TinyFrame
 * @property {Record<string, Array<any>|TypedArray>} columns
 * @property {number} rowCount
 * @property {string[]} columnNames
 * @property {Record<string,DType>} dtypes
 * @property {Record<string,Array<any>>} [rawColumns]
 */

/** -----------------------------------------------------------
 * Public API
 * -----------------------------------------------------------*/
export {
  createFrame,
  isNumericArray,
  toArray,
  getColumnNames,
  getColumn,
  validateColumn,
};

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

  /** @type {TinyFrame} */ const frame = {
    columns,
    rowCount: rows.length,
    columnNames,
    dtypes,
  };

  if (opts.saveRawData) defineLazyRaw(frame, rows);
  return frame;
}

/**
 * @param {Record<string,any[]|TypedArray>} columnData
 * @param {number|null} rowCount
 * @param {TinyFrameOptions} opts
 * @returns {TinyFrame}
 */
function createFrameFromColumns(columnData, rowCount, opts) {
  const columnNames = Object.keys(columnData);
  if (columnNames.length === 0)
    return { columns: {}, rowCount: 0, columnNames: [], dtypes: {} };
  const firstLen = getLength(columnData[columnNames[0]]);
  const nRows = rowCount ?? firstLen;

  /** @type {Record<string,any[]|TypedArray>} */ const columns = {};
  /** @type {Record<string,DType>} */ const dtypes = {};

  for (const name of columnNames) {
    const col = columnData[name];
    if (!Array.isArray(col) && !ArrayBuffer.isView(col))
      throw new Error(`Column ${name} is not array‑like`);
    if (getLength(col) !== nRows)
      throw new Error(`Column ${name} length mismatch`);

    const dt = ArrayBuffer.isView(col) ? mapTAtoDType(col) : detectDType(col);
    dtypes[name] = dt;

    if (opts.copy === 'none') {
      columns[name] = col; // share as‑is
    } else if (opts.useTypedArrays && isNumericDType(dt)) {
      columns[name] = ArrayBuffer.isView(col)
        ? opts.copy === 'shallow'
          ? cloneTA(col)
          : col
        : toTyped(col, dt);
    } else {
      columns[name] =
        opts.copy === 'shallow' ? [...col] : JSON.parse(JSON.stringify(col));
    }
  }

  /** @type {TinyFrame} */ const frame = {
    columns,
    rowCount: nRows,
    columnNames,
    dtypes,
  };
  if (opts.saveRawData) defineLazyRaw(frame, columnData);
  return frame;
}

function getLength(arr) {
  return ArrayBuffer.isView(arr) ? arr.length : arr.length;
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
  let numeric = true,
    int = true,
    unsigned = true,
    max = 0;
  for (const v of arr) {
    // eslint-disable-next-line eqeqeq
    if (v == null || Number.isNaN(v)) continue;
    // eslint-enable-next-line eqeqeq
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

/* eslint-disable eqeqeq */
function safeNum(v) {
  return v == null ? NaN : v;
}
/* eslint-enable eqeqeq */

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

/** -----------------------------------------------------------
 * Public helper utilities (unchanged interface)
 * -----------------------------------------------------------*/

/**
 * Checks if array is numeric or TypedArray
 * @param {Array<any>|TypedArray} arr
 * @returns {boolean} True if array is numeric
 */
function isNumericArray(arr) {
  return ArrayBuffer.isView(arr) || detectDType(arr) !== 'str';
}

/**
 * Converts TinyFrame to array of objects
 * @param {TinyFrame} frame
 * @returns {Array<Object>} Array of row objects
 */
function toArray(frame) {
  const { columns, rowCount, columnNames } = frame;
  const rows = new Array(rowCount);
  for (let i = 0; i < rowCount; i++) {
    const row = {};
    for (const name of columnNames) row[name] = columns[name][i];
    rows[i] = row;
  }
  return rows;
}

/**
 * Returns column names from TinyFrame
 * @param {TinyFrame} frame
 * @returns {string[]} Array of column names
 */
function getColumnNames(frame) {
  return frame.columnNames;
}

/**
 * Returns column by name from TinyFrame
 * @param {TinyFrame} frame
 * @param {string} name
 * @returns {Array<any>|TypedArray} The column data
 */
function getColumn(frame, name) {
  validateColumn(frame, name);
  return frame.columns[name];
}

/**
 * @param {TinyFrame} frame @param {string} name
 * @param name
 */
function validateColumn(frame, name) {
  if (!frame.columns[name]) throw new Error(`Column '${name}' not found`);
}
