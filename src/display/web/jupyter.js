/**
 * Specialized display functions for Jupyter notebooks
 */

/**
 * Creates a rich display object for Jupyter notebooks
 *
 * @param {Object} frame - DataFrame in TinyFrame format
 * @param {Object} options - Display options
 * @param {number} [options.maxRows=10] - Maximum number of rows to display
 * @param {number} [options.maxCols=Infinity] - Maximum number of columns to display
 * @param {boolean} [options.showIndex=true] - Whether to show row indices
 * @param {string} [options.tableClass='tinyframe-table'] - CSS class for the table
 * @param {string} [options.theme='default'] - Theme for the table ('default', 'dark', 'minimal')
 * @returns {Object} Display object for Jupyter
 */
export function toJupyter(frame, options = {}) {
  // Import the toHTML function from html.js
  const { toHTML } = require('./html.js');

  // Generate HTML representation
  const html = toHTML(frame, options);

  // Check if we're in a Jupyter environment
  const isJupyter =
    typeof global !== 'undefined' &&
    global.hasOwnProperty('$$') &&
    typeof global.$$ === 'function';

  if (isJupyter) {
    // Return a display object that Jupyter can render
    return {
      'text/html': html,
      'application/json': {
        columns: Object.keys(frame.columns),
        rowCount: frame.rowCount,
        truncated: frame.rowCount > (options.maxRows || 10),
      },
    };
  } else {
    // Not in Jupyter, return HTML string
    return html;
  }
}

/**
 * Registers a custom DataFrame representation for Jupyter notebooks
 * This should be called when working in Jupyter environments
 *
 * @param {Function} DataFrame - DataFrame class to register
 */
export function registerJupyterDisplay(DataFrame) {
  // Check if we're in a Jupyter environment
  const isJupyter =
    typeof global !== 'undefined' &&
    global.hasOwnProperty('$$') &&
    typeof global.$$ === 'function';

  if (!isJupyter) {
    console.warn('Not in a Jupyter environment, skipping registration');
    return;
  }

  // Add repr_html method to DataFrame for Jupyter display
  // Using non-camelCase name because this is a Jupyter-specific convention
  // eslint-disable-next-line camelcase
  DataFrame.prototype._repr_html_ = function () {
    // Import the toHTML function from html.js
    const { toHTML } = require('./html.js');

    // Convert DataFrame to TinyFrame format
    const frame = {
      columns: this._columns,
      rowCount: this.rowCount,
    };

    // Return HTML representation
    return toHTML(frame);
  };

  // Add repr_mimebundle method for more control over display
  // Using non-camelCase name because this is a Jupyter-specific convention
  // eslint-disable-next-line camelcase
  DataFrame.prototype._repr_mimebundle_ = function (include, exclude) {
    // Convert DataFrame to TinyFrame format
    const frame = {
      columns: this._columns,
      rowCount: this.rowCount,
    };

    // Return multiple representations
    return {
      'text/html': this._repr_html_(),
      'application/json': {
        columns: this.columns,
        rowCount: this.rowCount,
        truncated: this.rowCount > 10,
      },
    };
  };

  console.log('Jupyter display methods registered for DataFrame');
}
