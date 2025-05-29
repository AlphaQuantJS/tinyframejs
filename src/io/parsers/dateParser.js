/**
 * Module for parsing dates in various formats
 */

/**
 * Converts a date string to a Date object
 * @param {string} dateString - Date string
 * @param {Object} options - Parsing options
 * @param {string} options.format - Date format (e.g., 'YYYY-MM-DD')
 * @param {string} options.locale - Locale for parsing (e.g., 'ru-RU')
 * @returns {Date} - Date object
 */
export function parseDate(dateString, options = {}) {
  if (!dateString) {
    return null;
  }

  // If the input is already a Date object, return it as is
  if (dateString instanceof Date) {
    return dateString;
  }

  // Try standard parsing
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    return date;
  }

  // If standard parsing fails, try different formats
  // ISO format: YYYY-MM-DD
  const isoRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
  const isoMatch = dateString.match(isoRegex);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  // Format DD.MM.YYYY
  const dotRegex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
  const dotMatch = dateString.match(dotRegex);
  if (dotMatch) {
    const [, day, month, year] = dotMatch;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  // Format MM/DD/YYYY
  const slashRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const slashMatch = dateString.match(slashRegex);
  if (slashMatch) {
    const [, month, day, year] = slashMatch;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  // If nothing worked, return null
  return null;
}

/**
 * Formats a Date object into a string in the specified format
 * @param {Date} date - Date object
 * @param {string} format - Output format (e.g., 'YYYY-MM-DD')
 * @returns {string} - Formatted date string
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

export default {
  parseDate,
  formatDate,
};
