/**
 * Convert Series to Markdown string representation
 *
 * @param {Series} series - Series instance
 * @param {Object} options - Conversion options
 * @returns {string} Markdown string representation of the Series
 */

/**
 * Convert Series to Markdown string representation
 *
 * @param {Series} series - Series instance
 * @param {Object} options - Display options
 * @returns {string} Markdown string representation
 */
export function toMarkdown(series, options = {}) {
  const { maxRows = 20, includeIndex = true } = options;

  const values = series.values || [];
  const name = series.name || 'Series';
  const rowCount = values.length;

  // Create header row
  let md = '';
  if (includeIndex) {
    md += '| index | ' + name + ' |\n';
    md += '|-------|' + '-'.repeat(name.length + 2) + '|\n';
  } else {
    md += '| ' + name + ' |\n';
    md += '|' + '-'.repeat(name.length + 2) + '|\n';
  }

  // Limit rows if needed
  const displayCount = Math.min(rowCount, maxRows);

  // Add data rows
  for (let i = 0; i < displayCount; i++) {
    if (includeIndex) {
      md += `| ${i} | ${values[i]} |\n`;
    } else {
      md += `| ${values[i]} |\n`;
    }
  }

  // Add ellipsis row if needed
  if (rowCount > maxRows) {
    if (includeIndex) {
      md += '| ... | ... |\n';
    } else {
      md += '| ... |\n';
    }
  }

  return md;
}
