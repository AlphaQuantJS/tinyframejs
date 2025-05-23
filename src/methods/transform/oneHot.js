/**
 * oneHot.js - One-hot encoding for categorical columns
 *
 * Implements one-hot encoding (dummy variables) for categorical data,
 * similar to pandas get_dummies() function. Creates binary columns
 * for each category in a categorical column.
 */

import { cloneFrame } from '../../core/createFrame.js';

/**
 * Creates one-hot encoded columns from a categorical column
 *
 * @param {{ validateColumn(frame, column): void }} deps - Injectable dependencies
 * @returns {(frame: TinyFrame, column: string, options?: object) => TinyFrame} - Function for one-hot encoding
 */
export const oneHot =
  ({ validateColumn }) =>
  (frame, column, options = {}) => {
    // Validate column exists
    validateColumn(frame, column);

    // Default options
    const {
      prefix = `${column}_`, // Prefix for new column names
      dropOriginal = false, // Whether to drop the original column
      dropFirst = false, // Whether to drop the first category (to avoid multicollinearity)
      categories = null, // Predefined categories to use (if null, derive from data)
      dtype = 'u8', // Data type for encoded columns ('u8', 'i32', 'f64')
      handleNull = 'ignore', // How to handle null values: 'ignore', 'error', or 'encode'
    } = options;

    // Validate options
    if (!['u8', 'i32', 'f64'].includes(dtype)) {
      throw new Error(`Invalid dtype: ${dtype}. Must be one of: u8, i32, f64`);
    }

    if (!['ignore', 'error', 'encode'].includes(handleNull)) {
      throw new Error(
        `Invalid handleNull: ${handleNull}. Must be one of: ignore, error, encode`,
      );
    }

    // Check for null values
    const hasNullValues = frame.columns[column].some(
      (val) => val === null || val === undefined,
    );
    if (hasNullValues && handleNull === 'error') {
      throw new Error(
        `Column '${column}' contains null values. Set handleNull option to 'ignore' or 'encode' to proceed.`,
      );
    }

    // Get unique values in the column
    let uniqueValues = [];
    if (categories) {
      // Use predefined categories
      uniqueValues = [...categories];
    } else {
      // Extract unique values from the column
      const valueSet = new Set();
      for (let i = 0; i < frame.rowCount; i++) {
        const value = frame.columns[column][i];
        if (value !== null && value !== undefined) {
          valueSet.add(value);
        } else if (handleNull === 'encode') {
          valueSet.add(null);
        }
      }
      uniqueValues = Array.from(valueSet);
    }

    // Sort values for consistent output (null values come first)
    uniqueValues.sort((a, b) => {
      if (a === null) return -1;
      if (b === null) return 1;
      if (typeof a === 'number' && typeof b === 'number') return a - b;
      return String(a).localeCompare(String(b));
    });

    // If dropFirst is true, remove the first category
    if (dropFirst && uniqueValues.length > 0) {
      uniqueValues = uniqueValues.slice(1);
    }

    // Clone the frame to avoid modifying the original
    const resultFrame = cloneFrame(frame, {
      useTypedArrays: true,
      copy: 'deep',
      saveRawData: false,
    });

    // Create appropriate TypedArray constructor based on dtype
    const TypedArrayConstructor =
      dtype === 'u8' ? Uint8Array : dtype === 'i32' ? Int32Array : Float64Array;

    // Create one-hot encoded columns
    for (const value of uniqueValues) {
      // Generate column name, handling null values specially
      const valuePart = value === null ? 'null' : value;
      const newColumnName = `${prefix}${valuePart}`;

      // Skip if column already exists
      if (resultFrame.columnNames.includes(newColumnName)) {
        continue;
      }

      // Create a new column with 0/1 values
      const newColumn = new TypedArrayConstructor(frame.rowCount);
      for (let i = 0; i < frame.rowCount; i++) {
        const currentValue = frame.columns[column][i];
        // Special handling for null values
        if (currentValue === null || currentValue === undefined) {
          newColumn[i] = value === null ? 1 : 0;
        } else {
          newColumn[i] = currentValue === value ? 1 : 0;
        }
      }

      // Add the new column to the result frame
      resultFrame.columns[newColumnName] = newColumn;
      resultFrame.dtypes[newColumnName] = dtype;
      resultFrame.columnNames.push(newColumnName);
    }

    // Remove the original column if dropOriginal is true
    if (dropOriginal) {
      const columnIndex = resultFrame.columnNames.indexOf(column);
      if (columnIndex !== -1) {
        resultFrame.columnNames.splice(columnIndex, 1);
        delete resultFrame.columns[column];
        delete resultFrame.dtypes[column];
      }
    }

    return resultFrame;
  };
