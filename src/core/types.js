/**
 * Type definitions and type checking utilities for TinyFrameJS
 */

/**
 * Enum for data types supported by TinyFrameJS
 * @enum {string}
 */
export const DataType = {
  NUMBER: 'number',
  STRING: 'string',
  BOOLEAN: 'boolean',
  DATE: 'date',
  OBJECT: 'object',
  ARRAY: 'array',
  NULL: 'null',
  UNDEFINED: 'undefined',
};

/**
 * Enum for storage types supported by TinyFrameJS
 * @enum {string}
 */
export const StorageType = {
  TYPED_ARRAY: 'typedarray',
  ARROW: 'arrow',
  ARRAY: 'array',
};

/**
 * Determines the data type of a value
 *
 * @param {*} value - Value to check
 * @returns {string} - Type name as string
 */
export function getType(value) {
  if (value === null) return DataType.NULL;
  if (value === undefined) return DataType.UNDEFINED;
  if (typeof value === 'number') return DataType.NUMBER;
  if (typeof value === 'string') return DataType.STRING;
  if (typeof value === 'boolean') return DataType.BOOLEAN;
  if (value instanceof Date) return DataType.DATE;
  if (Array.isArray(value)) return DataType.ARRAY;
  return DataType.OBJECT;
}

/**
 * Checks if a value is numeric (can be converted to a number)
 *
 * @param {*} value - Value to check
 * @returns {boolean} - True if value is numeric
 */
export function isNumeric(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'number') return !isNaN(value);
  if (typeof value === 'string') {
    return !isNaN(value) && !isNaN(parseFloat(value));
  }
  return false;
}

/**
 * Checks if a value is a date or can be converted to a date
 *
 * @param {*} value - Value to check
 * @returns {boolean} - True if value is a date
 */
export function isDate(value) {
  if (value instanceof Date) return true;
  if (typeof value === 'string') {
    const date = new Date(value);
    return !isNaN(date.getTime());
  }
  return false;
}
