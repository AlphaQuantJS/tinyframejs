// src/methods/filtering/at.js

/**
 * Creates a function that selects a row from a DataFrame by its index.
 *
 * @param {Object} deps - Dependencies
 * @returns {Function} Function that selects a row by index
 */
export const at = (deps) => (frame, index) => {
  // Validate input
  if (typeof index !== 'number' || !Number.isInteger(index)) {
    throw new Error('Index must be an integer');
  }

  if (index < 0) {
    throw new Error('Index must be non-negative');
  }

  // Get all column names
  const columns = Object.keys(frame.columns);

  // Get the number of rows
  const rowCount = frame.columns[columns[0]]?.length || 0;

  if (index >= rowCount) {
    throw new Error(`Index ${index} is out of bounds (0-${rowCount - 1})`);
  }

  // Create an object with values from the specified row
  const result = {};

  columns.forEach((column) => {
    result[column] = frame.columns[column][index];
  });

  return result;
};
