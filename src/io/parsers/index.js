/**
 * Export parsers for various data formats
 */

import * as dateParser from './dateParser.js';
import * as numberParser from './numberParser.js';

// Export all parsers
export { dateParser, numberParser };

// Export individual functions for convenience
export const parseDate = dateParser.parseDate;
export const formatDate = dateParser.formatDate;
export const parseNumber = numberParser.parseNumber;
export const formatNumber = numberParser.formatNumber;

// Export default
export default {
  dateParser,
  numberParser,
  parseDate,
  formatDate,
  parseNumber,
  formatNumber,
};
