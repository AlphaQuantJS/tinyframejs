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
    (frame, columns, options = {}) => {
    // Validate input
      if (!Array.isArray(columns)) {
        throw new Error('Columns must be an array');
      }

      // Validate each column exists in the frame
      columns.forEach((column) => validateColumn(frame, column));

      // Create a new frame with only the selected columns
      const result = {
        columns: {},
        rowCount: frame.columns[columns[0]]?.length || 0, // Add rowCount property
        columnNames: [...columns], // Add columnNames property
        dtypes: {}, // Copy dtypes if available
      };

      // Copy dtypes for selected columns
      if (frame.dtypes) {
        columns.forEach((column) => {
          if (frame.dtypes[column]) {
            result.dtypes[column] = frame.dtypes[column];
          }
        });
      }

      // Copy columns data
      columns.forEach((column) => {
        result.columns[column] = frame.columns[column];
      });

      // If this is a direct call (not assigned to a variable), add metadata for printing
      result._meta = {
        ...result._meta,
        shouldPrint: options.print !== false,
      };

      return result;
    };
