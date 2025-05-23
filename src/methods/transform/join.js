/**
 * join.js - DataFrame joins with optimized implementation
 *
 * Implements SQL-like joins (inner, left, right, outer) with:
 * - Hash-based lookup for O(n) performance
 * - Support for single or multiple join columns
 * - Proper handling of null values and type conversions
 */

import { cloneFrame } from '../../core/createFrame.js';

/**
 * Creates a composite key from multiple column values
 * @private
 * @param {Object} row - Object containing column values
 * @param {string[]} columns - Column names to use for key
 * @returns {string} - Composite key
 */
const makeKey = (row, columns) =>
  // Use null-safe conversion and delimiter unlikely to appear in data
  columns
    .map((col) => {
      const val = row[col];
      return val === null || val === undefined
        ? '\u0000NULL\u0000'
        : String(val);
    })
    .join('\u0001');
/**
 * Joins two DataFrames on specified column(s)
 *
 * @param {{ validateColumn(frame, column): void }} deps - Injectable dependencies
 * @returns {(frame: TinyFrame, otherFrame: object, on: string|string[], how?: string) => TinyFrame}
 */
export const join =
  ({ validateColumn }) =>
  (frame, otherFrame, on, how = 'inner') => {
    // Extract the actual frame if otherFrame is a DataFrame instance
    const otherFrameObj =
      otherFrame && otherFrame._frame ? otherFrame._frame : otherFrame;

    // Validate parameters
    if (!otherFrameObj || !otherFrameObj.columns) {
      throw new Error('otherFrame must be a valid DataFrame');
    }

    // Normalize 'on' parameter to array
    const onColumns = Array.isArray(on) ? on : [on];

    if (onColumns.length === 0) {
      throw new Error('At least one join column must be specified');
    }

    // Validate join columns exist in both frames
    for (const col of onColumns) {
      validateColumn(frame, col);
      if (!Object.prototype.hasOwnProperty.call(otherFrameObj.columns, col)) {
        throw new Error(`Column '${col}' not found in the second DataFrame`);
      }
    }

    // Validate join type
    const validJoinTypes = ['inner', 'left', 'right', 'outer'];
    if (!validJoinTypes.includes(how)) {
      throw new Error(
        `Invalid join type: ${how}. Must be one of: ${validJoinTypes.join(', ')}`,
      );
    }

    // Build hash maps for efficient lookup
    const leftMap = new Map();
    const rightMap = new Map();

    // Create row objects for easier key generation and value access
    const leftRows = [];
    for (let i = 0; i < frame.rowCount; i++) {
      const row = {};
      for (const col of Object.keys(frame.columns)) {
        row[col] = frame.columns[col][i];
      }
      leftRows.push(row);

      // Index by join key
      const key = makeKey(row, onColumns);
      if (!leftMap.has(key)) {
        leftMap.set(key, []);
      }
      leftMap.get(key).push(i);
    }

    const rightRows = [];
    for (let i = 0; i < otherFrameObj.rowCount; i++) {
      const row = {};
      for (const col of Object.keys(otherFrameObj.columns)) {
        row[col] = otherFrameObj.columns[col][i];
      }
      rightRows.push(row);

      // Index by join key
      const key = makeKey(row, onColumns);
      if (!rightMap.has(key)) {
        rightMap.set(key, []);
      }
      rightMap.get(key).push(i);
    }

    // Determine result columns (avoiding duplicates for join columns)
    const leftColumns = Object.keys(frame.columns);
    const rightColumns = Object.keys(otherFrameObj.columns).filter(
      (col) => !onColumns.includes(col),
    );
    const resultColumnNames = [...leftColumns, ...rightColumns];

    // Collect matching row indices based on join type
    const matches = [];

    if (how === 'inner') {
      // Only matching rows from both frames
      for (const [key, leftIndices] of leftMap.entries()) {
        if (rightMap.has(key)) {
          const rightIndices = rightMap.get(key);
          for (const leftIdx of leftIndices) {
            for (const rightIdx of rightIndices) {
              matches.push({ left: leftIdx, right: rightIdx });
            }
          }
        }
      }
    } else if (how === 'left') {
      // All left rows, matching right rows
      for (const [key, leftIndices] of leftMap.entries()) {
        if (rightMap.has(key)) {
          const rightIndices = rightMap.get(key);
          for (const leftIdx of leftIndices) {
            for (const rightIdx of rightIndices) {
              matches.push({ left: leftIdx, right: rightIdx });
            }
          }
        } else {
          for (const leftIdx of leftIndices) {
            matches.push({ left: leftIdx, right: null });
          }
        }
      }
    } else if (how === 'right') {
      // All right rows, matching left rows
      for (const [key, rightIndices] of rightMap.entries()) {
        if (leftMap.has(key)) {
          const leftIndices = leftMap.get(key);
          for (const rightIdx of rightIndices) {
            for (const leftIdx of leftIndices) {
              matches.push({ left: leftIdx, right: rightIdx });
            }
          }
        } else {
          for (const rightIdx of rightIndices) {
            matches.push({ left: null, right: rightIdx });
          }
        }
      }
    } else if (how === 'outer') {
      // All rows from both frames
      const processedKeys = new Set();

      // First add all matching rows (inner join)
      for (const [key, leftIndices] of leftMap.entries()) {
        if (rightMap.has(key)) {
          const rightIndices = rightMap.get(key);
          for (const leftIdx of leftIndices) {
            for (const rightIdx of rightIndices) {
              matches.push({ left: leftIdx, right: rightIdx });
            }
          }
        } else {
          for (const leftIdx of leftIndices) {
            matches.push({ left: leftIdx, right: null });
          }
        }
        processedKeys.add(key);
      }

      // Then add right rows that didn't match
      for (const [key, rightIndices] of rightMap.entries()) {
        if (!processedKeys.has(key)) {
          for (const rightIdx of rightIndices) {
            matches.push({ left: null, right: rightIdx });
          }
        }
      }
    }

    // Create result frame structure
    const result = {
      columns: {},
      dtypes: {},
      columnNames: resultColumnNames,
      rowCount: matches.length,
    };

    // Fill result columns with appropriate data types
    for (const col of resultColumnNames) {
      const isLeftColumn = leftColumns.includes(col);
      const sourceFrame = isLeftColumn ? frame : otherFrameObj;
      const dtype = sourceFrame.dtypes[col];
      result.dtypes[col] = dtype;

      // Create appropriate array based on data type
      if (dtype === 'f64') {
        const array = new Float64Array(matches.length);
        for (let i = 0; i < matches.length; i++) {
          const { left, right } = matches[i];
          const idx = isLeftColumn ? left : right;
          array[i] = idx !== null ? sourceFrame.columns[col][idx] : NaN;
        }
        result.columns[col] = array;
      } else if (dtype === 'i32') {
        const array = new Int32Array(matches.length);
        for (let i = 0; i < matches.length; i++) {
          const { left, right } = matches[i];
          const idx = isLeftColumn ? left : right;
          array[i] = idx !== null ? sourceFrame.columns[col][idx] : 0;
        }
        result.columns[col] = array;
      } else if (dtype === 'u32') {
        const array = new Uint32Array(matches.length);
        for (let i = 0; i < matches.length; i++) {
          const { left, right } = matches[i];
          const idx = isLeftColumn ? left : right;
          array[i] = idx !== null ? sourceFrame.columns[col][idx] : 0;
        }
        result.columns[col] = array;
      } else {
        // For string and other types use regular array
        const array = new Array(matches.length);
        for (let i = 0; i < matches.length; i++) {
          const { left, right } = matches[i];
          const idx = isLeftColumn ? left : right;
          array[i] = idx !== null ? sourceFrame.columns[col][idx] : null;
        }
        result.columns[col] = array;
      }
    }

    return result;
  };
