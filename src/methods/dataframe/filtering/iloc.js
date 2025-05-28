/**
 * Selects rows and columns from a DataFrame by integer positions.
 *
 * @param {DataFrame} df - DataFrame instance
 * @param {number|number[]|Function} rowSelector - Row indices to select
 * @param {number|number[]|Function} [colSelector] - Column indices to select
 * @returns {DataFrame|Object} - New DataFrame with selected rows and columns, or a single row if only one row is selected
 */
export const iloc = (df, rowSelector, colSelector) => {
  const rows = df.toArray();
  const allColumns = df.columns;

  // Process row selector
  let selectedRows = [];
  if (typeof rowSelector === 'number') {
    // Single row index
    const idx = rowSelector < 0 ? rows.length + rowSelector : rowSelector;
    if (idx < 0 || idx >= rows.length) {
      throw new Error(
        `Row index ${rowSelector} is out of bounds for DataFrame with ${rows.length} rows`,
      );
    }
    selectedRows = [rows[idx]];
  } else if (Array.isArray(rowSelector)) {
    // Array of row indices
    selectedRows = rowSelector.map((idx) => {
      const adjustedIdx = idx < 0 ? rows.length + idx : idx;
      if (adjustedIdx < 0 || adjustedIdx >= rows.length) {
        throw new Error(
          `Row index ${idx} is out of bounds for DataFrame with ${rows.length} rows`,
        );
      }
      return rows[adjustedIdx];
    });
  } else if (typeof rowSelector === 'function') {
    // Function that returns true/false for each row index
    selectedRows = rows.filter((_, idx) => rowSelector(idx));
  } else if (rowSelector === undefined || rowSelector === null) {
    // Select all rows if no selector provided
    selectedRows = rows;
  } else {
    throw new Error(
      'Invalid row selector: must be a number, array of numbers, or function',
    );
  }

  // If no column selector, return the selected rows
  if (colSelector === undefined || colSelector === null) {
    // If only one row was selected, return it as an object
    if (selectedRows.length === 1 && typeof rowSelector === 'number') {
      return selectedRows[0];
    }
    return df.constructor.fromRows(selectedRows);
  }

  // Process column selector
  let selectedColumns = [];
  if (typeof colSelector === 'number') {
    // Single column index
    const idx = colSelector < 0 ? allColumns.length + colSelector : colSelector;
    if (idx < 0 || idx >= allColumns.length) {
      throw new Error(
        `Column index ${colSelector} is out of bounds for DataFrame with ${allColumns.length} columns`,
      );
    }
    selectedColumns = [allColumns[idx]];
  } else if (Array.isArray(colSelector)) {
    // Array of column indices
    selectedColumns = colSelector.map((idx) => {
      const adjustedIdx = idx < 0 ? allColumns.length + idx : idx;
      if (adjustedIdx < 0 || adjustedIdx >= allColumns.length) {
        throw new Error(
          `Column index ${idx} is out of bounds for DataFrame with ${allColumns.length} columns`,
        );
      }
      return allColumns[adjustedIdx];
    });
  } else if (typeof colSelector === 'function') {
    // Function that returns true/false for each column index
    selectedColumns = allColumns.filter((_, idx) => colSelector(idx));
  } else {
    throw new Error(
      'Invalid column selector: must be a number, array of numbers, or function',
    );
  }

  // Filter rows to only include selected columns
  const filteredRows = selectedRows.map((row) => {
    const filteredRow = {};
    for (const col of selectedColumns) {
      filteredRow[col] = row[col];
    }
    return filteredRow;
  });

  // If only one row was selected, return it as an object
  if (filteredRows.length === 1 && typeof rowSelector === 'number') {
    return filteredRows[0];
  }

  return df.constructor.fromRows(filteredRows);
};

/**
 * Registers the iloc method on DataFrame prototype
 * @param {Class} DataFrame - DataFrame class to extend
 */
export const register = (DataFrame) => {
  DataFrame.prototype.iloc = function(rowSelector, colSelector) {
    return iloc(this, rowSelector, colSelector);
  };
};

export default { iloc, register };
