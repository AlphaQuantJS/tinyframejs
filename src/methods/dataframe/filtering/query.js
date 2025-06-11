/**
 * Filters DataFrame rows using SQL-like syntax
 *
 * @param {DataFrame} df - DataFrame instance
 * @param {string} queryString - SQL-like query string
 * @returns {DataFrame} - New DataFrame with filtered rows
 */
export const query = (df, queryString) => {
  if (typeof queryString !== 'string') {
    throw new Error('Query must be a string');
  }

  // Get data from DataFrame
  const rows = df.toArray();

  // Create a function to evaluate the query
  const evaluateQuery = createQueryEvaluator(queryString);

  // Filter rows using the evaluation function
  const filteredRows = rows.filter((row) => {
    try {
      return evaluateQuery(row);
    } catch (e) {
      throw new Error(`Error evaluating query for row: ${e.message}`);
    }
  });

  // If no rows are filtered, create an empty DataFrame with the same columns
  if (filteredRows.length === 0) {
    // Create an empty object with the same columns, but empty arrays
    const emptyData = {};
    for (const col of df.columns) {
      // Save the array type if it's a typed array
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

  // Create a new DataFrame preserving typed arrays
  const filteredData = {};
  for (const col of df.columns) {
    const originalArray = df.col(col).toArray();
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
 * Creates a function to evaluate an SQL-like query
 * @param {string} queryString - SQL-like query string
 * @returns {Function} - Function evaluating the query for a row
 */
function createQueryEvaluator(queryString) {
  // Replace comparison operators with JavaScript equivalents
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

  // Create a function to evaluate the query
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
    throw new Error(`Invalid query syntax: ${e.message}`);
  }
}

/**
 * Registers the query method on DataFrame prototype
 * @param {Class} DataFrame - DataFrame class to extend
 */
export const register = (DataFrame) => {
  DataFrame.prototype.query = function (queryString) {
    return query(this, queryString);
  };
};

export default { query, register };
