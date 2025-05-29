/**
 * Schema validator for data transformations
 * Validates data against schema definitions to ensure integrity
 */

/**
 * Schema field type definitions
 */
const FIELD_TYPES = {
  STRING: 'string',
  NUMBER: 'number',
  INTEGER: 'integer',
  BOOLEAN: 'boolean',
  DATE: 'date',
  OBJECT: 'object',
  ARRAY: 'array',
  ANY: 'any',
};

/**
 * Schema field definition
 *
 * @typedef {Object} SchemaField
 * @property {string} type - Field type (string, number, integer, boolean, date, object, array, any)
 * @property {boolean} [required=false] - Whether the field is required
 * @property {*} [defaultValue] - Default value if field is missing
 * @property {Function} [validate] - Custom validation function
 * @property {number} [minLength] - Minimum length for strings or arrays
 * @property {number} [maxLength] - Maximum length for strings or arrays
 * @property {number} [min] - Minimum value for numbers
 * @property {number} [max] - Maximum value for numbers
 * @property {RegExp} [pattern] - Regex pattern for strings
 * @property {Array} [enum] - Allowed values
 * @property {Object} [properties] - Nested object properties schema
 * @property {Object} [items] - Array items schema
 */

/**
 * Schema definition
 *
 * @typedef {Object.<string, SchemaField>} Schema
 */

/**
 * Validation error
 */
class ValidationError extends Error {
  /**
   * Create a validation error
   *
   * @param {string} message - Error message
   * @param {string} [field] - Field name that failed validation
   * @param {*} [value] - Value that failed validation
   */
  constructor(message, field, value) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
  }
}

/**
 * Validates a value against a field schema
 *
 * @param {*} value - Value to validate
 * @param {SchemaField} fieldSchema - Field schema
 * @param {string} fieldName - Field name
 * @throws {ValidationError} If validation fails
 */
function validateField(value, fieldSchema, fieldName) {
  // Check if field is required
  if (value === undefined || value === null) {
    if (fieldSchema.required) {
      throw new ValidationError(
        `Field '${fieldName}' is required`,
        fieldName,
        value,
      );
    }

    // If not required and missing, use default value if available
    if (fieldSchema.defaultValue !== undefined) {
      return fieldSchema.defaultValue;
    }

    // Not required and no default, so it's valid to be missing
    return value;
  }

  // Type validation
  switch (fieldSchema.type) {
  case FIELD_TYPES.STRING:
    if (typeof value !== 'string') {
      throw new ValidationError(
        `Field '${fieldName}' must be a string`,
        fieldName,
        value,
      );
    }

    // String-specific validations
    if (
      fieldSchema.minLength !== undefined &&
        value.length < fieldSchema.minLength
    ) {
      throw new ValidationError(
        `Field '${fieldName}' must be at least ${fieldSchema.minLength} characters long`,
        fieldName,
        value,
      );
    }

    if (
      fieldSchema.maxLength !== undefined &&
        value.length > fieldSchema.maxLength
    ) {
      throw new ValidationError(
        `Field '${fieldName}' must be at most ${fieldSchema.maxLength} characters long`,
        fieldName,
        value,
      );
    }

    if (fieldSchema.pattern && !fieldSchema.pattern.test(value)) {
      throw new ValidationError(
        `Field '${fieldName}' does not match required pattern`,
        fieldName,
        value,
      );
    }
    break;

  case FIELD_TYPES.NUMBER:
    if (typeof value !== 'number' || isNaN(value)) {
      throw new ValidationError(
        `Field '${fieldName}' must be a number`,
        fieldName,
        value,
      );
    }

    // Number-specific validations
    if (fieldSchema.min !== undefined && value < fieldSchema.min) {
      throw new ValidationError(
        `Field '${fieldName}' must be at least ${fieldSchema.min}`,
        fieldName,
        value,
      );
    }

    if (fieldSchema.max !== undefined && value > fieldSchema.max) {
      throw new ValidationError(
        `Field '${fieldName}' must be at most ${fieldSchema.max}`,
        fieldName,
        value,
      );
    }
    break;

  case FIELD_TYPES.INTEGER:
    if (
      typeof value !== 'number' ||
        isNaN(value) ||
        !Number.isInteger(value)
    ) {
      throw new ValidationError(
        `Field '${fieldName}' must be an integer`,
        fieldName,
        value,
      );
    }

    // Integer-specific validations
    if (fieldSchema.min !== undefined && value < fieldSchema.min) {
      throw new ValidationError(
        `Field '${fieldName}' must be at least ${fieldSchema.min}`,
        fieldName,
        value,
      );
    }

    if (fieldSchema.max !== undefined && value > fieldSchema.max) {
      throw new ValidationError(
        `Field '${fieldName}' must be at most ${fieldSchema.max}`,
        fieldName,
        value,
      );
    }
    break;

  case FIELD_TYPES.BOOLEAN:
    if (typeof value !== 'boolean') {
      throw new ValidationError(
        `Field '${fieldName}' must be a boolean`,
        fieldName,
        value,
      );
    }
    break;

  case FIELD_TYPES.DATE:
    if (!(value instanceof Date) || isNaN(value.getTime())) {
      throw new ValidationError(
        `Field '${fieldName}' must be a valid date`,
        fieldName,
        value,
      );
    }
    break;

  case FIELD_TYPES.OBJECT:
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw new ValidationError(
        `Field '${fieldName}' must be an object`,
        fieldName,
        value,
      );
    }

    // Validate nested object properties
    if (fieldSchema.properties) {
      validateObject(value, fieldSchema.properties, `${fieldName}.`);
    }
    break;

  case FIELD_TYPES.ARRAY:
    if (!Array.isArray(value)) {
      throw new ValidationError(
        `Field '${fieldName}' must be an array`,
        fieldName,
        value,
      );
    }

    // Array-specific validations
    if (
      fieldSchema.minLength !== undefined &&
        value.length < fieldSchema.minLength
    ) {
      throw new ValidationError(
        `Field '${fieldName}' must contain at least ${fieldSchema.minLength} items`,
        fieldName,
        value,
      );
    }

    if (
      fieldSchema.maxLength !== undefined &&
        value.length > fieldSchema.maxLength
    ) {
      throw new ValidationError(
        `Field '${fieldName}' must contain at most ${fieldSchema.maxLength} items`,
        fieldName,
        value,
      );
    }

    // Validate array items
    if (fieldSchema.items) {
      value.forEach((item, index) => {
        try {
          validateField(item, fieldSchema.items, `${fieldName}[${index}]`);
        } catch (error) {
          throw new ValidationError(
            `Invalid item at index ${index} in array '${fieldName}': ${error.message}`,
            `${fieldName}[${index}]`,
            item,
          );
        }
      });
    }
    break;

  case FIELD_TYPES.ANY:
    // No type validation needed
    break;

  default:
    throw new ValidationError(
      `Unknown field type '${fieldSchema.type}' for field '${fieldName}'`,
      fieldName,
      value,
    );
  }

  // Enum validation
  if (fieldSchema.enum && !fieldSchema.enum.includes(value)) {
    throw new ValidationError(
      `Field '${fieldName}' must be one of: ${fieldSchema.enum.join(', ')}`,
      fieldName,
      value,
    );
  }

  // Custom validation
  if (fieldSchema.validate && typeof fieldSchema.validate === 'function') {
    try {
      const isValid = fieldSchema.validate(value);
      if (isValid !== true) {
        throw new ValidationError(
          typeof isValid === 'string' ?
            isValid :
            `Field '${fieldName}' failed custom validation`,
          fieldName,
          value,
        );
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }

      throw new ValidationError(
        `Field '${fieldName}' failed custom validation: ${error.message}`,
        fieldName,
        value,
      );
    }
  }

  return value;
}

/**
 * Validates an object against a schema
 *
 * @param {Object} obj - Object to validate
 * @param {Schema} schema - Schema definition
 * @param {string} [prefix=''] - Field name prefix for nested objects
 * @returns {Object} - Validated object with default values applied
 * @throws {ValidationError} If validation fails
 */
function validateObject(obj, schema, prefix = '') {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    throw new ValidationError('Input must be an object', '', obj);
  }

  const result = { ...obj };

  // Validate each field in the schema
  for (const [fieldName, fieldSchema] of Object.entries(schema)) {
    const fullFieldName = prefix + fieldName;
    const value = obj[fieldName];

    try {
      const validatedValue = validateField(value, fieldSchema, fullFieldName);

      // Apply default value if field is missing and has a default
      if (value === undefined && validatedValue !== undefined) {
        result[fieldName] = validatedValue;
      }
    } catch (error) {
      throw error;
    }
  }

  return result;
}

/**
 * Creates a schema validator function
 *
 * @param {Schema} schema - Schema definition
 * @param {Object} [options] - Validation options
 * @param {boolean} [options.strict=false] - Whether to fail on unknown fields
 * @param {boolean} [options.applyDefaults=true] - Whether to apply default values
 * @returns {Function} - Validator function
 */
export function createValidator(schema, options = {}) {
  const { strict = false, applyDefaults = true } = options;

  return function validate(data) {
    // Handle array of objects
    if (Array.isArray(data)) {
      return data.map((item, index) => {
        try {
          return validateObject(item, schema);
        } catch (error) {
          error.message = `Validation failed at index ${index}: ${error.message}`;
          throw error;
        }
      });
    }

    // Handle single object
    return validateObject(data, schema);
  };
}

/**
 * Creates a column validator for DataFrame
 *
 * @param {Object} columnSchema - Schema for DataFrame columns
 * @returns {Function} - Validator function
 */
export function createColumnValidator(columnSchema) {
  return function validateColumns(df) {
    // Check required columns
    for (const [columnName, schema] of Object.entries(columnSchema)) {
      if (schema.required && !df.columns.includes(columnName)) {
        throw new ValidationError(
          `Required column '${columnName}' is missing`,
          columnName,
        );
      }
    }

    // Check column types
    for (const column of df.columns) {
      const schema = columnSchema[column];

      // Skip validation for columns not in schema
      if (!schema) continue;

      // Validate column values
      const values = df.col(column).toArray();

      for (let i = 0; i < values.length; i++) {
        try {
          validateField(values[i], schema, column);
        } catch (error) {
          throw new ValidationError(
            `Invalid value at row ${i} in column '${column}': ${error.message}`,
            column,
            values[i],
          );
        }
      }
    }

    return true;
  };
}

/**
 * Exports field types for easy schema creation
 */
export { FIELD_TYPES };

/**
 * Export ValidationError class
 */
export { ValidationError };
