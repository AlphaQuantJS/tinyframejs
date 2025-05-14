// src/methods/filtering/selectByPattern.js

/**
 * Creates a function that selects columns from a DataFrame that match a pattern.
 *
 * @param {Object} deps - Dependencies
 * @returns {Function} Function that selects columns matching a pattern
 */
export const selectByPattern =
  (deps) =>
  (frame, pattern, options = {}) => {
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

    // If no columns match the pattern, return an empty DataFrame with metadata
    if (matchingColumns.length === 0) {
      return {
        columns: {},
        rowCount: 0,
        columnNames: [],
        dtypes: {},
        _meta: {
          ...frame._meta,
          shouldPrint: options.print !== false,
        },
      };
    }

    // Create a new frame with only the matching columns
    const result = {
      columns: {},
      rowCount: frame.columns[matchingColumns[0]]?.length || 0, // Add rowCount property
      columnNames: [...matchingColumns], // Add columnNames property
      dtypes: {}, // Copy dtypes if available
    };

    // Copy dtypes for matching columns
    if (frame.dtypes) {
      matchingColumns.forEach((column) => {
        if (frame.dtypes[column]) {
          result.dtypes[column] = frame.dtypes[column];
        }
      });
    }

    // Copy data from matching columns
    matchingColumns.forEach((column) => {
      result.columns[column] = frame.columns[column];
    });

    // If this is a direct call (not assigned to a variable), add metadata for printing
    result._meta = {
      ...result._meta,
      shouldPrint: options.print !== false,
    };

    return result;
  };
