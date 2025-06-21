/**
 * Print DataFrame to console
 *
 * @param {DataFrame} frame - DataFrame instance
 * @param {Object} options - Display options
 * @returns {DataFrame} Original DataFrame for chaining
 */

/**
 * Print DataFrame to console
 *
 * @param {DataFrame} frame - DataFrame instance
 * @param {Object} options - Display options
 * @returns {DataFrame} Original DataFrame for chaining
 */
export function print(frame, options = {}) {
  const { maxRows = 10, maxCols = 10 } = options;

  // Get data for display
  const columns = frame.columns;
  const data = frame.toArray();
  const rowCount = frame.rowCount;

  // Prepare column widths
  const colWidths = {};
  columns.forEach((col) => {
    colWidths[col] = col.length;

    // Check data values for width
    for (let i = 0; i < Math.min(rowCount, maxRows); i++) {
      const value = String(
        data[i][col] !== undefined && data[i][col] !== null ? data[i][col] : '',
      );
      colWidths[col] = Math.max(colWidths[col], value.length);
    }
  });

  // Limit columns if needed
  const displayCols =
    columns.length > maxCols
      ? [...columns.slice(0, maxCols - 1), '...', columns[columns.length - 1]]
      : columns;

  // Generate header
  let header = '';
  displayCols.forEach((col) => {
    const width = col === '...' ? 3 : colWidths[col];
    header += col.padEnd(width + 2);
  });

  // Generate separator
  let separator = '';
  displayCols.forEach((col) => {
    const width = col === '...' ? 3 : colWidths[col];
    separator += '-'.repeat(width) + '  ';
  });

  // Generate rows
  const rows = [];
  const displayRows = Math.min(rowCount, maxRows);

  for (let i = 0; i < displayRows; i++) {
    let row = '';
    displayCols.forEach((col) => {
      const value =
        col === '...'
          ? '...'
          : data[i][col] !== undefined && data[i][col] !== null
            ? data[i][col]
            : '';
      const width = col === '...' ? 3 : colWidths[col];
      row += String(value).padEnd(width + 2);
    });
    rows.push(row);
  }

  // Add ellipsis row if needed
  if (rowCount > maxRows) {
    let ellipsisRow = '';
    displayCols.forEach((col) => {
      const width = col === '...' ? 3 : colWidths[col];
      ellipsisRow += '...'.padEnd(width + 2);
    });
    rows.push(ellipsisRow);
  }

  // Print to console
  console.log(`DataFrame: ${rowCount} rows × ${columns.length} columns`);
  console.log(header);
  console.log(separator);
  rows.forEach((row) => console.log(row));

  // Return the DataFrame for chaining
  return frame;
}
