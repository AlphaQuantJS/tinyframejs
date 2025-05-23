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
 * @returns {(frame: TinyFrame, ...args) => TinyFrame}
 */
/**
 * Creates a pivot table with support for multiple aggregation functions
 *
 * @param {{ validateColumn(frame, column): void }} deps - Injectable dependencies
 * @returns {(frame: TinyFrame, options: {index: string|string[], columns: string|string[], values: string, aggFunc?: Function|Function[]|Object}) => TinyFrame}
 */
export const pivotTable =
  ({ validateColumn }) =>
  (frame, ...args) => {
    // Support both object parameter and individual parameters for backward compatibility
    let index, columns, values, aggFunc;

    if (
      args.length === 1 &&
      typeof args[0] === 'object' &&
      !Array.isArray(args[0])
    ) {
      // Object parameter style: pivotTable({ index, columns, values, aggFunc })
      const options = args[0];
      index = options.index;
      columns = options.columns;
      values = options.values;
      aggFunc = options.aggFunc || sum;
    } else {
      // Legacy style: pivotTable(index, columns, values, aggFunc)
      index = args[0];
      columns = args[1];
      values = args[2];
      aggFunc = args[3] || sum;
    }

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

    // Normalize index and columns to arrays
    const indexCols = Array.isArray(index) ? index : [index];
    const columnsCols = Array.isArray(columns) ? columns : [columns];

    // Validate that all columns exist
    for (const col of [...indexCols, ...columnsCols, values]) {
      validateColumn(frame, col);
    }

    // Process aggregation functions
    let aggFuncs = {};

    if (typeof aggFunc === 'function') {
      // Single function
      aggFuncs = { [values]: aggFunc };
    } else if (Array.isArray(aggFunc)) {
      // Array of functions
      aggFuncs = {};
      for (const func of aggFunc) {
        if (typeof func !== 'function') {
          throw new Error('Each aggregation function must be a valid function');
        }
        const funcName = func.name || 'agg';
        aggFuncs[`${values}_${funcName}`] = func;
      }
    } else if (typeof aggFunc === 'object' && aggFunc !== null) {
      // Object mapping column names to functions
      aggFuncs = aggFunc;
      for (const [key, func] of Object.entries(aggFuncs)) {
        if (typeof func !== 'function') {
          throw new Error(
            `Aggregation function for '${key}' must be a valid function`,
          );
        }
      }
    } else {
      throw new Error(
        'aggFunc must be a function, array of functions, or object mapping column names to functions',
      );
    }

    // Extract unique values for index columns
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

    // Extract unique values for columns to pivot on (support multi-level columns)
    const uniqueColumnValuesByLevel = {};
    for (const colLevel of columnsCols) {
      const uniqueValues = new Set();
      for (let i = 0; i < frame.rowCount; i++) {
        uniqueValues.add(makeKey([frame.columns[colLevel][i]]));
      }
      uniqueColumnValuesByLevel[colLevel] = Array.from(uniqueValues)
        .map((key) => (key === '\u0000NULL\u0000' ? null : key))
        .sort((a, b) => {
          if (a === null) return -1;
          if (b === null) return 1;
          return String(a).localeCompare(String(b));
        });
    }

    // Generate all possible column combinations for multi-level columns
    const columnCombinations = [];
    const generateColumnCombinations = (arrays, current = [], depth = 0) => {
      if (depth === arrays.length) {
        columnCombinations.push([...current]);
        return;
      }

      for (const value of arrays[depth]) {
        current[depth] = value;
        generateColumnCombinations(arrays, current, depth + 1);
      }
    };

    generateColumnCombinations(
      columnsCols.map((col) => uniqueColumnValuesByLevel[col]),
    );

    // Group values by index and column combinations
    const aggregationMap = new Map();
    for (let i = 0; i < frame.rowCount; i++) {
      // Create composite keys for index and columns
      const indexKey = makeKey(indexCols.map((col) => frame.columns[col][i]));
      const columnKey = makeKey(
        columnsCols.map((col) => frame.columns[col][i]),
      );
      const value = frame.columns[values][i];

      const fullKey = `${indexKey}${columnKey}`;

      if (!aggregationMap.has(fullKey)) {
        aggregationMap.set(fullKey, []);
      }

      aggregationMap.get(fullKey).push(value);
    }

    // Generate all possible index combinations
    const indexCombinations = [];
    const generateIndexCombinations = (arrays, current = [], depth = 0) => {
      if (depth === arrays.length) {
        indexCombinations.push([...current]);
        return;
      }

      for (const value of arrays[depth]) {
        current[depth] = value;
        generateIndexCombinations(arrays, current, depth + 1);
      }
    };

    generateIndexCombinations(indexCols.map((col) => uniqueIndexValues[col]));

    // Create result column names with hierarchical structure for each aggregation function
    const resultColumnNames = [...indexCols];

    // Create column names for each combination of column values and aggregation function
    const valueColumnNames = [];
    for (const combination of columnCombinations) {
      const baseColName = combination
        .map((val, idx) => {
          const displayVal = val === null ? 'null' : val;
          return `${columnsCols[idx]}_${displayVal}`;
        })
        .join('.');

      for (const [aggName] of Object.entries(aggFuncs)) {
        const colName = `${baseColName}.${aggName}`;
        valueColumnNames.push(colName);
        resultColumnNames.push(colName);
      }
    }

    // Create result frame
    const resultFrame = {
      columns: {},
      dtypes: {},
      columnNames: resultColumnNames,
      rowCount: indexCombinations.length,
      // Add metadata for multi-level indices and columns
      metadata: {
        multiLevelIndex: indexCols.length > 1 ? indexCols : null,
        multiLevelColumns: columnsCols.length > 1 ? columnsCols : null,
        aggregationFunctions: Object.keys(aggFuncs),
      },
    };

    // Set dtypes for index columns
    for (const col of indexCols) {
      resultFrame.dtypes[col] = frame.dtypes[col];
    }

    // Set dtypes for value columns and create arrays
    const valueType = frame.dtypes[values];
    for (const colName of valueColumnNames) {
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

      // Set aggregated values for each column combination and aggregation function
      const indexKey = makeKey(combination);

      for (let j = 0; j < columnCombinations.length; j++) {
        const colCombination = columnCombinations[j];
        const baseColName = colCombination
          .map((val, idx) => {
            const displayVal = val === null ? 'null' : val;
            return `${columnsCols[idx]}_${displayVal}`;
          })
          .join('.');

        const columnKey = makeKey(colCombination);
        const fullKey = `${indexKey}${columnKey}`;
        const aggregatedValues = aggregationMap.has(fullKey)
          ? aggregationMap.get(fullKey)
          : [];

        // Apply each aggregation function
        for (const [aggName, aggFunction] of Object.entries(aggFuncs)) {
          const colName = `${baseColName}.${aggName}`;

          if (aggregatedValues.length > 0) {
            const result = aggFunction(aggregatedValues);
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
    }

    return resultFrame;
  };

/**
 * Creates a pivot table from DataFrame
 *
 * @param {{ validateColumn(frame, column): void }} deps - Injectable dependencies
 * @returns {(frame: TinyFrame, ...args) => TinyFrame}
 */
export const pivot =
  ({ validateColumn }) =>
  (frame, ...args) => {
    // Support both object parameter and individual parameters for backward compatibility
    let index, columns, values, aggFunc;

    if (
      args.length === 1 &&
      typeof args[0] === 'object' &&
      !Array.isArray(args[0])
    ) {
      // Object parameter style: pivot({ index, columns, values, aggFunc })
      const options = args[0];
      index = options.index;
      columns = options.columns;
      values = options.values;
      aggFunc = options.aggFunc || sum;
    } else {
      // Legacy style: pivot(index, columns, values, aggFunc)
      index = args[0];
      columns = args[1];
      values = args[2];
      aggFunc = args[3] || sum;
    }

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

    // Normalize index and columns to arrays
    const indexCols = Array.isArray(index) ? index : [index];
    const columnsCols = Array.isArray(columns) ? columns : [columns];

    // Validate that all columns exist
    for (const col of [...indexCols, ...columnsCols, values]) {
      validateColumn(frame, col);
    }

    // Extract unique values for index columns
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

    // Extract unique values for columns to pivot on (support multi-level columns)
    const uniqueColumnValuesByLevel = {};
    for (const colLevel of columnsCols) {
      const uniqueValues = new Set();
      for (let i = 0; i < frame.rowCount; i++) {
        uniqueValues.add(makeKey([frame.columns[colLevel][i]]));
      }
      uniqueColumnValuesByLevel[colLevel] = Array.from(uniqueValues)
        .map((key) => (key === '\u0000NULL\u0000' ? null : key))
        .sort((a, b) => {
          if (a === null) return -1;
          if (b === null) return 1;
          return String(a).localeCompare(String(b));
        });
    }

    // Generate all possible column combinations for multi-level columns
    const columnCombinations = [];
    const generateColumnCombinations = (arrays, current = [], depth = 0) => {
      if (depth === arrays.length) {
        columnCombinations.push([...current]);
        return;
      }

      for (const value of arrays[depth]) {
        current[depth] = value;
        generateColumnCombinations(arrays, current, depth + 1);
      }
    };

    generateColumnCombinations(
      columnsCols.map((col) => uniqueColumnValuesByLevel[col]),
    );

    // Group values by index and column combinations
    const aggregationMap = new Map();
    for (let i = 0; i < frame.rowCount; i++) {
      // Create composite keys for index and columns
      const indexKey = makeKey(indexCols.map((col) => frame.columns[col][i]));
      const columnKey = makeKey(
        columnsCols.map((col) => frame.columns[col][i]),
      );
      const value = frame.columns[values][i];

      const fullKey = `${indexKey}${columnKey}`;

      if (!aggregationMap.has(fullKey)) {
        aggregationMap.set(fullKey, []);
      }

      aggregationMap.get(fullKey).push(value);
    }

    // Generate all possible index combinations
    const indexCombinations = [];
    const generateIndexCombinations = (arrays, current = [], depth = 0) => {
      if (depth === arrays.length) {
        indexCombinations.push([...current]);
        return;
      }

      for (const value of arrays[depth]) {
        current[depth] = value;
        generateIndexCombinations(arrays, current, depth + 1);
      }
    };

    generateIndexCombinations(indexCols.map((col) => uniqueIndexValues[col]));

    // Create result column names with hierarchical structure
    const resultColumnNames = [
      ...indexCols,
      ...columnCombinations.map((combination) =>
        // Create hierarchical column names for multi-level columns
        combination
          .map((val, idx) => {
            const displayVal = val === null ? 'null' : val;
            return `${columnsCols[idx]}_${displayVal}`;
          })
          .join('.'),
      ),
    ];

    // Create result frame
    const resultFrame = {
      columns: {},
      dtypes: {},
      columnNames: resultColumnNames,
      rowCount: indexCombinations.length,
      // Add metadata for multi-level indices and columns
      metadata: {
        multiLevelIndex: indexCols.length > 1 ? indexCols : null,
        multiLevelColumns: columnsCols.length > 1 ? columnsCols : null,
      },
    };

    // Set dtypes for index columns
    for (const col of indexCols) {
      resultFrame.dtypes[col] = frame.dtypes[col];
    }

    // Set dtypes for value columns and create arrays
    const valueType = frame.dtypes[values];
    for (const combination of columnCombinations) {
      const colName = combination
        .map((val, idx) => {
          const displayVal = val === null ? 'null' : val;
          return `${columnsCols[idx]}_${displayVal}`;
        })
        .join('.');
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

      // Set aggregated values for each column combination
      const indexKey = makeKey(combination);

      for (let j = 0; j < columnCombinations.length; j++) {
        const colCombination = columnCombinations[j];
        const colName = colCombination
          .map((val, idx) => {
            const displayVal = val === null ? 'null' : val;
            return `${columnsCols[idx]}_${displayVal}`;
          })
          .join('.');

        const columnKey = makeKey(colCombination);
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
