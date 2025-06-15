// src/io/transformers/rowsToObjects.js

/**
 * Transforms array of rows and column headers into an array of objects.
 * This is a common operation when working with data from CSV files or spreadsheets.
 *
 * @param {Array} rows - Array of data rows
 * @param {Array} columns - Array of column names
 * @param {Object} options - Transformation options
 * @param {boolean} [options.skipNulls=false] - Whether to skip null/undefined values
 * @param {boolean} [options.dynamicTyping=false] - Whether to convert values to appropriate types
 * @returns {Array} Array of objects where each object represents a row
 */
export function rowsToObjects(rows, columns, options = {}) {
  const { skipNulls = false, dynamicTyping = false } = options;

  if (!Array.isArray(rows) || !Array.isArray(columns)) {
    throw new Error('Both rows and columns must be arrays');
  }

  return rows.map((row) => {
    const obj = {};
    columns.forEach((col, i) => {
      // Skip null/undefined values if skipNulls is true
      if (skipNulls && (row[i] === null || row[i] === undefined)) {
        return;
      }

      // Apply dynamic typing if enabled
      let value = row[i];
      if (dynamicTyping) {
        value = convertType(value);
      }

      obj[col] = value;
    });
    return obj;
  });
}

/**
 * Converts a value to its appropriate JavaScript type
 *
 * @param {any} value - The value to convert
 * @returns {any} The converted value
 */
function convertType(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (typeof value !== 'string') {
    return value;
  }

  // Try to convert to number
  if (!isNaN(value) && value.trim() !== '') {
    const num = Number(value);
    // Check if it's an integer or float
    return Number.isInteger(num) ? parseInt(value, 10) : num;
  }

  // Convert boolean strings
  if (value.toLowerCase() === 'true') return true;
  if (value.toLowerCase() === 'false') return false;

  // Return as string if no conversion applies
  return value;
}
