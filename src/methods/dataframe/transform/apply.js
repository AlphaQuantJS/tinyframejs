/**
 * Apply a function to each column in a DataFrame
 *
 * @returns {Function} - Function that takes a DataFrame and applies the function to each column
 */
export const apply =
  () =>
    (df, func, options = {}) => {
      const { inplace = false, columns = df.columns } = options;

      // Validate columns
      for (const col of columns) {
        if (!df.columns.includes(col)) {
          throw new Error(`Column '${col}' not found`);
        }
      }

      // Create a new object to hold the transformed columns
      const result = {};

      // Copy columns that are not being transformed
      for (const col of df.columns) {
        if (!columns.includes(col)) {
          result[col] = df.col(col).toArray();
        }
      }

      // Apply function to specified columns
      for (const col of columns) {
        const series = df.col(col);
        const values = series.toArray();
        result[col] = values.map(func);
      }

      // Return new DataFrame or modify in place
      if (inplace) {
      // Replace columns in original DataFrame
        for (const col of columns) {
          df._columns[col] = result[col];
        }
        return df;
      }

      // Create a new DataFrame with the transformed columns
      return new df.constructor(result);
    };

export default { apply };
