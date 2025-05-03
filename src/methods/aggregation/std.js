/**
 * Calculates the standard deviation of values in a column.
 * By default, calculates the population standard deviation.
 * Set 'sample' parameter to true for sample standard deviation.
 *
 * @param {{ validateColumn(frame, column): void }} deps
 * @returns {(frame: TinyFrame, column: string, options?: { sample?: boolean }) => number|null}
 */
export const std =
  ({ validateColumn }) =>
  (frame, column, options = {}) => {
    validateColumn(frame, column);

    const values = frame.columns[column];
    const sample = options.sample || false;

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

    // Calculate mean
    let sum = 0;
    for (let i = 0; i < length; i++) {
      sum += numericValues[i];
    }
    const mean = sum / length;

    // Calculate sum of squared differences from the mean
    let sumSquaredDiff = 0;
    for (let i = 0; i < length; i++) {
      const diff = numericValues[i] - mean;
      sumSquaredDiff += diff * diff;
    }

    // For population standard deviation, divide by n
    // For sample standard deviation, divide by (n-1)
    const divisor = sample ? length - 1 : length;

    // Handle edge case: if sample=true and there's only one value
    if (divisor === 0) {
      return null;
    }

    // Calculate standard deviation
    return Math.sqrt(sumSquaredDiff / divisor);
  };
