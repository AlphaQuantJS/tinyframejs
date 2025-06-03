import { Series } from '../../../core/dataframe/Series.js';
import { VectorFactory } from '../../../core/storage/VectorFactory.js';

/**
 * Adds or updates columns in a DataFrame.
 *
 * @param {DataFrame} df - DataFrame instance
 * @param {Object} columns - Object with column names as keys and arrays or Series as values
 * @param {Object} options - Options for assign
 * @param {boolean} [options.inplace=false] - Whether to modify the DataFrame in place
 * @returns {DataFrame} - New DataFrame with added/updated columns or the original DataFrame if inplace=true
 */
export function assign(df, columns, options = {}) {
  // Validate arguments
  if (!df || typeof df !== 'object') {
    throw new Error('DataFrame instance is required');
  }

  if (!columns || typeof columns !== 'object' || Array.isArray(columns)) {
    throw new Error('Columns must be an object');
  }

  const { inplace = false } = options;

  // Process column values to handle Series, arrays, and constants
  const processedColumns = {};
  for (const [key, value] of Object.entries(columns)) {
    // If value is a Series, get its values
    if (value && typeof value.toArray === 'function') {
      processedColumns[key] = value.toArray();
    } else if (Array.isArray(value)) {
      processedColumns[key] = value;
    } else {
      // For constant values, create an array of that value
      processedColumns[key] = Array(df.rowCount).fill(value);
    }
  }

  if (inplace) {
    // For inplace modification, directly modify the DataFrame's internal structure
    for (const [key, values] of Object.entries(processedColumns)) {
      // Create a vector from the values
      const vector = VectorFactory.from(values);

      // Create a new Series for this column
      const series = new Series(vector, { name: key });

      // Update or add the Series to the DataFrame
      df._columns[key] = series;

      // If it's a new column, update the _order array
      if (!df._order.includes(key)) {
        // Since _order is frozen, we need to create a new array and replace it
        const newOrder = [...df._order, key];
        Object.defineProperty(df, '_order', { value: Object.freeze(newOrder) });
      }
    }

    // Return the original DataFrame instance
    return df;
  } else {
    // Create a new DataFrame with all columns
    const newData = {};

    // Copy existing columns
    for (const col of df.columns) {
      if (!(col in processedColumns)) {
        newData[col] = df.col(col).toArray();
      }
    }

    // Add new/updated columns
    Object.assign(newData, processedColumns);

    // Create a new DataFrame with the updated data
    return new df.constructor(newData);
  }
}

/**
 * Registers the assign method on DataFrame prototype
 * @param {Class} DataFrame - DataFrame class to extend
 */
export function register(DataFrame) {
  // Store the original reference to the DataFrame instance
  DataFrame.prototype.assign = function (columns, options = {}) {
    const result = assign(this, columns, options);
    if (options.inplace) {
      // For inplace modification, return this (the original DataFrame instance)
      return this;
    }
    return result;
  };
}
