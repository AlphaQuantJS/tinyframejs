/**
 * CSV Stream Reader for processing large CSV files without loading them entirely into memory
 * Supports chunked processing with configurable batch size
 */

import fs from 'fs';
import path from 'path';
import { createReadStream } from 'fs';
import { once } from 'events';
import { createInterface } from 'readline';
import { DataFrame } from '../../../core/dataframe/DataFrame.js';

/**
 * Parses a CSV row into an array of values, handling quoted fields properly.
 * Supports fields containing delimiters when enclosed in quotes and escaped quotes ("")
 *
 * @param {string} row - The CSV row to parse
 * @param {string} delimiter - The delimiter character (e.g., comma, tab)
 * @returns {string[]} Array of parsed values from the row
 */
function parseCSVLine(row, delimiter) {
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
 * Creates a readable stream for a CSV file and processes it in chunks
 *
 * @param {string} filePath - Path to the CSV file
 * @param {Object} options - Options for reading and parsing
 * @param {number} [options.batchSize=10000] - Number of rows to process in each batch
 * @param {boolean} [options.header=true] - Whether the first line contains headers
 * @param {string} [options.delimiter=','] - CSV delimiter
 * @param {boolean} [options.skipEmptyLines=true] - Whether to skip empty lines
 * @param {Object} [options.parsers] - Custom parsers for specific columns
 * @param {Function} [options.onBatch] - Callback function to process each batch
 * @returns {Promise<DataFrame|null>} - Returns the last batch as DataFrame or null if all batches were processed by onBatch
 */
export async function readCSVStream(filePath, options = {}) {
  const {
    batchSize = 10000,
    header = true,
    delimiter = ',',
    skipEmptyLines = true,
    parsers = {},
    onBatch = null,
  } = options;

  // Validate file path
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  // Create read stream
  const fileStream = createReadStream(filePath, { encoding: 'utf8' });
  const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let headers = [];
  let currentBatch = [];
  let lineCount = 0;
  let lastBatch = null;

  // Process the file line by line
  for await (const line of rl) {
    // Skip empty lines if configured
    if (skipEmptyLines && line.trim() === '') {
      continue;
    }

    // Parse the CSV line
    const parsedLine = parseRow(line, delimiter);

    // Handle header line
    if (lineCount === 0 && header) {
      headers = parsedLine;
      lineCount++;
      continue;
    }

    // Add the parsed line to the current batch
    currentBatch.push(parsedLine);
    lineCount++;

    // Process batch when it reaches the specified size
    if (currentBatch.length >= batchSize) {
      const batchData = processBatch(currentBatch, headers, parsers);

      // If onBatch callback is provided, call it with the current batch
      if (onBatch) {
        await onBatch(batchData);
      } else {
        lastBatch = batchData;
      }

      // Clear the current batch
      currentBatch = [];
    }
  }

  // Process any remaining rows in the last batch
  if (currentBatch.length > 0) {
    const batchData = processBatch(currentBatch, headers, parsers);

    if (onBatch) {
      await onBatch(batchData);
    } else {
      lastBatch = batchData;
    }
  }

  // Close the file stream
  fileStream.close();

  // Return the last batch if no onBatch callback was provided
  return lastBatch;
}

/**
 * Process a batch of CSV rows and convert to DataFrame
 *
 * @param {Array} batch - Array of parsed CSV rows
 * @param {Array} headers - Column headers
 * @param {Object} parsers - Custom parsers for specific columns
 * @returns {DataFrame} - DataFrame created from the batch
 */
function processBatch(batch, headers, parsers) {
  // Convert rows to columns format for DataFrame
  const columns = {};

  // Initialize columns
  for (const header of headers) {
    columns[header] = [];
  }

  // Fill columns with data
  for (const row of batch) {
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      const value = row[i];

      // Apply parser if available for this column
      if (parsers[header]) {
        columns[header].push(parsers[header](value));
      } else {
        columns[header].push(value);
      }
    }
  }

  // Create DataFrame from columns
  return DataFrame.fromColumns(columns);
}

/**
 * Creates an async generator for processing CSV files row by row
 *
 * @param {string} filePath - Path to the CSV file
 * @param {Object} options - Options for reading and parsing
 * @param {boolean} [options.header=true] - Whether the first line contains headers
 * @param {string} [options.delimiter=','] - CSV delimiter
 * @param {boolean} [options.skipEmptyLines=true] - Whether to skip empty lines
 * @param {Object} [options.parsers] - Custom parsers for specific columns
 * @returns {AsyncGenerator} - Async generator that yields rows as objects
 */
export async function* csvRowGenerator(filePath, options = {}) {
  const {
    header = true,
    delimiter = ',',
    skipEmptyLines = true,
    parsers = {},
  } = options;

  // Validate file path
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  // Create read stream
  const fileStream = createReadStream(filePath, { encoding: 'utf8' });
  const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let headers = [];
  let lineCount = 0;

  // Process the file line by line
  for await (const line of rl) {
    // Skip empty lines if configured
    if (skipEmptyLines && line.trim() === '') {
      continue;
    }

    // Parse the CSV line
    const parsedLine = parseRow(line, delimiter);

    // Handle header line
    if (lineCount === 0 && header) {
      headers = parsedLine;
      lineCount++;
      continue;
    }

    // Create a row object using headers
    const row = {};
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      const value = parsedLine[i];

      // Apply parser if available for this column
      if (parsers[header]) {
        row[header] = parsers[header](value);
      } else {
        row[header] = value;
      }
    }

    lineCount++;
    yield row;
  }

  // Close the file stream
  fileStream.close();
}

/**
 * Apply a transformation function to each row of a CSV file and collect results
 *
 * @param {string} filePath - Path to the CSV file
 * @param {Function} transformFn - Function to transform each row
 * @param {Object} options - Options for reading and parsing
 * @returns {Promise<Array>} - Array of transformed results
 */
export async function mapCSVStream(filePath, transformFn, options = {}) {
  const results = [];

  for await (const row of csvRowGenerator(filePath, options)) {
    const result = transformFn(row);
    if (result !== undefined) {
      results.push(result);
    }
  }

  return results;
}

/**
 * Filter rows from a CSV file based on a predicate function
 *
 * @param {string} filePath - Path to the CSV file
 * @param {Function} predicateFn - Function to test each row
 * @param {Object} options - Options for reading and parsing
 * @returns {Promise<DataFrame>} - DataFrame with filtered rows
 */
export async function filterCSVStream(filePath, predicateFn, options = {}) {
  const filteredRows = [];
  let headers = [];

  // Get the first row to extract headers
  const generator = csvRowGenerator(filePath, options);
  const firstRow = await generator.next();

  if (!firstRow.done) {
    headers = Object.keys(firstRow.value);

    // Test the first row
    if (predicateFn(firstRow.value)) {
      filteredRows.push(Object.values(firstRow.value));
    }

    // Process remaining rows
    for await (const row of generator) {
      if (predicateFn(row)) {
        filteredRows.push(Object.values(row));
      }
    }
  }

  // Convert rows to columns format for DataFrame
  const columns = {};

  // Initialize columns
  for (const header of headers) {
    columns[header] = [];
  }

  // Fill columns with data
  for (const row of filteredRows) {
    for (let i = 0; i < headers.length; i++) {
      columns[headers[i]].push(row[i]);
    }
  }

  // Create DataFrame from columns
  return DataFrame.fromColumns(columns);
}
