/**
 * Common validators for DataFrame and Series methods
 */

/**
 * Validates that a column exists in the DataFrame
 *
 * @param {DataFrame} df - DataFrame instance
 * @param {string} column - Column name to validate
 * @throws {Error} If column does not exist
 */
export function validateColumn(df, column) {
  const columns = df.columns;
  if (!columns.includes(column)) {
    throw new Error(`Column '${column}' not found`);
  }
}

/**
 * Validates that all columns exist in the DataFrame
 *
 * @param {DataFrame} df - DataFrame instance
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

/**
 * Validates that a value is not null or undefined
 *
 * @param {*} value - Value to validate
 * @param {string} [name='Value'] - Name of the value for error message
 * @throws {Error} If value is null or undefined
 */
export function validateNotNull(value, name = 'Value') {
  if (value === null || value === undefined) {
    throw new Error(`${name} cannot be null or undefined`);
  }
}

/**
 * Validates that a value is a non-empty array
 *
 * @param {Array} array - Array to validate
 * @param {string} [name='Array'] - Name of the array for error message
 * @throws {Error} If array is not an array or is empty
 */
export function validateNonEmptyArray(array, name = 'Array') {
  if (!Array.isArray(array)) {
    throw new Error(`${name} must be an array`);
  }
  if (array.length === 0) {
    throw new Error(`${name} cannot be empty`);
  }
}
