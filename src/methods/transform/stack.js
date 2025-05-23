/**
 * Converts a DataFrame from wide format to long format (similar to melt).
 *
 * @param {object} frame - The TinyFrame to transform
 * @param {string|string[]} idVars - Column(s) to use as identifier variables
 * @param {string|string[]} [valueVars=null] - Column(s) to unpivot. If null, uses all columns not in idVars
 * @param {string} [varName='variable'] - Name for the variable column
 * @param {string} [valueName='value'] - Name for the value column
 * @param frame.validateColumn
 * @returns {object} A new TinyFrame with stacked data
 */
export const stack =
  ({ validateColumn }) =>
  (
    frame,
    idVars,
    valueVars = null,
    varName = 'variable',
    valueName = 'value',
  ) => {
    // Validate parameters
    if (!idVars) {
      throw new Error('idVars parameter is required');
    }

    // Convert idVars to array if it's a string
    const idCols = Array.isArray(idVars) ? idVars : [idVars];

    // Validate all id columns
    for (const col of idCols) {
      validateColumn(frame, col);
    }

    // Determine value columns to stack
    let valueCols = valueVars;
    if (!valueCols) {
      // If valueVars is not provided, use all columns not in idVars
      valueCols = Object.keys(frame.columns).filter(
        (col) => !idCols.includes(col),
      );
    } else if (!Array.isArray(valueCols)) {
      // Convert valueVars to array if it's a string
      valueCols = [valueCols];
    }

    // Validate all value columns
    for (const col of valueCols) {
      validateColumn(frame, col);
    }

    // Calculate the number of rows in the result DataFrame
    const resultRowCount = frame.rowCount * valueCols.length;

    // Create result columns
    const resultColumns = {};

    // Add id columns
    for (const idCol of idCols) {
      resultColumns[idCol] = new Array(resultRowCount);

      // Repeat each id value for each value column
      for (let i = 0; i < frame.rowCount; i++) {
        for (let j = 0; j < valueCols.length; j++) {
          resultColumns[idCol][i * valueCols.length + j] =
            frame.columns[idCol][i];
        }
      }
    }

    // Add variable column
    resultColumns[varName] = new Array(resultRowCount);

    // Fill with value column names
    for (let i = 0; i < frame.rowCount; i++) {
      for (let j = 0; j < valueCols.length; j++) {
        resultColumns[varName][i * valueCols.length + j] = valueCols[j];
      }
    }

    // Add value column
    resultColumns[valueName] = new Array(resultRowCount);

    // Fill with values from the original frame
    for (let i = 0; i < frame.rowCount; i++) {
      for (let j = 0; j < valueCols.length; j++) {
        resultColumns[valueName][i * valueCols.length + j] =
          frame.columns[valueCols[j]][i];
      }
    }

    // Create and return the new frame
    return {
      columns: resultColumns,
      dtypes: frame.dtypes,
      columnNames: Object.keys(resultColumns),
      rowCount: resultRowCount,
      metadata: {
        stackedFrom: Object.keys(frame.columns).filter(
          (col) => !idCols.includes(col) && valueCols.includes(col),
        ),
        idColumns: idCols,
        variableColumn: varName,
        valueColumn: valueName,
      },
    };
  };
