/**
 * Calendar utility functions for time series data
 * @module methods/timeseries/alltypes/calendar
 */

/**
 * Checks if a date is a business day (Monday to Friday)
 *
 * @param {Date} date - Date to check
 * @returns {boolean} - True if date is a business day, false otherwise
 */
function isBusinessDay(date) {
  if (!(date instanceof Date) || isNaN(date)) {
    return false;
  }

  const day = date.getDay();
  // 0 is Sunday, 6 is Saturday
  return day !== 0 && day !== 6;
}

/**
 * Gets the next business day after a given date
 *
 * @param {Date} date - Starting date
 * @returns {Date} - Next business day
 */
function nextBusinessDay(date) {
  if (!(date instanceof Date) || isNaN(date)) {
    return null;
  }

  const result = new Date(date);
  result.setDate(result.getDate() + 1);

  // Keep adding days until we find a business day
  while (!isBusinessDay(result)) {
    result.setDate(result.getDate() + 1);
  }

  return result;
}

/**
 * Gets the previous business day before a given date
 *
 * @param {Date} date - Starting date
 * @returns {Date} - Previous business day
 */
function previousBusinessDay(date) {
  if (!(date instanceof Date) || isNaN(date)) {
    return null;
  }

  const result = new Date(date);
  result.setDate(result.getDate() - 1);

  // Keep subtracting days until we find a business day
  while (!isBusinessDay(result)) {
    result.setDate(result.getDate() - 1);
  }

  return result;
}

/**
 * Gets the end of month date for a given date
 *
 * @param {Date} date - Input date
 * @returns {Date} - Last day of the month
 */
function endOfMonth(date) {
  if (!(date instanceof Date) || isNaN(date)) {
    return null;
  }

  const result = new Date(date);
  // Set to first day of next month, then subtract one day
  result.setMonth(result.getMonth() + 1, 0);
  return result;
}

/**
 * Gets the start of month date for a given date
 *
 * @param {Date} date - Input date
 * @returns {Date} - First day of the month
 */
function startOfMonth(date) {
  if (!(date instanceof Date) || isNaN(date)) {
    return null;
  }

  const result = new Date(date);
  result.setDate(1);
  return result;
}

/**
 * Gets the end of quarter date for a given date
 *
 * @param {Date} date - Input date
 * @returns {Date} - Last day of the quarter
 */
function endOfQuarter(date) {
  if (!(date instanceof Date) || isNaN(date)) {
    return null;
  }

  const result = new Date(date);
  const month = result.getMonth();
  // Determine the last month of the quarter
  const lastMonthOfQuarter = Math.floor(month / 3) * 3 + 2;
  result.setMonth(lastMonthOfQuarter + 1, 0); // Last day of the last month of the quarter
  return result;
}

/**
 * Gets the start of quarter date for a given date
 *
 * @param {Date} date - Input date
 * @returns {Date} - First day of the quarter
 */
function startOfQuarter(date) {
  if (!(date instanceof Date) || isNaN(date)) {
    return null;
  }

  const result = new Date(date);
  const month = result.getMonth();
  // Determine the first month of the quarter
  const firstMonthOfQuarter = Math.floor(month / 3) * 3;
  result.setMonth(firstMonthOfQuarter, 1); // First day of the first month of the quarter
  return result;
}

/**
 * Gets the end of year date for a given date
 *
 * @param {Date} date - Input date
 * @returns {Date} - Last day of the year
 */
function endOfYear(date) {
  if (!(date instanceof Date) || isNaN(date)) {
    return null;
  }

  const result = new Date(date);
  result.setMonth(11, 31); // December 31
  return result;
}

/**
 * Gets the start of year date for a given date
 *
 * @param {Date} date - Input date
 * @returns {Date} - First day of the year
 */
function startOfYear(date) {
  if (!(date instanceof Date) || isNaN(date)) {
    return null;
  }

  const result = new Date(date);
  result.setMonth(0, 1); // January 1
  return result;
}

/**
 * Adds a specified number of business days to a date
 *
 * @param {Date} date - Starting date
 * @param {number} days - Number of business days to add
 * @returns {Date} - Resulting date
 */
function addBusinessDays(date, days) {
  if (!(date instanceof Date) || isNaN(date) || typeof days !== 'number') {
    return null;
  }

  const result = new Date(date);
  let remainingDays = days;

  while (remainingDays > 0) {
    result.setDate(result.getDate() + 1);
    if (isBusinessDay(result)) {
      remainingDays--;
    }
  }

  return result;
}

/**
 * Generates a range of dates between start and end dates with a specified frequency
 *
 * @param {Date} startDate - Start date of the range
 * @param {Date} endDate - End date of the range
 * @param {string} freq - Frequency ('D' for daily, 'B' for business days, 'W' for weekly, 'M' for monthly, 'Q' for quarterly, 'Y' for yearly)
 * @returns {Array<Date>} - Array of dates in the range
 */
function dateRange(startDate, endDate, freq = 'D') {
  if (
    !(startDate instanceof Date) ||
    !(endDate instanceof Date) ||
    isNaN(startDate) ||
    isNaN(endDate) ||
    startDate > endDate
  ) {
    return [];
  }

  const result = [];
  let currentDate = new Date(startDate);

  // Add start date to result
  result.push(new Date(currentDate));

  while (currentDate < endDate) {
    switch (freq) {
      case 'D': // Daily
        currentDate.setDate(currentDate.getDate() + 1);
        break;
      case 'B': // Business days
        currentDate = nextBusinessDay(currentDate);
        break;
      case 'W': // Weekly
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      case 'M': // Monthly
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
      case 'Q': // Quarterly
        currentDate.setMonth(currentDate.getMonth() + 3);
        break;
      case 'Y': // Yearly
        currentDate.setFullYear(currentDate.getFullYear() + 1);
        break;
      default:
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // Add current date to result if it's not past the end date
    if (currentDate <= endDate) {
      result.push(new Date(currentDate));
    }
  }

  return result;
}

export {
  isBusinessDay,
  nextBusinessDay,
  previousBusinessDay,
  endOfMonth,
  startOfMonth,
  endOfQuarter,
  startOfQuarter,
  endOfYear,
  startOfYear,
  addBusinessDays,
  dateRange,
};
