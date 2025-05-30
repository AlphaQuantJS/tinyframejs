/**
 * Selects rows and columns from a DataFrame by integer positions.
 *
 * @param {DataFrame} df - DataFrame instance
 * @param {number|number[]|Function} rowSelector - Row indices to select
 * @param {number|number[]|Function} [colSelector] - Column indices to select
 * @returns {DataFrame|Object} - New DataFrame with selected rows and columns, or a single row if only one row is selected
 */
export const iloc = (df, rowSelector, colSelector) => {
  const rows = df.toArray();
  const allColumns = df.columns;
  const rowCount = df.rowCount;

  // Определяем индексы строк для выбора
  let selectedIndices = [];

  if (typeof rowSelector === 'number') {
    // Один индекс строки
    const idx = rowSelector < 0 ? rowCount + rowSelector : rowSelector;
    if (idx < 0 || idx >= rowCount) {
      throw new Error(
        `Row index ${rowSelector} is out of bounds for DataFrame with ${rowCount} rows`,
      );
    }
    selectedIndices = [idx];
  } else if (Array.isArray(rowSelector)) {
    // Массив индексов строк
    selectedIndices = rowSelector.map((idx) => {
      const adjustedIdx = idx < 0 ? rowCount + idx : idx;
      if (adjustedIdx < 0 || adjustedIdx >= rowCount) {
        throw new Error(
          `Row index ${idx} is out of bounds for DataFrame with ${rowCount} rows`,
        );
      }
      return adjustedIdx;
    });
  } else if (typeof rowSelector === 'function') {
    // Функция, возвращающая true/false для каждого индекса строки
    for (let i = 0; i < rowCount; i++) {
      if (rowSelector(i)) {
        selectedIndices.push(i);
      }
    }
  } else if (rowSelector === undefined || rowSelector === null) {
    // Выбираем все строки, если селектор не указан
    selectedIndices = Array.from({ length: rowCount }, (_, i) => i);
  } else {
    throw new Error(
      'Invalid row selector: must be a number, array of numbers, or function',
    );
  }

  // Если не указан селектор колонок, возвращаем все колонки для выбранных строк
  if (colSelector === undefined || colSelector === null) {
    // Создаем новый DataFrame с сохранением типов массивов
    const filteredData = {};
    for (const col of allColumns) {
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

  // Определяем индексы колонок для выбора
  let selectedColumnIndices = [];
  if (typeof colSelector === 'number') {
    // Один индекс колонки
    const idx = colSelector < 0 ? allColumns.length + colSelector : colSelector;
    if (idx < 0 || idx >= allColumns.length) {
      throw new Error(
        `Column index ${colSelector} is out of bounds for DataFrame with ${allColumns.length} columns`,
      );
    }
    selectedColumnIndices = [idx];
  } else if (Array.isArray(colSelector)) {
    // Массив индексов колонок
    selectedColumnIndices = colSelector.map((idx) => {
      const adjustedIdx = idx < 0 ? allColumns.length + idx : idx;
      if (adjustedIdx < 0 || adjustedIdx >= allColumns.length) {
        throw new Error(
          `Column index ${idx} is out of bounds for DataFrame with ${allColumns.length} columns`,
        );
      }
      return adjustedIdx;
    });
  } else if (typeof colSelector === 'function') {
    // Функция, возвращающая true/false для каждого индекса колонки
    for (let i = 0; i < allColumns.length; i++) {
      if (colSelector(i)) {
        selectedColumnIndices.push(i);
      }
    }
  } else {
    throw new Error(
      'Invalid column selector: must be a number, array of numbers, or function',
    );
  }

  // Получаем имена выбранных колонок
  const selectedColumns = selectedColumnIndices.map((idx) => allColumns[idx]);

  // Если выбрана только одна строка и одна колонка, возвращаем значение
  if (
    selectedIndices.length === 1 &&
    selectedColumns.length === 1 &&
    typeof rowSelector === 'number' &&
    typeof colSelector === 'number'
  ) {
    return df.col(selectedColumns[0]).toArray()[selectedIndices[0]];
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
 * Registers the iloc method on DataFrame prototype
 * @param {Class} DataFrame - DataFrame class to extend
 */
export const register = (DataFrame) => {
  DataFrame.prototype.iloc = function (rowSelector, colSelector) {
    return iloc(this, rowSelector, colSelector);
  };
};

export default { iloc, register };
