/**
 * Formats the DataFrame as a string table for console display.
 * @param frame
 * @param {Object} options - Display options
 * @param {number} [options.maxRows=10] - Maximum number of rows to display
 * @param {number} [options.maxCols=Infinity] - Maximum number of columns to display
 * @param {boolean} [options.showIndex=true] - Whether to show row indices
 * @returns {string} Formatted table string
 */
function formatTable(frame, options = {}) {
  const { maxRows = 10, maxCols = Infinity, showIndex = true } = options;

  // Convert frame to array of objects for easier processing
  const columns = Object.keys(frame.columns);
  const rowCount = frame.rowCount;
  const columnNames = columns.slice(0, maxCols);

  // Create data array with limited rows
  const data = [];
  for (let i = 0; i < Math.min(rowCount, maxRows); i++) {
    const row = {};
    for (const name of columnNames) {
      row[name] = frame.columns[name][i];
    }
    data.push(row);
  }

  // Calculate column widths
  const colWidths = {};
  columnNames.forEach((col) => {
    colWidths[col] = Math.max(
      String(col).length,
      ...data.map((row) => String(row[col] ?? '').length),
    );
  });

  if (showIndex) {
    const indexWidth = String(data.length - 1).length;
    colWidths['index'] = Math.max(indexWidth, 5); // Minimum width for index column
  }

  // Build header
  let result = '';
  if (showIndex) {
    result += ' '.repeat(colWidths['index'] + 1) + '| ';
  }

  columnNames.forEach((col) => {
    result += String(col).padEnd(colWidths[col] + 2);
  });
  result += '\n';

  // Add separator
  if (showIndex) {
    result += '-'.repeat(colWidths['index'] + 1) + '+ ';
  }

  columnNames.forEach((col) => {
    result += '-'.repeat(colWidths[col] + 2);
  });
  result += '\n';

  // Add data rows
  data.forEach((row, i) => {
    if (showIndex) {
      result += String(i).padStart(colWidths['index']) + ' | ';
    }

    columnNames.forEach((col) => {
      result += String(row[col] ?? '').padEnd(colWidths[col] + 2);
    });
    result += '\n';
  });

  // Add footer if there are more rows
  if (rowCount > maxRows) {
    result += `\n... ${rowCount - maxRows} more rows`;
  }

  // Add footer if there are more columns
  if (columns.length > maxCols) {
    result += `\n... ${columns.length - maxCols} more columns`;
  }

  return result;
}

/**
 * Prints the DataFrame to the console.
 * @param {{ validateColumn(frame, column): void }} deps
 * @returns {(frame: TinyFrame, options?: Object) => void}
 */
export const print =
  () =>
  (frame, options = {}) => {
    const formattedTable = formatTable(frame, options);
    console.log(formattedTable);
    return frame; // Return the frame for method chaining
  };
