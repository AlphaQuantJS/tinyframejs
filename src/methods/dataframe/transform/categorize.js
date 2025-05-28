/**
 * Categorize values in a column into discrete categories
 *
 * @returns {Function} - Function that takes a DataFrame and categorizes values in a column
 */
export const categorize =
  () =>
    (df, column, categories, options = {}) => {
      const { inplace = false, defaultCategory = null } = options;

      // Validate column
      if (!df.columns.includes(column)) {
        throw new Error(`Column '${column}' not found`);
      }

      // Validate categories
      if (!categories || typeof categories !== 'object') {
        throw new Error(
          'Categories must be an object mapping values to categories',
        );
      }

      // Get column values
      const series = df.col(column);
      const values = series.toArray();

      // Categorize values
      const categorized = values.map((value) => {
      // If the value is in categories, return the corresponding category
        if (value in categories) {
          return categories[value];
        }

        // Otherwise return defaultCategory
        return defaultCategory;
      });

      // Create a new object to hold the result
      const result = {};

      // Copy all columns
      for (const col of df.columns) {
        result[col] = df.col(col).toArray();
      }

      // Replace the categorized column
      const targetColumn = options.targetColumn || `${column}_categorized`;
      result[targetColumn] = categorized;

      // Return new DataFrame or modify in place
      if (inplace) {
      // Add the new column to the original DataFrame
        df._columns[targetColumn] = categorized;
        return df;
      }

      // Create a new DataFrame with the categorized column
      return new df.constructor(result);
    };

export default { categorize };
