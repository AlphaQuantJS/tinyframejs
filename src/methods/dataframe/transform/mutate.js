import { Series } from '../../../core/dataframe/Series.js';
import { VectorFactory } from '../../../core/storage/VectorFactory.js';

/**
 * Creates new columns or modifies existing columns in a DataFrame by applying functions to each row
 *
 * @param {DataFrame} df - DataFrame to transform
 * @param {Object} columnFunctions - Object with functions to create or modify columns
 * @param {Object} options - Options for mutate
 * @param {boolean} [options.inplace=false] - Whether to modify the DataFrame in place
 * @returns {DataFrame} - New DataFrame with modified columns or original DataFrame if inplace=true
 */
export function mutate(df, columnFunctions, options = {}) {
  const { inplace = false } = options;

  // Validate inputs
  if (!columnFunctions || typeof columnFunctions !== 'object') {
    throw new Error('Column functions must be specified as an object');
  }

  // Get row count
  const rowCount = df.rowCount;

  // Convert DataFrame to array of row objects for processing
  const rows = df.toArray();

  // If inplace=true, modify DataFrame directly
  if (inplace) {
    // Apply mutation functions to each column
    for (const [colName, colFunc] of Object.entries(columnFunctions)) {
      if (typeof colFunc !== 'function') {
        throw new Error(`Value for column '${colName}' must be a function`);
      }

      // Create new column by applying function to each row
      const values = [];

      // Process each row
      for (let i = 0; i < rowCount; i++) {
        // Apply the transformation function with correct parameters
        const result = colFunc(rows[i], i, df);

        // Convert null/undefined to NaN
        values.push(result === null || result === undefined ? NaN : result);
      }

      // Create new Series for this column
      const vector = VectorFactory.from(values);
      const series = new Series(vector, { name: colName });

      // Update or add Series to DataFrame
      df._columns[colName] = series;

      // If this is a new column, update the _order array
      if (!df._order.includes(colName)) {
        // Since _order is frozen, we need to create a new array and replace it
        const newOrder = [...df._order, colName];
        Object.defineProperty(df, '_order', { value: Object.freeze(newOrder) });
      }
    }

    // Return the original DataFrame
    return df;
  } else {
    // Create a new object to store all columns
    const newData = {};

    // Copy existing columns
    for (const col of df.columns) {
      newData[col] = df.col(col).toArray();
    }

    // Apply mutation functions to each column
    for (const [colName, colFunc] of Object.entries(columnFunctions)) {
      if (typeof colFunc !== 'function') {
        throw new Error(`Value for column '${colName}' must be a function`);
      }

      // Create new column
      newData[colName] = [];

      // Process each row
      for (let i = 0; i < rowCount; i++) {
        // Apply the transformation function with correct parameters
        const result = colFunc(rows[i], i, df);

        // Convert null/undefined to NaN
        newData[colName].push(
          result === null || result === undefined ? NaN : result,
        );
      }
    }

    // Create a new DataFrame with updated data
    return new df.constructor(newData);
  }
}

/**
 * Registers the mutate method in DataFrame prototype
 *
 * @param {Class} DataFrame - DataFrame class to extend
 */
export function register(DataFrame) {
  if (!DataFrame) {
    throw new Error('DataFrame class is required');
  }

  DataFrame.prototype.mutate = function (columnFunctions, options = {}) {
    return mutate(this, columnFunctions, options);
  };
}
