/**
 * Filters rows in a DataFrame based on a predicate function.
 *
 * @param {DataFrame} df - DataFrame instance
 * @param {Function} predicate - Function that takes a row and returns true/false
 * @returns {DataFrame} - New DataFrame with filtered rows
 */
export const filter = (df, predicate) => {
  // Convert DataFrame to array of rows
  const rows = df.toArray();

  // Apply predicate to each row
  const filteredRows = rows.filter(predicate);

  // Create new DataFrame from filtered rows
  return df.constructor.fromRows(filteredRows);
};

/**
 * Registers the filter method on DataFrame prototype
 * @param {Class} DataFrame - DataFrame class to extend
 */
export const register = (DataFrame) => {
  DataFrame.prototype.filter = function(predicate) {
    return filter(this, predicate);
  };
};

export default { filter, register };
