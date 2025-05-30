/**
 * Фильтрует строки DataFrame с использованием SQL-подобного синтаксиса
 *
 * @param {DataFrame} df - Экземпляр DataFrame
 * @param {string} queryString - SQL-подобный запрос
 * @returns {DataFrame} - Новый DataFrame с отфильтрованными строками
 */
export const query = (df, queryString) => {
  if (typeof queryString !== 'string') {
    throw new Error('Запрос должен быть строкой');
  }

  // Получаем данные из DataFrame
  const rows = df.toArray();

  // Создаем функцию для оценки запроса
  const evaluateQuery = createQueryEvaluator(queryString);

  // Фильтруем строки с помощью функции оценки
  const filteredRows = rows.filter((row) => {
    try {
      return evaluateQuery(row);
    } catch (e) {
      throw new Error(`Ошибка при оценке запроса для строки: ${e.message}`);
    }
  });

  // Если нет отфильтрованных строк, создаем пустой DataFrame с теми же колонками
  if (filteredRows.length === 0) {
    // Создаем пустой объект с теми же колонками, но пустыми массивами
    const emptyData = {};
    for (const col of df.columns) {
      // Сохраняем тип массива, если это типизированный массив
      const originalArray = df.col(col).toArray();
      if (
        ArrayBuffer.isView(originalArray) &&
        !(originalArray instanceof DataView)
      ) {
        const TypedArrayConstructor = originalArray.constructor;
        emptyData[col] = new TypedArrayConstructor(0);
      } else {
        emptyData[col] = [];
      }
    }
    return new df.constructor(emptyData);
  }

  // Создаем новый DataFrame с сохранением типов массивов
  const filteredData = {};
  for (const col of df.columns) {
    const originalArray = df.col(col).toArray();
    const values = filteredRows.map((row) => row[col]);

    // Если оригинальный массив был типизированным, создаем новый типизированный массив
    if (
      ArrayBuffer.isView(originalArray) &&
      !(originalArray instanceof DataView)
    ) {
      const TypedArrayConstructor = originalArray.constructor;
      filteredData[col] = new TypedArrayConstructor(values);
    } else {
      filteredData[col] = values;
    }
  }

  return new df.constructor(filteredData);
};

/**
 * Создает функцию для оценки SQL-подобного запроса
 * @param {string} queryString - SQL-подобный запрос
 * @returns {Function} - Функция, оценивающая запрос для строки
 */
function createQueryEvaluator(queryString) {
  // Заменяем операторы сравнения на JavaScript-эквиваленты
  const jsQuery = queryString
    .replace(/(\w+)\s*=\s*([^=\s][^=]*)/g, '$1 == $2') // = -> ==
    .replace(
      /(\w+)\s+IN\s+\((.*?)\)/gi,
      'Array.isArray([$2]) && [$2].includes($1)',
    ) // IN -> includes
    .replace(/(\w+)\s+LIKE\s+['"]%(.*?)%['"]/gi, '$1.includes("$2")') // LIKE '%...%' -> includes
    .replace(/(\w+)\s+LIKE\s+['"]%(.*)['"]/gi, '$1.endsWith("$2")') // LIKE '%...' -> endsWith
    .replace(/(\w+)\s+LIKE\s+['"](.*)%['"]/gi, '$1.startsWith("$2")') // LIKE '...%' -> startsWith
    .replace(
      /(\w+)\s+BETWEEN\s+(\S+)\s+AND\s+(\S+)/gi,
      '($1 >= $2 && $1 <= $3)',
    ); // BETWEEN -> >= && <=

  // Создаем функцию для оценки запроса
  try {
    return new Function(
      'row',
      `
      try {
        with (row) {
          return ${jsQuery};
        }
      } catch (e) {
        return false;
      }
    `,
    );
  } catch (e) {
    throw new Error(`Неверный синтаксис запроса: ${e.message}`);
  }
}

/**
 * Регистрирует метод query в прототипе DataFrame
 * @param {Class} DataFrame - Класс DataFrame для расширения
 */
export const register = (DataFrame) => {
  DataFrame.prototype.query = function (queryString) {
    return query(this, queryString);
  };
};

export default { query, register };
