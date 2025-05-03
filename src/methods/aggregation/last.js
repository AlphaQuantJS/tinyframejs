/**
 * Returns the last value in a column.
 *
 * @param {{ validateColumn(frame, column): void }} deps
 * @returns {(frame: TinyFrame, column: string) => any}
 */
export const last =
  ({ validateColumn }) =>
  (frame, column) => {
    validateColumn(frame, column);

    const values = frame.columns[column];
    const length = values.length;

    if (length === 0) {
      return null;
    }

    return values[length - 1];
  };
