// src/methods/filtering/drop.js

/**
 * Creates a function that removes specific columns from a DataFrame.
 *
 * @param {Object} deps - Dependencies
 * @param {Function} deps.validateColumn - Function to validate column names
 * @returns {Function} Function that removes columns from a DataFrame
 */
export const drop =
  ({ validateColumn }) =>
  (frame, columns) => {
    // Validate input
    if (!Array.isArray(columns)) {
      throw new Error('Columns must be an array');
    }

    // Validate each column exists in the frame
    columns.forEach((column) => validateColumn(frame, column));

    // Create a new frame without the specified columns
    const result = {
      columns: {},
    };

    // Get all column names
    const allColumns = Object.keys(frame.columns);

    // Add only columns that are not in the drop list
    allColumns.forEach((column) => {
      if (!columns.includes(column)) {
        result.columns[column] = frame.columns[column];
      }
    });

    return result;
  };
