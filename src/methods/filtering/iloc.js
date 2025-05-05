// src/methods/filtering/iloc.js

/**
 * Creates a function that selects rows and columns by their integer positions.
 *
 * @param {Object} deps - Dependencies
 * @returns {Function} Function that selects rows and columns by integer positions
 */
export const iloc = (deps) => (frame, rowIndices, columnIndices) => {
  // Validate input
  if (!Array.isArray(rowIndices)) {
    rowIndices = [rowIndices];
  }

  if (!Array.isArray(columnIndices)) {
    columnIndices = [columnIndices];
  }

  // Validate that all indices are numbers
  if (!rowIndices.every((idx) => typeof idx === 'number' && idx >= 0)) {
    throw new Error('Row indices must be non-negative numbers');
  }

  if (!columnIndices.every((idx) => typeof idx === 'number' && idx >= 0)) {
    throw new Error('Column indices must be non-negative numbers');
  }

  // Get all column names
  const allColumns = Object.keys(frame.columns);

  // Get the number of rows
  const rowCount = frame.columns[allColumns[0]]?.length || 0;

  // Check if row indices are valid
  const maxRowIndex = Math.max(...rowIndices);
  if (maxRowIndex >= rowCount) {
    throw new Error(
      `Row index ${maxRowIndex} is out of bounds (0-${rowCount - 1})`,
    );
  }

  // Check if column indices are valid
  const maxColumnIndex = Math.max(...columnIndices);
  if (maxColumnIndex >= allColumns.length) {
    throw new Error(
      `Column index ${maxColumnIndex} is out of bounds (0-${allColumns.length - 1})`,
    );
  }

  // Map column indices to column names
  const selectedColumns = columnIndices.map((idx) => allColumns[idx]);

  // Create a new frame with selected rows and columns
  const result = {
    columns: {},
  };

  // Initialize columns in the result
  selectedColumns.forEach((column) => {
    result.columns[column] = [];
  });

  // Add selected rows to the result
  rowIndices.forEach((rowIdx) => {
    selectedColumns.forEach((column) => {
      result.columns[column].push(frame.columns[column][rowIdx]);
    });
  });

  // Convert arrays to typed arrays if the original columns were typed
  selectedColumns.forEach((column) => {
    const originalArray = frame.columns[column];
    if (originalArray instanceof Float64Array) {
      result.columns[column] = new Float64Array(result.columns[column]);
    } else if (originalArray instanceof Int32Array) {
      result.columns[column] = new Int32Array(result.columns[column]);
    }
  });

  return result;
};
