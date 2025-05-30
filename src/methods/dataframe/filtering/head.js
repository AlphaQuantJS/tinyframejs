/**
 * Возвращает первые n строк DataFrame
 *
 * @param {DataFrame} df - Экземпляр DataFrame
 * @param {number} [n=5] - Количество строк для возврата
 * @param {Object} [options] - Дополнительные опции
 * @param {boolean} [options.print=false] - Опция для совместимости с другими библиотеками
 * @returns {DataFrame} - Новый DataFrame с первыми n строками
 */
export const head = (df, n = 5, options = { print: false }) => {
  // Проверка входных параметров
  if (n <= 0) {
    throw new Error('Number of rows must be a positive number');
  }
  if (!Number.isInteger(n)) {
    throw new Error('Number of rows must be an integer');
  }

  // Получаем данные из DataFrame
  const rows = df.toArray();

  // Выбираем первые n строк (или все, если их меньше n)
  const selectedRows = rows.slice(0, n);

  // Создаем новый DataFrame из выбранных строк
  const result = df.constructor.fromRows(selectedRows);

  // Примечание: опция print сохранена для совместимости с API, но в текущей версии не используется
  // В будущем можно добавить метод print в DataFrame

  return result;
};

/**
 * Регистрирует метод head в прототипе DataFrame
 * @param {Class} DataFrame - Класс DataFrame для расширения
 */
export const register = (DataFrame) => {
  DataFrame.prototype.head = function (n, options) {
    return head(this, n, options);
  };
};

export default { head, register };
