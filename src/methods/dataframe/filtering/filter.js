/**
 * Filters rows in a DataFrame based on a predicate function or expression string
 *
 * @param {DataFrame} df - DataFrame instance
 * @param {Function|string} predicateOrExpression - Function or expression string to apply to each row
 * @returns {DataFrame} - New DataFrame with filtered rows
 */
export const filter = (df, predicateOrExpression) => {
  // If a string expression is provided, create a predicate function
  if (typeof predicateOrExpression === 'string') {
    try {
      // Create a function that evaluates the expression for each row

      const predicate = new Function(
        'row',
        `
        try {
          return ${predicateOrExpression};
        } catch (err) {
          throw new Error('Error evaluating expression: ' + err.message);
        }
      `,
      );

      // Check the expression on the first row if it exists
      if (df.rowCount > 0) {
        const firstRow = df.toArray()[0];
        try {
          predicate(firstRow);
        } catch (error) {
          throw new Error(
            `Invalid filter expression: ${predicateOrExpression}. ${error.message}`,
          );
        }
      }

      return filter(df, predicate);
    } catch (error) {
      throw new Error(
        `Invalid filter expression: ${predicateOrExpression}. ${error.message}`,
      );
    }
  }

  // Check that the argument is a function
  if (typeof predicateOrExpression !== 'function') {
    throw new Error('Predicate must be a function or a string expression');
  }

  const predicate = predicateOrExpression;

  // Convert DataFrame to array of rows
  const rows = df.toArray();

  // Apply predicate to each row
  const filteredRows = rows.filter(predicate);

  // If no results, create an empty DataFrame with the same columns
  if (filteredRows.length === 0) {
    // Create an empty object with the same columns, but empty arrays
    const emptyData = {};
    for (const col of df.columns) {
      // Save the array type, if it's a typed array
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

  // Create a new DataFrame with the same columns and types
  const filteredData = {};
  for (const col of df.columns) {
    const originalArray = df._columns[col].vector.__data;
    const values = filteredRows.map((row) => row[col]);

    // If the original array was typed, create a new typed array
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
  DataFrame.prototype.filter = function (predicateOrExpression) {
    return filter(this, predicateOrExpression);
  };
};

export default { filter, register };
