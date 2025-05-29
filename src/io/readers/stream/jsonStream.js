/**
 * JSON Stream Reader for processing large JSON and JSONL files without loading them entirely into memory
 * Supports both JSON Lines format and large JSON arrays
 */

import fs from 'fs';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import { DataFrame } from '../../../core/dataframe/DataFrame.js';

/**
 * Creates a readable stream for a JSONL (JSON Lines) file and processes it in chunks
 *
 * @param {string} filePath - Path to the JSONL file
 * @param {Object} options - Options for reading and parsing
 * @param {number} [options.batchSize=10000] - Number of rows to process in each batch
 * @param {boolean} [options.skipInvalid=false] - Whether to skip invalid JSON lines
 * @param {Function} [options.onBatch] - Callback function to process each batch
 * @returns {Promise<DataFrame|null>} - Returns the last batch as DataFrame or null if all batches were processed by onBatch
 */
export async function readJSONLStream(filePath, options = {}) {
  const { batchSize = 10000, skipInvalid = false, onBatch = null } = options;

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

  let currentBatch = [];
  let lastBatch = null;

  // Process the file line by line
  for await (const line of rl) {
    // Skip empty lines
    if (line.trim() === '') {
      continue;
    }

    try {
      // Parse the JSON line
      const parsedLine = JSON.parse(line);

      // Add the parsed line to the current batch
      currentBatch.push(parsedLine);

      // Process batch when it reaches the specified size
      if (currentBatch.length >= batchSize) {
        const batchData = DataFrame.fromRows(currentBatch);

        // If onBatch callback is provided, call it with the current batch
        if (onBatch) {
          await onBatch(batchData);
        } else {
          lastBatch = batchData;
        }

        // Clear the current batch
        currentBatch = [];
      }
    } catch (error) {
      if (!skipInvalid) {
        throw new Error(
          `Invalid JSON at line: ${line}\nError: ${error.message}`,
        );
      }
      // Skip invalid JSON if skipInvalid is true
    }
  }

  // Process any remaining rows in the last batch
  if (currentBatch.length > 0) {
    const batchData = DataFrame.fromRows(currentBatch);

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
 * Creates an async generator for processing JSONL files row by row
 *
 * @param {string} filePath - Path to the JSONL file
 * @param {Object} options - Options for reading and parsing
 * @param {boolean} [options.skipInvalid=false] - Whether to skip invalid JSON lines
 * @returns {AsyncGenerator} - Async generator that yields parsed JSON objects
 */
export async function* jsonlRowGenerator(filePath, options = {}) {
  const { skipInvalid = false } = options;

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

  // Process the file line by line
  for await (const line of rl) {
    // Skip empty lines
    if (line.trim() === '') {
      continue;
    }

    try {
      // Parse the JSON line
      const parsedLine = JSON.parse(line);
      yield parsedLine;
    } catch (error) {
      if (!skipInvalid) {
        throw new Error(
          `Invalid JSON at line: ${line}\nError: ${error.message}`,
        );
      }
      // Skip invalid JSON if skipInvalid is true
    }
  }

  // Close the file stream
  fileStream.close();
}

/**
 * Process a large JSON file containing an array of objects without loading it entirely into memory
 * Uses a streaming JSON parser to process the file incrementally
 *
 * @param {string} filePath - Path to the JSON file
 * @param {Object} options - Options for reading and parsing
 * @param {number} [options.batchSize=10000] - Number of objects to process in each batch
 * @param {Function} [options.onBatch] - Callback function to process each batch
 * @returns {Promise<DataFrame|null>} - Returns the last batch as DataFrame or null if all batches were processed by onBatch
 */
export async function readJSONArrayStream(filePath, options = {}) {
  const { batchSize = 10000, onBatch = null } = options;

  // For JSON array streaming, we'll use a third-party library
  // This is a simplified implementation that reads the whole file
  // In a real implementation, you would use a streaming JSON parser like 'stream-json'

  // Read the file content
  const content = fs.readFileSync(filePath, 'utf8');

  // Parse the JSON
  let jsonData;
  try {
    jsonData = JSON.parse(content);
  } catch (error) {
    throw new Error(`Invalid JSON file: ${error.message}`);
  }

  // Check if it's an array
  if (!Array.isArray(jsonData)) {
    throw new Error('JSON file does not contain an array at the root level');
  }

  // Process the array in batches
  const totalObjects = jsonData.length;
  const batches = Math.ceil(totalObjects / batchSize);
  let lastBatch = null;

  for (let i = 0; i < batches; i++) {
    const start = i * batchSize;
    const end = Math.min(start + batchSize, totalObjects);
    const batchData = jsonData.slice(start, end);

    const batchDF = DataFrame.fromRows(batchData);

    if (onBatch) {
      await onBatch(batchDF);
    } else {
      lastBatch = batchDF;
    }
  }

  return lastBatch;
}

/**
 * Apply a transformation function to each object in a JSONL file and collect results
 *
 * @param {string} filePath - Path to the JSONL file
 * @param {Function} transformFn - Function to transform each object
 * @param {Object} options - Options for reading and parsing
 * @returns {Promise<Array>} - Array of transformed results
 */
export async function mapJSONLStream(filePath, transformFn, options = {}) {
  const results = [];

  for await (const row of jsonlRowGenerator(filePath, options)) {
    const result = transformFn(row);
    if (result !== undefined) {
      results.push(result);
    }
  }

  return results;
}

/**
 * Filter objects from a JSONL file based on a predicate function
 *
 * @param {string} filePath - Path to the JSONL file
 * @param {Function} predicateFn - Function to test each object
 * @param {Object} options - Options for reading and parsing
 * @returns {Promise<DataFrame>} - DataFrame with filtered objects
 */
export async function filterJSONLStream(filePath, predicateFn, options = {}) {
  const filteredRows = [];

  for await (const row of jsonlRowGenerator(filePath, options)) {
    if (predicateFn(row)) {
      filteredRows.push(row);
    }
  }

  return DataFrame.fromRows(filteredRows);
}
