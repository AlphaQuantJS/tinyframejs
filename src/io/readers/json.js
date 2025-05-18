// src/io/readers/json.js

import { DataFrame } from '../../core/DataFrame.js';
// For compatibility with ESM and CommonJS
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

/**
 * Reads JSON content and returns a DataFrame.
 * Uses native JSON parsing capabilities of JavaScript.
 *
 * @param {string|Object|File|Blob|URL} source
 *   JSON content as a string, parsed object, path to file, File, Blob, or URL
 * @param {Object} options - Options for parsing
 * @param {string} [options.recordPath=''] - Path to records in nested JSON (dot notation)
 * @param {Object} [options.frameOptions={}] - Options to pass to DataFrame.create
 * @returns {Promise<DataFrame>} Promise resolving to DataFrame created from the JSON
 */
export async function readJson(source, options = {}) {
  const { recordPath = '', frameOptions = {} } = options;

  // Get content from source
  const content = await getContentFromSource(source);

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
      const headers = Array.isArray(data[0]) ?
        data[0] :
        Array.from({ length: data[0].length }, (_, i) => `column${i}`);

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

/**
 * Gets content from various source types.
 *
 * @param {string|Object|File|Blob|URL} source - Source to get content from
 * @returns {Promise<string|Object>} Promise resolving to content as string or object
 */
async function getContentFromSource(source) {
  // If source is already an object (parsed JSON)
  if (
    source !== null &&
    typeof source === 'object' &&
    !(source instanceof File) &&
    !(source instanceof Blob)
  ) {
    return source;
  }

  // If source is already a string with JSON content (not a file path)
  if (
    typeof source === 'string' &&
    !source.includes('/') &&
    !source.includes('\\') &&
    (source.startsWith('{') || source.startsWith('['))
  ) {
    return source;
  }

  // If source is a file path (Node.js)
  if (
    typeof source === 'string' &&
    (source.includes('/') || source.includes('\\')) &&
    typeof process !== 'undefined' &&
    process.versions &&
    process.versions.node
  ) {
    const fs = require('fs').promises;
    return await fs.readFile(source, 'utf8');
  }

  // If source is a URL or file path (browser)
  if (typeof source === 'string') {
    try {
      const response = await fetch(source);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${source}: ${response.statusText}`);
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error) {
      throw new Error(`Error fetching JSON: ${error.message}`);
    }
  }

  // If source is a File or Blob (browser)
  if (
    (typeof File !== 'undefined' && source instanceof File) ||
    (typeof Blob !== 'undefined' && source instanceof Blob)
  ) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) =>
        reject(new Error(`Error reading file: ${error}`));
      reader.readAsText(source);
    });
  }

  throw new Error('Unsupported source type for JSON reading');
}
