/**
 * Модуль для парсинга дат из различных форматов
 */

/**
 * Преобразует строку с датой в объект Date
 * @param {string} dateString - Строка с датой
 * @param {Object} options - Опции парсинга
 * @param {string} options.format - Формат даты (например, 'YYYY-MM-DD')
 * @param {string} options.locale - Локаль для парсинга (например, 'ru-RU')
 * @returns {Date} - Объект Date
 */
export function parseDate(dateString, options = {}) {
  if (!dateString) {
    return null;
  }

  // Если передан объект Date, возвращаем его
  if (dateString instanceof Date) {
    return dateString;
  }

  // Пробуем стандартный парсинг
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    return date;
  }

  // Если стандартный парсинг не сработал, пробуем разные форматы
  // ISO формат: YYYY-MM-DD
  const isoRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
  const isoMatch = dateString.match(isoRegex);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  // Формат DD.MM.YYYY
  const dotRegex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
  const dotMatch = dateString.match(dotRegex);
  if (dotMatch) {
    const [, day, month, year] = dotMatch;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  // Формат MM/DD/YYYY
  const slashRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const slashMatch = dateString.match(slashRegex);
  if (slashMatch) {
    const [, month, day, year] = slashMatch;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  // Если ничего не сработало, возвращаем null
  return null;
}

/**
 * Форматирует объект Date в строку в заданном формате
 * @param {Date} date - Объект Date
 * @param {string} format - Формат вывода (например, 'YYYY-MM-DD')
 * @returns {string} - Отформатированная строка с датой
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
