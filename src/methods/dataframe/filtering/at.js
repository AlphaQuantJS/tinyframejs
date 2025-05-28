/**
 * Selects a single row from a DataFrame by index.
 *
 * @param {DataFrame} df - DataFrame instance
 * @param {number} index - Row index to select
 * @returns {Object} - Object representing the selected row
 */
export const at = (df, index) => {
  const rows = df.toArray();

  if (index < 0) {
    // Handle negative indices (count from the end)
    index = rows.length + index;
  }

  if (index < 0 || index >= rows.length) {
    throw new Error(
      `Index ${index} is out of bounds for DataFrame with ${rows.length} rows`,
    );
  }

  return rows[index];
};

/**
 * Registers the at method on DataFrame prototype
 * @param {Class} DataFrame - DataFrame class to extend
 */
export const register = (DataFrame) => {
  DataFrame.prototype.at = function(index) {
    return at(this, index);
  };
};

export default { at, register };
