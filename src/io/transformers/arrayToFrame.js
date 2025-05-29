// src/io/transformers/arrayToFrame.js

import { DataFrame } from '../../core/dataframe/DataFrame.js';

/**
 * Transforms array data into a DataFrame.
 *
 * @param {Array} arrayData - Array data to transform
 * @param {Object} options - Transformation options
 * @param {Array} [options.columns=[]] - Column names for the data
 * @param {boolean} [options.headerRow=false] - Whether the first row contains column names
 * @param {boolean} [options.useTypedArrays=true] - Whether to use TypedArrays for numeric columns
 * @param {string} [options.copy='shallow'] - Copy mode
 * @param {boolean} [options.saveRawData=false] - Whether to save raw data in the frame
 * @returns {DataFrame} DataFrame created from the array data
 */
export function arrayToFrame(arrayData, options = {}) {
  const {
    columns = [],
    headerRow = false,
    useTypedArrays = true,
    copy = 'shallow',
    saveRawData = false,
  } = options;

  if (!Array.isArray(arrayData)) {
    throw new Error('Input data must be an array');
  }

  if (arrayData.length === 0) {
    // Return empty frame
    return new DataFrame({});
  }

  // Determine if it's an array of arrays or array of objects
  const firstItem = arrayData[0];

  try {
    if (Array.isArray(firstItem)) {
      // Array of arrays (rows)
      let data;
      let colNames;

      if (headerRow) {
        // First row contains column names
        colNames = firstItem;
        data = arrayData.slice(1);
      } else {
        // Use provided column names or generate them
        colNames =
          columns.length > 0 ?
            columns :
            Array.from({ length: firstItem.length }, (_, i) => `column${i}`);
        data = arrayData;
      }

      // Преобразуем массив массивов в формат строк для DataFrame.fromRows
      const rows = data.map((row) => {
        const obj = {};
        for (let i = 0; i < colNames.length; i++) {
          obj[colNames[i]] = i < row.length ? row[i] : null;
        }
        return obj;
      });

      return DataFrame.fromRows(rows);
    } else if (typeof firstItem === 'object' && firstItem !== null) {
      // Массив объектов - используем напрямую DataFrame.fromRows
      return DataFrame.fromRows(arrayData);
    }

    // Array of primitives (single column)
    const colName = columns.length > 0 ? columns[0] : 'value';
    const rows = arrayData.map((value) => ({ [colName]: value }));

    // Create a DataFrame from rows
    return DataFrame.fromRows(rows);
  } catch (error) {
    console.error('Error creating DataFrame:', error);
    throw error;
  }
}
