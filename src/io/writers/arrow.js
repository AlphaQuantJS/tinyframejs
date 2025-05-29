/**
 * Arrow format writer for efficient data interchange
 * Supports zero-copy IPC with Polars, DuckDB, and other Arrow-compatible systems
 */

import { DataFrame } from '../../core/dataframe/DataFrame.js';
import { detectEnvironment, isNodeJs } from '../utils/environment.js';

/**
 * Write DataFrame to Arrow format
 *
 * @param {DataFrame} df - DataFrame to write
 * @param {string|object} [destination] - File path or writable stream
 * @param {Object} [options] - Arrow writing options
 * @param {boolean} [options.compression='zstd'] - Compression algorithm ('zstd', 'lz4', 'none')
 * @param {boolean} [options.includeIndex=false] - Whether to include index in output
 * @returns {Promise<Buffer|Uint8Array>} - Arrow buffer or void if writing to file/stream
 */
export async function writeArrow(df, destination, options = {}) {
  if (!(df instanceof DataFrame)) {
    throw new Error('First argument must be a DataFrame');
  }

  const { compression = 'zstd', includeIndex = false } = options;

  // Dynamically import Arrow module based on environment
  let arrow;

  try {
    if (isNodeJs()) {
      arrow = await import('apache-arrow');
    } else {
      arrow = await import('@apache-arrow/es2015-esm');
    }
  } catch (error) {
    throw new Error(
      'Apache Arrow library not found. Please install it with: npm install apache-arrow',
    );
  }

  // Convert DataFrame to Arrow Table
  const table = _dataFrameToArrowTable(df, arrow, includeIndex);

  // Apply compression if requested
  const writerOptions = {};
  if (compression && compression !== 'none') {
    writerOptions.codec = arrow.Codec[compression.toUpperCase()];
  }

  // Write to destination or return buffer
  if (destination) {
    if (typeof destination === 'string') {
      // Write to file
      if (!isNodeJs()) {
        throw new Error(
          'File writing is only supported in Node.js environment',
        );
      }

      const fs = await import('fs/promises');
      const buffer = arrow.tableToIPC(table, writerOptions);
      await fs.writeFile(destination, buffer);
      return;
    } else if (typeof destination.write === 'function') {
      // Write to stream
      const buffer = arrow.tableToIPC(table, writerOptions);

      if (isNodeJs()) {
        return new Promise((resolve, reject) => {
          destination.write(buffer, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      } else {
        destination.write(buffer);
        return;
      }
    }
  }

  // Return Arrow buffer
  return arrow.tableToIPC(table, writerOptions);
}

/**
 * Write DataFrame to Arrow IPC stream format
 *
 * @param {DataFrame} df - DataFrame to write
 * @param {string|object} destination - File path or writable stream
 * @param {Object} [options] - Arrow writing options
 * @param {boolean} [options.compression='zstd'] - Compression algorithm ('zstd', 'lz4', 'none')
 * @param {boolean} [options.includeIndex=false] - Whether to include index in output
 * @returns {Promise<void>}
 */
export async function writeArrowStream(df, destination, options = {}) {
  if (!(df instanceof DataFrame)) {
    throw new Error('First argument must be a DataFrame');
  }

  if (!destination) {
    throw new Error('Destination is required for writeArrowStream');
  }

  const { compression = 'zstd', includeIndex = false } = options;

  // Dynamically import Arrow module based on environment
  let arrow;

  try {
    if (isNodeJs()) {
      arrow = await import('apache-arrow');
    } else {
      arrow = await import('@apache-arrow/es2015-esm');
    }
  } catch (error) {
    throw new Error(
      'Apache Arrow library not found. Please install it with: npm install apache-arrow',
    );
  }

  // Convert DataFrame to Arrow Table
  const table = _dataFrameToArrowTable(df, arrow, includeIndex);

  // Apply compression if requested
  const writerOptions = {};
  if (compression && compression !== 'none') {
    writerOptions.codec = arrow.Codec[compression.toUpperCase()];
  }

  // Create RecordBatchStreamWriter
  const stream = arrow.recordBatchStreamWriter(writerOptions);

  if (typeof destination === 'string') {
    // Write to file
    if (!isNodeJs()) {
      throw new Error('File writing is only supported in Node.js environment');
    }

    const fs = await import('fs');
    const writeStream = fs.createWriteStream(destination);

    stream.pipe(writeStream);
    stream.write(table);
    stream.end();

    return new Promise((resolve, reject) => {
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
  } else if (typeof destination.write === 'function') {
    // Write to stream
    stream.pipe(destination);
    stream.write(table);
    stream.end();

    return new Promise((resolve, reject) => {
      destination.on('finish', resolve);
      destination.on('error', reject);
    });
  }

  throw new Error(
    'Invalid destination. Must be a file path or writable stream',
  );
}

/**
 * Convert DataFrame to Arrow Table
 *
 * @param {DataFrame} df - DataFrame to convert
 * @param {Object} arrow - Arrow module
 * @param {boolean} includeIndex - Whether to include index
 * @returns {Object} - Arrow Table
 * @private
 */
function _dataFrameToArrowTable(df, arrow, includeIndex) {
  const { Table, makeData } = arrow;

  // Get column data
  const columns = df.columns;
  const data = {};

  // Add index if requested
  if (includeIndex) {
    data['__index__'] = Array.from({ length: df.rowCount }, (_, i) => i);
  }

  // Add column data
  for (const column of columns) {
    data[column] = df.col(column).toArray();
  }

  // Create Arrow Table
  return Table.new(data);
}

/**
 * Add Arrow batch methods to DataFrame class
 *
 * @param {Function} DataFrameClass - DataFrame class to extend
 * @returns {Function} - Extended DataFrame class
 */
export function addArrowBatchMethods(DataFrameClass) {
  // Add toArrow method
  DataFrameClass.prototype.toArrow = async function(options = {}) {
    return writeArrow(this, null, options);
  };

  // Add writeArrow method
  DataFrameClass.prototype.writeArrow = async function(
    destination,
    options = {},
  ) {
    return writeArrow(this, destination, options);
  };

  // Add writeArrowStream method
  DataFrameClass.prototype.writeArrowStream = async function(
    destination,
    options = {},
  ) {
    return writeArrowStream(this, destination, options);
  };

  return DataFrameClass;
}
