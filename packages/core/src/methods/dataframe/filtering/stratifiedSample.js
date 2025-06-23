/*-------------------------------------------------------------------------*
 |  DataFrame -› filtering · stratifiedSample()                           |
 |                                                                         |
 |  df.stratifiedSample('category', 100) → sample of 100 rows preserving  |
 |  category proportions.                                                 |
 |  df.stratifiedSample('category', { frac: 0.1 }) → sample of 10% rows.  |
 *-------------------------------------------------------------------------*/

import { createTypedSeries } from '../../../data/utils/createTypedArray.js';

/**
 * Selects a stratified sample from a DataFrame, preserving category proportions.
 *
 * @param {Object} df - DataFrame instance
 * @param {string} stratifyColumn - Column name to stratify by
 * @param {number|Object} nOrOptions - Number of rows to sample or options object with frac property
 * @param {Object} [options] - Additional options
 * @param {number} [options.seed] - Seed for random number generator
 * @returns {Object} - New DataFrame with sampled rows
 */
export function stratifiedSample(df, stratifyColumn, nOrOptions, options = {}) {
  // Check that DataFrame is not empty
  if (df.rowCount === 0) {
    throw new Error('DataFrame is empty');
  }
  
  // Check if the stratify column exists
  if (!df.columns.includes(stratifyColumn)) {
    throw new Error("Column not found");
  }

  // Determine if we're using count (n) or fraction (frac)
  let n;
  let fraction;
  
  if (typeof nOrOptions === 'object' && nOrOptions !== null) {
    // Use options object with frac property
    fraction = nOrOptions.frac;
    if (fraction === undefined) {
      throw new Error('When using options object, frac property must be specified');
    }
    if (fraction <= 0 || fraction > 1) {
      throw new Error('Fraction must be in the range (0, 1]');
    }
    // Calculate n based on fraction
    n = Math.round(df.rowCount * fraction);
    // Merge options
    options = { ...nOrOptions, ...options };
  } else {
    // Use n (count) directly
    n = nOrOptions;
    // Validate n
    if (typeof n !== 'number') {
      throw new Error('Number of rows to sample must be a number');
    }
    if (n < 0) {
      throw new Error('Number of rows to sample must be a positive number');
    }
    if (!Number.isInteger(n)) {
      throw new Error('Number of rows to sample must be an integer');
    }
    if (n > df.rowCount) {
      throw new Error(`Sample size (${n}) cannot be greater than number of rows (${df.rowCount})`);
    }
    // Calculate fraction based on n
    fraction = n / df.rowCount;
  }

  // Get data from DataFrame
  const rows = df.toArray();

  // Group rows by categories
  const categories = {};
  rows.forEach((row) => {
    const category = row[stratifyColumn];
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(row);
  });

  // Create random number generator with seed if specified
  const random =
    options.seed !== undefined ? createSeededRandom(options.seed) : Math.random;

  // Sample rows from each category, preserving proportions
  const sampledRows = [];
  Object.entries(categories).forEach(([category, categoryRows]) => {
    // Calculate number of rows to sample from this category
    let sampleSize = Math.round(categoryRows.length * fraction);

    // Ensure each category has at least one row
    sampleSize = Math.max(1, sampleSize);
    sampleSize = Math.min(categoryRows.length, sampleSize);

    // Shuffle rows and select the required number
    const shuffled = [...categoryRows].sort(() => 0.5 - random());
    sampledRows.push(...shuffled.slice(0, sampleSize));
  });

  // If no results, create an empty DataFrame with the same columns and column types
  if (sampledRows.length === 0) {
    // Create a new DataFrame instance with the same options as the original
    const result = new df.constructor({}, df._options);
    
    // For each column, create a Series with the appropriate type
    for (const col of df.columns) {
      // Get the original column data to determine its type
      const originalColumn = df._columns[col];
      const originalArray = originalColumn.vector.__data;
      
      // Create an empty array with the same type
      if (ArrayBuffer.isView(originalArray) && !(originalArray instanceof DataView)) {
        const TypedArrayConstructor = originalArray.constructor;
        const emptyTypedArray = new TypedArrayConstructor(0);
        result._columns[col] = createTypedSeries(emptyTypedArray, col, df);
      } else {
        result._columns[col] = createTypedSeries([], col, df);
      }
      
      // Add to column order
      if (!result._order.includes(col)) {
        result._order.push(col);
      }
    }
    
    return result;
  }

  // For non-empty results, create a new DataFrame with filtered rows
  // Create a new DataFrame instance with the same options as the original
  const result = new df.constructor({}, df._options);
  
  // For each column, create a Series with the appropriate type
  for (const col of df.columns) {
    // Get the original column data to determine its type
    const originalColumn = df._columns[col];
    const originalArray = originalColumn.vector.__data;
    
    // Extract values for this column from the sampled rows
    const values = sampledRows.map(row => row[col]);
    
    // Preserve the array type if it's a typed array
    if (ArrayBuffer.isView(originalArray) && !(originalArray instanceof DataView)) {
      const TypedArrayConstructor = originalArray.constructor;
      const typedValues = new TypedArrayConstructor(values.length);
      values.forEach((value, i) => {
        typedValues[i] = value;
      });
      result._columns[col] = createTypedSeries(typedValues, col, df);
    } else {
      result._columns[col] = createTypedSeries(values, col, df);
    }
    
    // Add to column order
    if (!result._order.includes(col)) {
      result._order.push(col);
    }
  }
  
  return result;
}

/**
 * Creates a seeded random number generator
 * 
 * @param {number} seed - Seed for random number generator
 * @returns {Function} - Function returning a pseudo-random number in range [0, 1)
 * @private
 */
function createSeededRandom(seed) {
  return function () {
    // Simple linear congruential generator
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

// Export object with method for the pool
export default { stratifiedSample };
