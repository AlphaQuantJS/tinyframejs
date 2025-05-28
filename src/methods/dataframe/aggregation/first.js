/**
 * Returns the first value in a column.
 *
 * @param {Object} options - Options object
 * @param {Function} options.validateColumn - Function to validate column
 * @returns {Function} - Function that returns the first value in a column
 */
export const first =
  ({ validateColumn }) =>
    (df, column) => {
    // Для пустых фреймов сразу возвращаем undefined
      if (!df || !df.columns || df.columns.length === 0 || df.rowCount === 0) {
        return undefined;
      }

      // Validate that the column exists - это выбросит ошибку для несуществующей колонки
      validateColumn(df, column);

      try {
      // Get Series for the column and extract values
        const series = df.col(column);

        // Если серия не существует, возвращаем undefined
        if (!series) return undefined;

        const values = series.toArray();

        // Если массив пустой, возвращаем undefined
        if (values.length === 0) return undefined;

        // Возвращаем первое значение, даже если оно null, undefined или NaN
        return values[0];
      } catch (error) {
      // В случае ошибки возвращаем undefined
        return undefined;
      }
    };

/**
 * Registers the first method on DataFrame prototype
 * @param {Class} DataFrame - DataFrame class to extend
 */
export const register = (DataFrame) => {
  // Создаем валидатор для проверки существования колонки
  const validateColumn = (df, column) => {
    if (!df.columns.includes(column)) {
      throw new Error(`Column '${column}' not found`);
    }
  };

  // Создаем функцию first с валидатором
  const firstFn = first({ validateColumn });

  // Регистрируем метод first в прототипе DataFrame
  DataFrame.prototype.first = function(column) {
    return firstFn(this, column);
  };
};

export default { first, register };
