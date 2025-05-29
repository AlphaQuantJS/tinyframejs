/**
 * Module for parsing numbers in various formats
 */

/**
 * Converts a string with a number to a numeric value
 * @param {string|number} value - String with a number or number
 * @param {Object} options - Parsing options
 * @param {string} options.decimalSeparator - Decimal separator (default '.')
 * @param {string} options.thousandsSeparator - Thousands separator (default ',')
 * @param {boolean} options.parsePercent - Convert percentages to decimal fractions (default true)
 * @returns {number} - Numeric value or NaN if parsing fails
 */
export function parseNumber(value, options = {}) {
  // Default values
  const decimalSeparator = options.decimalSeparator || '.';
  const thousandsSeparator = options.thousandsSeparator || ',';
  const parsePercent = options.parsePercent !== false;

  // If value is already a number, return it
  if (typeof value === 'number') {
    return value === 0 ? 0 : value; // Convert -0 to 0
  }

  // If value is not a string or an empty string, return NaN
  if (typeof value !== 'string' || value.trim() === '') {
    return NaN;
  }

  // Handle percentages
  let stringValue = value.trim();
  let percentMultiplier = 1;

  if (stringValue.endsWith('%')) {
    if (parsePercent) {
      stringValue = stringValue.slice(0, -1).trim();
      percentMultiplier = 0.01;
    } else {
      // If parsePercent is false, just remove the % sign without applying multiplier
      stringValue = stringValue.slice(0, -1).trim();
    }
  }

  // Basic validation before processing
  // Check for multiple minus signs
  const minusCount = (stringValue.match(/-/g) || []).length;
  if (minusCount > 1 || (minusCount === 1 && !stringValue.startsWith('-'))) {
    return NaN;
  }

  // Check for multiple decimal separators
  const decimalCount = (
    stringValue.match(new RegExp(`\\${decimalSeparator}`, 'g')) || []
  ).length;
  if (decimalCount > 1) {
    return NaN;
  }

  // Simple approach for parsing with custom decimal separator
  try {
    // Handle the sign separately
    const isNegative = stringValue.startsWith('-');
    if (isNegative) {
      stringValue = stringValue.substring(1);
    }

    // Split by decimal separator
    const parts = stringValue.split(decimalSeparator);

    // If we have more than 2 parts after splitting by decimal separator, it's invalid
    if (parts.length > 2) {
      return NaN;
    }

    // Get integer and fractional parts
    let integerPart = parts[0] || '0';
    const fractionalPart = parts.length > 1 ? parts[1] : '';

    // Remove thousands separators from integer part
    if (thousandsSeparator) {
      integerPart = integerPart.replace(
        new RegExp(`\\${thousandsSeparator}`, 'g'),
        '',
      );
    }

    // Check if the parts contain only digits
    if (!/^\d*$/.test(integerPart) || !/^\d*$/.test(fractionalPart)) {
      return NaN;
    }

    // Combine parts into a proper number string
    const numberStr = `${isNegative ? '-' : ''}${integerPart}${fractionalPart ? '.' + fractionalPart : ''}`;

    // Parse the number
    const number = parseFloat(numberStr);

    // Handle -0 case
    if (Object.is(number, -0)) {
      return 0;
    }

    // Apply percentage multiplier
    return isNaN(number) ? NaN : number * percentMultiplier;
  } catch (e) {
    return NaN;
  }
}

/**
 * Formats a number into a string with the specified parameters
 * @param {number} value - Number to format
 * @param {Object} options - Formatting options
 * @param {string} options.decimalSeparator - Decimal separator (default '.')
 * @param {string} options.thousandsSeparator - Thousands separator (default ',')
 * @param {number} options.precision - Number of decimal places (default 2)
 * @param {boolean} options.showPercent - Show value as percentage (default false)
 * @returns {string} - Formatted number as string
 */
export function formatNumber(value, options = {}) {
  // Default values
  const decimalSeparator = options.decimalSeparator || '.';
  const thousandsSeparator = options.thousandsSeparator || ',';
  const precision = options.precision !== undefined ? options.precision : 2;
  const showPercent = options.showPercent || false;

  // If value is not a number, return an empty string
  if (typeof value !== 'number' || isNaN(value)) {
    return '';
  }

  // Apply percentage multiplier
  const multipliedValue = showPercent ? value * 100 : value;

  // Format the number
  const [integerPart, decimalPart] = multipliedValue
    .toFixed(precision)
    .split('.');

  // Add thousands separators
  const formattedIntegerPart = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    thousandsSeparator,
  );

  // Assemble the result
  let result = formattedIntegerPart;
  if (precision > 0) {
    result += decimalSeparator + decimalPart;
  }

  // Add percentage sign if needed
  if (showPercent) {
    result += '%';
  }

  return result;
}

export default {
  parseNumber,
  formatNumber,
};
