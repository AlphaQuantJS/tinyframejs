/**
 * Unpivots a DataFrame from wide to long format.
 * This is the inverse of pivot - transforms columns into rows.
 *
 * @param {DataFrame} df - DataFrame instance
 * @param {string[]} idVars - Columns to use as identifier variables (not to be melted)
 * @param {string[]} [valueVars] - Columns to unpivot
 * (if not specified, all columns not in idVars will be used)
 * @param {string} [varName='variable'] - Name for the variable column
 * @param {string} [valueName='value'] - Name for the value column
 * @returns {DataFrame} - Melted DataFrame
 */
export const melt = (
  df,
  idVars,
  valueVars,
  varName = 'variable',
  valueName = 'value',
) => {
  // Validate id variables
  for (const col of idVars) {
    if (!df.columns.includes(col)) {
      throw new Error(`ID variable '${col}' not found`);
    }
  }

  // If valueVars not specified, use all columns not in idVars
  if (!valueVars) {
    valueVars = df.columns.filter((col) => !idVars.includes(col));
  } else {
    // Validate value variables
    for (const col of valueVars) {
      if (!df.columns.includes(col)) {
        throw new Error(`Value variable '${col}' not found`);
      }
    }
  }

  // Convert DataFrame to array of rows
  const rows = df.toArray();

  // Create melted rows
  const meltedRows = [];

  for (const row of rows) {
    // Extract id variables for this row
    const idValues = {};
    for (const idVar of idVars) {
      idValues[idVar] = row[idVar];
    }

    // Create a new row for each value variable
    for (const valueVar of valueVars) {
      const meltedRow = {
        ...idValues,
        [varName]: valueVar,
        [valueName]: row[valueVar],
      };

      meltedRows.push(meltedRow);
    }
  }

  // Create new DataFrame from melted rows
  return df.constructor.fromRows(meltedRows);
};

/**
 * Registers the melt method on DataFrame prototype
 * @param {Class} DataFrame - DataFrame class to extend
 */
export const register = (DataFrame) => {
  DataFrame.prototype.melt = function(idVars, valueVars, varName, valueName) {
    return melt(this, idVars, valueVars, varName, valueName);
  };
};

export default { melt, register };
