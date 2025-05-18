/**
 * mean — calculates the arithmetic mean (average) of a column, ignoring NaN/null/undefined
 *
 * @param {import('../../createFrame.js').TinyFrame} frame - Input frame
 * @param {string} column - Column name
 * @returns {number} - Mean value (NaN if no valid values)
 */
export const mean =
  ({ validateColumn }) =>
    (frame, column) => {
      validateColumn(frame, column);
      const arr = frame.columns[column];
      let sum = 0,
        count = 0;
      for (let i = 0; i < arr.length; ++i) {
        const v = arr[i];
        if (v !== null && !Number.isNaN(v)) {
          sum += v;
          count++;
        }
      }
      return count ? sum / count : NaN;
    };
