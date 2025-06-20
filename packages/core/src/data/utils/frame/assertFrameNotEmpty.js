/**
 * Asserts that a DataFrame is not empty
 *
 * @param {object} df - DataFrame instance
 * @throws {Error} If DataFrame has no rows or columns
 */
export function assertFrameNotEmpty(df) {
  if (!df.columns || df.columns.length === 0) {
    throw new Error('DataFrame has no columns');
  }
  if (df.rowCount === 0) {
    throw new Error('DataFrame has no rows');
  }
}
