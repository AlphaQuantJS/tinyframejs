// src/io/readers/excel.js

/**
 * Module for reading and parsing Excel data from various sources.
 *
 * Key functions:
 * convertType - Converts values to appropriate JavaScript types (null, boolean, number, Date, or string).
 * isNodeJs - Determines if code is running in Node.js by checking for Node-specific globals.
 * isDirectContent - Checks if the source is direct Excel content rather than a file path or URL.
 * isNodeFilePath - Determines if the source is a file path in a Node.js environment.
 * fetchFromUrl - Fetches content from a URL using the fetch API with error handling.
 * isBrowserFile - Checks if the source is a File or Blob object in a browser.
 * readBrowserFile - Reads a File or Blob object in a browser using FileReader.
 * getContentFromSource - Gets content from various source types by detecting type and using appropriate reader.
 * processWorksheetData - Processes Excel worksheet data into a structure suitable for DataFrame.
 * readExcel - Main function for reading Excel data from various sources and returning a DataFrame.
 */

import { DataFrame } from '../../core/DataFrame.js';

/**
 * Check if exceljs is installed and provide helpful error message if not
 * @returns {Object} The exceljs module
 * @throws {Error} If exceljs is not installed
 */
function requireExcelJS() {
  try {
    return require('exceljs');
  } catch (error) {
    throw new Error(
      'The exceljs package is required for Excel file operations. ' +
        'Please install it using: npm install exceljs',
    );
  }
}

const ExcelJS = requireExcelJS();

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
 * Detects if the code is running in a Node.js environment by checking for Node-specific globals.
 * Used to determine whether Node.js specific APIs can be used.
 *
 * @returns {boolean} True if running in Node.js, false otherwise (e.g., browser)
 */
function isNodeJs() {
  return (
    typeof process !== 'undefined' &&
    process.versions !== null &&
    process.versions.node !== null
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
    throw new Error(`Error fetching Excel file: ${error.message}`);
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
    canHandle: (src) => isNodeFilePath(src),
    getContent: (src) => Promise.resolve(src),
  },
  // URL handler
  {
    canHandle: (src) =>
      typeof src === 'string' &&
      (src.startsWith('http://') || src.startsWith('https://')),
    getContent: (src) => fetchFromUrl(src),
  },
  // Browser File/Blob handler
  {
    canHandle: (src) => isBrowserFile(src),
    getContent: (src) => readBrowserFile(src),
  },
  // ArrayBuffer/Uint8Array handler
  {
    canHandle: (src) => src instanceof ArrayBuffer || src instanceof Uint8Array,
    getContent: (src) => Promise.resolve(src),
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
  // Find the first handler that can handle this source type
  const handler = SOURCE_HANDLERS.find((handler) => handler.canHandle(source));

  if (handler) {
    return handler.getContent(source);
  }

  throw new Error('Unsupported source type for Excel reading');
}

/**
 * Processes an Excel worksheet into a data structure suitable for DataFrame.
 * Handles header extraction, row processing, and type conversion.
 * Ensures all cells in the range are processed, including empty ones.
 *
 * @param {ExcelJS.Worksheet} worksheet - The worksheet to process
 * @param {Object} options - Processing options
 * @param {boolean} [options.header=true] - Whether the sheet has a header row
 * @param {boolean} [options.dynamicTyping=true] - Whether to convert values to appropriate types
 * @param {any} [options.emptyValue=undefined] - Value to use for empty cells (undefined, 0, null, or NaN)
 * @returns {Object} Object with column data suitable for DataFrame.create
 */
function processWorksheet(worksheet, options = {}) {
  const {
    header = true,
    dynamicTyping = true,
    emptyValue = undefined,
  } = options;
  const rows = [];

  // Get column names from header row or use column indices
  const columnNames = [];
  let maxColumn = 0;

  if (header && worksheet.rowCount > 0) {
    const headerRow = worksheet.getRow(1);
    // Find the maximum column number in the header row
    headerRow.eachCell((cell, colNumber) => {
      maxColumn = Math.max(maxColumn, colNumber);
      let columnName = cell.value;
      // Ensure column name is a string
      columnName =
        columnName !== null && columnName !== undefined
          ? String(columnName)
          : `Column${colNumber}`;
      columnNames[colNumber] = columnName;
    });
  }

  // Process data rows
  const startRow = header ? 2 : 1;
  for (let rowNumber = startRow; rowNumber <= worksheet.rowCount; rowNumber++) {
    const row = worksheet.getRow(rowNumber);
    const rowData = {};

    // Determine the maximum column for this row
    let rowMaxColumn = 0;
    row.eachCell((cell, colNumber) => {
      rowMaxColumn = Math.max(rowMaxColumn, colNumber);
    });

    // Use the larger of the header max column or this row's max column
    const effectiveMaxColumn = Math.max(maxColumn, rowMaxColumn);

    // Process each cell in the row, including empty ones
    for (let colNumber = 1; colNumber <= effectiveMaxColumn; colNumber++) {
      // Get column name from header or use column index
      let columnName;
      if (header) {
        columnName = columnNames[colNumber];
        if (!columnName) {
          columnName = `Column${colNumber}`;
        }
      } else {
        columnName = `${colNumber - 1}`;
      }

      // Get cell value, handling empty cells
      const cell = row.getCell(colNumber);
      let value = cell.value;

      // Convert value if dynamic typing is enabled
      if (dynamicTyping) {
        value = convertType(value, emptyValue);
      }

      rowData[columnName] = value;
    }

    rows.push(rowData);
  }

  // Convert array of objects to format for DataFrame.create
  const columnsData = {};

  if (rows.length > 0) {
    // Initialize arrays for each column
    Object.keys(rows[0]).forEach((key) => {
      columnsData[key] = [];
    });

    // Fill arrays with data
    rows.forEach((row) => {
      Object.keys(columnsData).forEach((key) => {
        // Ensure all columns have values for all rows, even if the row doesn't have this key
        columnsData[key].push(key in row ? row[key] : emptyValue);
      });
    });
  }

  return columnsData;
}

/**
 * Main function to read Excel data from various sources and return a DataFrame.
 * Automatically detects the source type and environment, choosing the optimal parsing strategy.
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
 * @returns {Promise<DataFrame>} Promise resolving to DataFrame created from the Excel data
 *
 * @example
 * // Read from a local file (Node.js)
 * const df = await readExcel('/path/to/data.xlsx');
 *
 * @example
 * // Read from a URL
 * const df = await readExcel('https://example.com/data.xlsx');
 *
 * @example
 * // Read from a File object (browser)
 * const fileInput = document.querySelector('input[type="file"]');
 * const df = await readExcel(fileInput.files[0]);
 *
 * @example
 * // With custom options
 * const df = await readExcel(source, {
 *   sheet: 'Sales Data',
 *   header: true,
 *   dynamicTyping: true,
 *   emptyValue: undefined // Use undefined for empty cells (good for statistical analysis)
 * });
 *
 * @example
 * // With 0 as empty value (better for performance with large datasets)
 * const df = await readExcel(source, { emptyValue: 0 });
 */
export async function readExcel(source, options = {}) {
  // Set defaults for options if not provided
  const {
    sheet = '',
    header = true,
    dynamicTyping = true,
    emptyValue = undefined,
    frameOptions = {},
  } = options;

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
