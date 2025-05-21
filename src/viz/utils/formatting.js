// src/viz/utils/formatting.js

/**
 * Formats date values for display on axes
 * @param {Date|string|number} date - Date value to format
 * @param {string} [format='auto'] - Format string or 'auto' for automatic formatting
 * @returns {string} Formatted date string
 */
export function formatDate(date, format = 'auto') {
  // Convert to Date object if needed
  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    return '';
  }

  if (format === 'auto') {
    // Determine appropriate format based on the date range
    return autoFormatDate(dateObj);
  }

  // Apply custom format
  return customFormatDate(dateObj, format);
}

/**
 * Automatically determines the best format for a date based on its value
 * @param {Date} date - Date object to format
 * @returns {string} Formatted date string
 * @private
 */
function autoFormatDate(date) {
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isThisYear = date.getFullYear() === now.getFullYear();

  if (isToday) {
    // Format as time for today's dates
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  } else if (isThisYear) {
    // Format as month and day for dates in the current year
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  } else {
    // Format as year, month, and day for older dates
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}

/**
 * Formats a date according to a custom format string
 * Supported tokens:
 * - YYYY: 4-digit year
 * - YY: 2-digit year
 * - MMMM: Full month name
 * - MMM: 3-letter month name
 * - MM: 2-digit month
 * - M: 1-digit month
 * - DD: 2-digit day
 * - D: 1-digit day
 * - HH: 2-digit hour (24h)
 * - H: 1-digit hour (24h)
 * - hh: 2-digit hour (12h)
 * - h: 1-digit hour (12h)
 * - mm: 2-digit minute
 * - m: 1-digit minute
 * - ss: 2-digit second
 * - s: 1-digit second
 * - A: AM/PM
 * - a: am/pm
 *
 * @param {Date} date - Date object to format
 * @param {string} format - Format string
 * @returns {string} Formatted date string
 * @private
 */
function customFormatDate(date, format) {
  const tokens = {
    YYYY: date.getFullYear(),
    YY: String(date.getFullYear()).slice(-2),
    MMMM: date.toLocaleString(undefined, { month: 'long' }),
    MMM: date.toLocaleString(undefined, { month: 'short' }),
    MM: String(date.getMonth() + 1).padStart(2, '0'),
    M: date.getMonth() + 1,
    DD: String(date.getDate()).padStart(2, '0'),
    D: date.getDate(),
    HH: String(date.getHours()).padStart(2, '0'),
    H: date.getHours(),
    hh: String(date.getHours() % 12 || 12).padStart(2, '0'),
    h: date.getHours() % 12 || 12,
    mm: String(date.getMinutes()).padStart(2, '0'),
    m: date.getMinutes(),
    ss: String(date.getSeconds()).padStart(2, '0'),
    s: date.getSeconds(),
    A: date.getHours() < 12 ? 'AM' : 'PM',
    a: date.getHours() < 12 ? 'am' : 'pm',
  };

  // Replace tokens in the format string
  let result = format;
  for (const [token, value] of Object.entries(tokens)) {
    result = result.replace(new RegExp(token, 'g'), value);
  }

  return result;
}

/**
 * Formats a value based on its type
 * @param {*} value - Value to format
 * @param {Object} [options] - Formatting options
 * @returns {string} Formatted value
 */
export function formatValue(value, options = {}) {
  if (value === null || value === undefined) {
    return '';
  }

  if (value instanceof Date || !isNaN(new Date(value).getTime())) {
    return formatDate(value, options.dateFormat);
  }

  if (typeof value === 'number') {
    return formatNumber(value, options);
  }

  return String(value);
}

/**
 * Formats a number with specified options
 * @param {number} value - Number to format
 * @param {Object} [options] - Formatting options
 * @returns {string} Formatted number
 */
function formatNumber(value, options = {}) {
  const {
    precision,
    locale = undefined,
    style = 'decimal',
    currency = 'USD',
    compact = false,
  } = options;

  if (compact) {
    // Use compact notation (K, M, B)
    const absValue = Math.abs(value);

    if (absValue >= 1e9) {
      return (
        (value / 1e9).toFixed(precision !== undefined ? precision : 1) + 'B'
      );
    } else if (absValue >= 1e6) {
      return (
        (value / 1e6).toFixed(precision !== undefined ? precision : 1) + 'M'
      );
    } else if (absValue >= 1e3) {
      return (
        (value / 1e3).toFixed(precision !== undefined ? precision : 1) + 'K'
      );
    }
  }

  // Use Intl.NumberFormat for locale-aware formatting
  const formatOptions = {
    style,
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  };

  if (style === 'currency') {
    formatOptions.currency = currency;
  } else if (style === 'percent') {
    // Convert decimal to percentage
    value *= 100;
  }

  try {
    return new Intl.NumberFormat(locale, formatOptions).format(value);
  } catch (error) {
    // Fallback if Intl is not supported
    return precision !== undefined
      ? value.toFixed(precision)
      : value.toString();
  }
}

/**
 * Creates a label formatter function for chart axes
 * @param {string} type - Data type ('number', 'date', 'category')
 * @param {Object} [options] - Formatting options
 * @returns {Function} Formatter function that takes a value and returns a string
 */
export function createLabelFormatter(type, options = {}) {
  switch (type) {
    case 'date':
      return (value) => formatDate(value, options.dateFormat);

    case 'number':
      return (value) => formatNumber(value, options);

    case 'category':
    default:
      return (value) => String(value);
  }
}

/**
 * Truncates text to a specified length
 * @param {string} text - Text to truncate
 * @param {number} [maxLength=30] - Maximum length
 * @param {string} [ellipsis='...'] - Ellipsis string
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 30, ellipsis = '...') {
  if (!text || text.length <= maxLength) {
    return text;
  }

  return text.substring(0, maxLength - ellipsis.length) + ellipsis;
}
