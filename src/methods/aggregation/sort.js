// methods/aggregation/methods/sort.js

/**
 * sort — returns a new TinyFrame with rows sorted by the specified column (ascending)
 *
 * @param {import('../../createFrame.js').TinyFrame} frame - Input frame
 * @param {string} column - Column name
 * @returns {import('../../createFrame.js').TinyFrame} - Sorted TinyFrame
 */
export const sort =
  ({ validateColumn }) =>
  (frame, column) => {
    validateColumn(frame, column);
    const arr = frame.columns[column];
    const sortedIndices = [...arr.keys()].sort((a, b) => arr[a] - arr[b]);
    const sortedFrame = frame.clone();
    for (const col of Object.keys(frame.columns)) {
      sortedFrame.columns[col] = sortedIndices.map(
        (i) => frame.columns[col][i],
      );
    }
    return sortedFrame;
  };
