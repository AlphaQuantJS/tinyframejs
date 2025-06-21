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
