// src/io/readers/tsv.js

import { readCsv } from './csv.js';

/**
 * Reads a TSV file and returns a DataFrame.
 *
 * @param {string} content - TSV content as a string
 * @param {Object} options - Options for parsing
 * @param {string} [options.delimiter='\t'] - Delimiter character (default is tab)
 * @param {boolean} [options.header=true] - Whether the TSV has a header row
 * @param {boolean} [options.dynamicTyping=true] - Whether to automatically detect and convert types
 * @param {boolean} [options.skipEmptyLines=true] - Whether to skip empty lines
 * @param {Object} [options.frameOptions={}] - Options to pass to DataFrame.create
 * @returns {import('../../core/DataFrame.js').DataFrame} DataFrame created from the TSV
 */
export function readTsv(content, options = {}) {
  // Use the CSV reader with tab as the default delimiter
  return readCsv(content, {
    delimiter: '\t',
    ...options,
  });
}
