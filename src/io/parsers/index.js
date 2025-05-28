/**
 * Экспорт парсеров для различных форматов данных
 */

import * as dateParser from './dateParser.js';
import * as numberParser from './numberParser.js';

// Экспорт всех парсеров
export { dateParser, numberParser };

// Экспорт отдельных функций для удобства
export const parseDate = dateParser.parseDate;
export const formatDate = dateParser.formatDate;
export const parseNumber = numberParser.parseNumber;
export const formatNumber = numberParser.formatNumber;

// Экспорт по умолчанию
export default {
  dateParser,
  numberParser,
  parseDate,
  formatDate,
  parseNumber,
  formatNumber,
};
