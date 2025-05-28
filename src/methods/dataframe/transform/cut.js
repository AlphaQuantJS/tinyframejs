/**
 * Cut values in a column into bins
 *
 * @returns {Function} - Function that takes a DataFrame and cuts values in a column into bins
 */
export const cut =
  () =>
    (df, column, bins, options = {}) => {
      const {
        inplace = false,
        labels = null,
        targetColumn = `${column}_bin`,
        right = true, // Whether the intervals include the right bound
        includeLowest = false, // Whether the lowest interval should include the lowest value
      } = options;

      // Validate column
      if (!df.columns.includes(column)) {
        throw new Error(`Column '${column}' not found`);
      }

      // Validate bins
      if (!Array.isArray(bins) || bins.length < 2) {
        throw new Error('Bins must be an array with at least 2 elements');
      }

      // Validate labels if provided
      if (
        labels &&
      (!Array.isArray(labels) || labels.length !== bins.length - 1)
      ) {
        throw new Error(
          'Labels must be an array with length equal to bins.length - 1',
        );
      }

      // Get column values
      const series = df.col(column);
      const values = series.toArray();

      // Create bin labels if not provided
      const binLabels =
      labels ||
      Array.from({ length: bins.length - 1 }, (_, i) => {
        const start = bins[i];
        const end = bins[i + 1];
        return right ?
          includeLowest && i === 0 ?
            `[${start}, ${end})` :
            `(${start}, ${end}]` :
          includeLowest && i === 0 ?
            `[${start}, ${end}]` :
            `(${start}, ${end})`;
      });

      // Cut values into bins
      const binned = values.map((value) => {
      // Skip null, undefined, and NaN values
        if (value === null || value === undefined || isNaN(value)) {
          return null;
        }

        // Find the bin for the value
        for (let i = 0; i < bins.length - 1; i++) {
          const start = bins[i];
          const end = bins[i + 1];

          // Check if value is in the bin
          if (right) {
          // Right-inclusive intervals: (start, end]
            if (value > start && value <= end) {
              return binLabels[i];
            }
            // Special case for the first bin if includeLowest is true
            if (includeLowest && i === 0 && value === start) {
              return binLabels[i];
            }
          } else {
          // Left-inclusive intervals: [start, end)
            if (value >= start && value < end) {
              return binLabels[i];
            }
            // Special case for the last bin if includeLowest is true
            if (includeLowest && i === bins.length - 2 && value === end) {
              return binLabels[i];
            }
          }
        }

        // Value is outside the bins
        return null;
      });

      // Create a new object to hold the result
      const result = {};

      // Copy all columns
      for (const col of df.columns) {
        result[col] = df.col(col).toArray();
      }

      // Add the binned column
      result[targetColumn] = binned;

      // Return new DataFrame or modify in place
      if (inplace) {
      // Add the new column to the original DataFrame
        df._columns[targetColumn] = binned;
        return df;
      }

      // Create a new DataFrame with the binned column
      return new df.constructor(result);
    };

export default { cut };
