/**
 * Convert DataFrame to Markdown string representation
 *
 * @param {DataFrame} frame - DataFrame instance
 * @param {Object} options - Conversion options
 * @returns {string} Markdown string representation of the DataFrame
 */

/**
 * Convert DataFrame to Markdown string representation
 *
 * @param {DataFrame} frame - DataFrame instance
 * @param {Object} options - Display options
 * @returns {string} Markdown string representation
 */
export function toMarkdown(frame, options = {}) {
  const { maxRows = 20, maxCols = 20, includeIndex = true } = options;

  const columns = frame.columns || frame._order || [];
  const data = frame.toArray();
  const rowCount = frame.rowCount;

  // Limit columns if needed
  const displayCols =
    columns.length > maxCols
      ? [...columns.slice(0, maxCols - 1), '...', columns[columns.length - 1]]
      : columns;

  // Create header row
  let md = '|';
  if (includeIndex) {
    md += ' index |';
  }

  displayCols.forEach((col) => {
    md += ` ${col} |`;
  });
  md += '\n|';

  // Add separator row
  if (includeIndex) {
    md += '---|';
  }

  displayCols.forEach(() => {
    md += '---|';
  });
  md += '\n';

  // Limit rows if needed
  const displayRows = Math.min(rowCount, maxRows);

  // Функция для форматирования ячейки в markdown
  const formatCell = (value) => {
    const cellContent = value !== undefined && value !== null ? value : '';
    return ` ${cellContent} |`;
  };

  // Функция для создания строки в markdown
  const createRow = (rowIndex) => {
    let rowMd = '|';

    if (includeIndex) {
      rowMd += ` ${rowIndex} |`;
    }

    for (let j = 0; j < displayCols.length; j++) {
      const col = displayCols[j];
      const value = col === '...' ? '...' : data[rowIndex][col];
      rowMd += formatCell(value);
    }

    return rowMd + '\n';
  };

  // Создаем все строки таблицы
  for (let i = 0; i < displayRows; i++) {
    md += createRow(i);
  }

  // Add ellipsis row if needed
  if (rowCount > maxRows) {
    md += '|';
    if (includeIndex) {
      md += ' ... |';
    }

    displayCols.forEach(() => {
      md += ' ... |';
    });
    md += '\n';

    // Add last row if needed
    if (rowCount > maxRows + 1) {
      const lastIdx = rowCount - 1;
      md += '|';
      if (includeIndex) {
        md += ` ${lastIdx} |`;
      }

      displayCols.forEach((col) => {
        const value = col === '...' ? '...' : data[lastIdx][col];
        md += ` ${value !== undefined && value !== null ? value : ''} |`;
      });
      md += '\n';
    }
  }

  return md;
}
