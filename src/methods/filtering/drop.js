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
  (frame, columns, options = {}) => {
    // Validate input
    if (!Array.isArray(columns)) {
      throw new Error('Columns must be an array');
    }

    // Validate each column exists in the frame
    columns.forEach((column) => validateColumn(frame, column));

    // Get all column names
    const allColumns = Object.keys(frame.columns);

    // Determine remaining columns
    const remainingColumns = allColumns.filter(
      (column) => !columns.includes(column),
    );

    // Create a new frame without the specified columns
    const result = {
      columns: {},
      rowCount: frame.columns[remainingColumns[0]]?.length || 0, // Add rowCount property
      columnNames: [...remainingColumns], // Add columnNames property
      dtypes: {}, // Copy dtypes if available
    };

    // Copy dtypes for remaining columns
    if (frame.dtypes) {
      remainingColumns.forEach((column) => {
        if (frame.dtypes[column]) {
          result.dtypes[column] = frame.dtypes[column];
        }
      });
    }

    // Add only columns that are not in the drop list
    remainingColumns.forEach((column) => {
      result.columns[column] = frame.columns[column];
    });

    // If this is a direct call (not assigned to a variable), add metadata for printing
    result._meta = {
      ...result._meta,
      shouldPrint: options.print !== false,
    };

    return result;
  };
