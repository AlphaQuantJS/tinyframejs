/**
 * OneHot encoding method for DataFrame
 * Converts categorical column into multiple binary columns
 *
 * @returns {Function} - Function that takes a DataFrame and returns a DataFrame with one-hot encoded columns
 */
export const oneHot =
  () =>
  (df, column, options = {}) => {
    // Extract options with defaults
    const {
      prefix = `${column}_`,
      dropOriginal = false,
      dropFirst = false,
      dtype = 'i32',
      handleNull = 'ignore',
      categories = null,
    } = options;

    // Validate column exists
    if (!df.columns.includes(column)) {
      throw new Error(`Column '${column}' not found`);
    }

    // Validate dtype
    if (!['i32', 'f64', 'u32', 'u8', 'i8'].includes(dtype)) {
      throw new Error(`Invalid dtype: ${dtype}`);
    }

    // Validate handleNull
    if (!['ignore', 'encode', 'error'].includes(handleNull)) {
      throw new Error(`Invalid handleNull option: ${handleNull}`);
    }

    // Get unique values from the column
    const columnValues = df.col(column).toArray();

    // Check for null values
    const hasNulls = columnValues.some(
      (v) => v === null || v === undefined || Number.isNaN(v),
    );

    if (hasNulls && handleNull === 'error') {
      throw new Error(`Column '${column}' contains null values`);
    }

    // Determine categories to encode
    let uniqueCategories = categories ? [...categories] : [];

    if (!uniqueCategories.length) {
      // Get unique non-null values
      const nonNullValues = columnValues.filter(
        (v) => v !== null && v !== undefined && !Number.isNaN(v),
      );
      uniqueCategories = [...new Set(nonNullValues)].sort();
    }

    // If dropFirst is true, remove the first category
    if (dropFirst && uniqueCategories.length > 0) {
      uniqueCategories.shift();
    }

    // Add null category if needed
    if (hasNulls && handleNull === 'encode') {
      uniqueCategories.push('null');
    }

    // Create a new object to hold the result
    const result = {};

    // Copy all original columns
    for (const col of df.columns) {
      if (col !== column || !dropOriginal) {
        result[col] = df.col(col).toArray();
      }
    }

    // Create one-hot encoded columns
    for (const category of uniqueCategories) {
      const columnName = `${prefix}${category}`;
      const encodedValues = new Array(df.frame.rowCount).fill(0);

      for (let i = 0; i < df.frame.rowCount; i++) {
        const value = columnValues[i];

        if (category === 'null') {
          // Special case for null category
          if (value === null || value === undefined || Number.isNaN(value)) {
            encodedValues[i] = 1;
          }
        } else if (value === category) {
          encodedValues[i] = 1;
        }
      }

      // Add the encoded column to the result
      result[columnName] = encodedValues;
    }

    // Create a new DataFrame with the encoded columns
    return new df.constructor(result);
  };

export default { oneHot };
