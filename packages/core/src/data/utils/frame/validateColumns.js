/**
 * Validates that all columns exist in the DataFrame
 *
 * @param {object} df - DataFrame instance
 * @param {string[]} columns - Column names to validate
 * @throws {Error} If any column does not exist
 */
export function validateColumns(df, columns) {
  const dfColumns = df.columns;
  for (const column of columns) {
    if (!dfColumns.includes(column)) {
      throw new Error(`Column '${column}' not found`);
    }
  }
}
