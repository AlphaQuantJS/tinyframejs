/**
 * Selects rows and columns from a DataFrame by labels
 *
 * @param {DataFrame} df - DataFrame instance
 * @param {Array|Function|Object} rowSelector - Row selector (array of indices, predicate function, or object with conditions)
 * @param {Array|string} [colSelector] - Column selector (array of column names or one column)
 * @returns {DataFrame|Object} - New DataFrame with selected rows and columns, or an object if only one row is selected
 */
export const loc = (df, rowSelector, colSelector) => {
  // Get data from DataFrame
  const rows = df.toArray();
  const rowCount = df.rowCount;

  // Define rows for selection
  let selectedRows = [];
  let selectedIndices = [];

  if (Array.isArray(rowSelector)) {
    // If rowSelector is an array of indices
    // Check that all indices are within the valid range
    for (const index of rowSelector) {
      if (index < 0 || index >= rowCount) {
        throw new Error(
          `Row index ${index} is out of bounds for DataFrame with ${rowCount} rows`,
        );
      }
    }
    selectedIndices = rowSelector;
    selectedRows = rows.filter((_, index) => rowSelector.includes(index));
  } else if (typeof rowSelector === 'number') {
    // If rowSelector is a number
    if (rowSelector < 0 || rowSelector >= rowCount) {
      throw new Error(
        `Row index ${rowSelector} is out of bounds for DataFrame with ${rowCount} rows`,
      );
    }
    selectedIndices = [rowSelector];
    selectedRows = [rows[rowSelector]];
  } else if (typeof rowSelector === 'function') {
    // If rowSelector is a predicate function
    selectedRows = rows.filter(rowSelector);
    selectedIndices = rows
      .map((row, index) => (rowSelector(row) ? index : -1))
      .filter((index) => index !== -1);
  } else if (typeof rowSelector === 'object' && rowSelector !== null) {
    // If rowSelector is an object with conditions
    selectedIndices = [];
    selectedRows = [];
    rows.forEach((row, index) => {
      let match = true;
      for (const [key, value] of Object.entries(rowSelector)) {
        if (row[key] !== value) {
          match = false;
          break;
        }
      }
      if (match) {
        selectedIndices.push(index);
        selectedRows.push(row);
      }
    });
  } else {
    throw new Error('Invalid row selector type');
  }

  // If no column selector is specified, return all columns
  if (colSelector === undefined) {
    // If only one row is selected, return it as an object
    if (selectedRows.length === 1 && typeof rowSelector !== 'function') {
      return selectedRows[0];
    }

    // Create a new DataFrame preserving typed arrays
    const filteredData = {};
    for (const col of df.columns) {
      const originalArray = df.col(col).toArray();
      const values = selectedIndices.map((index) => originalArray[index]);

      // If the original array was typed, create a new typed array
      if (
        ArrayBuffer.isView(originalArray) &&
        !(originalArray instanceof DataView)
      ) {
        const TypedArrayConstructor = originalArray.constructor;
        filteredData[col] = new TypedArrayConstructor(values);
      } else {
        filteredData[col] = values;
      }
    }

    return new df.constructor(filteredData);
  }

  // Define columns for selection
  let selectedColumns = [];

  if (Array.isArray(colSelector)) {
    // If colSelector is an array of column names
    selectedColumns = colSelector;
  } else if (typeof colSelector === 'string') {
    // If colSelector is a single column name
    selectedColumns = [colSelector];
  } else {
    throw new Error('Invalid column selector type');
  }

  // Check that all specified columns exist
  for (const column of selectedColumns) {
    if (!df.columns.includes(column)) {
      throw new Error(`Column '${column}' not found`);
    }
  }

  // If only one row and one column is selected, return the value
  if (
    selectedRows.length === 1 &&
    selectedColumns.length === 1 &&
    typeof rowSelector !== 'function'
  ) {
    return selectedRows[0][selectedColumns[0]];
  }

  // Create a new DataFrame preserving typed arrays
  const filteredData = {};
  for (const col of selectedColumns) {
    const originalArray = df.col(col).toArray();
    const values = selectedIndices.map((index) => originalArray[index]);

    // If the original array was typed, create a new typed array
    if (
      ArrayBuffer.isView(originalArray) &&
      !(originalArray instanceof DataView)
    ) {
      const TypedArrayConstructor = originalArray.constructor;
      filteredData[col] = new TypedArrayConstructor(values);
    } else {
      filteredData[col] = values;
    }
  }

  return new df.constructor(filteredData);
};

/**
 * Registers the loc method on DataFrame prototype
 * @param {Class} DataFrame - DataFrame class to extend
 */
export const register = (DataFrame) => {
  DataFrame.prototype.loc = function (rowSelector, colSelector) {
    return loc(this, rowSelector, colSelector);
  };
};

export default { loc, register };
