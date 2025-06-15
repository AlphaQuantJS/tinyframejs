/**
 * Registrar for DataFrame display methods
 */
import {
  print,
  toHTML,
  display,
  renderTo,
  toJupyter,
  registerJupyterDisplay,
} from '../../../display/index.js';

/**
 * Registers all display methods for DataFrame
 * @param {Class} DataFrame - DataFrame class to extend
 */
export function registerDataFrameDisplay(DataFrame) {
  /**
   * Prints DataFrame to console in a tabular format with borders
   * @param {number} [rows] - Maximum number of rows to display
   * @param {number} [cols] - Maximum number of columns to display
   * @returns {DataFrame} - Returns the DataFrame for chaining
   */
  DataFrame.prototype.print = function (rows, cols) {
    // Convert DataFrame to TinyFrame format expected by print function
    const frame = {
      columns: {},
      rowCount: this.rowCount,
    };

    // Convert _columns to format expected by print function
    for (const colName of this.columns) {
      frame.columns[colName] = this._columns[colName].toArray();
    }

    // Use the imported print function
    return print(frame, rows, cols);
  };

  /**
   * Converts DataFrame to HTML table
   * @param {Object} [options] - Options for HTML generation
   * @param {number} [options.maxRows=10] - Maximum number of rows to display
   * @param {number} [options.maxCols=Infinity] - Maximum number of columns to display
   * @param {boolean} [options.showIndex=true] - Whether to show row indices
   * @param {string} [options.tableClass='tinyframe-table'] - CSS class for the table
   * @param {string} [options.theme='default'] - Theme for the table ('default', 'dark', 'minimal')
   * @returns {string} - HTML string representation of the DataFrame
   */
  DataFrame.prototype.toHTML = function (options = {}) {
    // Convert DataFrame to TinyFrame format expected by toHTML function
    const frame = {
      columns: this._columns,
      rowCount: this.rowCount,
    };

    // Use the imported toHTML function
    return toHTML()(frame, options);
  };

  /**
   * Returns a string representation of the DataFrame
   * @returns {string} - String representation
   */
  DataFrame.prototype.toString = function () {
    return `DataFrame(${this.rowCount} rows × ${this.columns.length} columns)`;
  };

  /**
   * Displays DataFrame in browser environment
   * @param {Object} [options] - Display options
   * @param {number} [options.maxRows=10] - Maximum number of rows to display
   * @param {number} [options.maxCols=Infinity] - Maximum number of columns to display
   * @param {boolean} [options.showIndex=true] - Whether to show row indices
   * @param {string} [options.tableClass='tinyframe-table'] - CSS class for the table
   * @param {string} [options.theme='default'] - Theme for the table ('default', 'dark', 'minimal')
   * @param {string} [options.container] - CSS selector for container element (browser only)
   * @returns {DataFrame} - Returns the DataFrame for chaining
   */
  DataFrame.prototype.display = function (options = {}) {
    // Convert DataFrame to TinyFrame format expected by display function
    const frame = {
      columns: this._columns,
      rowCount: this.rowCount,
    };

    // Use the imported display function
    display(frame, options);

    // Return the DataFrame for chaining
    return this;
  };

  /**
   * Renders DataFrame to a specified DOM element
   * @param {string|HTMLElement} element - CSS selector or DOM element
   * @param {Object} [options] - Display options
   * @param {number} [options.maxRows=10] - Maximum number of rows to display
   * @param {number} [options.maxCols=Infinity] - Maximum number of columns to display
   * @param {boolean} [options.showIndex=true] - Whether to show row indices
   * @param {string} [options.tableClass='tinyframe-table'] - CSS class for the table
   * @param {string} [options.theme='default'] - Theme for the table ('default', 'dark', 'minimal')
   * @returns {DataFrame} - Returns the DataFrame for chaining
   */
  DataFrame.prototype.renderTo = function (element, options = {}) {
    // Convert DataFrame to TinyFrame format expected by renderTo function
    const frame = {
      columns: this._columns,
      rowCount: this.rowCount,
    };

    // Use the imported renderTo function
    renderTo(frame, element, options);

    // Return the DataFrame for chaining
    return this;
  };

  /**
   * Returns a Jupyter notebook compatible representation
   * @param {Object} [options] - Display options
   * @returns {Object} - Jupyter display object
   */
  DataFrame.prototype.toJupyter = function (options = {}) {
    // Convert DataFrame to TinyFrame format
    const frame = {
      columns: this._columns,
      rowCount: this.rowCount,
    };

    // Use the imported toJupyter function
    return toJupyter(frame, options);
  };

  // Register Jupyter display methods if in a Jupyter environment
  try {
    registerJupyterDisplay(DataFrame);
  } catch (e) {
    // Not in a Jupyter environment or error during registration
    // This is fine, the methods will be registered only when needed
  }
}

export default registerDataFrameDisplay;
