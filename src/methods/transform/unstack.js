/**
 * Converts a DataFrame from long format to wide format (reverse of stack).
 *
 * @param {object} frame - The TinyFrame to transform
 * @param {string|string[]} index - Column(s) to use as the index
 * @param {string} column - Column to use for the new column names
 * @param {string} value - Column to use for the values
 * @param frame.validateColumn
 * @returns {object} A new TinyFrame with unstacked data
 */
export const unstack =
  ({ validateColumn }) =>
  (frame, index, column, value) => {
    // Validate parameters
    if (!index) {
      throw new Error('index parameter is required');
    }
    if (!column) {
      throw new Error('column parameter is required');
    }
    if (!value) {
      throw new Error('value parameter is required');
    }

    // Convert index to array if it's a string
    const indexCols = Array.isArray(index) ? index : [index];

    // Validate all columns
    for (const col of indexCols) {
      validateColumn(frame, col);
    }
    validateColumn(frame, column);
    validateColumn(frame, value);

    // Get unique values for the column that will become column names
    const uniqueColumnValues = [...new Set(frame.columns[column])];

    // Create a map of index values to row indices in the result DataFrame
    const indexToRowMap = new Map();
    const indexValues = [];

    for (let i = 0; i < frame.rowCount; i++) {
      // Create a composite key for multi-level indices
      const indexKey = indexCols.map((col) => frame.columns[col][i]).join('|');

      if (!indexToRowMap.has(indexKey)) {
        indexToRowMap.set(indexKey, indexValues.length);
        indexValues.push(indexCols.map((col) => frame.columns[col][i]));
      }
    }

    // Create result columns
    const resultColumns = {};

    // Add index columns
    for (let i = 0; i < indexCols.length; i++) {
      resultColumns[indexCols[i]] = indexValues.map((values) => values[i]);
    }

    // Create columns for each unique value in the column column
    for (const colValue of uniqueColumnValues) {
      const newColName = String(colValue);
      resultColumns[newColName] = new Array(indexValues.length).fill(null);
    }

    // Fill the result columns with values
    for (let i = 0; i < frame.rowCount; i++) {
      const indexKey = indexCols.map((col) => frame.columns[col][i]).join('|');
      const rowIndex = indexToRowMap.get(indexKey);
      const colValue = frame.columns[column][i];
      const valueValue = frame.columns[value][i];

      resultColumns[String(colValue)][rowIndex] = valueValue;
    }

    // Create and return the new frame
    return {
      columns: resultColumns,
      dtypes: frame.dtypes,
      columnNames: Object.keys(resultColumns),
      rowCount: indexValues.length,
      metadata: {
        unstackedColumn: column,
        valueColumn: value,
        indexColumns: indexCols,
      },
    };
  };
