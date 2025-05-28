/**
 * Sort a DataFrame by a column
 *
 * @param {Object} options - Options object
 * @param {Function} options.validateColumn - Function to validate column existence
 * @returns {Function} - Function that takes a DataFrame and column name and returns a sorted DataFrame
 */
export const sort =
  ({ validateColumn }) =>
    (frame, column, options = {}) => {
    // Validate column
      validateColumn(frame, column);

      // Get column values
      const arr = frame.columns[column];

      // Create indices and sort them by column values
      const sortedIndices = [...Array(arr.length).keys()].sort((a, b) => {
        const valA = arr[a];
        const valB = arr[b];

        // Handle null, undefined, and NaN values
        if (
          valA === null ||
        valA === undefined ||
        (typeof valA === 'number' && isNaN(valA))
        ) {
          return 1; // Move nulls to the end
        }
        if (
          valB === null ||
        valB === undefined ||
        (typeof valB === 'number' && isNaN(valB))
        ) {
          return -1; // Move nulls to the end
        }

        // Default ascending sort
        return options.descending ? valB - valA : valA - valB;
      });

      // Create a new object to hold the sorted columns
      const sortedColumns = {};

      // Sort each column using the sorted indices
      for (const colName of Object.keys(frame.columns)) {
        const colValues = frame.columns[colName];
        sortedColumns[colName] = sortedIndices.map((i) => colValues[i]);
      }

      // Create a new DataFrame with the sorted columns
      // Note: Using constructor directly instead of frame.clone() which doesn't exist
      return new frame.constructor(sortedColumns);
    };

export default { sort };
