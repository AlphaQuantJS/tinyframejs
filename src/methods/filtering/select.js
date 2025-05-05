// src/methods/filtering/select.js

/**
 * Creates a function that selects specific columns from a DataFrame.
 *
 * @param {Object} deps - Dependencies
 * @param {Function} deps.validateColumn - Function to validate column names
 * @returns {Function} Function that selects columns from a DataFrame
 */
export const select =
  ({ validateColumn }) =>
  (frame, columns) => {
    // Validate input
    if (!Array.isArray(columns)) {
      throw new Error('Columns must be an array');
    }

    // Validate each column exists in the frame
    columns.forEach((column) => validateColumn(frame, column));

    // Create a new frame with only the selected columns
    const result = {
      columns: {},
    };

    columns.forEach((column) => {
      result.columns[column] = frame.columns[column];
    });

    return result;
  };
