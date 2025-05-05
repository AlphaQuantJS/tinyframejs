// src/methods/filtering/where.js

/**
 * Creates a function that filters rows in a DataFrame based on column conditions.
 *
 * @param {Object} deps - Dependencies
 * @param {Function} deps.validateColumn - Function to validate column names
 * @returns {Function} Function that filters rows based on column conditions
 */
export const where =
  ({ validateColumn }) =>
  (frame, column, operator, value) => {
    // Validate input
    validateColumn(frame, column);

    if (typeof operator !== 'string') {
      throw new Error('Operator must be a string');
    }

    // Map of supported operators to their JavaScript equivalents
    const operatorMap = {
      '==': (a, b) => a == b, // eslint-disable-line eqeqeq
      '===': (a, b) => a === b,
      '!=': (a, b) => a != b, // eslint-disable-line eqeqeq
      '!==': (a, b) => a !== b,
      '>': (a, b) => a > b,
      '>=': (a, b) => a >= b,
      '<': (a, b) => a < b,
      '<=': (a, b) => a <= b,
      in: (a, b) => Array.isArray(b) && b.includes(a),
      contains: (a, b) => String(a).includes(b),
      startsWith: (a, b) => String(a).startsWith(b),
      endsWith: (a, b) => String(a).endsWith(b),
      matches: (a, b) => new RegExp(b).test(String(a)),
    };

    // Check if the operator is supported
    if (!operatorMap[operator]) {
      throw new Error(`Unsupported operator: ${operator}`);
    }

    // Get all column names and create a new frame
    const columns = Object.keys(frame.columns);
    const result = {
      columns: {},
    };

    // Initialize empty arrays for each column
    columns.forEach((col) => {
      result.columns[col] = [];
    });

    // Get the number of rows
    const rowCount = frame.columns[column]?.length || 0;

    // Get the comparison function
    const compare = operatorMap[operator];

    // Apply the filter condition to each row
    for (let i = 0; i < rowCount; i++) {
      // Get the value from the specified column
      const columnValue = frame.columns[column][i];

      // Check if the value passes the condition
      if (compare(columnValue, value)) {
        // Add the row to the result
        columns.forEach((col) => {
          result.columns[col].push(frame.columns[col][i]);
        });
      }
    }

    // Convert arrays to typed arrays if the original columns were typed
    columns.forEach((col) => {
      const originalArray = frame.columns[col];
      if (originalArray instanceof Float64Array) {
        result.columns[col] = new Float64Array(result.columns[col]);
      } else if (originalArray instanceof Int32Array) {
        result.columns[col] = new Int32Array(result.columns[col]);
      }
    });

    return result;
  };
