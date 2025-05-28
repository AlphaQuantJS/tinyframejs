/**
 * Filters rows in a DataFrame based on a condition for a specific column.
 * Supports various comparison operators.
 *
 * @param {DataFrame} df - DataFrame instance
 * @param {string} column - Column name
 * @param {string} operator - Comparison operator ('==', '===', '!=', '!==', '>', '>=', '<', '<=', 'in', 'contains', 'startsWith', 'endsWith', 'matches')
 * @param {*} value - Value to compare against
 * @returns {DataFrame} - New DataFrame with filtered rows
 */
export const where = (df, column, operator, value) => {
  if (!df.columns.includes(column)) {
    throw new Error(`Column '${column}' not found`);
  }

  // Get data from column
  const series = df.col(column);
  const columnData = series.toArray();
  const rows = df.toArray();

  // Define predicates for different operators
  const predicates = {
    '==': (a, b) => a == b,
    '===': (a, b) => a === b,
    '!=': (a, b) => a != b,
    '!==': (a, b) => a !== b,
    '>': (a, b) => a > b,
    '>=': (a, b) => a >= b,
    '<': (a, b) => a < b,
    '<=': (a, b) => a <= b,
    in: (a, b) => Array.isArray(b) && b.includes(a),
    contains: (a, b) => String(a).includes(String(b)),
    startsWith: (a, b) => String(a).startsWith(String(b)),
    startswith: (a, b) => String(a).startsWith(String(b)),
    endsWith: (a, b) => String(a).endsWith(String(b)),
    endswith: (a, b) => String(a).endsWith(String(b)),
    matches: (a, b) =>
      (b instanceof RegExp ? b.test(String(a)) : new RegExp(b).test(String(a))),
  };

  // Check if operator is supported
  if (!predicates[operator]) {
    throw new Error(`Unsupported operator: '${operator}'`);
  }

  // Apply predicate to each row
  const predicate = predicates[operator];
  const filteredIndices = [];

  for (let i = 0; i < columnData.length; i++) {
    if (predicate(columnData[i], value)) {
      filteredIndices.push(i);
    }
  }

  // Create new DataFrame from filtered rows
  const filteredRows = filteredIndices.map((i) => rows[i]);
  return df.constructor.fromRows(filteredRows);
};

/**
 * Registers the where method on DataFrame prototype
 * @param {Class} DataFrame - DataFrame class to extend
 */
export const register = (DataFrame) => {
  DataFrame.prototype.where = function(column, operator, value) {
    return where(this, column, operator, value);
  };
};

export default { where, register };
