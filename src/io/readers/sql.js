// src/io/readers/sql.js

import { DataFrame } from '../../core/DataFrame.js';

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
          return intValue.toString() === trimmed
            ? intValue
            : parseFloat(trimmed);
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
 * Reads data from a SQL database and returns a DataFrame.
 * This function requires a database connection object that supports a query method.
 *
 * @param {Object} connection - Database connection object
 * @param {string} query - SQL query to execute
 * @param {Object} options - Options for reading
 * @param {Array<any>} [options.params=[]] - Parameters for the query
 * @param {any} [options.emptyValue=undefined] - Value to use for null/empty values in the results
 * @param {boolean} [options.dynamicTyping=true] - Whether to automatically detect and convert types
 * @param {Object} [options.frameOptions={}] - Options to pass to DataFrame.create
 * @returns {Promise<DataFrame>} Promise resolving to DataFrame created from the query results
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

    // Process results to handle null/empty values and type conversion if needed
    let processedResults = results;

    if (dynamicTyping || emptyValue !== undefined) {
      processedResults = results.map((row) => {
        const processedRow = {};
        for (const key in row) {
          const value = row[key];
          processedRow[key] = dynamicTyping
            ? convertType(value, emptyValue)
            : value === null
              ? emptyValue
              : value;
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
