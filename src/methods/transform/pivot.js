/**
 * pivot.js - Create pivot tables from DataFrame
 *
 * Implements a flexible pivot table functionality similar to pandas pivot_table().
 * Supports multiple aggregation functions and handles various data types.
 */

import { cloneFrame } from '../../core/createFrame.js';

/**
 * Default aggregation function (sum)
 * @param {Array} values - Values to aggregate
 * @returns {number} - Sum of values
 */
export const sum = (values) =>
  values.reduce((acc, val) => {
    // Handle null/undefined/NaN values
    const numVal = typeof val === 'number' && !isNaN(val) ? val : 0;
    return acc + numVal;
  }, 0);

/**
 * Mean aggregation function
 * @param {Array} values - Values to aggregate
 * @returns {number} - Mean of values
 */
export const mean = (values) => {
  if (values.length === 0) return NaN;
  const validValues = values.filter(
    (val) => typeof val === 'number' && !isNaN(val),
  );
  if (validValues.length === 0) return NaN;
  return validValues.reduce((acc, val) => acc + val, 0) / validValues.length;
};

/**
 * Count aggregation function
 * @param {Array} values - Values to aggregate
 * @returns {number} - Count of non-null values
 */
export const count = (values) =>
  values.filter((val) => val !== null && val !== undefined).length;

/**
 * Max aggregation function
 * @param {Array} values - Values to aggregate
 * @returns {number} - Maximum value
 */
export const max = (values) => {
  const validValues = values.filter(
    (val) => typeof val === 'number' && !isNaN(val),
  );
  if (validValues.length === 0) return NaN;
  return Math.max(...validValues);
};

/**
 * Min aggregation function
 * @param {Array} values - Values to aggregate
 * @returns {number} - Minimum value
 */
export const min = (values) => {
  const validValues = values.filter(
    (val) => typeof val === 'number' && !isNaN(val),
  );
  if (validValues.length === 0) return NaN;
  return Math.min(...validValues);
};

/**
 * Creates a composite key from multiple values
 * @private
 * @param {Array} values - Values to combine into a key
 * @returns {string} - Composite key
 */
const makeKey = (values) =>
  values
    .map((val) =>
      val === null || val === undefined ? '\u0000NULL\u0000' : String(val),
    )
    .join('\u0001');

/**
 * Creates a typed array of the appropriate type
 * @private
 * @param {string} dtype - Data type ('f64', 'i32', 'u32', or other)
 * @param {number} length - Length of the array
 * @returns {TypedArray|Array} - The created array
 */
const createTypedArray = (dtype, length) => {
  switch (dtype) {
    case 'f64':
      return new Float64Array(length);
    case 'i32':
      return new Int32Array(length);
    case 'u32':
      return new Uint32Array(length);
    default:
      return new Array(length);
  }
};

/**
 * Creates a pivot table from DataFrame
 *
 * @param {{ validateColumn(frame, column): void }} deps - Injectable dependencies
 * @returns {(frame: TinyFrame, index: string|string[], columns: string, values: string, aggFunc?: Function) => TinyFrame}
 */
export const pivot =
  ({ validateColumn }) =>
  (frame, index, columns, values, aggFunc = sum) => {
    // Validate parameters
    if (!index) {
      throw new Error('index parameter is required');
    }

    if (!columns) {
      throw new Error('columns parameter is required');
    }

    if (!values) {
      throw new Error('values parameter is required');
    }

    // Normalize index to array
    const indexCols = Array.isArray(index) ? index : [index];

    // Validate that all columns exist
    for (const col of [...indexCols, columns, values]) {
      validateColumn(frame, col);
    }

    // Extract unique values for index columns and pivot column
    const uniqueIndexValues = {};
    for (const indexCol of indexCols) {
      const uniqueValues = new Set();
      for (let i = 0; i < frame.rowCount; i++) {
        uniqueValues.add(makeKey([frame.columns[indexCol][i]]));
      }
      uniqueIndexValues[indexCol] = Array.from(uniqueValues)
        .map((key) => (key === '\u0000NULL\u0000' ? null : key))
        .sort((a, b) => {
          // Handle null values in sorting
          if (a === null) return -1;
          if (b === null) return 1;
          return String(a).localeCompare(String(b));
        });
    }

    // Extract unique values for column to pivot on
    const uniqueColumnValues = new Set();
    for (let i = 0; i < frame.rowCount; i++) {
      uniqueColumnValues.add(makeKey([frame.columns[columns][i]]));
    }
    const sortedColumnValues = Array.from(uniqueColumnValues)
      .map((key) => (key === '\u0000NULL\u0000' ? null : key))
      .sort((a, b) => {
        if (a === null) return -1;
        if (b === null) return 1;
        return String(a).localeCompare(String(b));
      });

    // Group values by index and column combinations
    const aggregationMap = new Map();
    for (let i = 0; i < frame.rowCount; i++) {
      // Create composite keys
      const indexKey = makeKey(indexCols.map((col) => frame.columns[col][i]));
      const columnKey = makeKey([frame.columns[columns][i]]);
      const value = frame.columns[values][i];

      const fullKey = `${indexKey}${columnKey}`;

      if (!aggregationMap.has(fullKey)) {
        aggregationMap.set(fullKey, []);
      }

      aggregationMap.get(fullKey).push(value);
    }

    // Generate all possible index combinations
    const indexCombinations = [];
    const generateCombinations = (arrays, current = [], depth = 0) => {
      if (depth === arrays.length) {
        indexCombinations.push([...current]);
        return;
      }

      for (const value of arrays[depth]) {
        current[depth] = value;
        generateCombinations(arrays, current, depth + 1);
      }
    };

    generateCombinations(indexCols.map((col) => uniqueIndexValues[col]));

    // Create result column names
    const resultColumnNames = [
      ...indexCols,
      ...sortedColumnValues.map((val) => {
        const displayVal = val === null ? 'null' : val;
        return `${columns}_${displayVal}`;
      }),
    ];

    // Create result frame
    const resultFrame = {
      columns: {},
      dtypes: {},
      columnNames: resultColumnNames,
      rowCount: indexCombinations.length,
    };

    // Set dtypes for index columns
    for (const col of indexCols) {
      resultFrame.dtypes[col] = frame.dtypes[col];
    }

    // Set dtypes for value columns and create arrays
    const valueType = frame.dtypes[values];
    for (const colValue of sortedColumnValues) {
      const displayVal = colValue === null ? 'null' : colValue;
      const colName = `${columns}_${displayVal}`;
      resultFrame.dtypes[colName] = valueType;
    }

    // Create arrays for all columns
    for (const col of resultColumnNames) {
      const dtype = resultFrame.dtypes[col];
      resultFrame.columns[col] = createTypedArray(dtype, resultFrame.rowCount);
    }

    // Fill the result frame
    for (let i = 0; i < indexCombinations.length; i++) {
      const combination = indexCombinations[i];

      // Set index column values
      for (let j = 0; j < indexCols.length; j++) {
        resultFrame.columns[indexCols[j]][i] = combination[j];
      }

      // Set aggregated values for each column
      const indexKey = makeKey(combination);

      for (let j = 0; j < sortedColumnValues.length; j++) {
        const colValue = sortedColumnValues[j];
        const displayVal = colValue === null ? 'null' : colValue;
        const colName = `${columns}_${displayVal}`;
        const columnKey = makeKey([colValue]);
        const fullKey = `${indexKey}${columnKey}`;

        if (aggregationMap.has(fullKey)) {
          const aggregatedValues = aggregationMap.get(fullKey);
          const result = aggFunc(aggregatedValues);
          resultFrame.columns[colName][i] = result;
        } else if (valueType === 'f64') {
          // No values for this combination - handle based on type
          resultFrame.columns[colName][i] = NaN;
        } else if (valueType === 'i32' || valueType === 'u32') {
          resultFrame.columns[colName][i] = 0;
        } else {
          resultFrame.columns[colName][i] = null;
        }
      }
    }

    return resultFrame;
  };
