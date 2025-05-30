/**
 * Выбирает стратифицированную выборку из DataFrame, сохраняя пропорции категорий.
 *
 * @param {DataFrame} df - Экземпляр DataFrame
 * @param {string} stratifyColumn - Имя колонки для стратификации
 * @param {number} fraction - Доля строк для выборки (0 < fraction <= 1)
 * @param {Object} [options] - Дополнительные опции
 * @param {number} [options.seed] - Seed для генератора случайных чисел
 * @returns {DataFrame} - Новый DataFrame с выбранными строками
 */
export const stratifiedSample = (
  df,
  stratifyColumn,
  fraction,
  options = {},
) => {
  // Проверка входных параметров
  if (!df.columns.includes(stratifyColumn)) {
    throw new Error(`Колонка '${stratifyColumn}' не найдена`);
  }

  if (fraction <= 0 || fraction > 1) {
    throw new Error('Доля выборки должна быть в диапазоне (0, 1]');
  }

  // Получаем данные из DataFrame
  const rows = df.toArray();
  if (rows.length === 0) {
    // Возвращаем пустой DataFrame с тем же типом хранилища
    return new df.constructor({});
  }

  // Группируем строки по категориям
  const categories = {};
  rows.forEach((row) => {
    const category = row[stratifyColumn];
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(row);
  });

  // Создаем генератор случайных чисел с seed, если указан
  const random =
    options.seed !== undefined ? createSeededRandom(options.seed) : Math.random;

  // Выбираем строки из каждой категории, сохраняя пропорции
  const sampledRows = [];
  Object.entries(categories).forEach(([category, categoryRows]) => {
    // Вычисляем количество строк для выборки из этой категории
    let sampleSize = Math.round(categoryRows.length * fraction);

    // Гарантируем, что каждая категория имеет хотя бы одну строку
    sampleSize = Math.max(1, sampleSize);
    sampleSize = Math.min(categoryRows.length, sampleSize);

    // Перемешиваем строки и выбираем нужное количество
    const shuffled = [...categoryRows].sort(() => 0.5 - random());
    sampledRows.push(...shuffled.slice(0, sampleSize));
  });

  // Создаем новый DataFrame из выбранных строк
  return df.constructor.fromRows(sampledRows);
};

/**
 * Создает генератор псевдослучайных чисел с заданным seed
 * @param {number} seed - Начальное значение для генератора
 * @returns {Function} - Функция, возвращающая псевдослучайное число в диапазоне [0, 1)
 */
function createSeededRandom(seed) {
  return function () {
    // Простой линейный конгруэнтный генератор
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

/**
 * Регистрирует метод stratifiedSample в прототипе DataFrame
 * @param {Class} DataFrame - Класс DataFrame для расширения
 */
export const register = (DataFrame) => {
  DataFrame.prototype.stratifiedSample = function (
    stratifyColumn,
    fraction,
    options,
  ) {
    return stratifiedSample(this, stratifyColumn, fraction, options);
  };
};

export default { stratifiedSample, register };
