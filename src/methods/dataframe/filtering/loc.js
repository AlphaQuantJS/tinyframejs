/**
 * Выбирает строки и колонки DataFrame по меткам
 *
 * @param {DataFrame} df - Экземпляр DataFrame
 * @param {Array|Function|Object} rowSelector - Селектор строк (массив индексов, функция-предикат или объект с условиями)
 * @param {Array|string} [colSelector] - Селектор колонок (массив имен колонок или одна колонка)
 * @returns {DataFrame|Object} - Новый DataFrame с выбранными строками и колонками или объект, если выбрана одна строка
 */
export const loc = (df, rowSelector, colSelector) => {
  // Получаем данные из DataFrame
  const rows = df.toArray();
  const rowCount = df.rowCount;

  // Определяем строки для выбора
  let selectedRows = [];
  let selectedIndices = [];

  if (Array.isArray(rowSelector)) {
    // Если rowSelector - массив индексов
    // Проверяем, что все индексы в пределах допустимого диапазона
    for (const index of rowSelector) {
      if (index < 0 || index >= rowCount) {
        throw new Error(
          `Индекс строки ${index} выходит за пределы допустимого диапазона [0, ${rowCount - 1}]`,
        );
      }
    }
    selectedIndices = rowSelector;
    selectedRows = rows.filter((_, index) => rowSelector.includes(index));
  } else if (typeof rowSelector === 'number') {
    // Если rowSelector - числовой индекс
    if (rowSelector < 0 || rowSelector >= rowCount) {
      throw new Error(
        `Индекс строки ${rowSelector} выходит за пределы допустимого диапазона [0, ${rowCount - 1}]`,
      );
    }
    selectedIndices = [rowSelector];
    selectedRows = [rows[rowSelector]];
  } else if (typeof rowSelector === 'function') {
    // Если rowSelector - функция-предикат
    selectedRows = rows.filter(rowSelector);
    selectedIndices = rows
      .map((row, index) => (rowSelector(row) ? index : -1))
      .filter((index) => index !== -1);
  } else if (typeof rowSelector === 'object' && rowSelector !== null) {
    // Если rowSelector - объект с условиями
    selectedIndices = [];
    selectedRows = [];
    rows.forEach((row, index) => {
      let match = true;
      for (const [key, value] of Object.entries(rowSelector)) {
        if (row[key] !== value) {
          match = false;
          break;
        }
      }
      if (match) {
        selectedIndices.push(index);
        selectedRows.push(row);
      }
    });
  } else {
    throw new Error('Неверный тип селектора строк');
  }

  // Если не указан селектор колонок, возвращаем все колонки
  if (colSelector === undefined) {
    // Если выбрана только одна строка, возвращаем ее как объект
    if (selectedRows.length === 1 && typeof rowSelector !== 'function') {
      return selectedRows[0];
    }

    // Создаем новый DataFrame с сохранением типов массивов
    const filteredData = {};
    for (const col of df.columns) {
      const originalArray = df.col(col).toArray();
      const values = selectedIndices.map((index) => originalArray[index]);

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
  }

  // Определяем колонки для выбора
  let selectedColumns = [];

  if (Array.isArray(colSelector)) {
    // Если colSelector - массив имен колонок
    selectedColumns = colSelector;
  } else if (typeof colSelector === 'string') {
    // Если colSelector - одна колонка
    selectedColumns = [colSelector];
  } else {
    throw new Error('Неверный тип селектора колонок');
  }

  // Проверяем, что все указанные колонки существуют
  for (const column of selectedColumns) {
    if (!df.columns.includes(column)) {
      throw new Error(`Колонка '${column}' не найдена`);
    }
  }

  // Если выбрана только одна строка и одна колонка, возвращаем значение
  if (
    selectedRows.length === 1 &&
    selectedColumns.length === 1 &&
    typeof rowSelector !== 'function'
  ) {
    return selectedRows[0][selectedColumns[0]];
  }

  // Создаем новый DataFrame с сохранением типов массивов
  const filteredData = {};
  for (const col of selectedColumns) {
    const originalArray = df.col(col).toArray();
    const values = selectedIndices.map((index) => originalArray[index]);

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
 * Регистрирует метод loc в прототипе DataFrame
 * @param {Class} DataFrame - Класс DataFrame для расширения
 */
export const register = (DataFrame) => {
  DataFrame.prototype.loc = function (rowSelector, colSelector) {
    return loc(this, rowSelector, colSelector);
  };
};

export default { loc, register };
