/**
 * Categorize values in a column into discrete categories
 *
 * @param {DataFrame} df - DataFrame instance
 * @param {string} column - Column name to categorize
 * @param {Object} categories - Object mapping values to categories
 * @param {Object} options - Additional options
 * @param {boolean} [options.inplace=false] - Whether to modify the DataFrame in place
 * @param {*} [options.defaultCategory=null] - Default category for values not in the categories object
 * @param {string} [options.targetColumn] - Name of the target column, defaults to `${column}_categorized`
 * @returns {DataFrame} - New DataFrame with categorized column or the original DataFrame if inplace=true
 */
export function categorize(df, column, categories, options = {}) {
  // Validate arguments
  if (!df || typeof df !== 'object') {
    throw new Error('DataFrame instance is required');
  }

  // Validate column
  if (!column || typeof column !== 'string') {
    throw new Error('Column name must be a string');
  }

  if (!df.columns.includes(column)) {
    throw new Error(`Column '${column}' not found`);
  }

  // Validate categories
  if (
    !categories ||
    typeof categories !== 'object' ||
    Array.isArray(categories)
  ) {
    throw new Error(
      'Categories must be an object mapping values to categories',
    );
  }

  const { inplace = false, defaultCategory = null } = options;

  // Get column values
  const values = df.col(column).toArray();

  // Categorize values
  const categorized = values.map((value) => {
    // If the value is in categories, return the corresponding category
    if (value in categories) {
      return categories[value];
    }

    // Otherwise return defaultCategory
    return defaultCategory;
  });

  // Create a new object to hold the result
  const result = {};

  // Copy all columns using public API
  for (const col of df.columns) {
    result[col] = df.col(col).toArray();
  }

  // Add the categorized column
  const targetColumn = options.targetColumn || `${column}_categorized`;
  result[targetColumn] = categorized;

  // Return new DataFrame or modify in place
  if (inplace) {
    // For inplace modification, we need to modify the original DataFrame directly
    // This requires accessing internal properties of DataFrame
    // Note: This approach is not ideal as it relies on internal implementation details
    // but is necessary for the inplace functionality to work correctly

    // Create a new Series for the categorized column
    const Series = df.col(df.columns[0]).constructor;
    const categorizedSeries = new Series(categorized, { name: targetColumn });

    // Add the new Series to the DataFrame's internal _columns object
    df._columns[targetColumn] = categorizedSeries;

    // Update the order array to include the new column if it's not already there
    if (!df._order.includes(targetColumn)) {
      // Since _order is frozen, we need to create a new array and replace it
      // This is a bit of a hack, but it's the best we can do with the current implementation
      const newOrder = [...df._order, targetColumn];
      Object.defineProperty(df, '_order', { value: Object.freeze(newOrder) });
    }

    return df;
  }

  // Create a new DataFrame with the categorized column
  return new df.constructor(result);
}

/**
 * Registers the categorize method on DataFrame prototype
 * @param {Class} DataFrame - DataFrame class to extend
 */
export function register(DataFrame) {
  if (!DataFrame) {
    throw new Error('DataFrame class is required');
  }

  DataFrame.prototype.categorize = function (column, categories, options = {}) {
    const result = categorize(this, column, categories, options);
    if (options.inplace) {
      // For inplace modification, return this (the original DataFrame instance)
      return this;
    }
    return result;
  };
}
