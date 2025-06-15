// src/io/transformers/nestedToFrame.js

/**
 * Transforms an array of nested objects into a flat array of objects suitable for DataFrame creation.
 * This transformer can handle complex nested structures with arrays and sub-objects.
 *
 * @param {Array} data - Array of nested objects
 * @param {Object} options - Transformation options
 * @param {Object} [options.paths] - Mapping of output field names to dot notation paths in the nested objects
 * @param {Object} [options.aggregations] - Mapping of output field names to aggregation functions for array fields
 * @param {boolean} [options.dynamicTyping=false] - Whether to convert values to appropriate types
 * @returns {Array} Array of flattened objects
 */
export function nestedToFrame(data, options = {}) {
  const { paths = {}, aggregations = {}, dynamicTyping = false } = options;

  if (!Array.isArray(data)) {
    throw new Error('Data must be an array of objects');
  }

  return data.map((item) => {
    const result = {};

    // Process explicit path mappings if provided
    if (Object.keys(paths).length > 0) {
      for (const [outputField, path] of Object.entries(paths)) {
        result[outputField] = getNestedValue(item, path, dynamicTyping);
      }
    } else {
      // Auto-flatten the top level properties if no paths specified
      Object.assign(result, flattenObject(item, '', dynamicTyping));
    }

    // Apply aggregations for array fields
    for (const [outputField, aggregation] of Object.entries(aggregations)) {
      const { path, method, property } = aggregation;
      const arrayValue = getNestedValue(item, path);

      if (!Array.isArray(arrayValue)) {
        result[outputField] = null;
        continue;
      }

      switch (method) {
        case 'count':
          result[outputField] = arrayValue.length;
          break;
        case 'sum':
          result[outputField] = arrayValue.reduce((sum, val) => {
            const propValue = property ? val[property] : val;
            return sum + (Number(propValue) || 0);
          }, 0);
          break;
        case 'avg':
          if (arrayValue.length === 0) {
            result[outputField] = null;
          } else {
            const sum = arrayValue.reduce((acc, val) => {
              const propValue = property ? val[property] : val;
              return acc + (Number(propValue) || 0);
            }, 0);
            result[outputField] = sum / arrayValue.length;
          }
          break;
        case 'min':
          if (arrayValue.length === 0) {
            result[outputField] = null;
          } else {
            result[outputField] = Math.min(
              ...arrayValue.map((val) =>
                property ? Number(val[property]) || 0 : Number(val) || 0,
              ),
            );
          }
          break;
        case 'max':
          if (arrayValue.length === 0) {
            result[outputField] = null;
          } else {
            result[outputField] = Math.max(
              ...arrayValue.map((val) =>
                property ? Number(val[property]) || 0 : Number(val) || 0,
              ),
            );
          }
          break;
        case 'first':
          result[outputField] =
            arrayValue.length > 0
              ? property
                ? arrayValue[0][property]
                : arrayValue[0]
              : null;
          break;
        case 'last':
          result[outputField] =
            arrayValue.length > 0
              ? property
                ? arrayValue[arrayValue.length - 1][property]
                : arrayValue[arrayValue.length - 1]
              : null;
          break;
        case 'join':
          result[outputField] = arrayValue
            .map((val) => (property ? val[property] : val))
            .join(', ');
          break;
        default:
          result[outputField] = null;
      }
    }

    return result;
  });
}

/**
 * Gets a value from a nested object using dot notation path
 *
 * @param {Object} obj - The object to extract value from
 * @param {string} path - Dot notation path (e.g., 'user.name', 'orders[0].amount')
 * @param {boolean} dynamicTyping - Whether to convert values to appropriate types
 * @returns {any} The extracted value
 */
function getNestedValue(obj, path, dynamicTyping = false) {
  if (!obj || !path) return undefined;

  // Handle array indexing with bracket notation
  const parts = path.split(/\.|\[|\]/).filter(Boolean);
  let current = obj;

  for (const part of parts) {
    if (current === null || current === undefined) return undefined;

    // Check if part is a number (array index)
    const index = /^\d+$/.test(part) ? parseInt(part, 10) : part;
    current = current[index];
  }

  return dynamicTyping ? convertType(current) : current;
}

/**
 * Flattens a nested object into a single-level object with dot notation keys
 *
 * @param {Object} obj - The object to flatten
 * @param {string} prefix - Prefix for the keys
 * @param {boolean} dynamicTyping - Whether to convert values to appropriate types
 * @returns {Object} Flattened object
 */
function flattenObject(obj, prefix = '', dynamicTyping = false) {
  const result = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (value === null || value === undefined) {
      result[newKey] = null;
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      // Recursively flatten nested objects
      Object.assign(result, flattenObject(value, newKey, dynamicTyping));
    } else if (
      Array.isArray(value) &&
      value.length > 0 &&
      typeof value[0] === 'object'
    ) {
      // Skip complex arrays - these should be handled via aggregations
      result[newKey] = value;
    } else {
      // Simple value
      result[newKey] = dynamicTyping ? convertType(value) : value;
    }
  }

  return result;
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
