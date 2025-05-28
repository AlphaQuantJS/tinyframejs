/**
 * Resample a DataFrame to a different time frequency
 *
 * @param {DataFrame} df - DataFrame to resample
 * @param {Object} options - Options object
 * @param {string} options.dateColumn - Name of the column containing dates
 * @param {string} options.freq - Target frequency ('D' for day, 'W' for week, 'M' for month, 'Q' for quarter, 'Y' for year)
 * @param {Object} options.aggregations - Object mapping column names to aggregation functions
 * @param {boolean} [options.includeEmpty=false] - Whether to include empty periods
 * @returns {DataFrame} - Resampled DataFrame
 */
export function resample(df, options) {
  const {
    dateColumn,
    freq,
    aggregations = {},
    includeEmpty = false,
  } = options || {};

  // Validate options
  if (!dateColumn || !df.columns.includes(dateColumn)) {
    throw new Error(`Date column '${dateColumn}' not found in DataFrame`);
  }

  if (!freq) {
    throw new Error('freq parameter is required');
  }

  if (Object.keys(aggregations).length === 0) {
    throw new Error('At least one aggregation must be specified');
  }

  // Get date column values
  const dateValues = df.col(dateColumn).toArray();

  // Convert dates to Date objects if they are strings
  const dates = dateValues.map((d) => (d instanceof Date ? d : new Date(d)));

  // Group data by time periods
  const groups = groupByTimePeriod(dates, freq);

  // Create a new object to hold the result columns
  const resultColumns = {};

  // Add date column with period start dates
  resultColumns[dateColumn] = Object.keys(groups).map(
    (period) => new Date(period),
  );

  // Apply aggregations to each column
  for (const [colName, aggFunc] of Object.entries(aggregations)) {
    if (!df.columns.includes(colName)) {
      throw new Error(`Column '${colName}' not found in DataFrame`);
    }

    const colValues = df.col(colName).toArray();
    const aggregatedValues = [];

    // Aggregate values for each period
    for (const period of Object.keys(groups)) {
      const indices = groups[period];
      const periodValues = indices
        .map((i) => colValues[i])
        .filter((v) => v !== null && v !== undefined && !isNaN(v));

      if (periodValues.length > 0) {
        aggregatedValues.push(aggFunc(periodValues));
      } else {
        aggregatedValues.push(null);
      }
    }

    // Add aggregated values to result columns
    resultColumns[colName] = aggregatedValues;
  }

  // Create a new DataFrame with the result columns
  return new df.constructor(resultColumns);
}

/**
 * Group dates by time period
 *
 * @param {Date[]} dates - Array of dates
 * @param {string} freq - Frequency ('D', 'W', 'M', 'Q', 'Y')
 * @returns {Object} - Object mapping period start dates to arrays of indices
 */
function groupByTimePeriod(dates, freq) {
  const groups = {};

  // Group dates by period
  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    if (!(date instanceof Date) || isNaN(date)) {
      continue;
    }

    const periodStart = getPeriodStart(date, freq);
    const periodKey = periodStart.toISOString();

    if (!groups[periodKey]) {
      groups[periodKey] = [];
    }

    groups[periodKey].push(i);
  }

  return groups;
}

/**
 * Get the start date of a period
 *
 * @param {Date} date - Date to get period start for
 * @param {string} freq - Frequency ('D', 'W', 'M', 'Q', 'Y')
 * @returns {Date} - Start date of the period
 */
function getPeriodStart(date, freq) {
  const result = new Date(date);

  switch (freq.toUpperCase()) {
  case 'D':
    // Start of day
    result.setHours(0, 0, 0, 0);
    break;
  case 'W':
    // Start of week (Sunday)
    const day = result.getDay();
    result.setDate(result.getDate() - day);
    result.setHours(0, 0, 0, 0);
    break;
  case 'M':
    // Start of month
    result.setDate(1);
    result.setHours(0, 0, 0, 0);
    break;
  case 'Q':
    // Start of quarter
    const month = result.getMonth();
    const quarterMonth = Math.floor(month / 3) * 3;
    result.setMonth(quarterMonth, 1);
    result.setHours(0, 0, 0, 0);
    break;
  case 'Y':
    // Start of year
    result.setMonth(0, 1);
    result.setHours(0, 0, 0, 0);
    break;
  default:
    throw new Error(`Unsupported frequency: ${freq}`);
  }

  return result;
}

export default {
  resample,
};
