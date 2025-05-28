/**
 * Utility functions for type checking
 */

/**
 * Checks if a value is a number (including numeric strings)
 *
 * @param {any} value - Value to check
 * @returns {boolean} - True if value is a number or can be converted to a number
 */
export function isNumeric(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'number') return !isNaN(value);
  return !isNaN(parseFloat(value)) && isFinite(value);
}

/**
 * Checks if a value is a string
 *
 * @param {any} value - Value to check
 * @returns {boolean} - True if value is a string
 */
export function isString(value) {
  return typeof value === 'string' || value instanceof String;
}

/**
 * Checks if a value is an array
 *
 * @param {any} value - Value to check
 * @returns {boolean} - True if value is an array
 */
export function isArray(value) {
  return Array.isArray(value);
}

/**
 * Checks if a value is an object (not null, not array)
 *
 * @param {any} value - Value to check
 * @returns {boolean} - True if value is an object
 */
export function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Checks if a value is a function
 *
 * @param {any} value - Value to check
 * @returns {boolean} - True if value is a function
 */
export function isFunction(value) {
  return typeof value === 'function';
}

/**
 * Checks if a value is a date
 *
 * @param {any} value - Value to check
 * @returns {boolean} - True if value is a date
 */
export function isDate(value) {
  return value instanceof Date && !isNaN(value);
}

/**
 * Checks if a value is null or undefined
 *
 * @param {any} value - Value to check
 * @returns {boolean} - True if value is null or undefined
 */
export function isNullOrUndefined(value) {
  return value === null || value === undefined;
}

export default {
  isNumeric,
  isString,
  isArray,
  isObject,
  isFunction,
  isDate,
  isNullOrUndefined,
};
