/**
 * Finds the minimum value in a column.
 *
 * @param {Object} options - Options object
 * @param {Function} options.validateColumn - Function to validate column
 * @returns {Function} - Function that finds minimum value in a column
 */
export const min =
  ({ validateColumn }) =>
    (df, column) => {
    // Для пустых фреймов сразу возвращаем null
      if (!df || !df.columns || df.columns.length === 0) {
        return null;
      }

      // Validate that the column exists - это выбросит ошибку для несуществующей колонки
      validateColumn(df, column);

      try {
      // Get Series for the column and extract values
        const series = df.col(column);

        // Если серия не существует, возвращаем null
        if (!series) return null;

        const values = series.toArray();

        // Если массив пустой, возвращаем null
        if (values.length === 0) return null;

        let minValue = Number.POSITIVE_INFINITY;
        let hasValidValue = false;

        for (let i = 0; i < values.length; i++) {
          const value = values[i];
          if (value === null || value === undefined || Number.isNaN(value))
            continue;

          const numValue = Number(value);
          if (!Number.isNaN(numValue)) {
            if (numValue < minValue) {
              minValue = numValue;
            }
            hasValidValue = true;
          }
        }

        return hasValidValue ? minValue : null;
      } catch (error) {
      // В случае ошибки возвращаем null
        return null;
      }
    };

/**
 * Registers the min method on DataFrame prototype
 * @param {Class} DataFrame - DataFrame class to extend
 */
export const register = (DataFrame) => {
  // Создаем валидатор для проверки существования колонки
  const validateColumn = (df, column) => {
    if (!df.columns.includes(column)) {
      throw new Error(`Column '${column}' not found`);
    }
  };

  // Создаем функцию min с валидатором
  const minFn = min({ validateColumn });

  // Регистрируем метод min в прототипе DataFrame
  DataFrame.prototype.min = function(column) {
    return minFn(this, column);
  };
};

export default { min, register };
