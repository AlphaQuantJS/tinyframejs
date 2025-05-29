// src/io/readers/sql.js

import { DataFrame } from '../../core/dataframe/DataFrame.js';
import {
  detectEnvironment,
  safeRequire,
  isNodeJs,
} from '../utils/environment.js';

/**
 * Check if sqlite and sqlite3 are installed and provide helpful error message if not
 * @returns {Object} The sqlite module
 * @throws {Error} If sqlite or sqlite3 is not installed
 */
function requireSQLite() {
  try {
    // Only attempt to require in Node.js environment
    if (isNodeJs()) {
      // Try to require both sqlite and sqlite3
      safeRequire('sqlite3', 'npm install sqlite3');
      return safeRequire('sqlite', 'npm install sqlite sqlite3');
    }
    throw new Error(
      'SQL operations are currently only supported in Node.js environment. ' +
        'For other environments, consider using CSV or JSON formats.',
    );
  } catch (error) {
    throw error;
  }
}

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
 * Connection handlers for different types of database connections.
 * Each handler has a canHandle function to check if it can handle the connection type,
 * and an executeQuery function to run the query on the connection.
 */
const connectionHandlers = [
  // Promise-based connections (async/await compatible)
  {
    canHandle: (connection) =>
      connection.query.constructor.name === 'AsyncFunction' ||
      connection.query.toString().includes('return new Promise'),
    executeQuery: async (connection, query, params) =>
      await connection.query(query, params),
  },
  // Callback-based connections (Node.js style)
  {
    canHandle: (connection) => connection.query.length >= 3,
    executeQuery: (connection, query, params) =>
      new Promise((resolve, reject) => {
        connection.query(query, params, (error, results) => {
          if (error) {
            reject(error);
          } else {
            resolve(results);
          }
        });
      }),
  },
  // Synchronous connections
  {
    canHandle: () => true, // Fallback handler
    executeQuery: (connection, query, params) =>
      connection.query(query, params),
  },
];

/**
 * Process SQL query results in batches for large datasets
 *
 * @param {Array} results - The query results to process
 * @param {Object} options - Processing options
 * @param {any} options.emptyValue - Value to use for empty/null values
 * @param {boolean} options.dynamicTyping - Whether to auto-detect types
 * @param {Object} options.frameOptions - Options for DataFrame creation
 * @param {number} options.batchSize - Size of each batch
 * @yields {DataFrame} DataFrame for each batch of data
 */
async function* processSqlInBatches(results, options) {
  const {
    emptyValue = undefined,
    dynamicTyping = true,
    frameOptions = {},
    batchSize = 1000,
  } = options;

  // Handle empty results
  if (!Array.isArray(results) || results.length === 0) {
    yield DataFrame.create([], frameOptions);
    return;
  }

  let batch = [];

  for (let i = 0; i < results.length; i++) {
    const row = results[i];
    const processedRow = {};

    for (const key in row) {
      const value = row[key];
      processedRow[key] = dynamicTyping ?
        convertType(value, emptyValue) :
        value === null ?
          emptyValue :
          value;
    }

    batch.push(processedRow);

    // When batch is full or we're at the end, yield a DataFrame
    if (batch.length >= batchSize || i === results.length - 1) {
      yield DataFrame.create(batch, frameOptions);
      batch = [];
    }
  }
}

/**
 * Reads data from a SQL database and returns a DataFrame.
 * This function requires a database connection object that supports a query method.
 * Supports batch processing for large datasets.
 *
 * @param {Object} connection - Database connection object
 * @param {string} query - SQL query to execute
 * @param {Object} options - Options for reading
 * @param {Array<any>} [options.params=[]] - Parameters for the query
 * @param {any} [options.emptyValue=undefined] - Value to use for null/empty values in the results
 * @param {boolean} [options.dynamicTyping=true] - Whether to automatically detect and convert types
 * @param {Object} [options.frameOptions={}] - Options to pass to DataFrame.create
 * @param {number} [options.batchSize] - If specified, enables batch processing with the given batch size
 * @returns {Promise<DataFrame|Object>} Promise resolving to DataFrame or batch processor object
 *
 * @example
 * // Using with a MySQL connection
 * const mysql = require('mysql2/promise');
 * const connection = await mysql.createConnection({
 *   host: 'localhost',
 *   user: 'user',
 *   password: 'password',
 *   database: 'db'
 * });
 * const df = await readSql(connection, 'SELECT * FROM users WHERE age > ?', {
 *   params: [25],
 *   emptyValue: null
 * });
 *
 * @example
 * // Using with SQLite
 * // First make sure sqlite and sqlite3 are installed:
 * // npm install sqlite sqlite3
 * const sqlite3 = require('sqlite3');
 * const { open } = require('sqlite');
 * const db = await open({
 *   filename: './database.sqlite',
 *   driver: sqlite3.Database
 * });
 * const df = await readSql(db, 'SELECT * FROM products');
 */
export async function readSql(connection, query, options = {}) {
  // Set defaults for options
  const {
    params = [],
    emptyValue = undefined,
    dynamicTyping = true,
    frameOptions = {},
    batchSize,
  } = options;

  // Validate connection object
  if (!connection || typeof connection.query !== 'function') {
    throw new Error(
      'Invalid database connection. Must provide an object with a query method.',
    );
  }

  try {
    // Find appropriate handler for the connection type
    const handler = connectionHandlers.find((h) => h.canHandle(connection));

    // Execute the query using the handler
    const results = await handler.executeQuery(connection, query, params);

    // Handle empty results
    if (!Array.isArray(results) || results.length === 0) {
      return DataFrame.create([], frameOptions);
    }

    // If batchSize is specified, use streaming processing
    if (batchSize) {
      return {
        /**
         * Process each batch with a callback function
         * @param {Function} callback - Function to process each batch DataFrame
         * @returns {Promise<void>} Promise that resolves when processing is complete
         */
        process: async (callback) => {
          const batchGenerator = processSqlInBatches(results, {
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
          const batchGenerator = processSqlInBatches(results, {
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

    // Process results to handle null/empty values and type conversion if needed
    let processedResults = results;

    if (dynamicTyping || emptyValue !== undefined) {
      processedResults = results.map((row) => {
        const processedRow = {};
        for (const key in row) {
          const value = row[key];
          processedRow[key] = dynamicTyping ?
            convertType(value, emptyValue) :
            value === null ?
              emptyValue :
              value;
        }
        return processedRow;
      });
    }

    // Create DataFrame from the processed results
    return DataFrame.create(processedResults, frameOptions);
  } catch (error) {
    throw new Error(`SQL query execution failed: ${error.message}`);
  }
}

/**
 * Adds batch processing methods to DataFrame class for SQL data.
 * This follows a functional approach to extend DataFrame with SQL streaming capabilities.
 *
 * @param {Function} DataFrameClass - The DataFrame class to extend
 * @returns {Function} The extended DataFrame class
 */
export function addSqlBatchMethods(DataFrameClass) {
  // Add readSql as a static method to DataFrame
  DataFrameClass.readSql = readSql;

  return DataFrameClass;
}
