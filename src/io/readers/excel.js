// src/io/readers/excel.js

import { DataFrame } from '../../core/DataFrame.js';
import * as ExcelJS from 'exceljs';

/**
 * Reads Excel data and returns a DataFrame.
 * Uses the 'exceljs' package for Excel file parsing.
 *
 * @param {ArrayBuffer|Uint8Array|string} data
 *   Excel file data as ArrayBuffer, Uint8Array, or path to file
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
 * @returns {DataFrame}
 *   DataFrame created from the Excel data
 */
export async function readExcel(data, options = {}) {
  const {
    sheet = '',
    header = true,
    dynamicTyping = true,
    frameOptions = {},
  } = options;

  // Create a new workbook
  const workbook = new ExcelJS.Workbook();

  // Load the workbook based on data type
  if (typeof data === 'string') {
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
      headers[colNumber - 1] = cell.value
        ? cell.value.toString()
        : `Column${colNumber}`;
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

        // Handle dynamic typing
        if (dynamicTyping && value !== null && value !== undefined) {
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
