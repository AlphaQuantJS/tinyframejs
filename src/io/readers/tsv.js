// src/io/readers/tsv.js

import { readCsv } from './csv.js';

/**
 * Reads a TSV file and returns a DataFrame.
 * TSV (Tab-Separated Values) is a variant of CSV where tabs are used as the delimiter.
 * The TSV reader is a wrapper around the CSV reader with tab as the default
 * delimiter.
 *
 * Supports all features of the CSV reader, including:
 * - Automatic environment detection (Node.js, Deno, Bun, browser)
 * - Batch processing for large files
 * - Dynamic type conversion
 * - Various source types (string, file path, URL, File/Blob objects)
 *
 * @param {string|File|Blob|URL} source - TSV content as a string, path to file, File, Blob, or URL
 * @param {Object} options - Options for parsing
 * @param {string} [options.delimiter='\t'] - Delimiter character (default is tab)
 * @param {boolean} [options.header=true] - Whether the TSV has a header row
 * @param {boolean} [options.dynamicTyping=true] - Whether to automatically detect and convert types
 * @param {boolean} [options.skipEmptyLines=true] - Whether to skip empty lines
 * @param {any} [options.emptyValue=undefined] - Value to use for empty cells (undefined, 0, null, or NaN)
 * @param {Object} [options.frameOptions={}] - Options to pass to DataFrame.create
 * @param {number} [options.batchSize] - If specified, enables batch processing with the given batch size
 * @returns {Promise<import('../../core/DataFrame.js').DataFrame|Object>}
 *   Promise resolving to DataFrame or batch processor object
 *
 * @example
 * // Read from a local file (Node.js)
 * const df = await readTsv('/path/to/data.tsv');
 *
 * @example
 * // Read from a URL
 * const df = await readTsv('https://example.com/data.tsv');
 *
 * @example
 * // Read from direct content
 * const df = await readTsv('name\tage\nJohn\t30\nAlice\t25');
 *
 * @example
 * // Read with custom options
 * const df = await readTsv(source, {
 *   header: false,
 *   emptyValue: null,
 *   skipEmptyLines: false
 * });
 *
 * @example
 * // Process a large TSV file in batches
 * const processor = await readTsv('/path/to/large.tsv', { batchSize: 1000 });
 * await processor.process(batch => {
 *   // Process each batch of 1000 rows
 *   console.log(`Processing batch with ${batch.rowCount} rows`);
 * });
 *
 * @example
 * // Collect all batches into a single DataFrame
 * const processor = await readTsv('/path/to/large.tsv', { batchSize: 1000 });
 * const df = await processor.collect();
 */
export async function readTsv(source, options = {}) {
  try {
    // Set default delimiter to tab and merge with other options
    const tsvOptions = {
      delimiter: '\t',
      ...options,
    };

    // Use the CSV reader with tab as the default delimiter
    return await readCsv(source, tsvOptions);
  } catch (error) {
    throw new Error(`Error reading TSV: ${error.message}`);
  }
}

/**
 * Adds batch processing methods to DataFrame class for TSV data.
 * This follows a functional approach to extend DataFrame with TSV streaming capabilities.
 *
 * @param {Function} DataFrameClass - The DataFrame class to extend
 * @returns {Function} The extended DataFrame class
 */
export function addTsvBatchMethods(DataFrameClass) {
  // Add readTsv as a static method to DataFrame
  DataFrameClass.readTsv = readTsv;

  return DataFrameClass;
}
