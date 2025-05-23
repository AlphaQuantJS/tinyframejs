// src/io/readers/csv.js

/**
 * Module for reading and parsing CSV data from various sources.
 *
 * Key functions:
 * convertType - Converts string values to appropriate JavaScript types (null, boolean, number, Date, or string).
 * parseRow - Parses a CSV row into an array of values, handling quotes and
 * delimiters correctly.
 * createDataObject - Creates a data object from a parsed row, using either header names or numeric indices as keys.
 * isNodeJs - Determines if code is running in Node.js by checking for
 * Node-specific globals.
 * isDirectContent - Checks if the source is direct CSV content rather than a file path or URL.
 * isNodeFilePath - Determines if the source is a file path in a Node.js environment.
 * readNodeFile - Reads a file from the filesystem using Node.js fs module.
 * fetchFromUrl - Fetches content from a URL using the fetch API with error handling.
 * isBrowserFile - Checks if the source is a File or Blob object in a browser.
 * readBrowserFile - Reads a File or Blob object in a browser using FileReader.
 * getContentFromSource - Gets content from various source types by detecting type and using appropriate reader.
 * tryParseWithCsvParse - Attempts to parse CSV using csv-parse module with
 * fallback mechanism.
 * parseWithBuiltIn - Built-in CSV parser for environments where csv-parse is unavailable.
 * readCsv - Main function for reading CSV data from various sources and returning a DataFrame.
 */

import { DataFrame } from '../../core/DataFrame.js';
import { createRequire } from 'module';

/**
 * Converts a string value to its appropriate JavaScript type.
 * Handles conversion to: boolean, number (integer/float), or formatted date string (YYYY-MM-DD).
 * Empty values, null, and undefined are converted based on the emptyValue parameter.
 *
 * @param {string} value - The string value to convert
 * @param {any} [emptyValue=undefined] - Value to use for empty cells (undefined, 0, null, or NaN)
 * @returns {boolean|number|string} The converted value with appropriate type
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

  // Handle null/undefined values and empty strings
  if (value === null || value === undefined || value === '') {
    return emptyValue;
  }

  // Already a number - return as is
  if (typeof value === 'number') {
    return value;
  }

  // Handle Date objects - format to YYYY-MM-DD
  if (value instanceof Date && !isNaN(value.getTime())) {
    return formatDateToYYYYMMDD(value);
  }

  // If not a string, return as is
  if (typeof value !== 'string') {
    return value;
  }

  // Handle boolean values
  const lowerValue = value.toLowerCase();
  if (lowerValue === 'true') return true;
  if (lowerValue === 'false') return false;

  // Handle numeric values (only if string is not empty)
  if (value.trim() !== '' && !isNaN(value)) {
    const intValue = parseInt(value, 10);
    // Check if it's an integer or float
    return intValue.toString() === value ? intValue : parseFloat(value);
  }

  // Handle date values in various formats
  const isIsoDate = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/.test(
    value,
  );
  const hasTimeZone = /\d{4}.*GMT|\+\d{4}/.test(value);

  if (isIsoDate || hasTimeZone) {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return formatDateToYYYYMMDD(date);
    }
  }

  // If nothing matched, return the original value
  return value;
}

/**
 * Parses a CSV row into an array of values, handling quoted fields properly.
 * Supports fields containing delimiters when enclosed in quotes and escaped quotes ("")
 *
 * @param {string} row - The CSV row to parse
 * @param {string} delimiter - The delimiter character (e.g., comma, tab)
 * @returns {string[]} Array of parsed values from the row
 */
function parseRow(row, delimiter) {
  const values = [];
  let inQuotes = false;
  let currentValue = '';
  let i = 0;

  // Iterate through each character in the row
  while (i < row.length) {
    const char = row[i];
    const isQuote = char === '"';
    const isDelimiter = char === delimiter && !inQuotes;

    // Check for escaped quotes ("")
    if (isQuote && i + 1 < row.length && row[i + 1] === '"' && inQuotes) {
      // This is an escaped quote inside a quoted field
      currentValue += '"'; // Add a single quote to the value
      i += 2; // Skip both quote characters
      continue;
    }

    switch (true) {
      case isQuote:
        inQuotes = !inQuotes;
        break;
      case isDelimiter:
        values.push(currentValue);
        currentValue = '';
        break;
      default:
        currentValue += char;
    }

    i++;
  }

  // Add the last value
  values.push(currentValue);

  return values;
}

/**
 * Creates a data object from a parsed row, using either header names or numeric indices as keys.
 * Handles type conversion if requested and ensures proper mapping of values to keys.
 *
 * @param {string[]} values - The parsed row values
 * @param {string[]} headers - Array of header names (or empty if no headers)
 * @param {boolean} hasHeader - Whether the CSV has a header row
 * @param {boolean} convertTypes - Whether to convert string values to appropriate types
 * @param {any} [emptyValue=undefined] - Value to use for empty cells
 * @returns {Object} A data object representing the row with proper keys and values
 */
function createDataObject(
  values,
  headers,
  hasHeader,
  convertTypes,
  emptyValue = undefined,
) {
  // Create empty object without prototype for better performance
  const data = Object.create(null);

  // Define value processing function
  const processValue = (value) =>
    convertTypes ? convertType(value, emptyValue) : value;

  // If we have headers, use them as keys
  if (hasHeader && headers.length > 0) {
    // Map each header to its corresponding value
    for (let i = 0; i < headers.length; i++) {
      if (i < values.length) {
        data[headers[i]] = processValue(values[i]);
      } else {
        // If there are more headers than values, set missing values to emptyValue
        data[headers[i]] = processValue('');
      }
    }
  } else {
    // No headers, use numeric indices as keys (0-based)
    for (let i = 0; i < values.length; i++) {
      data[i] = processValue(values[i]);
    }
  }

  return data;
}

/**
 * Detects the JavaScript runtime environment.
 * Used to determine which parsing strategy and APIs to use.
 *
 * @returns {string} The detected environment: 'node', 'deno', 'bun', or 'browser'
 */
export function detectEnvironment() {
  // Check for Node.js
  if (
    typeof process !== 'undefined' &&
    process.versions !== null &&
    process.versions.node !== null
  ) {
    return 'node';
  }

  // Check for Deno
  if (typeof Deno !== 'undefined') {
    return 'deno';
  }

  // Check for Bun
  if (
    typeof process !== 'undefined' &&
    process.versions !== null &&
    process.versions.bun !== null
  ) {
    return 'bun';
  }

  // Default to browser
  return 'browser';
}

/**
 * Checks if a CSV parser is available in the current environment.
 * Supports different parsers based on the runtime (Node.js, Deno, Bun, browser).
 *
 * @returns {Object} Object containing information about available parsers
 * @property {boolean} csvParse - Whether the csv-parse module is available (Node.js)
 * @property {boolean} denoStd - Whether Deno's std/csv module is available
 * @property {boolean} bunCsv - Whether Bun's CSV utilities are available
 */
export async function checkCsvParserAvailability() {
  const env = detectEnvironment();
  const result = {
    csvParse: false,
    denoStd: false,
    bunCsv: false,
  };

  try {
    if (env === 'node') {
      // Check for csv-parse in Node.js
      const require = createRequire(import.meta.url);
      require.resolve('csv-parse/sync');
      result.csvParse = true;
    } else if (env === 'deno') {
      // Check for std/csv in Deno
      try {
        // In Deno, we can try to dynamically import the CSV module
        await import('https://deno.land/std/csv/mod.ts');
        result.denoStd = true;
      } catch (e) {
        // Module not available, keep default false
      }
    } else if (env === 'bun') {
      // Bun has built-in CSV parsing capabilities
      result.bunCsv =
        typeof Bun !== 'undefined' &&
        typeof Bun.readableStreamToArray === 'function';
    }
  } catch (e) {
    // If any error occurs, we'll just return the default values (all false)
  }

  return result;
}

/**
 * Determines if the source is direct CSV content as a string rather than a file path or URL.
 * Checks if the string doesn't contain path separators (/ or \).
 *
 * @param {any} source - The source to check
 * @returns {boolean} True if source appears to be direct CSV content
 */
function isDirectContent(source) {
  return (
    typeof source === 'string' &&
    !source.includes('/') &&
    !source.includes('\\')
  );
}

/**
 * Determines if the source is a file path in a Node.js environment.
 * Checks if the string contains path separators (/ or \) and is running in Node.js.
 *
 * @param {any} source - The source to check
 * @returns {boolean} True if source is a file path in Node.js
 */
function isNodeFilePath(source) {
  return (
    typeof source === 'string' &&
    (source.includes('/') || source.includes('\\')) &&
    detectEnvironment() === 'node'
  );
}

/**
 * Reads a file from the filesystem using Node.js fs module.
 * Uses promises API for async file reading.
 *
 * @param {string} path - The path to the file to read
 * @returns {Promise<string>} Promise resolving to the file content as a string
 */
async function readNodeFile(path) {
  const require = createRequire(import.meta.url);
  const fs = require('fs').promises;
  return await fs.readFile(path, 'utf8');
}

/**
 * Fetches content from a URL using the fetch API.
 * Handles error responses and provides meaningful error messages.
 *
 * @param {string} url - The URL to fetch content from
 * @returns {Promise<string>} Promise resolving to the fetched content as a string
 * @throws {Error} If the fetch fails or returns a non-OK status
 */
async function fetchFromUrl(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    throw new Error(`Error fetching CSV: ${error.message}`);
  }
}

/**
 * Determines if the source is a File or Blob object in a browser environment.
 * Safely checks for browser-specific APIs before testing instanceof.
 *
 * @param {any} source - The source to check
 * @returns {boolean} True if source is a File or Blob in browser
 */
function isBrowserFile(source) {
  return (
    (typeof File !== 'undefined' && source instanceof File) ||
    (typeof Blob !== 'undefined' && source instanceof Blob)
  );
}

/**
 * Reads a File or Blob object in a browser environment using FileReader.
 * Handles both success and error cases with proper error messages.
 *
 * @param {File|Blob} file - The File or Blob object to read
 * @returns {Promise<string>} Promise resolving to the file content as a string
 * @throws {Error} If reading the file fails
 */
function readBrowserFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) =>
      reject(new Error(`Error reading file: ${error}`));
    reader.readAsText(file);
  });
}

/**
 * Gets content from various source types by detecting the source type and using appropriate reader.
 * Supports direct content, Node.js files, URLs, and browser File/Blob objects.
 *
 * @param {string|File|Blob|URL} source - The source to get content from
 * @returns {Promise<string>} Promise resolving to the content as a string
 * @throws {Error} If the source type is unsupported or reading fails
 */
// Source handler map for more efficient lookup
const SOURCE_HANDLERS = [
  // Direct CSV content handler (highest priority)
  {
    canHandle: (src) => isDirectContent(src),
    getContent: (src) => Promise.resolve(src),
  },
  // Node.js file path handler
  {
    canHandle: (src) => isNodeFilePath(src),
    getContent: (src) => readNodeFile(src),
  },
  // URL or browser file path handler
  {
    canHandle: (src) => typeof src === 'string',
    getContent: (src) => fetchFromUrl(src),
  },
  // Browser File/Blob handler
  {
    canHandle: (src) => isBrowserFile(src),
    getContent: (src) => readBrowserFile(src),
  },
];

/**
 * Gets content from various source types by detecting the source type and using appropriate reader.
 * Supports direct content, Node.js files, URLs, and browser File/Blob objects.
 *
 * @param {string|File|Blob|URL} source - The source to get content from
 * @returns {Promise<string>} Promise resolving to the content as a string
 * @throws {Error} If the source type is unsupported or reading fails
 */
async function getContentFromSource(source) {
  // Find the first handler that can handle this source type
  const handler = SOURCE_HANDLERS.find((handler) => handler.canHandle(source));

  if (handler) {
    return handler.getContent(source);
  }

  throw new Error('Unsupported source type for CSV reading');
}

/**
 * Attempts to parse CSV content using the csv-parse module if available.
 *
 * @param {string} content - The CSV content to parse
 * @param {Object} options - The parsing options
 * @param {string} [options.delimiter=','] - Character that separates values in the CSV
 * (e.g., ',' for CSV, '\t' for TSV)
 * @param {boolean} [options.header=true] - If true, treats the first row as column names;
 * if false, uses numeric indices
 * @param {boolean} [options.skipEmptyLines=true] - If true, ignores empty lines in the CSV content
 * @param {boolean} [options.dynamicTyping=true] - If true, automatically converts values
 * to appropriate types (numbers, booleans, dates)
 * @param {Object} [options.frameOptions={}] - Additional options for DataFrame creation
 * @returns {Object} Object with result and error properties
 * @property {DataFrame|null} result - DataFrame if parsing succeeds, null otherwise
 * @property {Error|null} error - Error object if parsing fails, null otherwise
 */
function tryParseWithCsvParse(content, options) {
  const {
    delimiter,
    header,
    skipEmptyLines,
    dynamicTyping,
    frameOptions,
    emptyValue,
  } = options;

  try {
    const require = createRequire(import.meta.url);
    const csvParseModule = require('csv-parse/sync');

    const parseOptions = {
      delimiter,
      columns: header,
      skipEmptyLines,
      cast: dynamicTyping,
    };

    const records = csvParseModule.parse(content, parseOptions);

    // Additional processing to convert types using the convertType function
    if (dynamicTyping && records.length > 0) {
      // Process each record
      for (let i = 0; i < records.length; i++) {
        const record = records[i];

        // Process each field in the record
        for (const key in record) {
          // Use the existing convertType function to convert data types
          record[key] = convertType(record[key], emptyValue);
        }
      }
    }

    return { result: DataFrame.create(records, frameOptions), error: null };
  } catch (error) {
    return { result: null, error };
  }
}

/**
 * Attempts to parse CSV content using Deno's standard library CSV parser.
 *
 * @param {string} content - The CSV content to parse
 * @param {Object} options - The parsing options
 * @param {string} [options.delimiter=','] - Character that separates values in the CSV
 * @param {boolean} [options.header=true] - If true, treats the first row as column names
 * @param {boolean} [options.skipEmptyLines=true] - Whether to skip empty lines
 * @param {boolean} [options.dynamicTyping=true] - Whether to convert types
 * @param {Object} [options.frameOptions={}] - Additional options for DataFrame creation
 * @param {any} [options.emptyValue=undefined] - Value to use for empty cells
 * @returns {Object} Object with result and error properties
 */
async function tryParseWithDenoStd(content, options) {
  const {
    delimiter,
    header,
    skipEmptyLines,
    dynamicTyping,
    frameOptions,
    emptyValue,
  } = options;

  try {
    // Dynamically import Deno's CSV module
    const { parse } = await import('https://deno.land/std/csv/mod.ts');

    // Configure options for Deno's CSV parser
    const parseOptions = {
      separator: delimiter,
      header,
      skipEmptyLines,
    };

    // Parse the CSV content
    const records = parse(content, parseOptions);

    // Process types if dynamicTyping is enabled
    if (dynamicTyping && records.length > 0) {
      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        for (const key in record) {
          record[key] = convertType(record[key], emptyValue);
        }
      }
    }

    return { result: DataFrame.create(records, frameOptions), error: null };
  } catch (error) {
    return { result: null, error };
  }
}

/**
 * Attempts to parse CSV content using Bun's built-in CSV utilities.
 *
 * @param {string} content - The CSV content to parse
 * @param {Object} options - The parsing options
 * @param {string} [options.delimiter=','] - Character that separates values in the CSV
 * @param {boolean} [options.header=true] - If true, treats the first row as column names
 * @param {boolean} [options.skipEmptyLines=true] - Whether to skip empty lines
 * @param {boolean} [options.dynamicTyping=true] - Whether to convert types
 * @param {Object} [options.frameOptions={}] - Additional options for DataFrame creation
 * @param {any} [options.emptyValue=undefined] - Value to use for empty cells
 * @returns {Object} Object with result and error properties
 */
async function tryParseWithBun(content, options) {
  const {
    delimiter,
    header,
    skipEmptyLines,
    dynamicTyping,
    frameOptions,
    emptyValue,
  } = options;

  try {
    // Create a readable stream from the content
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(content));
        controller.close();
      },
    });

    // Use Bun's stream utilities to process the CSV
    const lines = await Bun.readableStreamToArray(stream);
    const decoder = new TextDecoder();
    const textLines = lines.map((line) => decoder.decode(line));

    // Filter empty lines if needed
    const filteredLines = skipEmptyLines
      ? textLines.filter((line) => line.trim() !== '')
      : textLines;

    // Parse CSV manually
    let headerRow = [];
    const records = [];

    for (let i = 0; i < filteredLines.length; i++) {
      const line = filteredLines[i];
      const values = parseRow(line, delimiter);

      if (i === 0 && header) {
        headerRow = values;
        continue;
      }

      const record = header
        ? createDataObject(values, headerRow, true, dynamicTyping, emptyValue)
        : createDataObject(values, [], false, dynamicTyping, emptyValue);

      records.push(record);
    }

    return { result: DataFrame.create(records, frameOptions), error: null };
  } catch (error) {
    return { result: null, error };
  }
}

/**
 * Built-in CSV parser implementation for environments where csv-parse is not available.
 * Handles header rows, empty lines, and type conversion according to options.
 *
 * @param {string} content - The CSV content to parse
 * @param {Object} options - The parsing options
 * @param {string} [options.delimiter=','] - Delimiter character for separating values
 * @param {boolean} [options.header=true] - Whether the CSV has a header row with column names
 * @param {boolean} [options.dynamicTyping=true] - Whether to automatically detect and convert types
 * @param {boolean} [options.skipEmptyLines=true] - Whether to skip empty lines in the CSV
 * @param {any} [options.emptyValue=undefined] - Value to use for empty cells
 * @param {Object} [options.frameOptions={}] - Additional options to pass to DataFrame.create
 * @param {string} options.delimiter - The delimiter character
 * @param {boolean} options.header - Whether the CSV has a header row
 * @param {boolean} options.dynamicTyping - Whether to convert types
 * @param {boolean} options.skipEmptyLines - Whether to skip empty lines
 * @param {any} options.emptyValue - Value to use for empty cells
 * @param {Object} options.frameOptions - Options to pass to DataFrame.create
 * @returns {DataFrame} DataFrame created from the parsed CSV data
 */
export function parseWithBuiltIn(content, options) {
  const {
    delimiter,
    header,
    dynamicTyping,
    skipEmptyLines,
    emptyValue,
    frameOptions,
  } = options;

  // Split content into lines
  const lines = content.split(/\r?\n/);

  // Filter empty lines if requested
  const filteredLines = skipEmptyLines
    ? lines.filter((line) => line.trim().length > 0)
    : lines;

  if (filteredLines.length === 0) {
    return DataFrame.create([], frameOptions);
  }

  // Process header and data rows
  const headerRow = header ? parseRow(filteredLines[0], delimiter) : [];
  const startIndex = header ? 1 : 0;

  // Prepare array for rows
  const rows = [];

  // Process each line into a data row - using for loop for better performance with large datasets
  for (let i = startIndex; i < filteredLines.length; i++) {
    const line = filteredLines[i];

    // Skip empty lines if configured to do so
    if (line.trim() === '' && skipEmptyLines) {
      continue;
    }

    // Parse the row (empty or not)
    const parsedRow = parseRow(line, delimiter);
    rows.push(
      createDataObject(parsedRow, headerRow, header, dynamicTyping, emptyValue),
    );
  }

  return DataFrame.create(rows, frameOptions);
}

/**
 * Main function to read CSV data from various sources and return a DataFrame.
 * Automatically detects the source type and environment, choosing the optimal parsing strategy.
 * Uses the csv-parse module for parsing if available, or falls back to the built-in parser.
 *
 * Supported source types:
 * - Direct CSV content as a string
 * - Local file path (in Node.js environment)
 * - URL to a CSV file (in both Node.js and browser)
 * - File or Blob object (in browser environment)
 *
 * @param {string|File|Blob|URL} source - Source of CSV data:
 *   - String containing direct CSV content: "col1,col2\nval1,val2"
 *   - Path to a local file: "/path/to/data.csv" (Node.js only)
 *   - URL to a remote file: "https://example.com/data.csv"
 *   - File or Blob object from file input (browser only)
 * @param {Object} options - Options for parsing
 * @param {string} [options.delimiter=','] - Delimiter character for separating values
 * @param {boolean} [options.header=true] - Whether the CSV has a header row with column names
 * @param {boolean} [options.dynamicTyping=true] - Whether to automatically detect and convert types
 * @param {boolean} [options.skipEmptyLines=true] - Whether to skip empty lines in the CSV
 * @param {Object} [options.frameOptions={}] - Additional options to pass to DataFrame.create
 * @returns {Promise<DataFrame>} Promise resolving to DataFrame created from the CSV data
 *
 * @example
 * // Read from a local file (Node.js)
 * const df = await readCsv('/path/to/data.csv');
 *
 * @example
 * // Read from a URL
 * const df = await readCsv('https://example.com/data.csv');
 *
 * @example
 * // Read from direct content
 * const df = await readCsv('name,age\nJohn,30\nAlice,25');
 *
 * @example
 * // Read from a File object (browser)
 * const fileInput = document.querySelector('input[type="file"]');
 * const df = await readCsv(fileInput.files[0]);
 *
 * @example
 * // With custom options
 * const df = await readCsv(source, {
 *   delimiter: ';',
 *   header: false,
 *   dynamicTyping: false
 * });
 */
/**
 * Handle logging for csv-parse errors
 * @param {Error} error - Error from csv-parse
 */
function logCsvParseError(error) {
  const isModuleNotFound = error && error.code === 'MODULE_NOT_FOUND';
  const message = isModuleNotFound
    ? 'For better CSV parsing performance in Node.js, consider installing the csv-parse package:\n' +
      'npm install csv-parse\n' +
      'Using built-in parser as fallback.'
    : `csv-parse module failed, falling back to built-in parser: ${error.message}`;

  console[isModuleNotFound ? 'info' : 'warn'](message);
}

/**
 * Main function to read CSV data from various sources and return a DataFrame.
 * Automatically detects the source type and environment, choosing the optimal parsing strategy.
 * Uses the csv-parse module for parsing if available, or falls back to the built-in parser.
 *
 * Supported source types:
 * - Direct CSV content as a string
 * - Local file path (in Node.js environment)
 * - URL to a CSV file (in both Node.js and browser)
 * - File or Blob object (in browser environment)
 *
 * @param {string|File|Blob|URL} source - Source of CSV data:
 *   - String containing direct CSV content: "col1,col2\nval1,val2"
 *   - Path to a local file: "/path/to/data.csv" (Node.js only)
 *   - URL to a remote file: "https://example.com/data.csv"
 *   - File or Blob object from file input (browser only)
 * @param {Object} options - Options for parsing
 * @param {string} [options.delimiter=','] - Delimiter character for separating values
 * @param {boolean} [options.header=true] - Whether the CSV has a header row with column names
 * @param {boolean} [options.dynamicTyping=true] - Whether to automatically detect and convert types
 * @param {boolean} [options.skipEmptyLines=true] - Whether to skip empty lines in the CSV
 * @param {any} [options.emptyValue=undefined] - Value to use for empty cells (undefined, 0, null, or NaN)
 * @param {Object} [options.frameOptions={}] - Additional options to pass to DataFrame.create
 * @returns {Promise<DataFrame>} Promise resolving to DataFrame created from the CSV data
 *
 * @example
 * // Read from a local file (Node.js)
 * const df = await readCsv('/path/to/data.csv');
 *
 * @example
 * // With undefined as empty value (good for statistical analysis)
 * const df = await readCsv(source, { emptyValue: undefined });
 *
 * @example
 * // With 0 as empty value (better for performance with large datasets)
 * const df = await readCsv(source, { emptyValue: 0 });
 */
/**
 * Reads CSV data in batches for processing large files with memory efficiency.
 * Uses Node.js streams for file sources and line-by-line processing for other sources.
 *
 * @param {string|File|Blob|URL} source - Source of CSV data
 * @param {Object} options - Options for parsing
 * @param {string} [options.delimiter=','] - Delimiter character for separating values
 * @param {boolean} [options.header=true] - Whether the CSV has a header row with column names
 * @param {boolean} [options.dynamicTyping=true] - Whether to automatically detect and convert types
 * @param {boolean} [options.skipEmptyLines=true] - Whether to skip empty lines in the CSV
 * @param {any} [options.emptyValue=undefined] - Value to use for empty cells
 * @param {number} [options.batchSize=1000] - Number of rows to process in each batch
 * @returns {AsyncGenerator<DataFrame>} Async generator yielding DataFrames for each batch
 *
 * @example
 * // Process CSV in batches
 * const batchGenerator = readCsvInBatches('/path/to/large.csv', { batchSize: 5000 });
 * for await (const batchDf of batchGenerator) {
 *   // Process each batch
 *   console.log(`Processing batch with ${batchDf.rowCount} rows`);
 * }
 */
async function* readCsvInBatches(source, options = {}) {
  // Set defaults for options if not provided
  options.delimiter = options.delimiter || ',';
  options.header = options.header !== undefined ? options.header : true;
  options.dynamicTyping =
    options.dynamicTyping !== undefined ? options.dynamicTyping : true;
  options.skipEmptyLines =
    options.skipEmptyLines !== undefined ? options.skipEmptyLines : true;
  options.emptyValue =
    options.emptyValue !== undefined ? options.emptyValue : undefined;
  options.batchSize = options.batchSize || 1000;
  options.frameOptions = options.frameOptions || {};

  // For Node.js file paths, use streaming approach
  if (detectEnvironment() === 'node' && isNodeFilePath(source)) {
    const fs = await import('fs');
    const readline = await import('readline');

    const fileStream = fs.createReadStream(source);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    let headers = [];
    let batch = [];
    let lineCount = 0;

    for await (const line of rl) {
      // Skip empty lines if configured
      if (options.skipEmptyLines && line.trim() === '') continue;

      // Parse the current line
      const values = parseRow(line, options.delimiter);

      // Handle header row
      if (lineCount === 0 && options.header) {
        headers = values;
        lineCount++;
        continue;
      }

      // If no headers (header option is false), use numeric indices
      if (headers.length === 0) {
        headers = values.map((_, i) => String(i));
      }

      // Create data object and add to batch
      const dataObj = createDataObject(
        values,
        headers,
        options.header,
        options.dynamicTyping,
        options.emptyValue,
      );

      batch.push(dataObj);
      lineCount++;

      // When batch is full, yield a DataFrame
      if (batch.length >= options.batchSize) {
        yield new DataFrame(batch, options.frameOptions);
        batch = [];
      }
    }

    // Yield remaining rows if any
    if (batch.length > 0) {
      yield DataFrame.create(batch);
    }
  } else {
    // For other sources, get all content and process in batches
    const content = await getContentFromSource(source);
    const lines = content.split(/\r?\n/);

    let headers = [];
    let batch = [];
    let lineCount = 0;

    for (const line of lines) {
      // Skip empty lines if configured
      if (options.skipEmptyLines && line.trim() === '') continue;

      // Parse the current line
      const values = parseRow(line, options.delimiter);

      // Handle header row
      if (lineCount === 0 && options.header) {
        headers = values;
        lineCount++;
        continue;
      }

      // If no headers (header option is false), use numeric indices
      if (headers.length === 0) {
        headers = values.map((_, i) => String(i));
      }

      // Create data object and add to batch
      const dataObj = createDataObject(
        values,
        headers,
        options.header,
        options.dynamicTyping,
        options.emptyValue,
      );

      batch.push(dataObj);
      lineCount++;

      // When batch is full, yield a DataFrame
      if (batch.length >= options.batchSize) {
        yield DataFrame.create(batch);
        batch = [];
      }
    }

    // Yield remaining rows if any
    if (batch.length > 0) {
      yield DataFrame.create(batch, options.frameOptions);
    }
  }
}

/**
 * Adds batch processing methods to DataFrame class for CSV data.
 * This follows a functional approach to extend DataFrame with CSV streaming capabilities.
 *
 * @param {Function} DataFrameClass - The DataFrame class to extend
 * @returns {Function} The extended DataFrame class
 */
export function addCsvBatchMethods(DataFrameClass) {
  // Add static readCsv method to DataFrame
  DataFrameClass.readCsv = readCsv;

  // Add readCsvInBatches as a static method for advanced usage
  DataFrameClass.readCsvInBatches = readCsvInBatches;

  return DataFrameClass;
}

export async function readCsv(source, options = {}) {
  // Set defaults for options if not provided
  options.delimiter = options.delimiter || ',';
  options.header = options.header !== undefined ? options.header : true;
  options.dynamicTyping =
    options.dynamicTyping !== undefined ? options.dynamicTyping : true;
  options.skipEmptyLines =
    options.skipEmptyLines !== undefined ? options.skipEmptyLines : true;
  options.emptyValue =
    options.emptyValue !== undefined ? options.emptyValue : undefined;
  options.frameOptions = options.frameOptions || {};

  // If batchSize is specified, use streaming processing
  if (options.batchSize) {
    return {
      /**
       * Process each batch with a callback function
       * @param {Function} callback - Function to process each batch DataFrame
       * @returns {Promise<void>} Promise that resolves when processing is complete
       */
      process: async (callback) => {
        const batchGenerator = readCsvInBatches(source, options);
        for await (const batchDf of batchGenerator) {
          await callback(batchDf);
        }
      },

      /**
       * Collect all batches into a single DataFrame
       * @returns {Promise<DataFrame>} Promise resolving to combined DataFrame
       */
      collect: async () => {
        const allData = [];
        const batchGenerator = readCsvInBatches(source, options);
        for await (const batchDf of batchGenerator) {
          allData.push(...batchDf.toArray());
        }
        return DataFrame.create(allData);
      },
    };
  }

  // Standard processing for loading the entire file at once
  // Get content from the source (file, URL, string, etc.)
  const content = await getContentFromSource(source);

  // Detect environment and available parsers
  const env = detectEnvironment();
  const parsers = await checkCsvParserAvailability();

  // Try the best available parser for the current environment
  const result = null;
  let error = null;

  // Node.js: Try csv-parse module
  if (env === 'node' && parsers.csvParse) {
    const parseResult = tryParseWithCsvParse(content, options);
    if (parseResult.result) return parseResult.result;
    error = parseResult.error;
    if (error) logCsvParseError(error);
  }

  // Deno: Try Deno standard library
  if (env === 'deno' && parsers.denoStd) {
    const parseResult = await tryParseWithDenoStd(content, options);
    if (parseResult.result) return parseResult.result;
    error = parseResult.error;
  }

  // Bun: Try Bun's built-in utilities
  if (env === 'bun' && parsers.bunCsv) {
    const parseResult = await tryParseWithBun(content, options);
    if (parseResult.result) return parseResult.result;
    error = parseResult.error;
  }

  // Use built-in parser as fallback for all environments
  return parseWithBuiltIn(content, options);
}
