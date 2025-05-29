/**
 * API Schema Registry for standardizing data from different API sources
 * Provides mapping definitions to convert API-specific formats to standard column names
 */

// Import specific schema mappings
import * as cryptoSchemas from './cryptoSchemas.js';
import * as financeSchemas from './financeSchemas.js';
import * as weatherSchemas from './weatherSchemas.js';

// Export all schemas
export { cryptoSchemas, financeSchemas, weatherSchemas };

// Registry of all available schemas
const schemaRegistry = {
  ...cryptoSchemas,
  ...financeSchemas,
  ...weatherSchemas,
};

/**
 * Clear all registered schemas
 *
 * @returns {void}
 */
export function clearSchemas() {
  // Удаляем все ключи из реестра схем, кроме встроенных схем
  Object.keys(schemaRegistry).forEach((key) => {
    if (!cryptoSchemas[key] && !financeSchemas[key] && !weatherSchemas[key]) {
      delete schemaRegistry[key];
    }
  });
}

/**
 * Get a schema mapping by name
 *
 * @param {string} schemaName - Name of the schema
 * @returns {Object|null} - Schema mapping or null if not found
 */
export function getSchema(schemaName) {
  return schemaRegistry[schemaName] || null;
}

/**
 * Register a new schema mapping
 *
 * @param {string} schemaName - Name of the schema
 * @param {Object} schema - Schema mapping
 * @param {boolean} force - Whether to overwrite existing schema
 * @throws {Error} If schema is invalid or already exists
 */
export function registerSchema(schemaName, schema, force = false) {
  // Validate schema
  if (!schema.name) {
    throw new Error('Schema must have a name');
  }

  if (typeof schema.transform !== 'function') {
    throw new Error('Schema must have a transform function');
  }

  // Check if schema already exists
  if (schemaRegistry[schemaName] && !force) {
    throw new Error(
      `Schema ${schemaName} already exists. Use force=true to overwrite.`,
    );
  }

  schemaRegistry[schemaName] = schema;
}

/**
 * Apply a schema mapping to transform data
 *
 * @param {string} schemaName - Name of the schema
 * @param {Object|Array} data - Data to transform
 * @returns {Object|Array} - Transformed data or original data if schema not found or error
 */
export function applySchema(schemaName, data) {
  try {
    // Get schema mapping
    const schema = getSchema(schemaName);

    if (!schema) {
      return data;
    }

    // Apply transformation function
    return schema.transform(data);
  } catch (error) {
    console.error(`Error applying schema ${schemaName}:`, error);
    return data;
  }
}

/**
 * Apply a schema mapping to a single object
 *
 * @param {Object} obj - Object to transform
 * @param {Object} mapping - Schema mapping
 * @returns {Object} - Transformed object
 */
function applyMappingToObject(obj, mapping) {
  const result = {};

  for (const [targetKey, sourceConfig] of Object.entries(mapping)) {
    if (typeof sourceConfig === 'string') {
      // Simple mapping: targetKey <- sourceKey
      result[targetKey] = getNestedValue(obj, sourceConfig);
    } else if (typeof sourceConfig === 'function') {
      // Function mapping: targetKey <- function(obj)
      result[targetKey] = sourceConfig(obj);
    } else if (sourceConfig && typeof sourceConfig === 'object') {
      // Complex mapping with transformation
      const { path, transform } = sourceConfig;
      const value = getNestedValue(obj, path);
      result[targetKey] = transform ? transform(value, obj) : value;
    }
  }

  return result;
}

/**
 * Get a nested value from an object using a dot-notation path
 *
 * @param {Object} obj - Object to get value from
 * @param {string} path - Dot-notation path (e.g., 'data.items[0].name')
 * @param {*} defaultValue - Default value if path not found
 * @returns {*} - Value at path or defaultValue
 */
function getNestedValue(obj, path, defaultValue = null) {
  if (!obj || !path) {
    return defaultValue;
  }

  // Handle array access in path (e.g., 'items[0]')
  const normalizedPath = path.replace(/\[(\d+)\]/g, '.$1');
  const keys = normalizedPath.split('.');

  let current = obj;

  for (const key of keys) {
    if (current === null || current === undefined || !(key in current)) {
      return defaultValue;
    }
    current = current[key];
  }

  return current !== undefined ? current : defaultValue;
}

/**
 * Transform data using a registered schema
 *
 * @param {Object|Array} data - Data to transform
 * @param {string} schemaName - Name of the schema to apply
 * @returns {Object|Array} - Transformed data or original data if schema not found
 */
export function transformData(data, schemaName) {
  if (!schemaName) {
    return data;
  }

  return applySchema(schemaName, data);
}
