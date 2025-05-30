/**
 * Filters rows in a DataFrame based on a predicate function
 *
 * @param {DataFrame} df - Экземпляр DataFrame
 * @param {Function} predicate - Функция-предикат для фильтрации строк
 * @returns {DataFrame} - New DataFrame with filtered rows
 */
export const filter = (df, predicate) => {
  if (typeof predicate !== 'function') {
    throw new Error('Predicate must be a function');
  }

  // Convert DataFrame to array of rows
  const rows = df.toArray();

  // Apply predicate to each row
  const filteredRows = rows.filter(predicate);

  // Если нет результатов, создаем пустой DataFrame с теми же колонками
  if (filteredRows.length === 0) {
    // Создаем пустой объект с теми же колонками, но пустыми массивами
    const emptyData = {};
    for (const col of df.columns) {
      // Сохраняем тип массива, если это типизированный массив
      const originalArray = df._columns[col].vector.__data;
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
    const originalArray = df._columns[col].vector.__data;
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
 * Registers the filter method on DataFrame prototype
 * @param {Class} DataFrame - DataFrame class to extend
 */
export const register = (DataFrame) => {
  DataFrame.prototype.filter = function (predicate) {
    return filter(this, predicate);
  };
};

export default { filter, register };
