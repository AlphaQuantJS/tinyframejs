// src/methods/filtering/selectByPattern.js

/**
 * Creates a function that selects columns from a DataFrame that match a pattern.
 *
 * @param {Object} deps - Dependencies
 * @returns {Function} Function that selects columns matching a pattern
 */
export const selectByPattern = (deps) => (frame, pattern) => {
  // Validate input
  if (typeof pattern !== 'string') {
    throw new Error('Pattern must be a string');
  }

  // Get all column names
  const columns = Object.keys(frame.columns);

  // Create a RegExp object from the pattern
  const regex = new RegExp(pattern);

  // Filter columns that match the pattern
  const matchingColumns = columns.filter((column) => regex.test(column));

  // Create a new frame with only the matching columns
  const result = {
    columns: {},
  };

  // Copy data from matching columns
  matchingColumns.forEach((column) => {
    result.columns[column] = frame.columns[column];
  });

  return result;
};
