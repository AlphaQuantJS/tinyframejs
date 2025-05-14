// src/methods/filtering/tail.js

/**
 * Creates a function that returns the last n rows of a DataFrame.
 *
 * @param {Object} deps - Dependencies
 * @returns {Function} Function that returns the last n rows
 */
export const tail =
  (deps) =>
  (frame, n = 5, options = {}) => {
    // Validate input
    if (typeof n !== 'number' || n <= 0) {
      throw new Error('Number of rows must be a positive number');
    }

    if (!Number.isInteger(n)) {
      throw new Error('Number of rows must be an integer');
    }

    // Get all column names
    const columns = Object.keys(frame.columns);

    // Get the number of rows
    const rowCount = frame.columns[columns[0]]?.length || 0;

    // Determine how many rows to return
    const numRows = Math.min(n, rowCount);

    // Calculate the starting index
    const startIndex = Math.max(0, rowCount - numRows);

    // Create a new frame with the same columns
    const result = {
      columns: {},
      rowCount: numRows, // Add rowCount property
      columnNames: [...columns], // Add columnNames property
      dtypes: { ...frame.dtypes }, // Copy dtypes if available
    };

    // Initialize columns in the result
    columns.forEach((column) => {
      result.columns[column] = [];
    });

    // Add the last n rows to the result
    for (let i = startIndex; i < rowCount; i++) {
      columns.forEach((column) => {
        result.columns[column].push(frame.columns[column][i]);
      });
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

    // If this is a direct call (not assigned to a variable), add metadata for printing
    result._meta = {
      ...result._meta,
      shouldPrint: options.print !== false,
    };

    return result;
  };
