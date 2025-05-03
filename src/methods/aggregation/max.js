/**
 * Finds the maximum value in a column.
 *
 * @param {{ validateColumn(frame, column): void }} deps
 * @returns {(frame: TinyFrame, column: string) => number|null}
 */
export const max =
  ({ validateColumn }) =>
  (frame, column) => {
    validateColumn(frame, column);

    const values = frame.columns[column];
    let maxValue = -Infinity;
    let hasValidValue = false;

    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      // Skip NaN, null, and undefined values
      if (value === null || value === undefined || Number.isNaN(value)) {
        continue;
      }

      // Ensure value is a number
      const numValue = Number(value);
      if (!Number.isNaN(numValue)) {
        maxValue = Math.max(maxValue, numValue);
        hasValidValue = true;
      }
    }

    // Return null if no valid values were found
    return hasValidValue ? maxValue : null;
  };
