/*-------------------------------------------------------------------------*
 |  DataFrame -› filtering · loc()                                       |
 |                                                                         |
 |  Selection of rows and columns from DataFrame by labels (names).        |
 |                                                                         |
 |  df.loc(5) → select row with index 5                                    |
 |  df.loc([1, 3, 5]) → select rows with specified indices                |
 |  df.loc(5, 'age') → select value in row 5, column 'age'                |
 |  df.loc([1, 3], ['name', 'age']) → select rows 1,3 and columns 'name','age' |
 |  df.loc(row => row.age > 30) → select rows where age > 30              |
 |  df.loc({city: 'Chicago'}) → select rows where city equals 'Chicago'   |
 *-------------------------------------------------------------------------*/

/**
 * Row and column selection by label or position
 * 
 * @module methods/dataframe/filtering/loc
 */

import { createTypedArray } from '../../../data/utils/createTypedArray.js';

/**
 * Selects rows and columns by label or position
 * 
 * @param {DataFrame} df - DataFrame to select from
 * @param {*} rowSelector - Row selector (label, array of labels, predicate function, or condition object)
 * @param {*} colSelector - Column selector (name, array of names, or null for all columns)
 * @returns {DataFrame} - New DataFrame with selected rows and columns
 */
export function loc(df, rowSelector, colSelector) {
  // Get data from DataFrame
  const rows = df.toArray();
  const rowCount = df.rowCount;

  // Define rows to select
  let selectedRows = [];
  let selectedIndices = [];

  // Check if DataFrame has an index set
  const hasIndex = df._index !== null && df._indexMap !== undefined && df._indexMap.size > 0;

  if (rowSelector === null) {
    // If rowSelector is null, select all rows
    selectedRows = [...rows];
    selectedIndices = Array.from({ length: rowCount }, (_, i) => i);
  } else if (Array.isArray(rowSelector)) {
    // If rowSelector is an array of indices or labels
    if (hasIndex) {
      // Use index for selection
      selectedIndices = [];
      selectedRows = [];
      
      for (const label of rowSelector) {
        const index = df._indexMap.get(label);
        if (index === undefined) {
          throw new Error('Row label not found');
        }
        selectedIndices.push(index);
        selectedRows.push(rows[index]);
      }
    } else {
      // Use numeric indices
      for (const index of rowSelector) {
        if (index < 0 || index >= rowCount) {
          throw new Error(
            `Row index ${index} is out of bounds for DataFrame with ${rowCount} rows`,
          );
        }
      }
      selectedIndices = rowSelector;
      selectedRows = rows.filter((_, index) => rowSelector.includes(index));
    }
  } else if (typeof rowSelector === 'number' || typeof rowSelector === 'string') {
    // If rowSelector is a number or string (index or label)
    if (hasIndex && typeof rowSelector === 'string') {
      // Use index for selection
      const index = df._indexMap.get(rowSelector);
      if (index === undefined) {
        throw new Error('Row label not found');
      }
      selectedIndices = [index];
      selectedRows = [rows[index]];
    } else if (typeof rowSelector === 'number') {
      // Use numeric index
      if (rowSelector < 0 || rowSelector >= rowCount) {
        throw new Error(
          `Row index ${rowSelector} is out of bounds for DataFrame with ${rowCount} rows`,
        );
      }
      selectedIndices = [rowSelector];
      selectedRows = [rows[rowSelector]];
    } else {
      throw new Error('Row label not found');
    }
  } else if (typeof rowSelector === 'function') {
    // If rowSelector is a predicate function
    selectedRows = rows.filter(rowSelector);
    selectedIndices = rows
      .map((row, index) => (rowSelector(row) ? index : -1))
      .filter((index) => index !== -1);
  } else if (typeof rowSelector === 'object' && rowSelector !== null) {
    // If rowSelector is an object with conditions
    selectedIndices = [];
    selectedRows = [];
    rows.forEach((row, index) => {
      let match = true;
      for (const [key, value] of Object.entries(rowSelector)) {
        if (row[key] !== value) {
          match = false;
          break;
        }
      }
      if (match) {
        selectedIndices.push(index);
        selectedRows.push(row);
      }
    });
  } else {
    throw new Error('Invalid row selector type');
  }

  // If column selector is not specified, return all columns
  if (colSelector === undefined) {
    // If only one row is selected and rowSelector is not a function, we need to decide
    // whether to return an object or a DataFrame with one row
    if (selectedRows.length === 1 && typeof rowSelector !== 'function') {
      // In tests, we need to return a DataFrame with rowCount property
      // Create a DataFrame with one row
      const result = df.constructor.fromRecords([selectedRows[0]], df._options);
      
      // Copy column metadata to preserve typed arrays
      for (const col of result.columns) {
        if (df._columns[col] && df._columns[col].vector && df._columns[col].vector.__data) {
          const originalArray = df._columns[col].vector.__data;
          if (ArrayBuffer.isView(originalArray) && !(originalArray instanceof DataView)) {
            const TypedArrayConstructor = originalArray.constructor;
            // Create a new typed array with the same type
            const newArray = new TypedArrayConstructor([selectedRows[0][col]]);
            result._columns[col].vector.__data = newArray;
          }
        }
      }
      
      return result;
    }

    // If no results, create an empty DataFrame with the same columns
    if (selectedRows.length === 0) {
      const emptyData = {};
      for (const col of df.columns) {
        // Preserve array type if it's a typed array
        const originalArray = df._columns[col].vector.__data;
        if (ArrayBuffer.isView(originalArray) && !(originalArray instanceof DataView)) {
          const TypedArrayConstructor = originalArray.constructor;
          emptyData[col] = new TypedArrayConstructor(0);
        } else {
          emptyData[col] = [];
        }
      }
      return new df.constructor(emptyData, df._options);
    }

    // Create a new DataFrame with the same options as the original
    const result = df.constructor.fromRecords(selectedRows, df._options);
    
    // Process each column to preserve typed arrays
    for (const col of df.columns) {
      if (df._columns[col] && df._columns[col].vector && df._columns[col].vector.__data) {
        const originalArray = df._columns[col].vector.__data;
        if (ArrayBuffer.isView(originalArray)) {
          // Get column options if specified
          const columnOptions = df._options?.columns?.[col] || {};
          
          // Extract values for this column from selected rows
          const values = selectedRows.map(row => row[col]);
          
          // Create a new typed array with the same type
          const newArray = createTypedArray(values, originalArray, columnOptions);
          
          // Replace the array in the result DataFrame
          if (result._columns[col] && result._columns[col].vector) {
            result._columns[col].vector.__data = newArray;
          }
        }
      }
    }
    
    return result;
  }

  // Define columns to select
  let selectedColumns = [];

  if (colSelector === null) {
    // If colSelector is null, select all columns
    selectedColumns = df.columns;
  } else if (Array.isArray(colSelector)) {
    // If colSelector is an array of column names
    selectedColumns = colSelector;
  } else if (typeof colSelector === 'string') {
    // If colSelector is a single column name
    selectedColumns = [colSelector];
  } else {
    throw new Error('Invalid column selector type');
  }

  // Check that all specified columns exist
  for (const column of selectedColumns) {
    if (!df.columns.includes(column)) {
      throw new Error('Column not found');
    }
  }

  // If only one row and one column are selected, return the value
  if (
    selectedRows.length === 1 &&
    selectedColumns.length === 1 &&
    typeof rowSelector !== 'function'
  ) {
    return selectedRows[0][selectedColumns[0]];
  }

  // If no results, create an empty DataFrame with selected columns
  if (selectedRows.length === 0) {
    const emptyData = {};
    for (const col of selectedColumns) {
      // Preserve array type if it's a typed array
      const originalArray = df._columns[col].vector.__data;
      if (ArrayBuffer.isView(originalArray) && !(originalArray instanceof DataView)) {
        const TypedArrayConstructor = originalArray.constructor;
        emptyData[col] = new TypedArrayConstructor(0);
      } else {
        emptyData[col] = [];
      }
    }
    return new df.constructor(emptyData, df._options);
  }
  
  // If only one row and one column are selected, but we need a DataFrame
  if (selectedRows.length === 1 && selectedColumns.length === 1 && typeof rowSelector === 'function') {
    const singleColData = {};
    const col = selectedColumns[0];
    const value = selectedRows[0][col];
    
    // Preserve array type if it's a typed array
    const originalArray = df._columns[col].vector.__data;
    if (ArrayBuffer.isView(originalArray) && !(originalArray instanceof DataView)) {
      const TypedArrayConstructor = originalArray.constructor;
      singleColData[col] = new TypedArrayConstructor([value]);
    } else {
      singleColData[col] = [value];
    }
    
    return new df.constructor(singleColData, df._options);
  }

  // Create a new DataFrame with only selected columns
  const filteredRows = selectedRows.map(row => {
    const filteredRow = {};
    for (const col of selectedColumns) {
      filteredRow[col] = row[col];
    }
    return filteredRow;
  });

  // Create a new DataFrame with the same options as the original
  const result = df.constructor.fromRecords(filteredRows, df._options);
  
  // Process each column to preserve typed arrays
  for (const col of selectedColumns) {
    if (df._columns[col] && df._columns[col].vector && df._columns[col].vector.__data) {
      const originalArray = df._columns[col].vector.__data;
      if (ArrayBuffer.isView(originalArray)) {
        // Get column options if specified
        const columnOptions = df._options?.columns?.[col] || {};
        
        // Extract values for this column from filtered rows
        const values = filteredRows.map(row => row[col]);
        
        // Create a new typed array with the same type
        const newArray = createTypedArray(values, originalArray, columnOptions);
        
        // Replace the array in the result DataFrame
        if (result._columns[col] && result._columns[col].vector) {
          result._columns[col].vector.__data = newArray;
        }
      }
    }
  }
  
  return result;
}

// Export the loc method directly
export { loc };
