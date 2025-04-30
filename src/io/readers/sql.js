// src/io/readers/sql.js

import { DataFrame } from '../../core/DataFrame.js';

/**
 * Reads data from a SQL database and returns a DataFrame.
 * This function requires a database connection object that supports a query method.
 *
 * @param {Object} connection - Database connection object
 * @param {string} query - SQL query to execute
 * @param {Object} options - Options for reading
 * @param {Array<any>} [options.params=[]] - Parameters for the query
 * @param {Object} [options.frameOptions={}] - Options to pass to DataFrame.create
 * @returns {Promise<DataFrame>} Promise resolving to DataFrame created from the query results
 */
export async function readSql(connection, query, options = {}) {
  const { params = [], frameOptions = {} } = options;

  // Validate connection object
  if (!connection || typeof connection.query !== 'function') {
    throw new Error(
      'Invalid database connection. Must provide an object with a query method.',
    );
  }

  try {
    // Execute the query
    const results = await executeQuery(connection, query, params);

    if (!Array.isArray(results) || results.length === 0) {
      return DataFrame.create([], frameOptions);
    }

    // Create DataFrame from the results
    return DataFrame.create(results, frameOptions);
  } catch (error) {
    throw new Error(`SQL query execution failed: ${error.message}`);
  }
}

/**
 * Execute a SQL query using the provided connection.
 * Handles different database connection types.
 *
 * @param {Object} connection - Database connection object
 * @param {string} query - SQL query to execute
 * @param {Array<any>} params - Parameters for the query
 * @returns {Promise<Array<Object>>} Promise resolving to query results
 */
async function executeQuery(connection, query, params) {
  // Handle different types of database connections

  // Case 1: connection.query returns a Promise
  if (
    connection.query.constructor.name === 'AsyncFunction' ||
    connection.query.toString().includes('return new Promise')
  ) {
    return await connection.query(query, params);
  }

  // Case 2: connection.query accepts a callback (Node.js style)
  if (connection.query.length >= 3) {
    return new Promise((resolve, reject) => {
      connection.query(query, params, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });
  }

  // Case 3: connection.query returns results directly
  return connection.query(query, params);
}
