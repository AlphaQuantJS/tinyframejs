// src/io/readers/excel.js

import { DataFrame } from '../../core/DataFrame.js';

/**
 * Reads Excel data and returns a DataFrame.
 * Uses the 'xlsx' package for Excel file parsing.
 *
 * @param {ArrayBuffer|Uint8Array|string} data
 *   Excel file data as ArrayBuffer, Uint8Array, or base64 string
 * @param {Object} options
 *   Options for parsing
 * @param {string} [options.sheet='']
 *   Sheet name to read (empty for first sheet)
 * @param {boolean} [options.header=true]
 *   Whether the sheet has a header row
 * @param {boolean} [options.dynamicTyping=true]
 *   Whether to automatically detect and convert types
 * @param {Object} [options.frameOptions={}]
 *   Options to pass to DataFrame.create
 * @returns {DataFrame}
 *   DataFrame created from the Excel data
 * @throws {Error}
 *   If the xlsx package is not installed
 */
export function readExcel(data, options = {}) {
  // Check if xlsx is available
  let XLSX;
  try {
    // Dynamic import to avoid dependency if not used
    XLSX = require('xlsx');
  } catch (e) {
    throw new Error(
      'The "xlsx" package is required to read Excel files. Install it with: npm install xlsx',
    );
  }

  const {
    sheet = '',
    header = true,
    dynamicTyping = true,
    frameOptions = {},
  } = options;

  // Parse Excel data
  const workbook = XLSX.read(data, { type: getDataType(data) });

  // Get sheet name - use provided sheet name or first sheet
  const sheetName = sheet || workbook.SheetNames[0];

  if (!workbook.SheetNames.includes(sheetName)) {
    throw new Error(`Sheet "${sheetName}" not found in workbook`);
  }

  // Get the worksheet
  const worksheet = workbook.Sheets[sheetName];

  // Convert to JSON with appropriate options
  const jsonOptions = {
    header: header ? 1 : undefined,
    defval: null,
    raw: !dynamicTyping,
  };

  const jsonData = XLSX.utils.sheet_to_json(worksheet, jsonOptions);

  // Create DataFrame from the JSON data
  return DataFrame.create(jsonData, frameOptions);
}

/**
 * Determine the data type for xlsx.read based on the input.
 *
 * @param {ArrayBuffer|Uint8Array|string} data - Excel file data
 * @returns {string} Data type string for xlsx.read
 */
function getDataType(data) {
  if (data instanceof ArrayBuffer) {
    return 'array';
  } else if (data instanceof Uint8Array) {
    return 'array';
  } else if (typeof data === 'string') {
    // Check if it's a base64 string
    if (/^[A-Za-z0-9+/=]+$/.test(data)) {
      return 'base64';
    }
    return 'binary';
  }

  throw new Error('Unsupported data type for Excel reading');
}
