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
 * Prints the DataFrame to the console in a table format with borders.
 * @param {{ validateColumn(frame, column): void }} deps
 * @returns {(frame: TinyFrame, rows?: number, cols?: number) => void}
 */
export const print = () => (frame, rows, cols) => {
  // Set defaults
  const maxRows = typeof rows === 'number' ? rows : 7;
  const maxCols = typeof cols === 'number' ? cols : Infinity;
  const showFirstAndLast = rows === undefined; // Default behavior shows first and last rows

  const columns = Object.keys(frame.columns);
  const rowCount = frame.rowCount;

  // Determine how many rows to display
  let rowsToDisplay = [];

  if (showFirstAndLast && rowCount > maxRows * 2) {
    // Standard behavior: show first and last rows
    const firstRows = Array.from({ length: maxRows }, (_, i) => i);
    const lastRows = Array.from(
      { length: maxRows },
      (_, i) => rowCount - maxRows + i,
    );
    rowsToDisplay = [...firstRows, -1, ...lastRows]; // -1 is a placeholder for the separator
  } else {
    // Show only first maxRows rows
    rowsToDisplay = Array.from(
      { length: Math.min(maxRows, rowCount) },
      (_, i) => i,
    );
    // Add separator if there are more rows
    if (rowCount > maxRows) {
      rowsToDisplay.push(-2); // -2 is a placeholder for the "more rows" message without showing last rows
    }
  }

  // Determine visible columns
  const displayCols = Math.min(maxCols, columns.length);
  const visibleColumns = columns.slice(0, displayCols);

  // Calculate column widths
  const columnWidths = {};

  // Initialize with header lengths
  visibleColumns.forEach((col) => {
    columnWidths[col] = col.length;
  });

  // Find the maximum width for each column based on data
  rowsToDisplay.forEach((rowIdx) => {
    if (rowIdx >= 0) {
      // Skip separator placeholders
      visibleColumns.forEach((col) => {
        const cellValue = frame.columns[col][rowIdx];
        // Consider the length of strings for null, undefined and NaN
        let value;
        if (cellValue === null) {
          value = 'null';
        } else if (cellValue === undefined) {
          value = 'undefined';
        } else if (Number.isNaN(cellValue)) {
          value = 'NaN';
        } else {
          value = String(cellValue);
        }
        columnWidths[col] = Math.max(columnWidths[col], value.length);
      });
    }
  });

  // Table border characters
  const border = {
    topLeft: '┌',
    topRight: '┐',
    bottomLeft: '└',
    bottomRight: '┘',
    horizontal: '─',
    vertical: '│',
    leftT: '├',
    rightT: '┤',
    topT: '┬',
    bottomT: '┴',
    cross: '┼',
  };

  // Create a formatted table
  const table = [];

  // Create top border
  let topBorder = border.topLeft;
  visibleColumns.forEach((col, i) => {
    topBorder += border.horizontal.repeat(columnWidths[col] + 2);
    topBorder += i < visibleColumns.length - 1 ? border.topT : border.topRight;
  });
  table.push(topBorder);

  // Add header row
  let headerRow = border.vertical;
  visibleColumns.forEach((col) => {
    headerRow += ' ' + col.padEnd(columnWidths[col]) + ' ' + border.vertical;
  });
  table.push(headerRow);

  // Add header separator
  let headerSeparator = border.leftT;
  visibleColumns.forEach((col, i) => {
    headerSeparator += border.horizontal.repeat(columnWidths[col] + 2);
    headerSeparator +=
      i < visibleColumns.length - 1 ? border.cross : border.rightT;
  });
  table.push(headerSeparator);

  // Add data rows
  let skipNextRow = false;
  for (let i = 0; i < rowsToDisplay.length; i++) {
    const rowIdx = rowsToDisplay[i];

    if (rowIdx === -1 || rowIdx === -2) {
      // This is a separator placeholder
      let message;
      if (rowIdx === -1) {
        // For first/last display
        const remainingRows = rowCount - maxRows * 2;
        message = `... ${remainingRows} more rows ...`;
      } else {
        // For showing only first N rows
        const remainingRows = rowCount - maxRows;
        message = `... ${remainingRows} more rows ...`;
      }

      // Create a centered message row
      let messageRow = border.vertical;
      const totalWidth = visibleColumns.reduce(
        (sum, col) => sum + columnWidths[col] + 3,
        -1,
      );
      const paddingLeft = Math.max(
        0,
        Math.floor((totalWidth - message.length) / 2),
      );
      const paddingRight = Math.max(
        0,
        totalWidth - message.length - paddingLeft,
      );
      messageRow +=
        ' '.repeat(paddingLeft) +
        message +
        ' '.repeat(paddingRight) +
        border.vertical;
      table.push(messageRow);

      if (rowIdx === -1) {
        skipNextRow = true;
      }
    } else if (!skipNextRow) {
      let dataRow = border.vertical;
      visibleColumns.forEach((col) => {
        const cellValue = frame.columns[col][rowIdx];
        // Explicitly display null and undefined
        let value;
        if (cellValue === null) {
          value = 'null';
        } else if (cellValue === undefined) {
          value = 'undefined';
        } else if (Number.isNaN(cellValue)) {
          value = 'NaN';
        } else {
          value = String(cellValue);
        }
        dataRow +=
          ' ' + value.padEnd(columnWidths[col]) + ' ' + border.vertical;
      });
      table.push(dataRow);
    } else {
      skipNextRow = false;
    }
  }

  // Add bottom border
  let bottomBorder = border.bottomLeft;
  visibleColumns.forEach((col, i) => {
    bottomBorder += border.horizontal.repeat(columnWidths[col] + 2);
    bottomBorder +=
      i < visibleColumns.length - 1 ? border.bottomT : border.bottomRight;
  });
  table.push(bottomBorder);

  // Add message about more columns if necessary
  if (columns.length > maxCols) {
    table.push(`... and ${columns.length - maxCols} more columns ...`);
  }

  // Add table size
  table.push(`[${rowCount} rows x ${columns.length} columns]`);

  // Print the table
  console.log(table.join('\n'));

  return frame; // Return the frame for method chaining
};
