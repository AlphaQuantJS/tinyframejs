/**
 * Filtering method: query$
 *
 * This file provides the query$ method for filtering DataFrame rows using template literals
 * for more intuitive syntax
 *
 * @module methods/dataframe/filtering/query$
 */

/**
 * Filters rows in a DataFrame using a template literal expression.
 * This provides a more intuitive syntax for filtering.
 *
 * @param {Object} df - DataFrame instance
 * @param {TemplateStringsArray} strings - Template strings array
 * @param {...any} values - Values to interpolate into the template
 * @returns {Object} - New DataFrame with filtered rows
 *
 * @example
 * // Filter rows where age > 40
 * df.query$`age > 40`
 * // Filter rows where age > 30 and salary > 100000
 * df.query$`age > 30 && salary > 100000`
 * // Filter rows where city includes "Francisco"
 * df.query$`city_includes("Francisco")`
 */
export function query$(df, strings, ...values) {
  // Create an expression from the template string
  const expression = String.raw({ raw: strings }, ...values);

  // Transform the expression, replacing string methods with special functions
  const processedExpr = expression
    .replace(/([a-zA-Z0-9_]+)_includes\(([^)]+)\)/g, '$1.includes($2)')
    .replace(/([a-zA-Z0-9_]+)_startsWith\(([^)]+)\)/g, '$1.startsWith($2)')
    .replace(/([a-zA-Z0-9_]+)_endsWith\(([^)]+)\)/g, '$1.endsWith($2)')
    .replace(/([a-zA-Z0-9_]+)_match\(([^)]+)\)/g, '$1.match($2)');

  // Create a predicate function for filtering rows
  const predicate = createPredicate(processedExpr);

  // Get DataFrame rows
  const rows = df.toArray();

  // Filter rows by predicate
  const filteredRows = rows.filter((row) => predicate(row));

  // If no matching rows, return an empty DataFrame with the same structure
  if (filteredRows.length === 0) {
    const emptyData = {};
    for (const col of df.columns) {
      emptyData[col] = [];
    }
    return new df.constructor(emptyData, df._options);
  }

  // Create a new DataFrame from filtered rows while preserving array types
  const filteredData = {};
  const allColumns = df.columns;

  // Get indices of rows that passed the filter
  const selectedIndices = [];
  for (let i = 0; i < rows.length; i++) {
    if (predicate(rows[i])) {
      selectedIndices.push(i);
    }
  }

  // Create new columns while preserving array types
  for (const col of allColumns) {
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

  return new df.constructor(filteredData, df._options);
}

/**
 * Create a predicate function for filtering rows
 * 
 * @param {string} expr - Expression to evaluate
 * @returns {Function} - Predicate function
 * @private
 */
function createPredicate(expr) {
  try {
    // Use Function instead of eval for better security
    return new Function(
      'row',
      `
      try {
        with (row) {
          return ${expr};
        }
      } catch (e) {
        return false;
      }
      `,
    );
  } catch (e) {
    throw new Error(`Invalid expression: ${expr}. Error: ${e.message}`);
  }
}

// Export the query$ method directly
export { query$ };
