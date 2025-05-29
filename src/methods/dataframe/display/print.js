/**
 * Print DataFrame as a formatted table in the console
 * @returns {Function} Function that takes a frame and prints it to console
 */

/**
 * Factory function that returns a print function for DataFrame
 * @returns {Function} Function that takes a frame and prints it to console
 */
export const print =
  () =>
  (frame, maxRows = 10, maxCols = Infinity) => {
    // Create a formatted table representation
    const table = formatDataFrameTable(frame, maxRows, maxCols);

    // Print the table
    console.log(table);

    // Return the frame for method chaining
    return frame;
  };

/**
 * Format a DataFrame as a table string
 * @param {Object} frame - DataFrame object
 * @param {number} maxRows - Maximum number of rows to display
 * @param {number} maxCols - Maximum number of columns to display
 * @returns {string} - Formatted table string
 */
function formatDataFrameTable(frame, maxRows = 10, maxCols = Infinity) {
  // Handle case when frame is undefined or doesn't have expected structure
  if (!frame || typeof frame !== 'object') {
    return 'Invalid DataFrame';
  }

  // Extract columns and data from the DataFrame
  const columns = frame._order || [];
  const data = {};
  let rowCount = 0;

  if (frame._columns) {
    // Extract data from DataFrame's Series objects
    rowCount =
      columns.length > 0 && frame._columns[columns[0]]
        ? frame._columns[columns[0]].length
        : 0;

    for (const col of columns) {
      const series = frame._columns[col];
      if (series) {
        // Handle Series objects which may have vector property
        if (series.vector && series.vector._data) {
          data[col] = Array.from(series.vector._data);
        } else if (series.toArray) {
          data[col] = series.toArray();
        } else if (Array.isArray(series)) {
          data[col] = series;
        } else {
          data[col] = [];
        }
      } else {
        data[col] = [];
      }
    }
  }

  // If no columns or data found, return empty message
  if (columns.length === 0) {
    return 'Empty DataFrame';
  }

  // Limit columns if needed
  const displayColumns =
    maxCols < columns.length ? columns.slice(0, maxCols) : columns;

  // Determine rows to display
  const displayRows = Math.min(rowCount, maxRows);

  // Create a table representation
  let table = 'DataFrame Table:\n';

  // Add header
  table += displayColumns.join(' | ') + '\n';
  table +=
    displayColumns.map((col) => '-'.repeat(col.length)).join('-+-') + '\n';

  // Add data rows
  for (let i = 0; i < displayRows; i++) {
    const rowValues = displayColumns.map((col) => {
      const value =
        data[col] && i < data[col].length ? data[col][i] : undefined;
      return formatValue(value);
    });
    table += rowValues.join(' | ') + '\n';
  }

  // Add message about additional rows if needed
  if (rowCount > displayRows) {
    table += `... ${rowCount - displayRows} more rows ...\n`;
  }

  // Add message about additional columns if needed
  if (columns.length > displayColumns.length) {
    table += `... and ${columns.length - displayColumns.length} more columns ...\n`;
  }

  // Add dimensions
  table += `[${rowCount} rows x ${columns.length} columns]`;

  return table;
}

/**
 * Format a value for display in the table
 * @param {*} value - The value to format
 * @returns {string} - Formatted string representation
 */
function formatValue(value) {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'number' && isNaN(value)) return 'NaN';
  if (typeof value === 'object' && value instanceof Date) {
    return value.toISOString();
  }
  return String(value);
}

export default print;
