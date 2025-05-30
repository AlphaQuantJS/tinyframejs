/**
 * Выбирает колонки DataFrame, соответствующие регулярному выражению
 *
 * @param {DataFrame} df - Экземпляр DataFrame
 * @param {RegExp|string} pattern - Регулярное выражение или строка для поиска
 * @returns {DataFrame} - Новый DataFrame только с выбранными колонками
 */
export const selectByPattern = (df, pattern) => {
  // Проверка типа паттерна
  if (typeof pattern !== 'string' && !(pattern instanceof RegExp)) {
    throw new TypeError(
      'Паттерн должен быть строкой или регулярным выражением',
    );
  }

  // Преобразуем строку в регулярное выражение, если необходимо
  const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);

  // Находим колонки, соответствующие паттерну
  const matchedColumns = df.columns.filter((column) => regex.test(column));

  // Если не найдено ни одной колонки, возвращаем пустой DataFrame
  if (matchedColumns.length === 0) {
    // Создаем пустой DataFrame
    return new df.constructor({});
  }

  // Создаем новый объект с данными только для выбранных колонок
  const selectedData = {};

  // Сохраняем типы массивов
  for (const column of matchedColumns) {
    // Получаем данные из оригинального DataFrame
    selectedData[column] = df.col(column).toArray();
  }

  // Создаем новый DataFrame с выбранными колонками, сохраняя тип хранилища
  return new df.constructor(selectedData);
};

/**
 * Регистрирует метод selectByPattern в прототипе DataFrame
 * @param {Class} DataFrame - Класс DataFrame для расширения
 */
export const register = (DataFrame) => {
  DataFrame.prototype.selectByPattern = function (pattern) {
    return selectByPattern(this, pattern);
  };
};

export default { selectByPattern, register };
