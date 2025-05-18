// src/methods/filtering/sample.js

/**
 * Creates a function that selects a random sample of rows from a DataFrame.
 *
 * @param {Object} deps - Dependencies
 * @returns {Function} Function that selects a random sample of rows
 */
export const sample =
  (deps) =>
    (frame, n, options = {}) => {
    // Get all column names
      const columns = Object.keys(frame.columns);

      // Get the number of rows
      const rowCount = frame.columns[columns[0]]?.length || 0;

      // Validate input
      if (typeof n !== 'number' || n <= 0) {
        throw new Error('Sample size must be a positive number');
      }

      if (!Number.isInteger(n)) {
        throw new Error('Sample size must be an integer');
      }

      if (n > rowCount) {
        throw new Error(
          `Sample size ${n} is greater than the number of rows ${rowCount}`,
        );
      }

      // Create a new frame with the same columns
      const result = {
        columns: {},
      };

      // Initialize columns in the result
      columns.forEach((column) => {
        result.columns[column] = [];
      });

      // Generate random indices without replacement
      const indices = [];
      const { seed } = options;

      // Use a seeded random number generator if seed is provided
      const random =
      seed !== undefined ? // Simple seeded random function
        (() => {
          let s = seed;
          return () => {
            s = (s * 9301 + 49297) % 233280;
            return s / 233280;
          };
        })() :
        Math.random;

      // Fisher-Yates shuffle to select n random indices
      const allIndices = Array.from({ length: rowCount }, (_, i) => i);
      for (let i = 0; i < n; i++) {
        const j = i + Math.floor(random() * (rowCount - i));
        [allIndices[i], allIndices[j]] = [allIndices[j], allIndices[i]];
        indices.push(allIndices[i]);
      }

      // Add selected rows to the result
      indices.forEach((rowIdx) => {
        columns.forEach((column) => {
          result.columns[column].push(frame.columns[column][rowIdx]);
        });
      });

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
