/**
 * Выбирает случайную выборку строк из DataFrame
 *
 * @param {DataFrame} df - Экземпляр DataFrame
 * @param {number|Object} n - Количество строк для выборки или объект с опциями
 * @param {Object} [options] - Дополнительные опции
 * @param {number} [options.seed] - Seed для генератора случайных чисел
 * @param {boolean} [options.replace=false] - Выборка с возвращением
 * @param {boolean} [options.fraction] - Доля строк для выборки (0 < fraction <= 1)
 * @returns {DataFrame} - Новый DataFrame с выбранными строками
 */
export const sample = (df, n, options = {}) => {
  // Обработка случая, когда n - это объект с опциями
  if (typeof n === 'object') {
    options = n;
    n = undefined;
  }

  // Получаем данные из DataFrame
  const rows = df.toArray();
  if (rows.length === 0) {
    return new df.constructor({});
  }

  // Определяем количество строк для выборки
  let sampleSize;
  if (options.fraction !== undefined) {
    if (options.fraction <= 0 || options.fraction > 1) {
      throw new Error('Доля выборки должна быть в диапазоне (0, 1]');
    }
    sampleSize = Math.round(rows.length * options.fraction);
  } else {
    sampleSize = n !== undefined ? n : 1;
  }

  // Проверка корректности количества строк
  if (sampleSize <= 0) {
    throw new Error(
      'Количество строк для выборки должно быть положительным числом',
    );
  }

  // Проверка, что размер выборки является целым числом
  if (!Number.isInteger(sampleSize)) {
    throw new Error('Количество строк для выборки должно быть целым числом');
  }

  // Если выборка без возвращения и размер выборки больше количества строк
  if (!options.replace && sampleSize > rows.length) {
    throw new Error(
      `Размер выборки (${sampleSize}) не может быть больше количества строк (${rows.length})`,
    );
  }

  // Создаем генератор случайных чисел с seed, если указан
  const random =
    options.seed !== undefined ? createSeededRandom(options.seed) : Math.random;

  // Выбираем строки
  const sampledRows = [];
  if (options.replace) {
    // Выборка с возвращением
    for (let i = 0; i < sampleSize; i++) {
      const index = Math.floor(random() * rows.length);
      sampledRows.push(rows[index]);
    }
  } else {
    // Выборка без возвращения (используем алгоритм Фишера-Йейтса)
    const indices = Array.from({ length: rows.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    for (let i = 0; i < sampleSize; i++) {
      sampledRows.push(rows[indices[i]]);
    }
  }

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
 * Регистрирует метод sample в прототипе DataFrame
 * @param {Class} DataFrame - Класс DataFrame для расширения
 */
export const register = (DataFrame) => {
  DataFrame.prototype.sample = function (n, options) {
    return sample(this, n, options);
  };
};

export default { sample, register };
