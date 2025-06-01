/**
 * Utility functions for inferring frequency from time series data
 * @module methods/timeseries/alltypes/inferFrequency
 */

/**
 * Infers the frequency of a time series from date values
 * Works with both DataFrame and Series
 *
 * @param {Array} dateValues - Array of date values
 * @returns {string} - Inferred frequency ('D' for daily, 'W' for weekly, 'M' for monthly, etc.)
 */
function inferFrequency(dateValues) {
  if (!dateValues || dateValues.length < 2) {
    return null; // Not enough data to infer frequency
  }

  // Filter out invalid dates
  const validDates = dateValues.filter((d) => d instanceof Date && !isNaN(d));
  if (validDates.length < 2) {
    return null; // Not enough valid dates
  }

  // Sort dates to ensure correct calculation
  const sortedDates = [...validDates].sort((a, b) => a - b);

  // Calculate differences between consecutive dates (in milliseconds)
  const diffs = [];
  for (let i = 1; i < sortedDates.length; i++) {
    diffs.push(sortedDates[i] - sortedDates[i - 1]);
  }

  // Find the most common difference
  const diffCounts = {};
  let maxCount = 0;
  let mostCommonDiff = null;

  diffs.forEach((diff) => {
    diffCounts[diff] = (diffCounts[diff] || 0) + 1;
    if (diffCounts[diff] > maxCount) {
      maxCount = diffCounts[diff];
      mostCommonDiff = diff;
    }
  });

  // Convert milliseconds to days
  const daysDiff = mostCommonDiff / (1000 * 60 * 60 * 24);

  // Infer frequency based on the most common difference
  if (daysDiff < 0.1) {
    // Less than 2.4 hours
    return 'H'; // Hourly
  } else if (daysDiff < 1.5) {
    return 'D'; // Daily
  } else if (daysDiff >= 1.5 && daysDiff < 10) {
    // Check if it's weekly (around 7 days)
    if (Math.abs(daysDiff - 7) < 1) {
      return 'W'; // Weekly
    }
    return 'D'; // Daily with gaps
  } else if (daysDiff >= 10 && daysDiff < 45) {
    return 'M'; // Monthly
  } else if (daysDiff >= 45 && daysDiff < 200) {
    return 'Q'; // Quarterly
  } else {
    return 'Y'; // Yearly
  }
}

/**
 * Extract date values from a DataFrame or Series
 *
 * @param {Object} data - DataFrame or Series object
 * @param {string} dateColumn - Column name containing dates (for DataFrame)
 * @returns {Array} - Array of date values
 */
function extractDateValues(data, dateColumn) {
  // Check if data is a DataFrame (has _columns property)
  if (data._columns) {
    if (!dateColumn) {
      // Try to find a date column
      const columns = data.columns || Object.keys(data._columns);
      dateColumn = columns.find((col) => {
        const column = data._columns[col];
        if (!column || !column.get) return false;
        const firstValue = column.get(0);
        return firstValue instanceof Date;
      });

      if (!dateColumn) {
        return []; // No date column found
      }
    }

    // Extract date values from the DataFrame using col() method
    const column = data.col(dateColumn);
    if (column && column.toArray) {
      return column.toArray();
    }
    return [];
  } else if (data.toArray && typeof data.toArray === 'function') {
    // Check if data is a Series
    return data.toArray();
  }

  return []; // Unknown data type
}

/**
 * Infers the frequency of a time series from a DataFrame or Series
 *
 * @param {Object} data - DataFrame or Series object
 * @param {string} dateColumn - Column name containing dates (for DataFrame)
 * @returns {string} - Inferred frequency ('D' for daily, 'W' for weekly, 'M' for monthly, etc.)
 */
function inferFrequencyFromData(data, dateColumn) {
  const dateValues = extractDateValues(data, dateColumn);
  return inferFrequency(dateValues);
}

export { inferFrequency, inferFrequencyFromData };
