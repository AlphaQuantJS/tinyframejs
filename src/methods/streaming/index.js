/**
 * DataFrame streaming methods for processing large datasets in chunks
 */

import { DataFrame } from '../../core/DataFrame.js';
import {
  streamCsv,
  processCsv,
  collectCsv,
} from '../../io/streamers/streamCsv.js';
import {
  streamJson,
  processJson,
  collectJson,
} from '../../io/streamers/streamJson.js';
import {
  streamSql,
  processSql,
  collectSql,
} from '../../io/streamers/streamSql.js';

/**
 * Add streaming methods to DataFrame
 */
function addStreamingMethods() {
  // Static methods for streaming from external sources

  /**
   * Stream data from a CSV file in batches
   * @param {string} source - Path to the CSV file
   * @param {Object} options - Configuration options
   * @returns {AsyncIterator} An async iterator that yields DataFrame objects
   */
  DataFrame.streamCsv = streamCsv;

  /**
   * Process a CSV file with a callback function
   * @param {string} source - Path to the CSV file
   * @param {Function} callback - Function to process each batch
   * @param {Object} options - Configuration options
   * @returns {Promise<void>}
   */
  DataFrame.processCsv = processCsv;

  /**
   * Collect all batches from a CSV file into an array of DataFrames
   * @param {string} source - Path to the CSV file
   * @param {Object} options - Configuration options
   * @returns {Promise<Array<DataFrame>>}
   */
  DataFrame.collectCsv = collectCsv;

  /**
   * Stream data from a JSON file in batches
   * @param {string} source - Path to the JSON file
   * @param {Object} options - Configuration options
   * @returns {AsyncIterator} An async iterator that yields DataFrame objects
   */
  DataFrame.streamJson = streamJson;

  /**
   * Process a JSON file with a callback function
   * @param {string} source - Path to the JSON file
   * @param {Function} callback - Function to process each batch
   * @param {Object} options - Configuration options
   * @returns {Promise<void>}
   */
  DataFrame.processJson = processJson;

  /**
   * Collect all batches from a JSON file into an array of DataFrames
   * @param {string} source - Path to the JSON file
   * @param {Object} options - Configuration options
   * @returns {Promise<Array<DataFrame>>}
   */
  DataFrame.collectJson = collectJson;

  /**
   * Stream data from a SQL query in batches
   * @param {string} source - Path to the SQLite database file
   * @param {string} query - SQL query to execute
   * @param {Object} options - Configuration options
   * @returns {AsyncIterator} An async iterator that yields DataFrame objects
   */
  DataFrame.streamSql = streamSql;

  /**
   * Process SQL query results with a callback function
   * @param {string} source - Path to the SQLite database file
   * @param {string} query - SQL query to execute
   * @param {Function} callback - Function to process each batch
   * @param {Object} options - Configuration options
   * @returns {Promise<void>}
   */
  DataFrame.processSql = processSql;

  /**
   * Collect all batches from SQL query results into an array of DataFrames
   * @param {string} source - Path to the SQLite database file
   * @param {string} query - SQL query to execute
   * @param {Object} options - Configuration options
   * @returns {Promise<Array<DataFrame>>}
   */
  DataFrame.collectSql = collectSql;

  // Instance methods for chunking existing DataFrames

  /**
   * Split the DataFrame into chunks of specified size
   * @param {number} chunkSize - Number of rows in each chunk
   * @returns {Array<DataFrame>} Array of DataFrame chunks
   */
  DataFrame.prototype.chunk = function(chunkSize) {
    if (!Number.isInteger(chunkSize) || chunkSize <= 0) {
      throw new Error('Chunk size must be a positive integer');
    }

    const totalRows = this.count();
    const chunks = [];

    for (let i = 0; i < totalRows; i += chunkSize) {
      const end = Math.min(i + chunkSize, totalRows);
      chunks.push(this.iloc(i, end - 1));
    }

    return chunks;
  };

  /**
   * Process the DataFrame in chunks with a callback function
   * @param {number} chunkSize - Number of rows in each chunk
   * @param {Function} callback - Function to process each chunk
   * @returns {Promise<void>}
   */
  DataFrame.prototype.processInChunks = async function(chunkSize, callback) {
    const chunks = this.chunk(chunkSize);

    for (const chunk of chunks) {
      await callback(chunk);
    }
  };

  /**
   * Create an async iterator that yields chunks of the DataFrame
   * @param {number} chunkSize - Number of rows in each chunk
   * @returns {AsyncIterator} An async iterator that yields DataFrame chunks
   */
  DataFrame.prototype.streamChunks = async function* (chunkSize) {
    const chunks = this.chunk(chunkSize);

    for (const chunk of chunks) {
      yield chunk;
    }
  };
}

export { addStreamingMethods };
