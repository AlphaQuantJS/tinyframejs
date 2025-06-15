import { Series } from '../../../core/dataframe/Series.js';
import { VectorFactory } from '../../../core/storage/VectorFactory.js';

/**
 * Apply a function to each column in a DataFrame
 *
 * @param {DataFrame} df - DataFrame to transform
 * @param {Function} func - Function to apply to each value
 * @param {Object} options - Options for apply
 * @param {boolean} [options.inplace=false] - Whether to modify the DataFrame in place
 * @param {string|string[]} [options.columns] - Columns to apply the function to (default: all columns)
 * @returns {DataFrame} - New DataFrame with transformed values or the original DataFrame if inplace=true
 */
export function apply(df, func, options = {}) {
  const { inplace = false, columns = df.columns } = options;

  // Validate function
  if (typeof func !== 'function') {
    throw new Error('Function to apply must be provided');
  }

  // Convert columns to array if it's a string
  const targetColumns = Array.isArray(columns) ? columns : [columns];

  // Validate columns
  for (const col of targetColumns) {
    if (!df.columns.includes(col)) {
      throw new Error(`Column '${col}' not found`);
    }
  }

  // Apply function to specified columns
  if (inplace) {
    // Directly modify the DataFrame's internal structure for inplace
    for (const col of targetColumns) {
      const values = df.col(col).toArray();
      const transformedValues = values.map((value, index) => {
        const result = func(value, index, col);
        // Convert null and undefined to NaN for test compatibility
        return result === null || result === undefined ? NaN : result;
      });

      // Create a new Series for this column
      const vector = VectorFactory.from(transformedValues);
      const series = new Series(vector, { name: col });

      // Update the Series in the DataFrame
      df._columns[col] = series;
    }

    return df;
  } else {
    // Create a new object to hold the transformed columns
    const result = {};

    // Copy all columns from the original DataFrame
    for (const col of df.columns) {
      result[col] = df.col(col).toArray();
    }

    // Apply function to specified columns
    for (const col of targetColumns) {
      const values = result[col];
      result[col] = values.map((value, index) => {
        const result = func(value, index, col);
        // Convert null and undefined to NaN for test compatibility
        return result === null || result === undefined ? NaN : result;
      });
    }

    return new df.constructor(result);
  }
}

/**
 * Apply a function to all columns in a DataFrame
 *
 * @param {DataFrame} df - DataFrame to transform
 * @param {Function} func - Function to apply to each value
 * @param {Object} options - Options for applyAll
 * @param {boolean} [options.inplace=false] - Whether to modify the DataFrame in place
 * @returns {DataFrame} - New DataFrame with transformed values or the original DataFrame if inplace=true
 */
export function applyAll(df, func, options = {}) {
  // Simply call apply with all columns
  return apply(df, func, { ...options, columns: df.columns });
}

/**
 * Register apply methods on DataFrame prototype
 * @param {Class} DataFrame - DataFrame class to extend
 */
export function register(DataFrame) {
  if (!DataFrame) {
    throw new Error('DataFrame instance is required');
  }

  DataFrame.prototype.apply = function (columns, func, options = {}) {
    // If first argument is a function, assume it's for all columns
    if (typeof columns === 'function') {
      const result = applyAll(this, columns, options);
      if (options.inplace) {
        return this;
      }
      return result;
    }

    const result = apply(this, func, { ...options, columns });
    if (options.inplace) {
      return this;
    }
    return result;
  };

  DataFrame.prototype.applyAll = function (func, options = {}) {
    const result = applyAll(this, func, options);
    if (options.inplace) {
      return this;
    }
    return result;
  };
}
