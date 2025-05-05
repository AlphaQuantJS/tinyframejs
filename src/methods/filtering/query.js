// src/methods/filtering/query.js

/**
 * Creates a function that filters rows in a DataFrame using a SQL-like query.
 *
 * @param {Object} deps - Dependencies
 * @returns {Function} Function that filters rows using a query
 */
export const query = (deps) => (frame, queryString) => {
  // Validate input
  if (typeof queryString !== 'string') {
    throw new Error('Query must be a string');
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

  // Create a safe evaluation function for the query
  const createConditionFunction = (query) => {
    // Replace common operators with JavaScript equivalents
    const safeQuery = query
      .replace(/\band\b/gi, '&&')
      .replace(/\bor\b/gi, '||')
      .replace(/\bnot\b/gi, '!')
      .replace(/\bin\b/gi, 'includes');

    try {
      // Create a function that evaluates the query for a row

      return new Function(
        'row',
        `
        try {
          with (row) {
            return ${safeQuery};
          }
        } catch (e) {
          return false;
        }
      `,
      );
    } catch (e) {
      throw new Error(`Invalid query: ${e.message}`);
    }
  };

  // Create the condition function
  const conditionFn = createConditionFunction(queryString);

  // Apply the filter condition to each row
  for (let i = 0; i < rowCount; i++) {
    // Create a row object for the condition function
    const row = {};
    columns.forEach((column) => {
      row[column] = frame.columns[column][i];
    });

    // Check if the row passes the condition
    try {
      if (conditionFn(row)) {
        // Add the row to the result
        columns.forEach((column) => {
          result.columns[column].push(frame.columns[column][i]);
        });
      }
    } catch (e) {
      // Skip rows that cause errors in the query
      console.warn(`Error evaluating query for row ${i}: ${e.message}`);
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
