// src/io/readers/json.js

import { DataFrame } from '../../core/DataFrame.js';
// For compatibility with ESM and CommonJS
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

/**
 * Converts values to appropriate types based on content.
 * Handles conversion to: boolean, number (integer/float), or formatted date string (YYYY-MM-DD).
 * Empty values, null, and undefined are converted based on the emptyValue parameter.
 *
 * @param {any} value - The value to convert
 * @param {any} [emptyValue=undefined] - Value to use for empty/null values (undefined, 0, null, or NaN)
 * @returns {any} The converted value with appropriate type
 */
function convertType(value, emptyValue = undefined) {
  /**
   * Formats a Date object to YYYY-MM-DD string format
   * @param {Date} date - The date to format
   * @returns {string} Formatted date string in YYYY-MM-DD format
   */
  function formatDateToYYYYMMDD(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Special cases with early returns
  if (value === null || value === undefined || value === '') return emptyValue;
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return value;

  // Handle Date objects
  if (value instanceof Date && !isNaN(value.getTime())) {
    return formatDateToYYYYMMDD(value);
  }

  // String conversion with type detection
  if (typeof value === 'string') {
    const trimmed = value.trim();
    const lowerValue = trimmed.toLowerCase();

    // Type detection map - each entry has a test and conversion function
    const typeDetectors = [
      // Boolean values
      {
        test: () => lowerValue === 'true' || lowerValue === 'false',
        convert: () => lowerValue === 'true',
      },
      // Numeric values
      {
        test: () => !isNaN(trimmed) && trimmed !== '',
        convert: () => {
          const intValue = parseInt(trimmed, 10);
          return intValue.toString() === trimmed
            ? intValue
            : parseFloat(trimmed);
        },
      },
      // Date values - includes detection for various date formats
      {
        test: () => {
          // ISO date format
          if (
            /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/.test(trimmed)
          )
            return true;
          // Date string with GMT or timezone
          if (/\d{4}.*GMT|\+\d{4}/.test(trimmed)) return true;
          return false;
        },
        convert: () => {
          const date = new Date(trimmed);
          if (!isNaN(date.getTime())) {
            return formatDateToYYYYMMDD(date);
          }
          return trimmed;
        },
      },
    ];

    // Find and apply the first matching detector
    const detector = typeDetectors.find((d) => d.test());
    if (detector) return detector.convert();
  }

  // Default - return value as is
  return value;
}

/**
 * Source handlers for different types of JSON sources.
 * Each handler has a canHandle function to check if it can handle the source,
 * and a getContent function to extract the content from the source.
 */
const sourceHandlers = [
  // String JSON content handler
  {
    canHandle: (src) =>
      typeof src === 'string' &&
      !src.includes('/') &&
      !src.includes('\\') &&
      (src.startsWith('{') || src.startsWith('[')),
    getContent: (src) => src,
  },
  // File path handler (Node.js)
  {
    canHandle: (src) =>
      typeof src === 'string' &&
      (src.includes('/') || src.includes('\\')) &&
      typeof process !== 'undefined' &&
      process.versions &&
      process.versions.node,
    getContent: async (src) => {
      const fs = require('fs').promises;
      return await fs.readFile(src, 'utf8');
    },
  },
  // URL handler
  {
    canHandle: (src) =>
      typeof src === 'string' &&
      (src.startsWith('http://') || src.startsWith('https://')),
    getContent: async (src) => {
      const response = await fetch(src);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${src}: ${response.statusText}`);
      }
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text();
      }
    },
  },
  // Browser File/Blob handler
  {
    canHandle: (src) =>
      (typeof File !== 'undefined' && src instanceof File) ||
      (typeof Blob !== 'undefined' && src instanceof Blob),
    getContent: (src) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) =>
          reject(new Error(`Error reading file: ${error}`));
        reader.readAsText(src);
      }),
  },
  // Object handler (already parsed JSON)
  {
    canHandle: (src) =>
      src !== null &&
      typeof src === 'object' &&
      !(typeof File !== 'undefined' && src instanceof File) &&
      !(typeof Blob !== 'undefined' && src instanceof Blob),
    getContent: (src) => src,
  },
];

/**
 * Reads JSON content and returns a DataFrame.
 * Uses native JSON parsing capabilities of JavaScript.
 *
 * @param {string|Object|File|Blob|URL} source
 *   JSON content as a string, parsed object, path to file, File, Blob, or URL
 * @param {Object} options - Options for parsing
 * @param {string} [options.recordPath=''] - Path to records in nested JSON (dot notation)
 * @param {any} [options.emptyValue=undefined] - Value to use for empty/null values in the data
 * @param {boolean} [options.dynamicTyping=true] - Whether to automatically detect and convert types
 * @param {Object} [options.frameOptions={}] - Options to pass to DataFrame.create
 * @returns {Promise<DataFrame>} Promise resolving to DataFrame created from the JSON
 */
export async function readJson(source, options = {}) {
  // Set defaults for options
  const {
    recordPath = '',
    emptyValue = undefined,
    dynamicTyping = true,
    frameOptions = {},
  } = options;

  try {
    // Get content from source using appropriate handler
    let content;
    const handler = sourceHandlers.find((h) => h.canHandle(source));
    if (!handler) {
      throw new Error('Unsupported source type for JSON reading');
    }
    content = await handler.getContent(source);

    // Parse JSON if it's a string
    let data = typeof content === 'string' ? JSON.parse(content) : content;

    // Navigate to the specified path if provided
    if (recordPath) {
      const paths = recordPath.split('.');
      for (const path of paths) {
        if (data && typeof data === 'object') {
          data = data[path];
        } else {
          throw new Error(`Invalid path: ${recordPath}`);
        }
      }
    }

    // Process data based on its format
    let processedData;

    if (Array.isArray(data)) {
      // Empty array case
      if (data.length === 0) {
        return DataFrame.create([], frameOptions);
      }

      // Array of objects case
      if (typeof data[0] === 'object' && !Array.isArray(data[0])) {
        processedData = data.map((item) => {
          const processedItem = {};
          for (const key in item) {
            const value = item[key];
            processedItem[key] = dynamicTyping ? convertType(value, emptyValue) : value;
          }
          return processedItem;
        });
        return DataFrame.create(processedData, frameOptions);
      }

      // Array of arrays case
      if (Array.isArray(data[0])) {
        const headers = Array.isArray(data[0])
          ? data[0]
          : Array.from({ length: data[0].length }, (_, i) => `column${i}`);

        processedData = data.slice(1).map((row) => {
          const obj = {};
          for (let i = 0; i < headers.length; i++) {
            const value = row[i];
            obj[headers[i]] = dynamicTyping ? convertType(value, emptyValue) : value;
          }
          return obj;
        });
        return DataFrame.create(processedData, frameOptions);
      }
    } else if (typeof data === 'object' && data !== null) {
      // Object with column arrays case
      // Check if values are arrays (column-oriented data)
      const isColumnOriented = Object.values(data).some(Array.isArray);

      if (isColumnOriented) {
        // Process column values if dynamic typing is enabled
        if (dynamicTyping) {
          const processedColumns = {};
          for (const key in data) {
            if (Array.isArray(data[key])) {
              processedColumns[key] = data[key].map((value) =>
                convertType(value, emptyValue)
              );
            } else {
              processedColumns[key] = data[key];
            }
          }
          return DataFrame.create(processedColumns, frameOptions);
        }
        return DataFrame.create(data, frameOptions);
      } else {
        // Single object case - convert to array with one item
        const processedItem = {};
        for (const key in data) {
          const value = data[key];
          processedItem[key] = dynamicTyping ? convertType(value, emptyValue) : value;
        }
        return DataFrame.create([processedItem], frameOptions);
      }
    }

    throw new Error('Unsupported JSON format');
  } catch (error) {
    throw new Error(`Error reading JSON: ${error.message}`);
  }
}




