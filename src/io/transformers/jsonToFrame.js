// src/io/transformers/jsonToFrame.js

import { DataFrame } from '../../core/dataframe/DataFrame.js';

/**
 * Transforms JSON data into a DataFrame.
 *
 * @param {Object|Array} jsonData - JSON data to transform
 * @param {Object} options - Transformation options
 * @param {boolean} [options.useTypedArrays=true] - Whether to use TypedArrays for numeric columns
 * @param {string} [options.copy='shallow'] - Copy mode: 'none', 'shallow', or 'deep'
 * @param {boolean} [options.saveRawData=false] - Whether to save raw data in the frame
 * @returns {DataFrame} DataFrame created from the JSON data
 */
export function jsonToFrame(jsonData, options = {}) {
  const {
    useTypedArrays = true,
    copy = 'shallow',
    saveRawData = false,
  } = options;

  // Handle different JSON data formats
  if (Array.isArray(jsonData)) {
    // Array of objects (rows) - convert to column format
    if (jsonData.length === 0) {
      return new DataFrame({});
    }

    // Extract column names from the first object
    const columns = {};
    const keys = Object.keys(jsonData[0]);

    // Create arrays for each column
    for (const key of keys) {
      columns[key] = jsonData.map((row) => row[key]);
    }

    return new DataFrame(columns, { useTypedArrays, copy, saveRawData });
  } else if (jsonData && typeof jsonData === 'object') {
    // Object with arrays as columns - already in the correct format
    return new DataFrame(jsonData, { useTypedArrays, copy, saveRawData });
  }

  throw new Error(
    'Invalid JSON data format. Expected array of objects or object with array properties.',
  );
}
