/**
 * Calculates the sum of values in a column.
 *
 * @param {{ validateColumn(frame, column): void }} deps
 * @returns {(frame: TinyFrame, column: string) => number}
 */
export const sum =
  ({ validateColumn }) =>
  (frame, column) => {
    validateColumn(frame, column);

    const values = frame.columns[column];
    let total = 0;

    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      // Skip NaN, null, and undefined values
      if (value === null || value === undefined || Number.isNaN(value)) {
        continue;
      }

      // Ensure value is a number
      const numValue = Number(value);
      if (!Number.isNaN(numValue)) {
        total += numValue;
      }
    }

    return total;
  };
