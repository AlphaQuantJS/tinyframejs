/**
 * Sort a DataFrame by a column
 *
 * @param {DataFrame} df - DataFrame to sort
 * @param {string} column - Column name to sort by
 * @param {Object} options - Sort options
 * @param {boolean} [options.descending=false] - Sort in descending order
 * @param {boolean} [options.inplace=false] - Modify the DataFrame in place
 * @returns {DataFrame} - Sorted DataFrame
 */
function sort(df, column, options = {}) {
  // Validate inputs
  if (!df || typeof df !== 'object') {
    throw new Error('DataFrame is required');
  }

  if (!column || typeof column !== 'string') {
    throw new Error('Column name is required');
  }

  // Check if column exists
  if (!df.columns.includes(column)) {
    throw new Error(`Column '${column}' not found in DataFrame`);
  }

  const { descending = false, inplace = false } = options;

  // Get column values using public API
  const values = df.col(column).toArray();

  // Create indices and sort them by column values
  const indices = Array.from({ length: values.length }, (_, i) => i);

  indices.sort((a, b) => {
    const valA = values[a];
    const valB = values[b];

    // Handle null, undefined, and NaN values
    if (
      valA === null ||
      valA === undefined ||
      (typeof valA === 'number' && isNaN(valA))
    ) {
      return 1; // Move nulls to the end
    }
    if (
      valB === null ||
      valB === undefined ||
      (typeof valB === 'number' && isNaN(valB))
    ) {
      return -1; // Move nulls to the end
    }

    // Compare values based on their types
    if (typeof valA === 'string' && typeof valB === 'string') {
      return descending ? valB.localeCompare(valA) : valA.localeCompare(valB);
    }

    // Default numeric comparison
    return descending ? valB - valA : valA - valB;
  });

  // Create a new object to hold the sorted columns
  const sortedData = {};

  // Sort each column using the sorted indices
  for (const colName of df.columns) {
    const colValues = df.col(colName).toArray();
    sortedData[colName] = indices.map((i) => colValues[i]);
  }

  if (inplace) {
    // For inplace modification, we need to modify the original DataFrame directly
    // This requires accessing internal properties of DataFrame
    // Note: This approach is not ideal as it relies on internal implementation details
    // but is necessary for the inplace functionality to work correctly

    // Create a new DataFrame with sorted data
    const newDf = new df.constructor(sortedData);

    // Replace the internal _columns object with the new one
    // This is a direct modification of the internal state
    for (const colName of df.columns) {
      if (df._columns[colName]) {
        // Replace the Series data with the sorted data
        const sortedSeries = newDf.col(colName);
        df._columns[colName] = sortedSeries;
      }
    }

    return df;
  }

  // Create a new DataFrame with the sorted data
  return new df.constructor(sortedData);
}

/**
 * Registers the sort method on DataFrame prototype
 * @param {Class} DataFrame - DataFrame class to extend
 */
function registerSort(DataFrame) {
  DataFrame.prototype.sort = function (column, options = {}) {
    const result = sort(this, column, options);
    if (options.inplace) {
      // For inplace modification, return this (the original DataFrame instance)
      return this;
    }
    return result;
  };
}

export { sort, registerSort };
