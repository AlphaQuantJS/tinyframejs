/**
 * Display Series in a web environment
 *
 * @param {Series} series - Series instance
 * @param {Object} options - Display options
 * @returns {Series} Original Series for chaining
 */

/**
 * Display Series in a web environment
 *
 * @param {Series} series - Series instance
 * @param {Object} options - Display options
 * @returns {Series} Original Series for chaining
 */
export function display(series, options = {}) {
  // Create a simple HTML representation
  const html = toHTML(series, options);

  // Check if we're in a browser environment
  if (typeof document !== 'undefined') {
    const div = document.createElement('div');
    div.innerHTML = html;
    document.body.appendChild(div);
  }

  // Check if we're in a Jupyter environment
  if (typeof global !== 'undefined' && global.jupyter) {
    global.jupyter.display(html);
  }

  return series;
}

/**
 * Convert Series to HTML string representation
 *
 * @param {Series} series - Series instance
 * @param {Object} options - Display options
 * @returns {string} HTML string representation
 */
function toHTML(series, options = {}) {
  const { maxRows = 20, includeIndex = true } = options;

  const values = series.values || [];
  const name = series.name || 'Series';
  const rowCount = values.length;

  // Create table header
  let html = '<table class="tinyframe-table"><thead><tr>';
  if (includeIndex) html += '<th>index</th>';
  html += `<th>${name}</th>`;
  html += '</tr></thead><tbody>';

  // Limit rows if needed
  const displayCount = Math.min(rowCount, maxRows);

  // Add data rows
  for (let i = 0; i < displayCount; i++) {
    html += '<tr>';
    if (includeIndex) html += `<td>${i}</td>`;
    html += `<td>${values[i]}</td>`;
    html += '</tr>';
  }

  // Add ellipsis row if needed
  if (rowCount > maxRows) {
    html += '<tr>';
    if (includeIndex) html += '<td>...</td>';
    html += '<td>...</td>';
    html += '</tr>';
  }

  html += '</tbody></table>';
  return html;
}
