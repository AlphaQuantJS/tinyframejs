// src/methods/filtering/where.js

/**
 * Creates a function that filters rows in a DataFrame based on column conditions.
 * Supports a variety of operators for filtering, similar to Pandas syntax.
 *
 * @param {Object} deps - Dependencies
 * @param {Function} deps.validateColumn - Function to validate column names
 * @returns {Function} Function that filters rows based on column conditions
 */
export const where =
  ({ validateColumn }) =>
    (frame, column, operator, value, options = {}) => {
    // Validate input
      validateColumn(frame, column);

      if (typeof operator !== 'string') {
        throw new Error('Operator must be a string');
      }

      // Map of supported operators to their JavaScript equivalents
      const operatorMap = {
      // Equality operators
        '==': (a, b) => a == b, // eslint-disable-line eqeqeq
        '===': (a, b) => a === b,
        '!=': (a, b) => a != b, // eslint-disable-line eqeqeq
        '!==': (a, b) => a !== b,

        // Comparison operators
        '>': (a, b) => a > b,
        '>=': (a, b) => a >= b,
        '<': (a, b) => a < b,
        '<=': (a, b) => a <= b,

        // Collection operators
        in: (a, b) => Array.isArray(b) && b.includes(a),

        // String operators (support both camelCase and lowercase versions)
        contains: (a, b) => String(a).includes(b),
        startsWith: (a, b) => String(a).startsWith(b),
        startswith: (a, b) => String(a).startsWith(b),
        endsWith: (a, b) => String(a).endsWith(b),
        endswith: (a, b) => String(a).endsWith(b),
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
        columnNames: [...columns], // Add columnNames property
        dtypes: { ...frame.dtypes }, // Copy dtypes if available
      };

      // Initialize empty arrays for each column
      columns.forEach((col) => {
        result.columns[col] = [];
      });

      // Get the number of rows
      const originalRowCount = frame.columns[column]?.length || 0;

      // Get the comparison function
      const compare = operatorMap[operator];

      // Apply the filter condition to each row
      for (let i = 0; i < originalRowCount; i++) {
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

      // Update rowCount after filtering
      result.rowCount = result.columns[columns[0]]?.length || 0;

      // Convert arrays to typed arrays if the original columns were typed
      columns.forEach((col) => {
        const originalArray = frame.columns[col];
        if (originalArray instanceof Float64Array) {
          result.columns[col] = new Float64Array(result.columns[col]);
        } else if (originalArray instanceof Int32Array) {
          result.columns[col] = new Int32Array(result.columns[col]);
        }
      });

      // If this is a direct call (not assigned to a variable), add metadata for printing
      result._meta = {
        ...result._meta,
        shouldPrint: options.print !== false,
      };

      return result;
    };
