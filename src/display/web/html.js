import { isBrowser } from '../../io/utils/environment.js';

/**
 * Converts DataFrame to an HTML table representation.
 *
 * @param {Object} frame - DataFrame in TinyFrame format
 * @param {Object} options - Display options
 * @param {number} [options.maxRows=10] - Maximum number of rows to display
 * @param {number} [options.maxCols=Infinity] - Maximum number of columns to display
 * @param {boolean} [options.showIndex=true] - Whether to show row indices
 * @param {string} [options.tableClass='tinyframe-table'] - CSS class for the table
 * @param {string} [options.theme='default'] - Theme for the table ('default', 'dark', 'minimal')
 * @returns {string} HTML string representation of the DataFrame
 */
export function toHTML(frame, options = {}) {
  // Set defaults
  const {
    maxRows = 10,
    maxCols = Infinity,
    showIndex = true,
    tableClass = 'tinyframe-table',
    theme = 'default',
  } = options;

  // For empty frames, return a simple message
  if (!frame || !frame.columns || frame.columns.length === 0) {
    return '<div class="tinyframe-empty">Empty DataFrame</div>';
  }

  const columns = Object.keys(frame.columns);
  const rowCount = frame.rowCount;
  const showFirstAndLast = maxRows > 0 && rowCount > maxRows * 2;

  // Determine visible columns
  const displayCols = Math.min(maxCols, columns.length);
  const visibleColumns = columns.slice(0, displayCols);

  // Create CSS styles based on theme
  const themeStyles = getThemeStyles(theme);

  // Start building HTML
  let html = `<style>${themeStyles}</style>`;
  html += `<table class="${tableClass} theme-${theme}">`;

  // Add header row
  html += '<thead><tr>';
  if (showIndex) {
    html += '<th></th>'; // Empty header for index column
  }
  visibleColumns.forEach((col) => {
    html += `<th>${escapeHTML(col)}</th>`;
  });
  html += '</tr></thead>';

  // Add data rows
  html += '<tbody>';

  // Determine which rows to display
  let rowsToDisplay = [];

  if (showFirstAndLast && rowCount > maxRows * 2) {
    // Show first and last rows with ellipsis in between
    const firstRows = Array.from({ length: maxRows }, (_, i) => i);
    const lastRows = Array.from(
      { length: maxRows },
      (_, i) => rowCount - maxRows + i,
    );
    rowsToDisplay = [...firstRows, -1, ...lastRows]; // -1 is a placeholder for the ellipsis
  } else {
    // Show only first maxRows rows
    rowsToDisplay = Array.from(
      { length: Math.min(maxRows, rowCount) },
      (_, i) => i,
    );
  }

  // Add rows to HTML
  let skipNextRow = false;
  let rowsHtml = '';

  for (let i = 0; i < rowsToDisplay.length; i++) {
    const rowIdx = rowsToDisplay[i];

    if (rowIdx === -1) {
      // This is the ellipsis row
      const remainingRows = rowCount - maxRows * 2;
      const colSpan = showIndex
        ? visibleColumns.length + 1
        : visibleColumns.length;
      rowsHtml += `<tr class="ellipsis-row"><td colspan="${colSpan}">... ${remainingRows} more rows ...</td></tr>`;
      skipNextRow = true;
    } else if (!skipNextRow) {
      rowsHtml += '<tr>';

      // Add index column if needed
      if (showIndex) {
        rowsHtml += `<td class="row-index">${rowIdx}</td>`;
      }

      // Add data cells
      let cellsHtml = '';
      visibleColumns.forEach((col) => {
        const cellValue = frame.columns[col][rowIdx];
        cellsHtml += `<td>${formatCellValue(cellValue)}</td>`;
      });
      rowsHtml += cellsHtml;

      rowsHtml += '</tr>';
    } else {
      skipNextRow = false;
    }
  }

  html += rowsHtml;

  // If we didn't show all rows and didn't use the first/last pattern
  if (rowCount > maxRows && !showFirstAndLast) {
    const remainingRows = rowCount - maxRows;
    const colSpan = visibleColumns.length + (showIndex ? 1 : 0);
    html += `<tr class="ellipsis-row"><td colspan="${colSpan}">... ${remainingRows} more rows ...</td></tr>`;
  }

  html += '</tbody>';

  // Add footer for additional columns if needed
  if (columns.length > maxCols) {
    const remainingCols = columns.length - maxCols;
    html += `<tfoot><tr><td colspan="${visibleColumns.length + (showIndex ? 1 : 0)}">... and ${remainingCols} more columns ...</td></tr></tfoot>`;
  }

  // Add table size information
  html += `<caption>[${rowCount} rows x ${columns.length} columns]</caption>`;

  html += '</table>';

  return html;
}

/**
 * Displays a DataFrame in a browser environment.
 * In Node.js environment, falls back to console output.
 *
 * @param {Object} frame - DataFrame in TinyFrame format
 * @param {Object} options - Display options
 * @param {number} [options.maxRows=10] - Maximum number of rows to display
 * @param {number} [options.maxCols=Infinity] - Maximum number of columns to display
 * @param {boolean} [options.showIndex=true] - Whether to show row indices
 * @param {string} [options.tableClass='tinyframe-table'] - CSS class for the table
 * @param {string} [options.theme='default'] - Theme for the table ('default', 'dark', 'minimal')
 * @param {string} [options.container] - CSS selector for container element (browser only)
 * @returns {Object} The original DataFrame for method chaining
 */
export function display(frame, options = {}) {
  // Check if we're in a browser environment
  if (isBrowser()) {
    // We're in a browser, render HTML
    const html = toHTML(frame, options);
    const { container } = options;

    // Create a container for the table if not specified
    let targetElement;

    if (container) {
      // Use the specified container
      targetElement = document.querySelector(container);
      if (!targetElement) {
        console.warn(
          `Container element "${container}" not found, creating a new element.`,
        );
        targetElement = document.createElement('div');
        document.body.appendChild(targetElement);
      }
    } else {
      // Create a new element
      targetElement = document.createElement('div');
      targetElement.className = 'tinyframe-container';
      document.body.appendChild(targetElement);
    }

    // Set the HTML content
    targetElement.innerHTML = html;
  } else {
    // We're in Node.js or another non-browser environment
    // Fall back to console output
    console.log('DataFrame display:');
    console.log(frame.toString());
  }

  // Return the original frame for method chaining
  return frame;
}

/**
 * Renders a DataFrame to a specified DOM element.
 * Only works in browser environments.
 *
 * @param {Object} frame - DataFrame in TinyFrame format
 * @param {string|HTMLElement} element - CSS selector or DOM element
 * @param {Object} options - Display options
 * @param {number} [options.maxRows=10] - Maximum number of rows to display
 * @param {number} [options.maxCols=Infinity] - Maximum number of columns to display
 * @param {boolean} [options.showIndex=true] - Whether to show row indices
 * @param {string} [options.tableClass='tinyframe-table'] - CSS class for the table
 * @param {string} [options.theme='default'] - Theme for the table ('default', 'dark', 'minimal')
 * @returns {Object} The original DataFrame for method chaining
 */
export function renderTo(frame, element, options = {}) {
  // Check if we're in a browser environment
  if (!isBrowser()) {
    console.warn('renderTo() is only available in browser environments');
    return frame;
  }

  // Get the target element
  let targetElement;

  if (typeof element === 'string') {
    // Element is a CSS selector
    targetElement = document.querySelector(element);
    if (!targetElement) {
      console.error(`Element "${element}" not found`);
      return frame;
    }
  } else if (element instanceof HTMLElement) {
    // Element is a DOM element
    targetElement = element;
  } else {
    console.error('Invalid element: must be a CSS selector or DOM element');
    return frame;
  }

  // Generate HTML and render to the element
  const html = toHTML(frame, options);
  targetElement.innerHTML = html;

  // Return the original frame for method chaining
  return frame;
}

/**
 * Formats a cell value for HTML display
 * @param {*} value - The cell value
 * @returns {string} Formatted HTML string
 */
function formatCellValue(value) {
  if (value === null) {
    return '<span class="null-value">null</span>';
  } else if (value === undefined) {
    return '<span class="undefined-value">undefined</span>';
  } else if (Number.isNaN(value)) {
    return '<span class="nan-value">NaN</span>';
  } else if (typeof value === 'number') {
    return `<span class="number-value">${value}</span>`;
  } else if (typeof value === 'boolean') {
    return `<span class="boolean-value">${value}</span>`;
  } else if (typeof value === 'object') {
    return `<span class="object-value">${escapeHTML(JSON.stringify(value))}</span>`;
  } else {
    return escapeHTML(String(value));
  }
}

/**
 * Escapes HTML special characters
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Returns CSS styles for the specified theme
 * @param {string} theme - Theme name
 * @returns {string} CSS styles
 */
function getThemeStyles(theme) {
  const baseStyles = `
    .tinyframe-table {
      border-collapse: collapse;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      margin: 1em 0;
      width: 100%;
    }
    .tinyframe-table th, .tinyframe-table td {
      padding: 0.5em 1em;
      text-align: left;
      vertical-align: top;
    }
    .tinyframe-table caption {
      caption-side: bottom;
      font-size: 0.9em;
      margin-top: 0.5em;
      text-align: left;
    }
    .tinyframe-table .row-index {
      font-weight: bold;
    }
    .tinyframe-table .ellipsis-row {
      text-align: center;
      font-style: italic;
    }
    .tinyframe-table .null-value, .tinyframe-table .undefined-value, .tinyframe-table .nan-value {
      font-style: italic;
      opacity: 0.7;
    }
    .tinyframe-empty {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-style: italic;
      color: #666;
      padding: 1em;
      text-align: center;
    }
  `;

  // Theme-specific styles
  switch (theme) {
    case 'dark':
      return (
        baseStyles +
        `
        .tinyframe-table.theme-dark {
          background-color: #222;
          color: #eee;
        }
        .tinyframe-table.theme-dark th {
          background-color: #333;
          border-bottom: 2px solid #444;
        }
        .tinyframe-table.theme-dark td {
          border-bottom: 1px solid #444;
        }
        .tinyframe-table.theme-dark .ellipsis-row {
          background-color: #2a2a2a;
        }
        .tinyframe-table.theme-dark caption {
          color: #aaa;
        }
        .tinyframe-table.theme-dark .number-value {
          color: #6ca2e8;
        }
        .tinyframe-table.theme-dark .boolean-value {
          color: #e88c6c;
        }
      `
      );
    case 'minimal':
      return (
        baseStyles +
        `
        .tinyframe-table.theme-minimal {
          border: none;
        }
        .tinyframe-table.theme-minimal th {
          border-bottom: 1px solid #ddd;
        }
        .tinyframe-table.theme-minimal td {
          border-bottom: none;
        }
        .tinyframe-table.theme-minimal tr:nth-child(even) {
          background-color: #f9f9f9;
        }
      `
      );
    default: // 'default' theme
      return (
        baseStyles +
        `
        .tinyframe-table.theme-default {
          border: 1px solid #ddd;
        }
        .tinyframe-table.theme-default th {
          background-color: #f5f5f5;
          border-bottom: 2px solid #ddd;
        }
        .tinyframe-table.theme-default td {
          border-bottom: 1px solid #ddd;
        }
        .tinyframe-table.theme-default .ellipsis-row {
          background-color: #f9f9f9;
        }
        .tinyframe-table.theme-default .number-value {
          color: #0066cc;
        }
        .tinyframe-table.theme-default .boolean-value {
          color: #cc6600;
        }
      `
      );
  }
}
