/**
 * Validates that a column exists in the DataFrame
 *
 * @param {object} df - DataFrame instance
 * @param {string} column - Column name to validate
 * @throws {Error} If column does not exist
 */
export function validateColumn(df, column) {
  const columns = df.columns;
  if (!columns.includes(column)) {
    throw new Error(`Column '${column}' not found`);
  }
}
