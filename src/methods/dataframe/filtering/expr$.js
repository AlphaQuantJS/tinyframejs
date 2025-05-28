/**
 * Filters rows in a DataFrame using a template literal expression.
 * This provides a more intuitive syntax for filtering.
 *
 * @param {DataFrame} df - DataFrame instance
 * @param {Function} expressionFn - Tagged template function with the expression
 * @returns {DataFrame} - New DataFrame with filtered rows
 *
 * @example
 * // Filter rows where age > 30 and city includes "York"
 * df.expr$`age > 30 && city.includes("York")`
 */
export const expr$ = (df, expressionFn) => {
  // Get the expression from the tagged template
  const [template, ...substitutions] = expressionFn.raw;
  const expression = String.raw({ raw: template }, ...substitutions);

  // Convert DataFrame to array of rows
  const rows = df.toArray();

  // Create a function that evaluates the expression for each row
  const createPredicate = (expr) =>
    // This approach uses Function constructor which is safer than eval
    // It creates a function that takes a row as parameter and evaluates the expression
    new Function(
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
  const predicate = createPredicate(expression);

  // Apply predicate to each row
  const filteredRows = rows.filter((row) => predicate(row));

  // Create new DataFrame from filtered rows
  return df.constructor.fromRows(filteredRows);
};

/**
 * Registers the expr$ method on DataFrame prototype
 * @param {Class} DataFrame - DataFrame class to extend
 */
export const register = (DataFrame) => {
  DataFrame.prototype.expr$ = function(strings, ...values) {
    // Create a function that mimics a tagged template literal
    const expressionFn = { raw: strings };
    return expr$(this, expressionFn);
  };
};

export default { expr$, register };
