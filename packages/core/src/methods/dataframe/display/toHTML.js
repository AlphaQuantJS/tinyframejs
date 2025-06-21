/**
 * Convert DataFrame to HTML string representation
 *
 * @param {DataFrame} frame - DataFrame instance
 * @param {Object} options - Conversion options
 * @returns {string} HTML string representation of the DataFrame
 */

/**
 * Convert DataFrame to HTML string representation
 *
 * @param {DataFrame} frame - DataFrame instance
 * @param {Object} options - Display options
 * @returns {string} HTML string representation
 */
export function toHTML(frame, options = {}) {
  const { maxRows = 20, maxCols = 20, includeIndex = true } = options;

  // Используем геттер columns для получения массива имен колонок
  const columns = frame.columns || frame._order || [];
  const data = frame.toArray();
  const rowCount = frame.rowCount;

  // Limit columns if needed
  const displayCols =
    columns.length > maxCols
      ? [...columns.slice(0, maxCols - 1), '...', columns[columns.length - 1]]
      : columns;

  // Generate table header
  let html = '<table class="tinyframe-table">';
  html += '<thead><tr>';

  if (includeIndex) {
    html += '<th></th>'; // Index header
  }

  displayCols.forEach((col) => {
    html += `<th>${col}</th>`;
  });

  html += '</tr></thead>';
  html += '<tbody>';

  // Generate table rows
  const displayRows = rowCount > maxRows ? maxRows : rowCount;

  // Функция для создания ячейки таблицы
  const createCell = (value) => {
    const cellContent = value !== undefined && value !== null ? value : '';
    return `<td>${cellContent}</td>`;
  };

  // Функция для создания строки таблицы
  const createRow = (rowIndex) => {
    let rowHtml = '<tr>';

    if (includeIndex) {
      rowHtml += `<td>${rowIndex}</td>`;
    }

    for (let j = 0; j < displayCols.length; j++) {
      const col = displayCols[j];
      const value = col === '...' ? '...' : data[rowIndex][col];
      rowHtml += createCell(value);
    }

    rowHtml += '</tr>';
    return rowHtml;
  };

  // Создаем все строки таблицы
  for (let i = 0; i < displayRows; i++) {
    html += createRow(i);
  }

  // Add ellipsis row if needed
  if (rowCount > maxRows) {
    html += '<tr>';

    if (includeIndex) {
      html += '<td>...</td>';
    }

    displayCols.forEach(() => {
      html += '<td>...</td>';
    });

    html += '</tr>';

    // Add last row if needed
    if (rowCount > maxRows + 1) {
      const lastIdx = rowCount - 1;
      html += '<tr>';

      if (includeIndex) {
        html += `<td>${lastIdx}</td>`;
      }

      displayCols.forEach((col) => {
        const value = col === '...' ? '...' : data[lastIdx][col];
        html += `<td>${value !== undefined && value !== null ? value : ''}</td>`;
      });

      html += '</tr>';
    }
  }

  html += '</tbody></table>';
  return html;
}
