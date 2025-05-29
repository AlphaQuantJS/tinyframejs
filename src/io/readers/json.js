// src/io/readers/json.js

import { DataFrame } from '../../core/dataframe/DataFrame.js';
import {
  detectEnvironment,
  safeRequire,
  isNodeJs,
} from '../utils/environment.js';

/**
 * Converts values to appropriate types based on content.
 * Handles conversion to: boolean, number (integer/float), or formatted date string (YYYY-MM-DD).
 * Empty values, null, and undefined are converted based on the
 * emptyValue parameter.
 *
 * @param {any} value - The value to convert
 * @param {any} [emptyValue=undefined] - Value to use for empty/null values (undefined, 0, null, or NaN)
 * @returns {any} The converted value with appropriate type
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
  if (typeof value === 'boolean') return value;

  // Handle Date objects
  if (value instanceof Date && !isNaN(value.getTime())) {
    return formatDateToYYYYMMDD(value);
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
 * Source handlers for different types of JSON sources.
 * Each handler has a canHandle function to check if it can handle the source,
 * and a getContent function to extract the content from the source.
 */
const sourceHandlers = [
  // String JSON content handler
  {
    canHandle: (src) =>
      typeof src === 'string' &&
      !src.includes('/') &&
      !src.includes('\\') &&
      (src.startsWith('{') || src.startsWith('[')),
    getContent: (src) => src,
  },
  // File path handler (Node.js)
  {
    canHandle: (src) =>
      typeof src === 'string' &&
      (src.includes('/') || src.includes('\\')) &&
      isNodeJs(),
    getContent: async (src) => {
      try {
        const fs = safeRequire('fs');
        if (fs && fs.promises) {
          return await fs.promises.readFile(src, 'utf8');
        }
        throw new Error('fs module not available');
      } catch (error) {
        // In a test environment, we can mock fs using vi.mock
        if (typeof vi !== 'undefined' && vi.mocked && vi.mocked.fs) {
          return await vi.mocked.fs.promises.readFile(src, 'utf8');
        }
        throw error;
      }
    },
  },
  // URL handler
  {
    canHandle: (src) =>
      typeof src === 'string' &&
      (src.startsWith('http://') || src.startsWith('https://')),
    getContent: async (src) => {
      const response = await fetch(src);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${src}: ${response.statusText}`);
      }
      return await response.text();
    },
  },
  // Browser File/Blob handler
  {
    canHandle: (src) =>
      typeof File !== 'undefined' &&
      typeof Blob !== 'undefined' &&
      (src instanceof File || src instanceof Blob),
    getContent: async (src) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) =>
          reject(new Error(`Error reading file: ${error}`));
        reader.readAsText(src);
      }),
  },
  // Object handler (already parsed JSON)
  {
    canHandle: (src) =>
      src !== null &&
      typeof src === 'object' &&
      !(typeof File !== 'undefined' && src instanceof File) &&
      !(typeof Blob !== 'undefined' && src instanceof Blob),
    getContent: (src) => src,
  },
];

/**
 * Process JSON data in batches for large datasets
 *
 * @param {Array|Object} data - The JSON data to process
 * @param {Object} options - Processing options
 * @param {string} options.recordPath - Path to records in nested JSON
 * @param {any} options.emptyValue - Value to use for empty/null values
 * @param {boolean} options.dynamicTyping - Whether to auto-detect types
 * @param {Object} options.frameOptions - Options for DataFrame creation
 * @param {number} options.batchSize - Size of each batch
 * @yields {DataFrame} DataFrame for each batch of data
 */
async function* processJsonInBatches(data, options) {
  const {
    recordPath = '',
    emptyValue = undefined,
    dynamicTyping = true,
    frameOptions = {},
    batchSize = 1000,
  } = options;

  // Navigate to the specified path if provided
  let targetData = data;
  if (recordPath) {
    const paths = recordPath.split('.');
    for (const path of paths) {
      if (targetData && typeof targetData === 'object') {
        targetData = targetData[path];
      } else {
        throw new Error(`Invalid path: ${recordPath}`);
      }
    }
  }

  // Process data based on its format
  if (Array.isArray(targetData)) {
    // Empty array case
    if (targetData.length === 0) {
      yield DataFrame.create([], frameOptions);
      return;
    }

    // Array of objects case
    if (typeof targetData[0] === 'object' && !Array.isArray(targetData[0])) {
      let batch = [];

      for (let i = 0; i < targetData.length; i++) {
        const item = targetData[i];
        const processedItem = {};

        for (const key in item) {
          const value = item[key];
          processedItem[key] = dynamicTyping ?
            convertType(value, emptyValue) :
            value;
        }

        batch.push(processedItem);

        // When batch is full or we're at the end, yield a DataFrame
        if (batch.length >= batchSize || i === targetData.length - 1) {
          yield DataFrame.create(batch, frameOptions);
          batch = [];
        }
      }
    } else if (Array.isArray(targetData[0])) {
      // Array of arrays case
      const headers = Array.isArray(targetData[0]) ?
        targetData[0] :
        Array.from({ length: targetData[0].length }, (_, i) => `column${i}`);

      let batch = [];

      for (let i = 1; i < targetData.length; i++) {
        const row = targetData[i];
        const obj = {};

        for (let j = 0; j < headers.length; j++) {
          const value = row[j];
          obj[headers[j]] = dynamicTyping ?
            convertType(value, emptyValue) :
            value;
        }

        batch.push(obj);

        // When batch is full or we're at the end, yield a DataFrame
        if (batch.length >= batchSize || i === targetData.length - 1) {
          yield DataFrame.create(batch, frameOptions);
          batch = [];
        }
      }
    }
  } else if (typeof targetData === 'object' && targetData !== null) {
    // Object with column arrays case
    const isColumnOriented = Object.values(targetData).some(Array.isArray);

    if (isColumnOriented) {
      // For column-oriented data, we need to process all at once
      // since batching would split columns
      if (dynamicTyping) {
        const processedColumns = {};
        for (const key in targetData) {
          if (Array.isArray(targetData[key])) {
            processedColumns[key] = targetData[key].map((value) =>
              convertType(value, emptyValue),
            );
          } else {
            processedColumns[key] = targetData[key];
          }
        }
        yield DataFrame.create(processedColumns, frameOptions);
      } else {
        yield DataFrame.create(targetData, frameOptions);
      }
    } else {
      // Single object case - convert to array with one item
      const processedItem = {};
      for (const key in targetData) {
        const value = targetData[key];
        processedItem[key] = dynamicTyping ?
          convertType(value, emptyValue) :
          value;
      }
      yield DataFrame.create([processedItem], frameOptions);
    }
  } else {
    throw new Error('Unsupported JSON format');
  }
}

/**
 * Reads JSON content and returns a DataFrame.
 * Uses native JSON parsing capabilities of JavaScript.
 * Supports batch processing for large datasets.
 *
 * @param {string|Object|File|Blob|URL} source
 *   JSON content as a string, parsed object, path to file, File, Blob, or URL
 * @param {Object} options - Options for parsing
 * @param {string} [options.recordPath=''] - Path to records in nested JSON (dot notation)
 * @param {any} [options.emptyValue=undefined] - Value to use for empty/null values in the data
 * @param {boolean} [options.dynamicTyping=true] - Whether to automatically detect and convert types
 * @param {Object} [options.frameOptions={}] - Options to pass to DataFrame.create
 * @param {number} [options.batchSize] - If specified, enables batch processing with the given batch size
 * @returns {Promise<DataFrame|Object>} Promise resolving to DataFrame or batch processor object
 */
export async function readJson(source, options = {}) {
  // Set defaults for options
  const {
    recordPath = '',
    emptyValue = undefined,
    dynamicTyping = true,
    frameOptions = {},
    batchSize,
  } = options;

  try {
    // Get content from source using appropriate handler
    const handler = sourceHandlers.find((h) => h.canHandle(source));
    if (!handler) {
      throw new Error('Unsupported source type for JSON reading');
    }
    const content = await handler.getContent(source);

    // Parse JSON if it's a string
    let data = typeof content === 'string' ? JSON.parse(content) : content;

    // If batchSize is specified, use streaming processing
    if (batchSize) {
      return {
        async *[Symbol.asyncIterator]() {
          yield* processJsonInBatches(data, {
            recordPath,
            emptyValue,
            dynamicTyping,
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
          const batchGenerator = processJsonInBatches(data, {
            recordPath,
            emptyValue,
            dynamicTyping,
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

    // Standard processing for loading the entire data at once
    // Navigate to the specified path if provided
    if (recordPath) {
      const paths = recordPath.split('.');
      for (const path of paths) {
        if (data && typeof data === 'object') {
          data = data[path];
        } else {
          throw new Error(`Invalid path: ${recordPath}`);
        }
      }
    }

    // Process data based on its format
    let processedData;

    if (Array.isArray(data)) {
      // Empty array case
      if (data.length === 0) {
        return DataFrame.create([], frameOptions);
      }

      // Array of objects case
      if (typeof data[0] === 'object' && !Array.isArray(data[0])) {
        processedData = data.map((item) => {
          const processedItem = {};
          for (const key in item) {
            const value = item[key];
            processedItem[key] = dynamicTyping ?
              convertType(value, emptyValue) :
              value;
          }
          return processedItem;
        });
        return DataFrame.create(processedData, frameOptions);
      }

      // Array of arrays case
      if (Array.isArray(data[0])) {
        const headers = Array.isArray(data[0]) ?
          data[0] :
          Array.from({ length: data[0].length }, (_, i) => `column${i}`);

        processedData = data.slice(1).map((row) => {
          const obj = {};
          for (let i = 0; i < headers.length; i++) {
            const value = row[i];
            obj[headers[i]] = dynamicTyping ?
              convertType(value, emptyValue) :
              value;
          }
          return obj;
        });
        return DataFrame.create(processedData, frameOptions);
      }
    } else if (typeof data === 'object' && data !== null) {
      // Object with column arrays case
      // Check if values are arrays (column-oriented data)
      const isColumnOriented = Object.values(data).some(Array.isArray);

      if (isColumnOriented) {
        // Process column values if dynamic typing is enabled
        if (dynamicTyping) {
          const processedColumns = {};
          for (const key in data) {
            if (Array.isArray(data[key])) {
              processedColumns[key] = data[key].map((value) =>
                convertType(value, emptyValue),
              );
            } else {
              processedColumns[key] = data[key];
            }
          }
          return DataFrame.create(processedColumns, frameOptions);
        }
        return DataFrame.create(data, frameOptions);
      } else {
        // Single object case - convert to array with one item
        const processedItem = {};
        for (const key in data) {
          const value = data[key];
          processedItem[key] = dynamicTyping ?
            convertType(value, emptyValue) :
            value;
        }
        return DataFrame.create([processedItem], frameOptions);
      }
    }

    throw new Error('Unsupported JSON format');
  } catch (error) {
    throw new Error(`Error reading JSON: ${error.message}`);
  }
}

/**
 * Adds batch processing methods to DataFrame class for JSON data.
 * This follows a functional approach to extend DataFrame with JSON streaming capabilities.
 *
 * @param {Function} DataFrameClass - The DataFrame class to extend
 * @returns {Function} The extended DataFrame class
 */
export function addJsonBatchMethods(DataFrameClass) {
  // Add readJson as a static method to DataFrame
  DataFrameClass.readJson = readJson;

  return DataFrameClass;
}
