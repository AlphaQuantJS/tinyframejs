/**
 * Filtering method: expr$
 *
 * This file provides the expr$ method for DataFrame rows using template literals
 * This provides a more intuitive syntax for filtering
 *
 * @module methods/dataframe/filtering/expr$
 */

import { createTypedSeries } from '../../../data/utils/createTypedArray.js';

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
 * // Filter rows where age > 30 and city includes "York"
 * df.expr$`age > 30 && city_includes("York")`
 */
export function expr$(df, strings, ...values) {
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
  const allColumns = df.columns;

  // Filter rows by predicate
  const filteredRows = rows.filter((row) => predicate(row));

  // If no matching rows, return an empty DataFrame with the same columns and column types
  if (filteredRows.length === 0) {
    // Create a new DataFrame instance with the same options as the original
    const result = new df.constructor({}, df._options);

    // For each column, create a Series with the appropriate type
    for (const col of allColumns) {
      // Get the original column data to determine its type
      const originalColumn = df._columns[col];
      const originalArray = originalColumn.vector.__data;

      // Create an empty array with the same type
      if (
        ArrayBuffer.isView(originalArray) &&
        !(originalArray instanceof DataView)
      ) {
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
  for (const col of allColumns) {
    // Get the original column data to determine its type
    const originalColumn = df._columns[col];
    const originalArray = originalColumn.vector.__data;

    // Extract values for this column from the filtered rows
    const values = filteredRows.map((row) => row[col]);

    // Preserve the array type if it's a typed array
    if (
      ArrayBuffer.isView(originalArray) &&
      !(originalArray instanceof DataView)
    ) {
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

// Export the expr$ method directly
