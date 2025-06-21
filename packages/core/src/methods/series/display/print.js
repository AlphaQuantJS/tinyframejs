/**
 * Print Series to console
 *
 * @param {Series} series - Series instance
 * @param {Object} options - Print options
 * @returns {Series} Original Series for chaining
 */

/**
 * Print Series to console
 *
 * @param {Series} series - Series instance
 * @param {Object} options - Print options
 * @returns {Series} Original Series for chaining
 */
export function print(series, options = {}) {
  const { maxRows = 10, includeIndex = true } = options;

  const values = series.values || [];
  const name = series.name || 'Series';
  const rowCount = values.length;

  // Print header
  console.log(`${name} (${rowCount} rows)`);

  // Limit rows if needed
  const displayCount = Math.min(rowCount, maxRows);

  // Print data rows
  for (let i = 0; i < displayCount; i++) {
    if (includeIndex) {
      console.log(`${i}: ${values[i]}`);
    } else {
      console.log(values[i]);
    }
  }

  // Print ellipsis if needed
  if (rowCount > maxRows) {
    console.log('...');
  }

  return series;
}
