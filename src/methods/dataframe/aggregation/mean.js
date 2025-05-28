/**
 * Calculates the mean (average) of values in a column.
 *
 * @param {Object} options - Options object
 * @param {Function} options.validateColumn - Function to validate column
 * @returns {Function} - Function that calculates mean of values in a column
 */
export const mean =
  ({ validateColumn }) =>
    (df, column) => {
    // Для пустых фреймов сразу возвращаем NaN
      if (!df || !df.columns || df.columns.length === 0) {
        return NaN;
      }

      // Validate that the column exists - это выбросит ошибку для несуществующей колонки
      validateColumn(df, column);

      try {
      // Get Series for the column and extract values
        const series = df.col(column);

        // Если серия не существует, возвращаем NaN
        if (!series) return NaN;

        const values = series.toArray();

        let sum = 0;
        let count = 0;

        for (let i = 0; i < values.length; i++) {
          const value = values[i];
          if (value !== null && value !== undefined && !Number.isNaN(value)) {
            sum += Number(value);
            count++;
          }
        }

        return count > 0 ? sum / count : NaN;
      } catch (error) {
      // В случае ошибки возвращаем NaN
        return NaN;
      }
    };

/**
 * Registers the mean method on DataFrame prototype
 * @param {Class} DataFrame - DataFrame class to extend
 */
export const register = (DataFrame) => {
  // Создаем валидатор для проверки существования колонки
  const validateColumn = (df, column) => {
    if (!df.columns.includes(column)) {
      throw new Error(`Column '${column}' not found`);
    }
  };

  // Создаем функцию mean с валидатором
  const meanFn = mean({ validateColumn });

  // Регистрируем метод mean в прототипе DataFrame
  DataFrame.prototype.mean = function(column) {
    return meanFn(this, column);
  };
};

export default { mean, register };
