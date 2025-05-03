/**
 * Finds the most frequent value in a column.
 * If multiple values have the same highest frequency, returns the first one encountered.
 *
 * @param {{ validateColumn(frame, column): void }} deps
 * @returns {(frame: TinyFrame, column: string) => any|null}
 */
export const mode =
  ({ validateColumn }) =>
  (frame, column) => {
    validateColumn(frame, column);

    const values = frame.columns[column];
    const length = values.length;

    if (length === 0) {
      return null;
    }

    // Count frequency of each value
    const counts = new Map();
    let maxCount = 0;
    let modeValue = null;
    let hasValidValue = false;

    for (let i = 0; i < length; i++) {
      const value = values[i];

      // Skip NaN, null, and undefined values
      if (value === null || value === undefined || Number.isNaN(value)) {
        continue;
      }

      hasValidValue = true;

      // Get current count or initialize to 0
      const count = counts.get(value) || 0;
      const newCount = count + 1;

      // Update the map with new count
      counts.set(value, newCount);

      // Update mode if this value has a higher frequency
      if (newCount > maxCount) {
        maxCount = newCount;
        modeValue = value;
      }
    }

    return hasValidValue ? modeValue : null;
  };
