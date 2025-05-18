// src/io/readers/tsv.js

import { readCsv } from './csv.js';

/**
 * Reads a TSV file and returns a DataFrame.
 * TSV (Tab-Separated Values) is a variant of CSV where tabs are used as the delimiter.
 * The TSV reader is a wrapper around the CSV reader with tab as the default
 * delimiter.
 *
 * @param {string|File|Blob|URL} source - TSV content as a string, path to file, File, Blob, or URL
 * @param {Object} options - Options for parsing
 * @param {string} [options.delimiter='\t'] - Delimiter character (default is tab)
 * @param {boolean} [options.header=true] - Whether the TSV has a header row
 * @param {boolean} [options.dynamicTyping=true] - Whether to automatically detect and convert types
 * @param {boolean} [options.skipEmptyLines=true] - Whether to skip empty lines
 * @param {any} [options.emptyValue=undefined] - Value to use for empty cells (undefined, 0, null, or NaN)
 * @param {Object} [options.frameOptions={}] - Options to pass to DataFrame.create
 * @returns {Promise<import('../../core/DataFrame.js').DataFrame>}
 *   Promise resolving to DataFrame created from the TSV
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
