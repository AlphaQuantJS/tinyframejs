// src/methods/filtering/loc.js

/**
 * Creates a function that selects rows and columns by their labels.
 *
 * @param {Object} deps - Dependencies
 * @param {Function} deps.validateColumn - Function to validate column names
 * @returns {Function} Function that selects rows and columns by labels
 */
export const loc =
  ({ validateColumn }) =>
  (frame, rowIndices, columnNames) => {
    // Validate input
    if (!Array.isArray(rowIndices)) {
      rowIndices = [rowIndices];
    }

    if (!Array.isArray(columnNames)) {
      columnNames = [columnNames];
    }

    // Validate that all row indices are numbers
    if (!rowIndices.every((idx) => typeof idx === 'number' && idx >= 0)) {
      throw new Error('Row indices must be non-negative numbers');
    }

    // Validate that all column names exist
    columnNames.forEach((column) => validateColumn(frame, column));

    // Get the number of rows
    const rowCount = frame.columns[columnNames[0]]?.length || 0;

    // Check if row indices are valid
    const maxRowIndex = Math.max(...rowIndices);
    if (maxRowIndex >= rowCount) {
      throw new Error(
        `Row index ${maxRowIndex} is out of bounds (0-${rowCount - 1})`,
      );
    }

    // Create a new frame with selected rows and columns
    const result = {
      columns: {},
    };

    // Initialize columns in the result
    columnNames.forEach((column) => {
      result.columns[column] = [];
    });

    // Add selected rows to the result
    rowIndices.forEach((rowIdx) => {
      columnNames.forEach((column) => {
        result.columns[column].push(frame.columns[column][rowIdx]);
      });
    });

    // Convert arrays to typed arrays if the original columns were typed
    columnNames.forEach((column) => {
      const originalArray = frame.columns[column];
      if (originalArray instanceof Float64Array) {
        result.columns[column] = new Float64Array(result.columns[column]);
      } else if (originalArray instanceof Int32Array) {
        result.columns[column] = new Int32Array(result.columns[column]);
      }
    });

    return result;
  };
