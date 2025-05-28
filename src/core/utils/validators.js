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

/**
 * Validates that a value matches the specified type
 *
 * @param {*} value - Value to validate
 * @param {string} expectedType - Expected type ('number', 'string', 'array', 'object', 'function')
 * @param {string} paramName - Parameter name for error message
 * @throws {Error} If value does not match the expected type
 */
export function validateType(value, expectedType, paramName) {
  let isValid = false;

  switch (expectedType.toLowerCase()) {
  case 'number':
    isValid = typeof value === 'number' && !isNaN(value);
    break;
  case 'string':
    isValid = typeof value === 'string';
    break;
  case 'array':
    isValid = Array.isArray(value);
    break;
  case 'object':
    isValid =
        value !== null && typeof value === 'object' && !Array.isArray(value);
    break;
  case 'function':
    isValid = typeof value === 'function';
    break;
  default:
    throw new Error(`Unknown expected type: ${expectedType}`);
  }

  if (!isValid) {
    throw new Error(`Parameter '${paramName}' must be a ${expectedType}`);
  }
}

/**
 * Checks if the input data is suitable for creating a DataFrame
 * Valid formats:
 *   • Array<Object>               — array of objects
 *   • Record<string, Array|TypedArray>
 *   • Already existing TinyFrame / DataFrame
 *
 * @param {*} data - Data to validate
 * @throws {Error} If data is not in a valid format
 */
export function validateInput(data) {
  // 1) null / undefined
  if (data === null || data === undefined) {
    throw new Error('Input data must not be null/undefined');
  }

  // 2) DataFrame / TinyFrame passthrough
  if (data?._columns && data?.rowCount !== undefined) return;

  // 3) Array of rows
  if (Array.isArray(data)) {
    if (data.length === 0) {
      throw new Error('Input array is empty');
    }
    if (
      !data.every(
        (row) => row && typeof row === 'object' && !Array.isArray(row),
      )
    ) {
      throw new Error('Each element of array must be a plain object (row)');
    }
    return;
  }

  // 4) Object of columns
  if (typeof data === 'object') {
    const values = Object.values(data);
    if (
      values.length > 0 &&
      values.every((col) => Array.isArray(col) || ArrayBuffer.isView(col))
    ) {
      // additional check for equal length
      const len = values[0].length;
      const sameLen = values.every((col) => col.length === len);
      if (!sameLen) {
        throw new Error('All columns must have equal length');
      }
      return;
    }
  }

  // 5) Any other input — error
  throw new Error(
    'Unsupported input format: expected array of objects or object of arrays',
  );
}
