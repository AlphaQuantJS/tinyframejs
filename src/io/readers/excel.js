// src/io/readers/excel.js

import { DataFrame } from '../../core/DataFrame.js';
import * as ExcelJS from 'exceljs';

/**
 * Reads Excel data and returns a DataFrame.
 * Uses the 'exceljs' package for Excel file parsing.
 *
 * @param {ArrayBuffer|Uint8Array|string|File|Blob|URL} source
 *   Excel file data as ArrayBuffer, Uint8Array, path to file, File, Blob, or URL
 * @param {Object} options
 *   Options for parsing
 * @param {string|number} [options.sheet='']
 *   Sheet name or index to read (empty for first sheet)
 * @param {boolean} [options.header=true]
 *   Whether the sheet has a header row
 * @param {boolean} [options.dynamicTyping=true]
 *   Whether to automatically detect and convert types
 * @param {Object} [options.frameOptions={}]
 *   Options to pass to DataFrame.create
 * @returns {Promise<DataFrame>}
 *   Promise resolving to DataFrame created from the Excel data
 */
export async function readExcel(source, options = {}) {
  const {
    sheet = '',
    header = true,
    dynamicTyping = true,
    frameOptions = {},
  } = options;

  // Create a new workbook
  const workbook = new ExcelJS.Workbook();

  // Get data from source
  const data = await getDataFromSource(source);

  // Load the workbook based on data type
  if (typeof data === 'string' && (data.includes('/') || data.includes('\\'))) {
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

  // Convert worksheet to array of objects
  const rows = [];
  const headers = [];

  // Extract headers if needed
  if (header) {
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell, colNumber) => {
      headers[colNumber - 1] = cell.value ?
        cell.value.toString() :
        `Column${colNumber}`;
    });
  }

  // Process rows
  const startRow = header ? 2 : 1;
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber >= startRow) {
      const rowData = {};
      row.eachCell((cell, colNumber) => {
        const columnName = headers[colNumber - 1] || `Column${colNumber}`;
        let value = cell.value;

        // Handle null/undefined/empty values
        if (value === null || value === undefined || value === '') {
          value = 0; // Convert empty values to 0 for better performance with large datasets
        } else if (dynamicTyping) {
          // Handle dynamic typing
          if (typeof value === 'object' && value.text) {
            value = value.text;
          }
        }

        rowData[columnName] = value;
      });
      rows.push(rowData);
    }
  });

  // Convert array of objects to format for DataFrame.create
  const columnsData = {};

  if (rows.length > 0) {
    // Initialize arrays for each column
    Object.keys(rows[0]).forEach((key) => {
      columnsData[key] = [];
    });

    // Fill arrays with data
    rows.forEach((row) => {
      Object.keys(row).forEach((key) => {
        columnsData[key].push(row[key]);
      });
    });
  }

  // Create DataFrame using the static create method
  return DataFrame.create(columnsData, frameOptions);
}

/**
 * Gets data from various source types.
 *
 * @param {ArrayBuffer|Uint8Array|string|File|Blob|URL} source - Source to get data from
 * @returns {Promise<ArrayBuffer|Uint8Array|string>} Promise resolving to data
 */
async function getDataFromSource(source) {
  // If source is already an ArrayBuffer or Uint8Array
  if (source instanceof ArrayBuffer || source instanceof Uint8Array) {
    return source;
  }

  // If source is a file path (string)
  if (typeof source === 'string') {
    // Check if it's a URL
    if (source.startsWith('http://') || source.startsWith('https://')) {
      try {
        const response = await fetch(source);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${source}: ${response.statusText}`);
        }
        return await response.arrayBuffer();
      } catch (error) {
        throw new Error(`Error fetching Excel file: ${error.message}`);
      }
    } else if (source.includes('/') || source.includes('\\')) {
      // Otherwise, assume it's a file path
      return source;
    }
  }

  // If source is a File or Blob
  if (
    (typeof File !== 'undefined' && source instanceof File) ||
    (typeof Blob !== 'undefined' && source instanceof Blob)
  ) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) =>
        reject(new Error(`Error reading file: ${error}`));
      reader.readAsArrayBuffer(source);
    });
  }

  throw new Error('Unsupported source type for Excel reading');
}
