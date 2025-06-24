/*-------------------------------------------------------------------------*
 |  DataFrame › filtering · filter()                                     |
 |                                                                         |
 |  df.filter(row => row.age > 30) → new DataFrame with matching rows     |
 |  Supports predicate functions and string expressions.                  |
 *-------------------------------------------------------------------------*/

import { createTypedSeries } from '../../../data/utils/createTypedArray.js';

/**
 * Filters rows in a DataFrame based on a predicate function
 *
 * @param {Object} df - DataFrame instance
 * @param {Function} predicate - Function to apply to each row
 * @returns {Object} - New DataFrame with filtered rows
 */
export function filter(df, predicate) {
  // Check that the argument is a function
  if (typeof predicate !== 'function') {
    throw new Error('Predicate must be a function');
  }

  // Convert DataFrame to array of rows
  const rows = df.toArray();
  const allColumns = df.columns;

  // Apply predicate to each row
  const filteredRows = rows.filter(predicate);

  // If no results, create an empty DataFrame with the same columns and column types
  if (filteredRows.length === 0) {
    // Create a new DataFrame instance with the same options as the original
    const result = new df.constructor({}, df._options);

    // For each column, create a Series with the appropriate type
    for (const col of allColumns) {
      // Get the original column data to determine its type
      const originalColumn = df._columns[col];
      const originalArray = originalColumn.vector.__data;

      // Create an empty array with the same type
      if (
        ArrayBuffer.isView(originalArray) &&
        !(originalArray instanceof DataView)
      ) {
        const TypedArrayConstructor = originalArray.constructor;
        const emptyTypedArray = new TypedArrayConstructor(0);
        result._columns[col] = createTypedSeries(emptyTypedArray, col, df);
      } else {
        result._columns[col] = createTypedSeries([], col, df);
      }

      // Add to column order
      if (!result._order.includes(col)) {
        result._order.push(col);
      }
    }

    return result;
  }

  // For non-empty results, create a new DataFrame with filtered rows
  // Create a new DataFrame instance with the same options as the original
  const result = new df.constructor({}, df._options);

  // For each column, create a Series with the appropriate type
  for (const col of allColumns) {
    // Get the original column data to determine its type
    const originalColumn = df._columns[col];
    const originalArray = originalColumn.vector.__data;
    const values = filteredRows.map((row) => row[col]);

    // Preserve the array type if it's a typed array
    if (
      ArrayBuffer.isView(originalArray) &&
      !(originalArray instanceof DataView)
    ) {
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

// Export the filter method directly
