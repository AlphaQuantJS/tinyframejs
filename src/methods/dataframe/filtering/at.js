/**
 * Selects a single row from a DataFrame by index.
 *
 * @param {DataFrame} df - DataFrame instance
 * @param {number} index - Row index to select
 * @returns {Object} - Object representing the selected row
 */
export const at = (df, index) => {
  // Проверяем, что индекс является целым числом
  if (!Number.isInteger(index)) {
    throw new Error(
      `Index must be an integer, got ${typeof index === 'number' ? index : typeof index}`,
    );
  }

  // Проверяем, что индекс не отрицательный
  if (index < 0) {
    throw new Error(`Negative indices are not supported, got ${index}`);
  }

  const rows = df.toArray();

  // Проверяем, что индекс находится в допустимом диапазоне
  if (index >= rows.length) {
    throw new Error(
      `Index ${index} is out of bounds for DataFrame with ${rows.length} rows`,
    );
  }

  // Проверяем, что DataFrame не пустой
  if (rows.length === 0) {
    throw new Error('Cannot get row from empty DataFrame');
  }

  return rows[index];
};

/**
 * Registers the at method on DataFrame prototype
 * @param {Class} DataFrame - DataFrame class to extend
 */
export const register = (DataFrame) => {
  DataFrame.prototype.at = function (index) {
    return at(this, index);
  };
};

export default { at, register };
