/**
 * Registrar for DataFrame display methods
 */

/**
 * Registers all display methods for DataFrame
 * @param {Class} DataFrame - DataFrame class to extend
 */
export function registerDataFrameDisplay(DataFrame) {
  /**
   * Prints DataFrame to console in a tabular format
   * @param {number} [maxRows=10] - Maximum number of rows to display
   * @param {number} [maxCols=null] - Maximum number of columns to display
   * @returns {DataFrame} - Returns the DataFrame for chaining
   */
  DataFrame.prototype.print = function(maxRows = 10, maxCols = null) {
    const rows = this.rows;
    const columns = Object.keys(this.columns);
    const totalRows = rows.length;
    const totalCols = columns.length;

    // Determine how many rows and columns to display
    const displayRows = Math.min(totalRows, maxRows);
    const displayCols = maxCols ? Math.min(totalCols, maxCols) : totalCols;

    // Create a table for display
    const table = [];

    // Add header row
    const headerRow = columns.slice(0, displayCols);
    table.push(headerRow);

    // Add data rows
    for (let i = 0; i < displayRows; i++) {
      const row = [];
      for (let j = 0; j < displayCols; j++) {
        const col = columns[j];
        row.push(this.columns[col][i]);
      }
      table.push(row);
    }

    // Print the table
    console.table(table);

    // Print summary if not all rows/columns were displayed
    if (totalRows > displayRows || totalCols > displayCols) {
      console.log(
        `Displayed ${displayRows} of ${totalRows} rows and ${displayCols} of ${totalCols} columns.`,
      );
    }

    // Return the DataFrame for chaining
    return this;
  };

  /**
   * Converts DataFrame to HTML table
   * @param {Object} [options] - Options for HTML generation
   * @param {string} [options.className='dataframe'] - CSS class for the table
   * @param {number} [options.maxRows=null] - Maximum number of rows to include
   * @param {number} [options.maxCols=null] - Maximum number of columns to include
   * @returns {string} - HTML string representation of the DataFrame
   */
  DataFrame.prototype.toHTML = function(options = {}) {
    const { className = 'dataframe', maxRows = null, maxCols = null } = options;

    const rows = this.rows;
    const columns = Object.keys(this.columns);
    const totalRows = rows.length;
    const totalCols = columns.length;

    // Determine how many rows and columns to display
    const displayRows = maxRows ? Math.min(totalRows, maxRows) : totalRows;
    const displayCols = maxCols ? Math.min(totalCols, maxCols) : totalCols;

    // Start building HTML
    let html = `<table class="${className}">`;

    // Add header row
    html += '<thead><tr>';
    for (let j = 0; j < displayCols; j++) {
      html += `<th>${columns[j]}</th>`;
    }
    html += '</tr></thead>';

    // Add data rows
    html += '<tbody>';
    for (let i = 0; i < displayRows; i++) {
      html += '<tr>';
      for (let j = 0; j < displayCols; j++) {
        const col = columns[j];
        html += `<td>${this.columns[col][i]}</td>`;
      }
      html += '</tr>';
    }
    html += '</tbody>';

    // Close table
    html += '</table>';

    return html;
  };

  /**
   * Returns a string representation of the DataFrame
   * @returns {string} - String representation
   */
  DataFrame.prototype.toString = function() {
    const columns = Object.keys(this.columns);
    const rowCount = this.rows.length;
    return `DataFrame(${rowCount} rows × ${columns.length} columns)`;
  };

  // Here you can add other display methods
}

export default registerDataFrameDisplay;
