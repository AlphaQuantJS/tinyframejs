// src/io/readers/json.js

import { DataFrame } from '../../core/DataFrame.js';

/**
 * Reads JSON content and returns a DataFrame.
 * Uses native JSON parsing capabilities of JavaScript.
 *
 * @param {string|Object} content - JSON content as a string or parsed object
 * @param {Object} options - Options for parsing
 * @param {string} [options.recordPath=''] - Path to records in nested JSON (dot notation)
 * @param {Object} [options.frameOptions={}] - Options to pass to DataFrame.create
 * @returns {DataFrame} DataFrame created from the JSON
 */
export function readJson(content, options = {}) {
  const { recordPath = '', frameOptions = {} } = options;

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

  // Handle different data formats
  if (Array.isArray(data)) {
    // Check if it's an array of objects or array of arrays
    if (data.length === 0) {
      return DataFrame.create([], frameOptions);
    }

    if (typeof data[0] === 'object' && !Array.isArray(data[0])) {
      // Array of objects - use directly
      return DataFrame.create(data, frameOptions);
    } else if (Array.isArray(data[0])) {
      // Array of arrays - convert to objects using first row as headers if available
      const headers = Array.isArray(data[0])
        ? data[0]
        : Array.from({ length: data[0].length }, (_, i) => `column${i}`);

      const rows = data.slice(1).map((row) => {
        const obj = {};
        for (let i = 0; i < headers.length; i++) {
          obj[headers[i]] = row[i];
        }
        return obj;
      });

      return DataFrame.create(rows, frameOptions);
    }
  } else if (typeof data === 'object') {
    // Object with column arrays
    return DataFrame.create(data, frameOptions);
  }

  throw new Error('Unsupported JSON format');
}
