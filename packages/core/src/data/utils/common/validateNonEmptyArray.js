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
