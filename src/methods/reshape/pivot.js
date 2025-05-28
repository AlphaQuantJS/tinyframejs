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
  if (!df.columns.includes(index)) {
    throw new Error(`Index column '${index}' not found`);
  }
  if (!df.columns.includes(columns)) {
    throw new Error(`Columns column '${columns}' not found`);
  }
  if (!df.columns.includes(values)) {
    throw new Error(`Values column '${values}' not found`);
  }

  // Convert DataFrame to array of rows
  const rows = df.toArray();

  // Get unique values for the index and columns
  const uniqueIndices = [...new Set(rows.map((row) => row[index]))];
  const uniqueColumns = [...new Set(rows.map((row) => row[columns]))];

  // Create a map to store values
  const valueMap = new Map();

  // Group values by index and column
  for (const row of rows) {
    const indexValue = row[index];
    const columnValue = row[columns];
    const value = row[values];

    const key = `${indexValue}|${columnValue}`;
    if (!valueMap.has(key)) {
      valueMap.set(key, []);
    }
    valueMap.get(key).push(value);
  }

  // Create new pivoted rows
  const pivotedRows = uniqueIndices.map((indexValue) => {
    const newRow = { [index]: indexValue };

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
  DataFrame.prototype.pivot = function(index, columns, values, aggFunc) {
    return pivot(this, index, columns, values, aggFunc);
  };
};

export default { pivot, register };
