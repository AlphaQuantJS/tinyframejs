// src/methods/filtering/filter.js

/**
 * Creates a function that filters rows in a DataFrame based on a condition.
 *
 * @param {Object} deps - Dependencies
 * @returns {Function} Function that filters rows in a DataFrame
 */
export const filter = (deps) => (frame, condition) => {
  // Validate input
  if (typeof condition !== 'function') {
    throw new Error('Condition must be a function');
  }

  // Get all column names and create a new frame
  const columns = Object.keys(frame.columns);
  const result = {
    columns: {},
  };

  // Initialize empty arrays for each column
  columns.forEach((column) => {
    result.columns[column] = [];
  });

  // Get the number of rows
  const rowCount = frame.columns[columns[0]]?.length || 0;

  // Apply the filter condition to each row
  for (let i = 0; i < rowCount; i++) {
    // Create a row object for the condition function
    const row = {};
    columns.forEach((column) => {
      row[column] = frame.columns[column][i];
    });

    // Check if the row passes the condition
    if (condition(row)) {
      // Add the row to the result
      columns.forEach((column) => {
        result.columns[column].push(frame.columns[column][i]);
      });
    }
  }

  // Convert arrays to typed arrays if the original columns were typed
  columns.forEach((column) => {
    const originalArray = frame.columns[column];
    if (originalArray instanceof Float64Array) {
      result.columns[column] = new Float64Array(result.columns[column]);
    } else if (originalArray instanceof Int32Array) {
      result.columns[column] = new Int32Array(result.columns[column]);
    }
  });

  return result;
};
