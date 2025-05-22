// src/viz/utils/validation.js

/**
 * Utility functions for validating visualization inputs
 */

/**
 * Validates that the input is a DataFrame instance
 * @param {Object} dataFrame - Object to validate
 * @throws {Error} If input is not a DataFrame
 */
export function validateDataFrame(dataFrame) {
  if (!dataFrame || typeof dataFrame !== 'object' || !dataFrame.toArray) {
    throw new Error('Input must be a DataFrame instance');
  }
}

/**
 * Validates column existence in a DataFrame
 * @param {Object} dataFrame - DataFrame instance
 * @param {string} column - Column name to check
 * @throws {Error} If column doesn't exist
 */
export function validateColumn(dataFrame, column) {
  if (!dataFrame.hasColumn(column)) {
    throw new Error(`Column "${column}" does not exist in DataFrame`);
  }
}

/**
 * Validates multiple columns existence in a DataFrame
 * @param {Object} dataFrame - DataFrame instance
 * @param {string[]} columns - Column names to check
 * @throws {Error} If any column doesn't exist
 */
export function validateColumns(dataFrame, columns) {
  if (!Array.isArray(columns)) {
    throw new Error('Columns must be an array');
  }

  for (const column of columns) {
    validateColumn(dataFrame, column);
  }
}

/**
 * Validates chart options
 * @param {Object} options - Chart options
 * @param {Object} requiredFields - Required fields and their types
 * @throws {Error} If required fields are missing or have wrong type
 */
export function validateChartOptions(options, requiredFields) {
  if (!options || typeof options !== 'object') {
    throw new Error('Options must be an object');
  }

  for (const [field, type] of Object.entries(requiredFields)) {
    if (options[field] === undefined) {
      throw new Error(`Required option "${field}" is missing`);
    }

    if (type === 'string' && typeof options[field] !== 'string') {
      throw new Error(`Option "${field}" must be a string`);
    }

    if (type === 'array' && !Array.isArray(options[field])) {
      throw new Error(`Option "${field}" must be an array`);
    }

    if (type === 'number' && typeof options[field] !== 'number') {
      throw new Error(`Option "${field}" must be a number`);
    }

    if (type === 'boolean' && typeof options[field] !== 'boolean') {
      throw new Error(`Option "${field}" must be a boolean`);
    }

    if (
      type === 'object' &&
      (typeof options[field] !== 'object' || options[field] === null)
    ) {
      throw new Error(`Option "${field}" must be an object`);
    }
  }
}

/**
 * Validates export options
 * @param {Object} options - Export options
 * @throws {Error} If options are invalid
 */
export function validateExportOptions(options) {
  if (!options || typeof options !== 'object') {
    throw new Error('Export options must be an object');
  }

  if (options.format && typeof options.format !== 'string') {
    throw new Error('Format must be a string');
  }

  if (options.width && typeof options.width !== 'number') {
    throw new Error('Width must be a number');
  }

  if (options.height && typeof options.height !== 'number') {
    throw new Error('Height must be a number');
  }

  if (options.format) {
    const supportedFormats = ['png', 'jpeg', 'jpg', 'pdf', 'svg'];
    if (!supportedFormats.includes(options.format.toLowerCase())) {
      throw new Error(
        `Unsupported format: ${options.format}. Supported formats are: ${supportedFormats.join(', ')}`,
      );
    }
  }
}
