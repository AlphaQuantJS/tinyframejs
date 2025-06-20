/**
 * Validates that a DataFrame has data (both columns and rows)
 *
 * @param {object} df - DataFrame instance
 * @param {string} [operation='Operation'] - Name of the operation for error message
 * @throws {Error} If DataFrame has no columns or rows
 */
export function validateFrameHasData(df, operation = 'Operation') {
  if (!df.columns || df.columns.length === 0) {
    throw new Error(`${operation} requires DataFrame with columns`);
  }
  if (df.rowCount === 0) {
    throw new Error(`${operation} requires DataFrame with data`);
  }
}
