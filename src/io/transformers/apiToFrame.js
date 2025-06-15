/**
 * API to Frame Transformer
 * Transforms API response data into a DataFrame
 */

import { DataFrame } from '../../core/dataframe/DataFrame.js';

// Internal helper functions

/**
 * Cleans and normalizes data from API
 *
 * @param {Object|Array} apiData - Original API data
 * @param {Object} options - Cleaning and transformation options
 * @returns {Object|Array} Cleaned data
 * @private
 */
function _cleanApiData(apiData, options = {}) {
  const {
    dateField,
    numericFields = [],
    stringFields = [],
    booleanFields = [],
    renameFields = {},
    removeFields = [],
    customCleaner,
    removeNulls = false,
    removeEmptyStrings = false,
    trimStrings = true,
  } = options;

  // Make sure we have an array of data to process
  const dataArray = Array.isArray(apiData) ? apiData : [apiData];

  // Clean each data item
  const cleanedData = dataArray.map((item) => {
    // Create a new object for cleaned data
    let cleaned = { ...item };

    // Convert date field if specified
    if (dateField && cleaned[dateField]) {
      try {
        cleaned[dateField] = new Date(cleaned[dateField]);
      } catch (e) {
        // If conversion to date fails, leave as is
        console.warn(
          `Failed to convert ${dateField} to date: ${cleaned[dateField]}`,
        );
      }
    }

    // Convert numeric fields
    for (const field of numericFields) {
      if (cleaned[field] !== undefined && cleaned[field] !== null) {
        const num = Number(cleaned[field]);
        cleaned[field] = isNaN(num) ? cleaned[field] : num;
      }
    }

    // Convert string fields and trim whitespace if required
    for (const field of stringFields) {
      if (cleaned[field] !== undefined && cleaned[field] !== null) {
        cleaned[field] = String(cleaned[field]);
        if (trimStrings) {
          cleaned[field] = cleaned[field].trim();
        }
      }
    }

    // Process all string fields if trimStrings option is enabled
    if (trimStrings) {
      for (const field in cleaned) {
        if (typeof cleaned[field] === 'string') {
          cleaned[field] = cleaned[field].trim();
        }
      }
    }

    // Convert boolean fields
    for (const field of booleanFields) {
      if (cleaned[field] !== undefined && cleaned[field] !== null) {
        if (typeof cleaned[field] === 'string') {
          const lowered = cleaned[field].toLowerCase();
          cleaned[field] =
            lowered === 'true' ||
            lowered === 'yes' ||
            lowered === '1' ||
            lowered === 'active';
        } else {
          cleaned[field] = Boolean(cleaned[field]);
        }
      }
    }

    // Rename fields
    for (const [oldName, newName] of Object.entries(renameFields)) {
      if (oldName in cleaned) {
        cleaned[newName] = cleaned[oldName];
        delete cleaned[oldName];
      }
    }

    // Remove unwanted fields
    for (const field of removeFields) {
      delete cleaned[field];
    }

    // Remove null/undefined values if required
    if (removeNulls) {
      for (const key in cleaned) {
        if (cleaned[key] === null || cleaned[key] === undefined) {
          delete cleaned[key];
        }
      }
    }

    // Remove empty strings if required
    if (removeEmptyStrings) {
      for (const key in cleaned) {
        if (typeof cleaned[key] === 'string' && cleaned[key] === '') {
          delete cleaned[key];
        }
      }
    }

    // Apply custom cleaning function if specified
    if (typeof customCleaner === 'function') {
      cleaned = customCleaner(cleaned);
    }

    return cleaned;
  });

  // Return array or object depending on input data
  return Array.isArray(apiData) ? cleanedData : cleanedData[0];
}

/**
 * Cleans data in DataFrame
 *
 * @param {DataFrame} df - DataFrame to clean
 * @param {Object} options - Cleaning options
 * @returns {DataFrame} Cleaned DataFrame
 * @private
 */
function _cleanDataFrame(df, options = {}) {
  const {
    convertTypes = {},
    renameColumns = {},
    removeColumns = [],
    filterRows,
    dropNa = false,
    fillNa = {},
  } = options;

  // Get data from DataFrame
  let rows = df.toArray();

  // Convert column types
  if (Object.keys(convertTypes).length > 0) {
    rows = rows.map((row) => {
      const newRow = { ...row };

      for (const [column, type] of Object.entries(convertTypes)) {
        if (!(column in newRow)) continue;

        if (type === 'number') {
          newRow[column] = Number(newRow[column]);
        } else if (type === 'string') {
          newRow[column] = String(newRow[column]);
        } else if (type === 'date') {
          newRow[column] = new Date(newRow[column]);
        } else if (type === 'boolean') {
          const value = newRow[column];
          if (typeof value === 'string') {
            const lowered = value.toLowerCase();
            newRow[column] =
              lowered === 'true' || lowered === 'yes' || lowered === '1';
          } else {
            newRow[column] = Boolean(value);
          }
        }
      }

      return newRow;
    });
  }

  // Rename columns
  if (Object.keys(renameColumns).length > 0) {
    rows = rows.map((row) => {
      const newRow = { ...row };

      for (const [oldName, newName] of Object.entries(renameColumns)) {
        if (oldName in newRow) {
          newRow[newName] = newRow[oldName];
          delete newRow[oldName];
        }
      }

      return newRow;
    });
  }

  // Remove unwanted columns
  if (removeColumns.length > 0) {
    rows = rows.map((row) => {
      const newRow = { ...row };

      for (const column of removeColumns) {
        delete newRow[column];
      }

      return newRow;
    });
  }

  // Filter rows
  if (typeof filterRows === 'function') {
    rows = rows.filter((row) => filterRows(row));
  }

  // Create new DataFrame from cleaned data
  // Convert array of objects to column format for DataFrame
  if (Array.isArray(rows) && rows.length > 0) {
    const columns = {};
    const keys = Object.keys(rows[0]);

    for (const key of keys) {
      columns[key] = rows.map((row) => row[key]);
    }

    return new DataFrame(columns);
  } else {
    // Empty DataFrame
    return new DataFrame({});
  }
}

/**
 * Transforms API response data into a DataFrame
 * Handles various API response formats and normalizes them
 *
 * @param {Object|Array} apiData - API data to transform
 * @param {Object} options - Transformation options
 * @param {string} [options.dataPath=''] - Path to data in the response (dot notation)
 * @param {Object} [options.mapping={}] - Mapping of API fields to column names
 * @param {Function} [options.transform=null] - Custom transform function for each row
 * @param {boolean} [options.useTypedArrays=true] - Whether to use TypedArrays for numeric columns
 * @param {string} [options.copy='shallow'] - Copy mode: 'none', 'shallow', or 'deep'
 * @param {boolean} [options.saveRawData=false] - Whether to save raw data in the frame
 * @param {Object} [options.clean] - Data cleaning options
 * @param {string} [options.clean.dateField] - Name of date field to convert to Date object
 * @param {Array<string>} [options.clean.numericFields] - Array of fields to convert to numbers
 * @param {Array<string>} [options.clean.stringFields] - Array of fields to convert to strings
 * @param {Array<string>} [options.clean.booleanFields] - Array of fields to convert to booleans
 * @param {Object} [options.clean.renameFields] - Object for renaming fields {oldName: newName}
 * @param {Array<string>} [options.clean.removeFields] - Array of fields to remove
 * @param {Function} [options.clean.customCleaner] - Custom cleaning function for each record
 * @param {boolean} [options.clean.removeNulls=false] - Whether to remove null/undefined values
 * @param {boolean} [options.clean.removeEmptyStrings=false] - Whether to remove empty strings
 * @param {boolean} [options.clean.trimStrings=true] - Whether to trim whitespace in strings
 * @param {boolean} [options.cleanFirst=true] - Whether to clean data before converting to DataFrame
 * @param {Object} [options.postClean] - DataFrame cleaning options after conversion
 * @returns {DataFrame} DataFrame created from the API data
 */
export function apiToFrame(apiData, options = {}) {
  const {
    dataPath = '',
    mapping = {},
    transform = null,
    useTypedArrays = true,
    copy = 'shallow',
    saveRawData = false,
    clean = {},
    cleanFirst = true,
    postClean = {},
  } = options;

  // Process data based on cleanFirst flag
  if (cleanFirst && Object.keys(clean).length > 0) {
    // Clean first, then transform
    apiData = _cleanApiData(apiData, clean);
  }

  // Navigate to the specified data path if provided
  let data = apiData;
  if (dataPath) {
    const paths = dataPath.split('.');
    for (const path of paths) {
      if (data && typeof data === 'object') {
        data = data[path];
      } else {
        throw new Error(`Invalid data path: ${dataPath}`);
      }
    }
  }

  // Handle different data formats
  if (!data) {
    throw new Error('No data found in API response');
  }

  // Ensure data is an array
  const dataArray = Array.isArray(data) ? data : [data];

  // Apply field mapping and transform if provided
  let transformedData = dataArray;

  // Apply mapping if provided
  if (Object.keys(mapping).length > 0) {
    transformedData = dataArray.map((item) => {
      const mappedItem = {};
      for (const [apiField, columnName] of Object.entries(mapping)) {
        // Support nested fields with dot notation
        if (apiField.includes('.')) {
          let value = item;
          const fields = apiField.split('.');
          for (const field of fields) {
            if (value && typeof value === 'object') {
              value = value[field];
            } else {
              value = undefined;
              break;
            }
          }
          mappedItem[columnName] = value;
        } else {
          mappedItem[columnName] = item[apiField];
        }
      }
      return mappedItem;
    });
  }

  // Apply custom transform function if provided
  if (typeof transform === 'function') {
    transformedData = transformedData.map(transform);
  }

  // Create DataFrame from the transformed data
  // Convert array of objects to column format for DataFrame
  let result;
  if (Array.isArray(transformedData) && transformedData.length > 0) {
    const columns = {};
    const keys = Object.keys(transformedData[0]);

    for (const key of keys) {
      columns[key] = transformedData.map((row) => row[key]);
    }

    result = new DataFrame(columns, {
      index: options.index,
      columns: options.columns,
      types: options.types,
    });
  } else {
    // Empty DataFrame or object with arrays
    result = new DataFrame(transformedData || {}, {
      index: options.index,
      columns: options.columns,
      types: options.types,
    });
  }

  // Apply post-cleaning if needed
  if (Object.keys(postClean).length > 0) {
    result = _cleanDataFrame(result, postClean);
  }

  // If cleanFirst is false and clean options are provided, clean the data after transformation
  if (!cleanFirst && Object.keys(clean).length > 0) {
    const rows = result.toArray();
    const cleanedRows = _cleanApiData(rows, clean);

    // Convert array of objects to column format for DataFrame
    if (Array.isArray(cleanedRows) && cleanedRows.length > 0) {
      const columns = {};
      const keys = Object.keys(cleanedRows[0]);

      for (const key of keys) {
        columns[key] = cleanedRows.map((row) => row[key]);
      }

      const newResult = new DataFrame(columns, {
        index: options.index,
        columns: options.columns,
        types: options.types,
      });
      result = newResult;
    } else {
      // Empty DataFrame or object with arrays
      const newResult = new DataFrame(cleanedRows || {}, {
        index: options.index,
        columns: options.columns,
        types: options.types,
      });
      result = newResult;
    }
  }

  return result;
}
