// src/io/readers/excel.js

/**
 * Module for reading and parsing Excel data from various sources.
 *
 * Key functions:
 * convertType - Converts values to appropriate JavaScript types (null, boolean, number, Date, or string).
 * detectEnvironment - Determines the JavaScript runtime environment (Node.js, Deno, Bun, browser).
 * getContentFromSource - Gets content from various source types by detecting type and using appropriate reader.
 * processWorksheet - Processes Excel worksheet data into a structure suitable for DataFrame.
 * readExcel - Main function for reading Excel data from various sources and returning a DataFrame.
 */

import { DataFrame } from '../../core/dataframe/DataFrame.js';
import {
  detectEnvironment,
  safeRequire,
  isNodeJs,
} from '../utils/environment.js';

/**
 * Check if exceljs is installed and provide helpful error message if not
 * @returns {Object} The exceljs module
 * @throws {Error} If exceljs is not installed
 */
function requireExcelJS() {
  try {
    // Only attempt to require in Node.js environment
    if (isNodeJs()) {
      return safeRequire('exceljs', 'npm install exceljs');
    }
    throw new Error(
      'Excel operations are currently only supported in Node.js environment. ' +
        'For browser support, consider using CSV or JSON formats.',
    );
  } catch (error) {
    throw error;
  }
}

/**
 * Converts a value to its appropriate JavaScript type.
 * Handles conversion to: boolean, number (integer/float), Date, or keeps as is.
 * Empty values, null, and undefined are converted based on the emptyValue parameter.
 * Dates are formatted as YYYY-MM-DD strings for better readability.
 *
 * @param {any} value - The value to convert
 * @param {any} [emptyValue=undefined] - Value to use for empty cells (undefined, 0, null, or NaN)
 * @returns {boolean|number|string|any} The converted value with appropriate type
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

  // Handle Excel-specific objects
  if (typeof value === 'object') {
    // Date object with getTime method
    if (value.getTime && typeof value.getTime === 'function') {
      return formatDateToYYYYMMDD(value);
    }

    // Text or rich text objects - extract and convert the text content
    if (value.text) return convertType(value.text);
    if (value.richText)
      return convertType(value.richText.map((rt) => rt.text).join(''));
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
          return intValue.toString() === trimmed ?
            intValue :
            parseFloat(trimmed);
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
 * Determines if the source is a file path in a Node.js environment.
 * Checks if the string contains path separators (/ or \\) and is running in Node.js.
 *
 * @param {any} source - The source to check
 * @returns {boolean} True if source is a file path in Node.js
 */
function isNodeFilePath(source) {
  return (
    typeof source === 'string' &&
    (source.includes('/') || source.includes('\\')) &&
    isNodeJs()
  );
}

/**
 * Fetches content from a URL using the fetch API.
 * Handles error responses and provides meaningful error messages.
 *
 * @param {string} url - The URL to fetch content from
 * @returns {Promise<ArrayBuffer>} Promise resolving to the fetched content as an ArrayBuffer
 * @throws {Error} If the fetch fails or returns a non-OK status
 */
async function fetchFromUrl(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }
    return await response.arrayBuffer();
  } catch (error) {
    throw new Error(`Error fetching URL: ${error.message}`);
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
    typeof File !== 'undefined' &&
    typeof Blob !== 'undefined' &&
    (source instanceof File || source instanceof Blob)
  );
}

/**
 * Reads a File or Blob object in a browser environment using FileReader.
 * Handles both success and error cases with proper error messages.
 *
 * @param {File|Blob} file - The File or Blob object to read
 * @returns {Promise<ArrayBuffer>} Promise resolving to the file content as an ArrayBuffer
 * @throws {Error} If reading the file fails
 */
function readBrowserFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) =>
      reject(new Error(`Error reading file: ${error}`));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Source handler map for more efficient lookup
 * Each handler has canHandle and getContent methods
 */
const SOURCE_HANDLERS = [
  // Node.js file path handler
  {
    canHandle: isNodeFilePath,
    getContent: async (src) => src, // Just return the path for Node.js file
  },
  // URL handler
  {
    canHandle: (src) =>
      typeof src === 'string' &&
      (src.startsWith('http://') || src.startsWith('https://')),
    getContent: fetchFromUrl,
  },
  // Browser File/Blob handler
  {
    canHandle: isBrowserFile,
    getContent: readBrowserFile,
  },
  // ArrayBuffer/Uint8Array handler
  {
    canHandle: (src) => src instanceof ArrayBuffer || src instanceof Uint8Array,
    getContent: (src) => src,
  },
];

/**
 * Gets content from various source types by detecting the source type and using appropriate reader.
 * Supports Node.js files, URLs, browser File/Blob objects, and ArrayBuffers.
 *
 * @param {string|File|Blob|ArrayBuffer|Uint8Array} source - Source of Excel data
 * @returns {Promise<string|ArrayBuffer|Uint8Array>} Promise resolving to the source content
 * @throws {Error} If the source type is unsupported or reading fails
 */
async function getContentFromSource(source) {
  const handler = SOURCE_HANDLERS.find((h) => h.canHandle(source));
  if (!handler) {
    throw new Error(
      'Unsupported source type. Expected file path, URL, File, Blob, ArrayBuffer, or Uint8Array.',
    );
  }

  try {
    return await handler.getContent(source);
  } catch (error) {
    throw new Error(`Error getting content from source: ${error.message}`);
  }
}

/**
 * Processes a worksheet into a format suitable for DataFrame creation.
 * Handles header rows, type conversion, and empty values.
 *
 * @param {Object} worksheet - ExcelJS worksheet object
 * @param {Object} options - Processing options
 * @param {boolean} options.header - Whether the worksheet has a header row
 * @param {boolean} options.dynamicTyping - Whether to automatically detect and convert types
 * @param {any} options.emptyValue - Value to use for empty cells
 * @returns {Object} Processed data in a format suitable for DataFrame
 */
function processWorksheet(worksheet, options) {
  const {
    header = true,
    dynamicTyping = true,
    emptyValue = undefined,
  } = options;

  // Get all values as a 2D array
  const rows = [];
  worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
    const values = [];
    row.eachCell({ includeEmpty: true }, (cell) => {
      values.push(cell.value);
    });
    rows.push(values);
  });

  // Handle empty worksheet
  if (rows.length === 0) {
    return {};
  }

  // Determine headers
  const headerRow = header ? rows[0] : null;
  const dataRows = header ? rows.slice(1) : rows;

  // Create column-oriented data structure
  const columnsData = {};

  if (headerRow) {
    // Initialize columns with empty arrays
    headerRow.forEach((header, index) => {
      const columnName =
        header !== null && header !== undefined ?
          String(header) :
          `column${index}`;
      columnsData[columnName] = [];
    });

    // Fill columns with data
    dataRows.forEach((row) => {
      headerRow.forEach((header, index) => {
        const columnName =
          header !== null && header !== undefined ?
            String(header) :
            `column${index}`;
        const value = index < row.length ? row[index] : null;
        columnsData[columnName].push(
          dynamicTyping ? convertType(value, emptyValue) : value,
        );
      });
    });
  } else {
    // No header row, use column0, column1, etc.
    const maxLength = Math.max(...rows.map((row) => row.length));

    for (let i = 0; i < maxLength; i++) {
      const columnName = `column${i}`;
      columnsData[columnName] = rows.map((row) => {
        const value = i < row.length ? row[i] : null;
        return dynamicTyping ? convertType(value, emptyValue) : value;
      });
    }
  }

  return columnsData;
}

/**
 * Process Excel data in batches for large datasets
 *
 * @param {Object} worksheet - ExcelJS worksheet
 * @param {Object} options - Processing options
 * @param {boolean} options.header - Whether the worksheet has a header row
 * @param {boolean} options.dynamicTyping - Whether to auto-detect types
 * @param {any} options.emptyValue - Value to use for empty cells
 * @param {Object} options.frameOptions - Options for DataFrame creation
 * @param {number} options.batchSize - Size of each batch
 * @yields {DataFrame} DataFrame for each batch of data
 */
async function* processExcelInBatches(worksheet, options) {
  const {
    header = true,
    dynamicTyping = true,
    emptyValue = undefined,
    frameOptions = {},
    batchSize = 1000,
  } = options;

  // Get all rows
  const rows = [];
  worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
    const values = [];
    row.eachCell({ includeEmpty: true }, (cell) => {
      values.push(cell.value);
    });
    rows.push(values);
  });

  // Handle empty worksheet
  if (rows.length === 0) {
    yield DataFrame.create({}, frameOptions);
    return;
  }

  // Determine headers
  const headerRow = header ? rows[0] : null;
  const dataRows = header ? rows.slice(1) : rows;

  // Process in batches
  if (headerRow) {
    // Create headers array
    const headers = headerRow.map((header, index) =>
      (header !== null && header !== undefined ?
        String(header) :
        `column${index}`),
    );

    // Process data rows in batches
    let batch = [];

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const obj = {};

      for (let j = 0; j < headers.length; j++) {
        const value = j < row.length ? row[j] : null;
        obj[headers[j]] = dynamicTyping ?
          convertType(value, emptyValue) :
          value;
      }

      batch.push(obj);

      // When batch is full or we're at the end, yield a DataFrame
      if (batch.length >= batchSize || i === dataRows.length - 1) {
        yield DataFrame.create(batch, frameOptions);
        batch = [];
      }
    }
  } else {
    // No header row, use column0, column1, etc.
    const maxLength = Math.max(...rows.map((row) => row.length));
    const headers = Array.from({ length: maxLength }, (_, i) => `column${i}`);

    let batch = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const obj = {};

      for (let j = 0; j < headers.length; j++) {
        const value = j < row.length ? row[j] : null;
        obj[headers[j]] = dynamicTyping ?
          convertType(value, emptyValue) :
          value;
      }

      batch.push(obj);

      // When batch is full or we're at the end, yield a DataFrame
      if (batch.length >= batchSize || i === rows.length - 1) {
        yield DataFrame.create(batch, frameOptions);
        batch = [];
      }
    }
  }
}

/**
 * Main function to read Excel data from various sources and return a DataFrame.
 * Automatically detects the source type and environment, choosing the optimal parsing strategy.
 * Supports batch processing for large datasets.
 *
 * Supported source types:
 * - Local file path (in Node.js environment)
 * - URL to an Excel file (in both Node.js and browser)
 * - File or Blob object (in browser environment)
 * - ArrayBuffer or Uint8Array containing Excel data
 *
 * @param {string|File|Blob|ArrayBuffer|Uint8Array} source - Source of Excel data:
 *   - Path to a local file: "/path/to/data.xlsx" (Node.js only)
 *   - URL to a remote file: "https://example.com/data.xlsx"
 *   - File or Blob object from file input (browser only)
 *   - ArrayBuffer or Uint8Array containing Excel data
 * @param {Object} options - Options for parsing
 * @param {string|number} [options.sheet=''] - Sheet name or index to read (empty for first sheet)
 * @param {boolean} [options.header=true] - Whether the sheet has a header row
 * @param {boolean} [options.dynamicTyping=true] - Whether to automatically detect and convert types
 * @param {any} [options.emptyValue=undefined] - Value to use for empty cells (undefined, 0, null, or NaN)
 * @param {Object} [options.frameOptions={}] - Additional options to pass to DataFrame.create
 * @param {number} [options.batchSize] - If specified, enables batch processing with the given batch size
 * @returns {Promise<DataFrame|Object>} Promise resolving to DataFrame or batch processor object
 */
export async function readExcel(source, options = {}) {
  // Set defaults for options if not provided
  const {
    sheet = '',
    header = true,
    dynamicTyping = true,
    emptyValue = undefined,
    frameOptions = {},
    batchSize,
  } = options;

  // Load ExcelJS module
  const ExcelJS = requireExcelJS();

  // Create a new workbook
  const workbook = new ExcelJS.Workbook();

  // Get data from source
  const data = await getContentFromSource(source);

  try {
    // Load the workbook based on data type
    if (
      typeof data === 'string' &&
      (data.includes('/') || data.includes('\\'))
    ) {
      // Assume it's a file path
      await workbook.xlsx.readFile(data);
    } else if (data instanceof ArrayBuffer || data instanceof Uint8Array) {
      // Handle binary data
      await workbook.xlsx.load(data);
    } else {
      throw new Error('Unsupported data type for Excel reading');
    }

    // Get the worksheet - by name, index, or first sheet
    let worksheet;
    if (typeof sheet === 'string' && sheet !== '') {
      worksheet = workbook.getWorksheet(sheet);
      if (!worksheet) {
        throw new Error(`Sheet "${sheet}" not found in workbook`);
      }
    } else if (typeof sheet === 'number') {
      worksheet = workbook.worksheets[sheet];
      if (!worksheet) {
        throw new Error(`Sheet at index ${sheet} not found in workbook`);
      }
    } else {
      // Use first sheet
      worksheet = workbook.worksheets[0];
      if (!worksheet) {
        throw new Error('No worksheets found in workbook');
      }
    }

    // If batchSize is specified, use streaming processing
    if (batchSize) {
      return {
        /**
         * Process each batch with a callback function
         * @param {Function} callback - Function to process each batch DataFrame
         * @returns {Promise<void>} Promise that resolves when processing is complete
         */
        process: async (callback) => {
          const batchGenerator = processExcelInBatches(worksheet, {
            header,
            dynamicTyping,
            emptyValue,
            frameOptions,
            batchSize,
          });

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
          const batchGenerator = processExcelInBatches(worksheet, {
            header,
            dynamicTyping,
            emptyValue,
            frameOptions,
            batchSize,
          });

          for await (const batchDf of batchGenerator) {
            allData.push(...batchDf.toArray());
          }

          return DataFrame.create(allData, frameOptions);
        },
      };
    }

    // Process the worksheet
    const columnsData = processWorksheet(worksheet, {
      header,
      dynamicTyping,
      emptyValue,
    });

    // Create DataFrame using the static create method
    return DataFrame.create(columnsData, frameOptions);
  } catch (error) {
    throw new Error(`Error processing Excel file: ${error.message}`);
  }
}

/**
 * Adds batch processing methods to DataFrame class for Excel data.
 * This follows a functional approach to extend DataFrame with Excel streaming capabilities.
 *
 * @param {Function} DataFrameClass - The DataFrame class to extend
 * @returns {Function} The extended DataFrame class
 */
export function addExcelBatchMethods(DataFrameClass) {
  // Add readExcel as a static method to DataFrame
  DataFrameClass.readExcel = readExcel;

  return DataFrameClass;
}
