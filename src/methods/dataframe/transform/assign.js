/**
 * Adds or updates columns in a DataFrame.
 *
 * @param {DataFrame} df - DataFrame instance
 * @param {Object} columns - Object with column names as keys and arrays or Series as values
 * @returns {DataFrame} - New DataFrame with added/updated columns
 */
export const assign = (df, columns) => {
  // Проверяем, что df существует и является объектом
  if (!df || typeof df !== 'object') {
    throw new Error('DataFrame instance is required');
  }

  // Use the built-in assign method if available
  if (df && typeof df.assign === 'function') {
    return df.assign(columns);
  }

  // Create a copy of the existing columns
  const newData = {};

  // Copy existing columns
  const columnNames = Array.isArray(df.columns) ? df.columns : [];
  for (const col of columnNames) {
    if (typeof df.col === 'function') {
      newData[col] = df.col(col).toArray();
    }
  }

  // Add or update columns
  for (const [key, value] of Object.entries(columns)) {
    // If value is a Series, get its values
    const columnData =
      value && typeof value.toArray === 'function' ? value.toArray() : value;

    newData[key] = columnData;
  }

  // Create new DataFrame with updated columns
  return new df.constructor(newData);
};

/**
 * Registers the assign method on DataFrame prototype
 * @param {Class} DataFrame - DataFrame class to extend
 */
export const register = (DataFrame) => {
  DataFrame.prototype.assign = function(columns) {
    return assign(this, columns);
  };
};

export default { assign, register };
