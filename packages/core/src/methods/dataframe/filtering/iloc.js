/*-------------------------------------------------------------------------*
 |  DataFrame -› filtering · iloc()                                      |
 |                                                                         |
 |  Выбор строк и колонок из DataFrame по целочисленным позициям.  |
 |                                                                         |
 |  df.iloc(5) → выбор строки с индексом 5                           |
 |  df.iloc([1, 3, 5]) → выбор строк с указанными индексами         |
 |  df.iloc(5, 2) → выбор значения в строке 5, колонке 2                |
 |  df.iloc([1, 3], [0, 2]) → выбор строк 1,3 и колонок 0,2               |
 *-------------------------------------------------------------------------*/

/**
 * Method for selecting rows and columns by indices
 *
 * @module methods/dataframe/filtering/iloc
 */

// Import function for creating typed arrays
import { createTypedSeries } from '../../../data/utils/createTypedArray.js';

/**
 * Method for selecting rows and columns by indices (similar to iloc in pandas)
 * @param {DataFrame} df - DataFrame instance
 * @param {number|number[]|function} rowSelector - Row index, array of indices, or predicate function
 * @param {number|number[]|function} colSelector - Column index, array of indices, or predicate function
 * @returns {DataFrame|*} - New DataFrame with selected rows and columns or a cell value
 */
export function iloc(df, rowSelector = null, colSelector = null) {
  // Get all rows as array of objects
  const rows = df.toArray();
  const allColumns = df.columns;
  const rowCount = df.rowCount;

  if (rowCount === 0) {
    throw new Error('Row index out of bounds');
  }

  // Indices of selected rows
  let selectedIndices = [];

  // Process row selector
  if (rowSelector === null || rowSelector === undefined) {
    // If selector is null, select all rows
    selectedIndices = Array.from({ length: rowCount }, (_, i) => i);
  } else if (typeof rowSelector === 'number') {
    // Single row index
    const idx = rowSelector < 0 ? rowCount + rowSelector : rowSelector;
    if (idx < 0 || idx >= rowCount) {
      throw new Error('Row index out of bounds');
    }
    selectedIndices = [idx];
  } else if (Array.isArray(rowSelector)) {
    // Array of row indices
    selectedIndices = rowSelector.map((idx) => {
      const adjustedIdx = idx < 0 ? rowCount + idx : idx;
      if (adjustedIdx < 0 || adjustedIdx >= rowCount) {
        throw new Error('Row index out of bounds');
      }
      return adjustedIdx;
    });
  } else if (typeof rowSelector === 'function') {
    // Function returning true/false for each row index
    for (let i = 0; i < rowCount; i++) {
      if (rowSelector(i)) {
        selectedIndices.push(i);
      }
    }
  } else {
    throw new Error('Invalid row selector type');
  }

  // Indices of selected columns
  let selectedColumnIndices = [];

  // Process column selector
  if (colSelector === null || colSelector === undefined) {
    // If selector is null, select all columns
    selectedColumnIndices = Array.from({ length: allColumns.length }, (_, i) => i);
  } else if (typeof colSelector === 'number') {
    // Single column index
    const idx = colSelector < 0 ? allColumns.length + colSelector : colSelector;
    if (idx < 0 || idx >= allColumns.length) {
      throw new Error('Column index out of bounds');
    }
    selectedColumnIndices = [idx];
  } else if (Array.isArray(colSelector)) {
    // Array of column indices
    selectedColumnIndices = colSelector.map((idx) => {
      const adjustedIdx = idx < 0 ? allColumns.length + idx : idx;
      if (adjustedIdx < 0 || adjustedIdx >= allColumns.length) {
        throw new Error('Column index out of bounds');
      }
      return adjustedIdx;
    });
  } else if (typeof colSelector === 'function') {
    // Function returning true/false for each column index
    for (let i = 0; i < allColumns.length; i++) {
      if (colSelector(i)) {
        selectedColumnIndices.push(i);
      }
    }
  } else {
    throw new Error('Invalid column selector type');
  }

  // Get names of selected columns
  const selectedColumns = selectedColumnIndices.map((idx) => allColumns[idx]);

  // If only one row and one column are selected, return the value
  if (
    selectedIndices.length === 1 &&
    selectedColumns.length === 1 &&
    typeof rowSelector === 'number' &&
    typeof colSelector === 'number'
  ) {
    return rows[selectedIndices[0]][selectedColumns[0]];
  }

  // Create a new DataFrame instance with the same options as the original
  const result = new df.constructor({}, df._options);
  
  // For each selected column, create a Series with the appropriate type
  for (const col of selectedColumns) {
    // Get the original column data to determine its type
    const originalColumn = df._columns[col];
    const originalArray = originalColumn.vector.__data;
    const values = selectedIndices.map(index => rows[index][col]);
    
    // Preserve the array type if it's a typed array
    if (ArrayBuffer.isView(originalArray) && !(originalArray instanceof DataView)) {
      const TypedArrayConstructor = originalArray.constructor;
      const typedValues = new TypedArrayConstructor(values.length);
      values.forEach((value, i) => {
        typedValues[i] = value;
      });
      result._columns[col] = createTypedSeries(typedValues, col, df);
    } else {
      result._columns[col] = createTypedSeries(values, col, df);
    }
    
    // Add to column order
    if (!result._order.includes(col)) {
      result._order.push(col);
    }
  }
  
  return result;
}

// Export the method for the pool
export default { iloc };
