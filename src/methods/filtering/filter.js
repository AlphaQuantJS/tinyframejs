// src/methods/filtering/filter.js

/**
 * Creates a function that filters rows in a DataFrame based on a condition.
 *
 * @param {Object} deps - Dependencies
 * @returns {Function} Function that filters rows in a DataFrame
 */
export const filter =
  (deps) =>
    (frame, condition, options = {}) => {
    // Validate input
      if (typeof condition !== 'function') {
        throw new Error('Condition must be a function');
      }

      // Get all column names and create a new frame
      const columns = Object.keys(frame.columns);
      const result = {
        columns: {},
        columnNames: [...columns], // Add columnNames property
        dtypes: { ...frame.dtypes }, // Copy dtypes if available
      };

      // Initialize empty arrays for each column
      columns.forEach((column) => {
        result.columns[column] = [];
      });

      // Get the number of rows
      const originalRowCount = frame.columns[columns[0]]?.length || 0;

      // Apply the filter condition to each row
      for (let i = 0; i < originalRowCount; i++) {
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

      // Update rowCount after filtering
      result.rowCount = result.columns[columns[0]]?.length || 0;

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
