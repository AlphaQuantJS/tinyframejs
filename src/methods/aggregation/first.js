/**
 * first.js - Gets first value in column
 */

/**
 * first — Gets the first value in a column
 *
 * @param {import('../../createFrame.js').TinyFrame} frame - Input frame
 * @param {string} column - Column name
 * @returns {any} - First value or undefined if column is empty
 */
export const first =
  ({ validateColumn }) =>
    (frame, column) => {
      validateColumn(frame, column);

      // Check for empty frame
      if (frame.rowCount === 0) {
        return undefined; // For empty frame return undefined
      }

      const values = frame.columns[column];

      // Simply return the first element of the array
      if (values.length === 0) {
        return undefined;
      }

      return values[0];
    };
