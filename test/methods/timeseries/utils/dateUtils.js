/**
 * Utility functions for working with dates and time series data.
 * These functions help with date parsing, frequency conversion, and date operations.
 * @module methods/timeseries/dateUtils
 */

/**
 * Parses a date string or timestamp into a JavaScript Date object
 * @param {string|number|Date} dateValue - The date to parse
 * @returns {Date} - JavaScript Date object
 * @throws {Error} - If the date format is invalid
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
 * @throws {Error} - If the frequency is not supported
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
 * @throws {Error} - If the frequency is not supported
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
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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

/**
 * Adds a specified number of time units to a date
 * @param {Date} date - The date to add to
 * @param {number} amount - The amount to add
 * @param {string} unit - The unit to add ('days', 'weeks', 'months', 'quarters', 'years')
 * @returns {Date} - New date with the added time
 * @throws {Error} - If the time unit is not supported
 */
function addTime(date, amount, unit) {
  const result = new Date(date);

  switch (unit) {
    case 'days':
      result.setDate(result.getDate() + amount);
      break;
    case 'weeks':
      result.setDate(result.getDate() + amount * 7);
      break;
    case 'months':
      result.setMonth(result.getMonth() + amount);
      break;
    case 'quarters':
      result.setMonth(result.getMonth() + amount * 3);
      break;
    case 'years':
      result.setFullYear(result.getFullYear() + amount);
      break;
    default:
      throw new Error(`Unsupported time unit: ${unit}`);
  }

  return result;
}

/**
 * Subtracts a specified number of time units from a date
 * @param {Date} date - The date to subtract from
 * @param {number} amount - The amount to subtract
 * @param {string} unit - The unit to subtract ('days', 'weeks', 'months', 'quarters', 'years')
 * @returns {Date} - New date with the subtracted time
 */
function subtractTime(date, amount, unit) {
  return addTime(date, -amount, unit);
}

/**
 * Calculates the difference between two dates in the specified unit
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @param {string} unit - The unit to calculate difference in ('days', 'weeks', 'months', 'quarters', 'years')
 * @returns {number} - Difference in the specified unit
 * @throws {Error} - If the time unit is not supported
 */
function dateDiff(date1, date2, unit) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  switch (unit) {
    case 'days':
      return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
    case 'weeks':
      return Math.round((d2 - d1) / (1000 * 60 * 60 * 24 * 7));
    case 'months': {
      const monthDiff =
        (d2.getFullYear() - d1.getFullYear()) * 12 +
        (d2.getMonth() - d1.getMonth());
      const dayDiff = d2.getDate() - d1.getDate();

      // Adjust for month ends
      if (dayDiff < 0) {
        return monthDiff - 1;
      } else {
        return monthDiff;
      }
    }
    case 'quarters':
      return Math.floor(dateDiff(date1, date2, 'months') / 3);
    case 'years':
      return d2.getFullYear() - d1.getFullYear();
    default:
      throw new Error(`Unsupported time unit: ${unit}`);
  }
}

/**
 * Formats a date according to the specified format string
 * @param {Date} date - The date to format
 * @param {string} format - Format string (e.g., 'YYYY-MM-DD', 'DD/MM/YYYY', etc.)
 * @returns {string} - Formatted date string
 */
function formatDate(date, format = 'YYYY-MM-DD') {
  const d = new Date(date);

  const tokens = {
    YYYY: d.getFullYear(),
    YY: String(d.getFullYear()).slice(-2),
    MM: String(d.getMonth() + 1).padStart(2, '0'),
    M: d.getMonth() + 1,
    DD: String(d.getDate()).padStart(2, '0'),
    D: d.getDate(),
    HH: String(d.getHours()).padStart(2, '0'),
    H: d.getHours(),
    mm: String(d.getMinutes()).padStart(2, '0'),
    m: d.getMinutes(),
    ss: String(d.getSeconds()).padStart(2, '0'),
    s: d.getSeconds(),
  };

  return format.replace(
    /YYYY|YY|MM|M|DD|D|HH|H|mm|m|ss|s/g,
    (match) => tokens[match],
  );
}

/**
 * Parses a date string according to the specified format
 * @param {string} dateStr - The date string to parse
 * @param {string} format - Format string (e.g., 'YYYY-MM-DD', 'DD/MM/YYYY', etc.)
 * @returns {Date} - Parsed date
 */
function parseDateFormat(dateStr, format = 'YYYY-MM-DD') {
  // Create a regex pattern from the format
  const pattern = format
    .replace(/YYYY/g, '(\\d{4})')
    .replace(/YY/g, '(\\d{2})')
    .replace(/MM/g, '(\\d{2})')
    .replace(/M/g, '(\\d{1,2})')
    .replace(/DD/g, '(\\d{2})')
    .replace(/D/g, '(\\d{1,2})')
    .replace(/HH/g, '(\\d{2})')
    .replace(/H/g, '(\\d{1,2})')
    .replace(/mm/g, '(\\d{2})')
    .replace(/m/g, '(\\d{1,2})')
    .replace(/ss/g, '(\\d{2})')
    .replace(/s/g, '(\\d{1,2})');

  const regex = new RegExp(`^${pattern}$`);
  const match = dateStr.match(regex);

  if (!match) {
    throw new Error(
      `Date string '${dateStr}' does not match format '${format}'`,
    );
  }

  // Extract values based on format
  const values = {};
  let matchIndex = 1;

  const formatTokens = format.match(/YYYY|YY|MM|M|DD|D|HH|H|mm|m|ss|s/g);
  formatTokens.forEach((token) => {
    values[token] = match[matchIndex++];
  });

  // Handle two-digit years
  let year;
  if (values.YYYY) {
    year = parseInt(values.YYYY, 10);
  } else if (values.YY) {
    const currentYear = new Date().getFullYear();
    const century = Math.floor(currentYear / 100) * 100;
    year = century + parseInt(values.YY, 10);
  } else {
    year = new Date().getFullYear();
  }

  const month = parseInt(values.MM || values.M || 1, 10) - 1;
  const day = parseInt(values.DD || values.D || 1, 10);
  const hour = parseInt(values.HH || values.H || 0, 10);
  const minute = parseInt(values.mm || values.m || 0, 10);
  const second = parseInt(values.ss || values.s || 0, 10);

  return new Date(year, month, day, hour, minute, second);
}

/**
 * Gets the start of a business day (9:30 AM)
 * @param {Date} date - The date
 * @returns {Date} - Date set to the start of the business day
 */
function businessDayStart(date) {
  const result = new Date(date);
  result.setHours(9, 30, 0, 0);
  return result;
}

/**
 * Gets the end of a business day (4:00 PM)
 * @param {Date} date - The date
 * @returns {Date} - Date set to the end of the business day
 */
function businessDayEnd(date) {
  const result = new Date(date);
  result.setHours(16, 0, 0, 0);
  return result;
}

/**
 * Checks if a date is a weekend (Saturday or Sunday)
 * @param {Date} date - The date to check
 * @returns {boolean} - True if the date is a weekend
 */
function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
}

/**
 * Gets the next business day (skipping weekends)
 * @param {Date} date - The starting date
 * @returns {Date} - The next business day
 */
function nextBusinessDay(date) {
  const result = new Date(date);
  result.setDate(result.getDate() + 1);

  // Skip weekends
  while (isWeekend(result)) {
    result.setDate(result.getDate() + 1);
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
  addTime,
  subtractTime,
  dateDiff,
  formatDate,
  parseDateFormat,
  businessDayStart,
  businessDayEnd,
  isWeekend,
  nextBusinessDay,
};
