/*-------------------------------------------------------------------------*
 |  DataFrame - indexing - at()                                           |
 |                                                                         |
 |  Get a single row or value from the DataFrame by position.              |
 |                                                                         |
 |  df.at(5) -> returns an object representing the row at index 5.         |
 |  df.at(5, 'age') -> returns the value at row 5, column 'age'.          |
 *-------------------------------------------------------------------------*/
/**
 * Returns a row at the specified index.<br>
 * `df.at(5)` -> returns an object representing the row at index 5.
 *
 * @param {import('../../../data/model/DataFrame.js').DataFrame} df
 * @param {number} index - Row index to select
 * @returns {Object} - Object representing the selected row
 * @throws {Error} If index is invalid or out of bounds
 */
export function at(df, index) {
  // Validate index is an integer
  if (!Number.isInteger(index)) {
    throw new Error(
      `Index must be an integer, got ${typeof index === 'number' ? index : typeof index}`,
    );
  }

  // Validate index is not negative
  if (index < 0) {
    throw new Error(`Index out of bounds: ${index} is negative`);
  }

  const rows = df.toArray();

  // Check if DataFrame is empty
  if (rows.length === 0) {
    throw new Error('Index out of bounds: DataFrame is empty');
  }

  // Check if index is within range
  if (index >= rows.length) {
    throw new Error(`Index out of bounds: ${index} >= ${rows.length}`);
  }

  return rows[index];
}

/* -------------------------------------------------------------- *
 |  Pool for extendDataFrame                                       |
 * -------------------------------------------------------------- */
export default { at };
