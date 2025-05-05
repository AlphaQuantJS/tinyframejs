// src/methods/filtering/stratifiedSample.js

/**
 * Creates a function that selects a stratified sample of rows from a DataFrame.
 * Maintains the proportion of values in a specific column.
 *
 * @param {Object} deps - Dependencies
 * @param {Function} deps.validateColumn - Function to validate column names
 * @returns {Function} Function that selects a stratified sample of rows
 */
export const stratifiedSample =
  ({ validateColumn }) =>
  (frame, stratifyColumn, fraction, options = {}) => {
    // Validate input
    validateColumn(frame, stratifyColumn);

    if (typeof fraction !== 'number' || fraction <= 0 || fraction > 1) {
      throw new Error('Fraction must be a number between 0 and 1');
    }

    // Get all column names
    const columns = Object.keys(frame.columns);

    // Get the number of rows
    const rowCount = frame.columns[columns[0]]?.length || 0;

    // Create a new frame with the same columns
    const result = {
      columns: {},
    };

    // Initialize columns in the result
    columns.forEach((column) => {
      result.columns[column] = [];
    });

    // Group rows by the values in the stratify column
    const groups = {};
    const stratifyValues = frame.columns[stratifyColumn];

    for (let i = 0; i < rowCount; i++) {
      const value = stratifyValues[i];
      const key = String(value); // Convert to string for object key

      if (!groups[key]) {
        groups[key] = [];
      }

      groups[key].push(i);
    }

    // Use a seeded random number generator if seed is provided
    const { seed } = options;
    const random =
      seed !== undefined // Simple seeded random function
        ? (() => {
            let s = seed;
            return () => {
              s = (s * 9301 + 49297) % 233280;
              return s / 233280;
            };
          })()
        : Math.random;

    // Select rows from each group based on the fraction
    const selectedIndices = [];

    Object.values(groups).forEach((groupIndices) => {
      const groupSize = groupIndices.length;
      const sampleSize = Math.max(1, Math.round(groupSize * fraction));

      // Shuffle the group indices
      for (let i = groupSize - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [groupIndices[i], groupIndices[j]] = [groupIndices[j], groupIndices[i]];
      }

      // Select the first sampleSize indices
      selectedIndices.push(...groupIndices.slice(0, sampleSize));
    });

    // Add selected rows to the result
    selectedIndices.forEach((rowIdx) => {
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
