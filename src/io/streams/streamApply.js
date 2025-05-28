/**
 * streamApply.js - Apply functions to data streams
 *
 * This module provides functionality to apply transformations to data streams,
 * allowing for efficient processing of large datasets without loading them entirely into memory.
 */

/**
 * Applies a function to each chunk of data in a stream
 *
 * @param {Stream} stream - Input data stream
 * @param {Function} fn - Function to apply to each chunk
 * @param {Object} [options] - Stream options
 * @param {number} [options.batchSize=1] - Number of rows to process in each batch
 * @param {boolean} [options.parallel=false] - Whether to process batches in parallel
 * @param {number} [options.maxConcurrent=4] - Maximum number of concurrent batch processing (if parallel is true)
 * @returns {Stream} Stream of transformed data
 */
export const streamApply = (stream, fn, options = {}) => {
  if (!stream || typeof stream.pipe !== 'function') {
    throw new Error('Stream must be a valid readable stream');
  }

  if (typeof fn !== 'function') {
    throw new Error('Transform function must be a function');
  }

  // Default options - use batchSize=1 for tests to process one item at a time
  const { batchSize = 1, parallel = false, maxConcurrent = 4 } = options;

  // Create a transform stream
  const { Transform } = require('stream');

  let buffer = [];
  let activeTransforms = 0;
  const pendingChunks = [];

  const transformStream = new Transform({
    objectMode: true,

    transform(chunk, encoding, callback) {
      // Add chunk to buffer
      buffer.push(chunk);

      // Process buffer when it reaches batch size
      if (buffer.length >= batchSize) {
        const batchToProcess = buffer;
        buffer = [];

        if (parallel && activeTransforms >= maxConcurrent) {
          // Queue chunk for later processing if too many active transforms
          pendingChunks.push({ batch: batchToProcess, callback });
        } else {
          processChunk(batchToProcess, callback);
        }
      } else {
        callback();
      }
    },

    flush(callback) {
      // Process any remaining data in buffer
      if (buffer.length > 0) {
        const batchToProcess = buffer;
        buffer = [];

        processChunk(batchToProcess, (err) => {
          if (err) {
            callback(err);
          } else if (pendingChunks.length > 0 || activeTransforms > 0) {
            // Wait for all pending chunks to complete
            const checkInterval = setInterval(() => {
              if (pendingChunks.length === 0 && activeTransforms === 0) {
                clearInterval(checkInterval);
                callback();
              }
            }, 50);
          } else {
            callback();
          }
        });
      } else {
        callback();
      }
    },
  });

  // Function to process a chunk of data
  function processChunk(chunk, callback) {
    if (parallel) {
      activeTransforms++;
    }

    try {
      // Apply the transformation function
      // If batchSize=1 and chunk is an array with a single element, pass this element directly
      const input =
        batchSize === 1 && Array.isArray(chunk) && chunk.length === 1 ?
          chunk[0] :
          chunk;
      const result = fn(input);

      // Handle promises
      if (result && typeof result.then === 'function') {
        result
          .then((transformedData) => {
            // For test cases, ensure we're handling the data correctly
            if (
              batchSize > 1 &&
              Array.isArray(chunk) &&
              Array.isArray(transformedData)
            ) {
              // This is a batch transformation that returned an array of transformed items
              for (const item of transformedData) {
                transformStream.push(item);
              }
            } else {
              // This is a single item transformation
              transformStream.push(transformedData);
            }
            completeTransform(null, callback);
          })
          .catch((err) => {
            completeTransform(err, callback);
          });
      } else {
        // Handle synchronous results
        if (batchSize > 1 && Array.isArray(chunk) && Array.isArray(result)) {
          // This is a batch transformation that returned an array of transformed items
          for (const item of result) {
            transformStream.push(item);
          }
        } else {
          // This is a single item transformation
          transformStream.push(result);
        }
        completeTransform(null, callback);
      }
    } catch (err) {
      completeTransform(err, callback);
    }
  }

  // Push transformed data to output stream
  function pushTransformedData(data) {
    // If we're processing a batch, the result should be an array of transformed items
    if (Array.isArray(data)) {
      // If we're processing a batch, each item in the batch should be pushed individually
      for (const item of data) {
        transformStream.push(item);
      }
    } else if (data !== null && data !== undefined) {
      // If we're processing a single item, push it directly
      transformStream.push(data);
    }
  }

  // Complete transform and process next pending chunk if any
  function completeTransform(err, callback) {
    if (parallel) {
      activeTransforms--;

      // Process next pending chunk if any
      if (pendingChunks.length > 0 && activeTransforms < maxConcurrent) {
        const nextChunk = pendingChunks.shift();
        processChunk(nextChunk.batch, nextChunk.callback);
      }
    }

    callback(err);
  }

  // Pipe input stream through transform stream
  return stream.pipe(transformStream);
};

/**
 * Extends DataFrame with stream apply method
 *
 * @param {Object} DataFrame - DataFrame class to extend
 */
export function extendStreamApply(DataFrame) {
  /**
   * Applies a function to each chunk of data in a stream
   *
   * @param {Function} fn - Function to apply to each chunk
   * @param {Object} [options] - Stream options
   * @returns {Stream} Stream of transformed data
   */
  DataFrame.prototype.streamApply = function(fn, options = {}) {
    if (!this._stream) {
      throw new Error(
        'No active stream. Use a streaming method like readCsvStream first.',
      );
    }

    return streamApply(this._stream, fn, options);
  };
}

export default streamApply;
