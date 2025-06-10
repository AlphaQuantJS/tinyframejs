/**
 * Pivots a DataFrame by transforming unique values from one column into multiple columns.
 *
 * @param {DataFrame} df - DataFrame instance
 * @param {string} index - Column to use as index
 * @param {string} columns - Column whose unique values will become new columns
 * @param {string} values - Column to aggregate
 * @param {Function} [aggFunc=first] - Aggregation function to use when there are multiple values
 * @returns {DataFrame} - Pivoted DataFrame
 */
export const pivot = (
  df,
  index,
  columns,
  values,
  aggFunc = (arr) => arr[0],
) => {
  // Handle array of index columns
  const indexCols = Array.isArray(index) ? index : [index];
  // Handle array of column columns
  const columnsCols = Array.isArray(columns) ? columns : [columns];

  // Check that all index columns exist
  for (const col of indexCols) {
    if (!df.columns.includes(col)) {
      throw new Error(`Index column '${col}' not found`);
    }
  }

  // Check that all columns columns exist
  for (const col of columnsCols) {
    if (!df.columns.includes(col)) {
      throw new Error(`Columns column '${col}' not found`);
    }
  }

  // Check that values column exists
  if (!df.columns.includes(values)) {
    throw new Error(`Values column '${values}' not found`);
  }

  // Convert DataFrame to array of rows
  const rows = df.toArray();

  // Get unique values for the index
  const uniqueIndices = [];
  if (indexCols.length === 1) {
    // Single index column
    uniqueIndices.push(...new Set(rows.map((row) => row[indexCols[0]])));
  } else {
    // Multiple index columns - create composite keys
    const indexKeys = new Set();
    rows.forEach((row) => {
      const key = indexCols.map((col) => row[col]).join('|');
      indexKeys.add(key);
    });
    uniqueIndices.push(...indexKeys);
  }

  // Get unique values for the columns
  const uniqueColumns = [];
  if (columnsCols.length === 1) {
    // Single column column
    uniqueColumns.push(...new Set(rows.map((row) => row[columnsCols[0]])));
  } else {
    // Multiple column columns - create composite keys
    const columnKeys = new Set();
    rows.forEach((row) => {
      const key = columnsCols.map((col) => row[col]).join('.');
      columnKeys.add(key);
    });
    uniqueColumns.push(...columnKeys);
  }

  // Create a map to store values
  const valueMap = new Map();

  // Group values by index and column
  for (const row of rows) {
    // Get index value (single or composite)
    let indexValue;
    if (indexCols.length === 1) {
      indexValue = row[indexCols[0]];
    } else {
      indexValue = indexCols.map((col) => row[col]).join('|');
    }

    // Get column value (single or composite)
    let columnValue;
    if (columnsCols.length === 1) {
      columnValue = row[columnsCols[0]];
    } else {
      columnValue = columnsCols.map((col) => row[col]).join('.');
    }

    const value = row[values];

    const key = `${indexValue}|${columnValue}`;
    if (!valueMap.has(key)) {
      valueMap.set(key, []);
    }
    valueMap.get(key).push(value);
  }

  // Create new pivoted rows
  const pivotedRows = uniqueIndices.map((indexValue) => {
    const newRow = {};

    // Set index column(s)
    if (indexCols.length === 1) {
      newRow[indexCols[0]] = indexValue;
    } else {
      // Split composite index back into individual columns
      const indexParts = indexValue.split('|');
      indexCols.forEach((col, i) => {
        newRow[col] = indexParts[i];
      });
    }

    // Set value columns
    for (const columnValue of uniqueColumns) {
      const key = `${indexValue}|${columnValue}`;
      const values = valueMap.get(key) || [];
      newRow[columnValue] = values.length > 0 ? aggFunc(values) : null;
    }

    return newRow;
  });

  // Create new DataFrame from pivoted rows
  return df.constructor.fromRows(pivotedRows);
};

/**
 * Registers the pivot method on DataFrame prototype
 * @param {Class} DataFrame - DataFrame class to extend
 */
export const register = (DataFrame) => {
  DataFrame.prototype.pivot = function (index, columns, values, aggFunc) {
    // Support for object parameter style
    if (
      typeof index === 'object' &&
      index !== null &&
      !(index instanceof Array)
    ) {
      const options = index;
      return pivot(
        this,
        options.index,
        options.columns,
        options.values,
        options.aggFunc,
      );
    }
    return pivot(this, index, columns, values, aggFunc);
  };
};

export default { pivot, register };
