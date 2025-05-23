/**
 * Utility functions for working with dates and time series data.
 * These functions help with date parsing, frequency conversion, and date operations.
 */

/**
 * Parses a date string or timestamp into a JavaScript Date object
 * @param {string|number|Date} dateValue - The date to parse
 * @returns {Date} - JavaScript Date object
 */
function parseDate(dateValue) {
  if (dateValue instanceof Date) {
    return dateValue;
  }

  if (typeof dateValue === 'number') {
    return new Date(dateValue);
  }

  // Try to parse the date string
  const parsedDate = new Date(dateValue);
  if (isNaN(parsedDate.getTime())) {
    throw new Error(`Invalid date format: ${dateValue}`);
  }

  return parsedDate;
}

/**
 * Truncates a date to the specified frequency, returning the start of the period
 * @param {Date} date - The date to truncate
 * @param {string} freq - Frequency ('D' for day, 'W' for week, 'M' for month, 'Q' for quarter, 'Y' for year)
 * @returns {Date} - Date at the start of the period
 */
function truncateDate(date, freq) {
  const result = new Date(date);

  switch (freq) {
    case 'D': // Day
      result.setHours(0, 0, 0, 0);
      break;
    case 'W': // Week (Sunday as first day)
      const day = result.getDay();
      result.setDate(result.getDate() - day);
      result.setHours(0, 0, 0, 0);
      break;
    case 'M': // Month
      result.setDate(1);
      result.setHours(0, 0, 0, 0);
      break;
    case 'Q': // Quarter
      const month = result.getMonth();
      const quarterMonth = month - (month % 3);
      result.setMonth(quarterMonth, 1);
      result.setHours(0, 0, 0, 0);
      break;
    case 'Y': // Year
      result.setMonth(0, 1);
      result.setHours(0, 0, 0, 0);
      break;
    default:
      throw new Error(`Unsupported frequency: ${freq}`);
  }

  return result;
}

/**
 * Gets the next date based on the current date and frequency
 * @param {Date} date - The current date
 * @param {string} freq - Frequency ('D' for day, 'W' for week, 'M' for month, 'Q' for quarter, 'Y' for year)
 * @returns {Date} - The next date
 */
function getNextDate(date, freq) {
  const result = new Date(date);

  switch (freq) {
    case 'D': // Day
      result.setDate(result.getDate() + 1);
      break;
    case 'W': // Week
      result.setDate(result.getDate() + 7);
      break;
    case 'M': // Month
      result.setMonth(result.getMonth() + 1);
      break;
    case 'Q': // Quarter
      result.setMonth(result.getMonth() + 3);
      break;
    case 'Y': // Year
      result.setFullYear(result.getFullYear() + 1);
      break;
    default:
      throw new Error(`Unsupported frequency: ${freq}`);
  }

  return result;
}

/**
 * Formats a date as an ISO string without time component
 * @param {Date} date - The date to format
 * @returns {string} - Formatted date string (YYYY-MM-DD)
 */
function formatDateISO(date) {
  return date.toISOString().split('T')[0];
}

/**
 * Checks if two dates are in the same period based on frequency
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @param {string} freq - Frequency ('D' for day, 'W' for week, 'M' for month, 'Q' for quarter, 'Y' for year)
 * @returns {boolean} - True if dates are in the same period
 */
function isSamePeriod(date1, date2, freq) {
  const truncated1 = truncateDate(date1, freq);
  const truncated2 = truncateDate(date2, freq);

  return truncated1.getTime() === truncated2.getTime();
}

/**
 * Generates a sequence of dates from start to end with the specified frequency
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @param {string} freq - Frequency ('D' for day, 'W' for week, 'M' for month, 'Q' for quarter, 'Y' for year)
 * @returns {Date[]} - Array of dates
 */
function dateRange(startDate, endDate, freq) {
  const result = [];
  let currentDate = truncateDate(startDate, freq);
  const truncatedEndDate = truncateDate(endDate, freq);

  while (currentDate <= truncatedEndDate) {
    result.push(new Date(currentDate));
    currentDate = getNextDate(currentDate, freq);
  }

  return result;
}

export {
  parseDate,
  truncateDate,
  getNextDate,
  formatDateISO,
  isSamePeriod,
  dateRange,
};
