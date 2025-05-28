/**
 * Counts non-null, non-undefined, non-NaN values in a column.
 *
 * @param {Object} options - Options object
 * @param {Function} options.validateColumn - Function to validate column
 * @returns {Function} - Function that counts valid values in a column
 */
export const count =
  ({ validateColumn }) =>
    (df, column) => {
    // Validate that the column exists
      validateColumn(df, column);

      // Get Series for the column and count valid values
      const series = df.col(column);
      const values = series.toArray();

      let validCount = 0;
      for (let i = 0; i < values.length; i++) {
        const value = values[i];
        if (value !== null && value !== undefined && !Number.isNaN(value)) {
          validCount++;
        }
      }

      return validCount;
    };

/**
 * Registers the count method on DataFrame prototype
 * @param {Class} DataFrame - DataFrame class to extend
 */
export const register = (DataFrame) => {
  // Создаем валидатор для проверки существования колонки
  const validateColumn = (df, column) => {
    if (!df.columns.includes(column)) {
      throw new Error(`Column '${column}' not found`);
    }
  };

  // Создаем функцию count с валидатором
  const countFn = count({ validateColumn });

  // Регистрируем метод count в прототипе DataFrame
  DataFrame.prototype.count = function(column) {
    return countFn(this, column);
  };
};

export default { count, register };
