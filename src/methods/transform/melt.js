/**
 * melt.js - Unpivot DataFrame from wide to long format
 *
 * Transforms a DataFrame from wide to long format, similar to pandas melt().
 * This operation is also known as "unpivoting" or "reshaping" data.
 */

import { cloneFrame } from '../../core/createFrame.js';

/**
 * Determines the most appropriate data type for a set of columns
 * @private
 * @param {Object} frame - The DataFrame
 * @param {string[]} columns - Column names to check
 * @returns {string} - The most general data type
 */
const determineCommonType = (frame, columns) => {
  let commonType = 'string'; // Default to most general type

  for (const col of columns) {
    const dtype = frame.dtypes[col];
    if (dtype === 'f64') {
      return 'f64'; // Float is most general, return immediately
    } else if (dtype === 'i32' && commonType !== 'f64') {
      commonType = 'i32';
    } else if (
      dtype === 'u32' &&
      commonType !== 'f64' &&
      commonType !== 'i32'
    ) {
      commonType = 'u32';
    }
  }

  return commonType;
};

/**
 * Creates a typed array of the appropriate type
 * @private
 * @param {string} dtype - Data type ('f64', 'i32', 'u32', or 'string')
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
 * Unpivots DataFrame from wide to long format
 *
 * @param {{ validateColumn(frame, column): void }} deps - Injectable dependencies
 * @returns {(frame: TinyFrame, idVars: string[], valueVars: string[], varName?: string, valueName?: string) => TinyFrame}
 */
export const melt =
  ({ validateColumn }) =>
  (frame, idVars, valueVars, varName = 'variable', valueName = 'value') => {
    // Validate parameters
    if (!Array.isArray(idVars)) {
      throw new Error('idVars must be an array');
    }

    // If valueVars is not provided, use all non-id columns
    const allValueVars =
      valueVars || frame.columnNames.filter((col) => !idVars.includes(col));

    // Validate valueVars
    if (!Array.isArray(allValueVars)) {
      throw new Error('valueVars must be an array');
    }

    if (allValueVars.length === 0) {
      throw new Error('valueVars cannot be empty');
    }

    // Validate that all columns exist
    for (const col of [...idVars, ...allValueVars]) {
      validateColumn(frame, col);
    }

    // Check for duplicates between idVars and valueVars
    const duplicates = idVars.filter((col) => allValueVars.includes(col));
    if (duplicates.length > 0) {
      throw new Error(
        `Columns cannot be in both idVars and valueVars: ${duplicates.join(', ')}`,
      );
    }

    // Check that varName and valueName don't conflict with existing columns
    if ([...idVars, ...allValueVars].includes(varName)) {
      throw new Error(
        `varName '${varName}' conflicts with an existing column name`,
      );
    }

    if ([...idVars, ...allValueVars].includes(valueName)) {
      throw new Error(
        `valueName '${valueName}' conflicts with an existing column name`,
      );
    }

    // Calculate the resulting number of rows
    const resultRowCount = frame.rowCount * allValueVars.length;

    // Create result frame structure
    const resultFrame = {
      columns: {},
      dtypes: {},
      columnNames: [...idVars, varName, valueName],
      rowCount: resultRowCount,
    };

    // Copy id columns (repeating each value valueVars.length times)
    for (const col of idVars) {
      const dtype = frame.dtypes[col];
      resultFrame.dtypes[col] = dtype;
      const array = createTypedArray(dtype, resultRowCount);

      for (let i = 0; i < frame.rowCount; i++) {
        const value = frame.columns[col][i];
        for (let j = 0; j < allValueVars.length; j++) {
          array[i * allValueVars.length + j] = value;
        }
      }

      resultFrame.columns[col] = array;
    }

    // Create variable column (column names)
    resultFrame.dtypes[varName] = 'string';
    const varArray = new Array(resultRowCount);
    for (let i = 0; i < frame.rowCount; i++) {
      for (let j = 0; j < allValueVars.length; j++) {
        varArray[i * allValueVars.length + j] = allValueVars[j];
      }
    }
    resultFrame.columns[varName] = varArray;

    // Determine dtype for value column based on value columns
    const valueType = determineCommonType(frame, allValueVars);
    resultFrame.dtypes[valueName] = valueType;

    // Create value array
    const valueArray = createTypedArray(valueType, resultRowCount);
    for (let i = 0; i < frame.rowCount; i++) {
      for (let j = 0; j < allValueVars.length; j++) {
        const col = allValueVars[j];
        const value = frame.columns[col][i];

        // Handle null values appropriately based on type
        if (value === null || value === undefined) {
          if (valueType === 'f64') {
            valueArray[i * allValueVars.length + j] = NaN;
          } else if (valueType === 'i32' || valueType === 'u32') {
            valueArray[i * allValueVars.length + j] = 0;
          } else {
            valueArray[i * allValueVars.length + j] = null;
          }
        } else {
          valueArray[i * allValueVars.length + j] = value;
        }
      }
    }
    resultFrame.columns[valueName] = valueArray;

    return resultFrame;
  };
