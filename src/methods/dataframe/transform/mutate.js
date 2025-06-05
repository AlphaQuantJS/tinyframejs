import { Series } from '../../../core/dataframe/Series.js';

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

  // Get row count and columns for processing
  const rowCount = df.rowCount;
  const columns = df.columns;

  // Process column functions and create new column arrays
  const newColumns = {};

  // For each column function
  for (const [colName, colFunc] of Object.entries(columnFunctions)) {
    if (typeof colFunc !== 'function') {
      throw new Error(`Value for column '${colName}' must be a function`);
    }

    // Create array for new column values
    const colValues = new Array(rowCount);

    // Process each row
    for (let i = 0; i < rowCount; i++) {
      // Build row object for this index
      const row = {};
      for (const col of columns) {
        row[col] = df.col(col).get(i);
      }

      // Apply the transformation function with correct parameters
      let result = colFunc(row, i, df);

      // Convert null/undefined to NaN
      if (result === null || result === undefined) {
        result = NaN;
      }

      colValues[i] = result;
    }

    // Store the column values
    newColumns[colName] = colValues;
  }

  if (inplace) {
    // Update existing columns and add new ones
    for (const [colName, colValues] of Object.entries(newColumns)) {
      // Create a new Series for this column
      const series = new Series(colValues, { name: colName });

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
    // Create a new DataFrame with all columns
    const newData = {};

    // Copy existing columns that aren't being modified
    for (const col of columns) {
      if (!(col in newColumns)) {
        newData[col] = df.col(col).toArray();
      } else {
        // Use the new values for modified columns
        newData[col] = newColumns[col];
      }
    }

    // Add completely new columns
    for (const colName of Object.keys(newColumns)) {
      if (!columns.includes(colName)) {
        newData[colName] = newColumns[colName];
      }
    }

    // Create a new DataFrame with the updated data
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
