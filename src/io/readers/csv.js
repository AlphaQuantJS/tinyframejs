// src/io/readers/csv.js

import { DataFrame } from '../../core/DataFrame.js';
// Для совместимости с ESM и CommonJS
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

/**
 * Reads a CSV file and returns a DataFrame.
 * Uses the csv-parse module for parsing if available, or the built-in parser
 * if the external module is not available.
 *
 * @param {string|File|Blob|URL} source - CSV content as a string, path to file, File, Blob, or URL
 * @param {Object} options - Options for parsing
 * @param {string} [options.delimiter=','] - Delimiter character
 * @param {boolean} [options.header=true] - Whether the CSV has a header row
 * @param {boolean} [options.dynamicTyping=true] - Whether to automatically
 *   detect and convert types
 * @param {boolean} [options.skipEmptyLines=true] - Whether to skip empty lines
 * @param {Object} [options.frameOptions={}] - Options to pass to DataFrame.create
 * @returns {Promise<DataFrame>} Promise resolving to DataFrame created from the CSV
 */
export async function readCsv(source, options = {}) {
  const {
    delimiter = ',',
    header = true,
    dynamicTyping = true,
    skipEmptyLines = true,
    frameOptions = {},
  } = options;

  // Get content from source
  const content = await getContentFromSource(source);

  // Detect environment (Node.js or browser)
  const isNode =
    typeof process !== 'undefined' &&
    process.versions !== null &&
    process.versions.node !== null;

  if (isNode) {
    // Use Node.js CSV parsing if available
    try {
      // Try to use the csv-parse module with createRequire for ESM compatibility
      const csvParseModule = require('csv-parse/sync');

      const parseOptions = {
        delimiter,
        columns: header,
        skipEmptyLines,
        cast: dynamicTyping,
      };

      const data = csvParseModule.parse(content, parseOptions);
      return DataFrame.create(data, frameOptions);
    } catch (e) {
      // If csv-parse is not available, fall back to manual parsing
      console.warn(
        'csv-parse module not found, falling back to built-in parser',
      );
      return parseWithBuiltIn(content, {
        delimiter,
        header,
        dynamicTyping,
        skipEmptyLines,
        frameOptions,
      });
    }
  } else {
    // Browser environment - use built-in parser
    return parseWithBuiltIn(content, {
      delimiter,
      header,
      dynamicTyping,
      skipEmptyLines,
      frameOptions,
    });
  }
}

/**
 * Gets content from various source types.
 *
 * @param {string|File|Blob|URL} source - Source to get content from
 * @returns {Promise<string>} Promise resolving to content as string
 */
async function getContentFromSource(source) {
  // If source is already a string with CSV content
  if (
    typeof source === 'string' &&
    !source.includes('/') &&
    !source.includes('\\')
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
      return await response.text();
    } catch (error) {
      throw new Error(`Error fetching CSV: ${error.message}`);
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

  throw new Error('Unsupported source type for CSV reading');
}

/**
 * Built-in CSV parser for environments where csv-parse is not available.
 *
 * @param {string} content - CSV content
 * @param {Object} options - Parsing options
 * @returns {DataFrame} DataFrame created from the CSV
 */
function parseWithBuiltIn(content, options) {
  const { delimiter, header, dynamicTyping, skipEmptyLines, frameOptions } =
    options;

  // Split content into lines
  const lines = content.split(/\r?\n/);

  // Skip empty lines if requested
  const filteredLines = skipEmptyLines
    ? lines.filter((line) => line.trim().length > 0)
    : lines;

  if (filteredLines.length === 0) {
    return DataFrame.create([], frameOptions);
  }

  // Parse header row if present
  let headerRow = [];
  let startIndex = 0;

  if (header) {
    headerRow = parseRow(filteredLines[0], delimiter);
    startIndex = 1;
  }

  // Parse data rows
  const rows = [];
  for (let i = startIndex; i < filteredLines.length; i++) {
    const row = parseRow(filteredLines[i], delimiter);

    // Create object with header keys if header is present
    if (header) {
      const obj = {};
      for (let j = 0; j < headerRow.length; j++) {
        obj[headerRow[j]] = dynamicTyping ? convertType(row[j]) : row[j];
      }
      rows.push(obj);
    } else {
      // Use numeric indices as keys if no header
      const obj = {};
      for (let j = 0; j < row.length; j++) {
        obj[j.toString()] = dynamicTyping ? convertType(row[j]) : row[j];
      }
      rows.push(obj);
    }
  }

  // Create DataFrame from rows
  return DataFrame.create(rows, frameOptions);
}

/**
 * Parse a CSV row into an array of values.
 *
 * @param {string} row - CSV row
 * @param {string} delimiter - Delimiter character
 * @returns {string[]} Array of values
 */
function parseRow(row, delimiter) {
  const values = [];
  let inQuotes = false;
  let currentValue = '';

  for (let i = 0; i < row.length; i++) {
    const char = row[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === delimiter && !inQuotes) {
      values.push(currentValue);
      currentValue = '';
    } else {
      currentValue += char;
    }
  }

  // Add the last value
  values.push(currentValue);

  return values;
}

/**
 * Convert string value to appropriate type.
 *
 * @param {string} value - Value to convert
 * @returns {any} Converted value
 */
function convertType(value) {
  // Check for null or empty string
  if (value === null || value === undefined || value === '') {
    return null;
  }

  // Check for boolean
  if (value.toLowerCase() === 'true') return true;
  if (value.toLowerCase() === 'false') return false;

  // Check for number
  if (!isNaN(value) && value.trim() !== '') {
    // Check if it's an integer
    if (parseInt(value) === value) {
      return parseInt(value, 10);
    }
    return parseFloat(value);
  }

  // Check for date
  const date = new Date(value);
  if (
    !isNaN(date.getTime()) &&
    /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/.test(value)
  ) {
    return date;
  }

  // Default to string
  return value;
}
