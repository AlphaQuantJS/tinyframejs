/**
 * Calculates the median value in a column.
 *
 * @param {{ validateColumn(frame, column): void }} deps
 * @returns {(frame: TinyFrame, column: string) => number|null}
 */
export const median =
  ({ validateColumn }) =>
  (frame, column) => {
    validateColumn(frame, column);

    const values = frame.columns[column];

    // Filter out non-numeric values and convert to numbers
    const numericValues = [];
    for (let i = 0; i < values.length; i++) {
      const value = values[i];
      if (value === null || value === undefined || Number.isNaN(value)) {
        continue;
      }

      const numValue = Number(value);
      if (!Number.isNaN(numValue)) {
        numericValues.push(numValue);
      }
    }

    const length = numericValues.length;
    if (length === 0) {
      return null;
    }

    // Sort the values
    numericValues.sort((a, b) => a - b);

    // Calculate median
    const mid = Math.floor(length / 2);

    if (length % 2 === 0) {
      // Even number of elements, average the middle two
      return (numericValues[mid - 1] + numericValues[mid]) / 2;
    } else {
      // Odd number of elements, return the middle one
      return numericValues[mid];
    }
  };
