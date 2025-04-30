// methods/aggregation/methods/sort.js

import { createFrame } from '../../core/createFrame.js';

/**
 * sort — returns a new TinyFrame with rows sorted by the specified column (ascending)
 *
 * @param {import('../../core/createFrame.js').TinyFrame} frame - Input frame
 * @param {string} column - Column name
 * @returns {import('../../core/createFrame.js').TinyFrame} - Sorted TinyFrame
 */
export const sort =
  ({ validateColumn }) =>
  (frame, column) => {
    validateColumn(frame, column);
    const arr = frame.columns[column];

    // Create indices array
    const indices = Array.from(arr.keys());

    // Sort indices with a comparator that handles NaN and null values properly
    // NaN and null values will be placed at the end
    const sortedIndices = indices.sort((a, b) => {
      const valA = arr[a];
      const valB = arr[b];

      // Handle special cases
      if (valA === null || Number.isNaN(valA)) {
        return valB === null || Number.isNaN(valB) ? 0 : 1; // Both special or A special
      }
      if (valB === null || Number.isNaN(valB)) {
        return -1; // Only B special
      }

      // Normal numeric comparison
      return valA - valB;
    });

    // Create a new frame with the same structure but empty columns
    const sortedFrame = {
      columns: {},
      rowCount: frame.rowCount,
      columnNames: [...frame.columnNames],
      dtypes: { ...frame.dtypes },
    };

    // Fill the new frame with sorted data
    for (const col of Object.keys(frame.columns)) {
      sortedFrame.columns[col] = sortedIndices.map(
        (i) => frame.columns[col][i],
      );
    }

    return sortedFrame;
  };
