/**
 * Модуль для парсинга числовых значений из различных форматов
 */

/**
 * Преобразует строку с числом в числовое значение
 * @param {string|number} value - Строка с числом или число
 * @param {Object} options - Опции парсинга
 * @param {string} options.decimalSeparator - Разделитель десятичной части (по умолчанию '.')
 * @param {string} options.thousandsSeparator - Разделитель тысяч (по умолчанию ',')
 * @param {boolean} options.parsePercent - Преобразовывать ли проценты в десятичные дроби (по умолчанию true)
 * @returns {number} - Числовое значение или NaN, если парсинг не удался
 */
export function parseNumber(value, options = {}) {
  // Значения по умолчанию
  const decimalSeparator = options.decimalSeparator || '.';
  const thousandsSeparator = options.thousandsSeparator || ',';
  const parsePercent = options.parsePercent !== false;

  // Если value уже число, возвращаем его
  if (typeof value === 'number') {
    return value;
  }

  // Если value не строка или пустая строка, возвращаем NaN
  if (typeof value !== 'string' || value.trim() === '') {
    return NaN;
  }

  // Обрабатываем проценты
  let stringValue = value.trim();
  let percentMultiplier = 1;

  if (parsePercent && stringValue.endsWith('%')) {
    stringValue = stringValue.slice(0, -1).trim();
    percentMultiplier = 0.01;
  }

  // Удаляем разделители тысяч и заменяем десятичный разделитель на точку
  const normalizedValue = stringValue
    .replace(new RegExp(`\\${thousandsSeparator}`, 'g'), '')
    .replace(new RegExp(`\\${decimalSeparator}`, 'g'), '.');

  // Преобразуем в число
  const number = parseFloat(normalizedValue);

  // Применяем множитель для процентов
  return isNaN(number) ? NaN : number * percentMultiplier;
}

/**
 * Форматирует число в строку с заданными параметрами
 * @param {number} value - Число для форматирования
 * @param {Object} options - Опции форматирования
 * @param {string} options.decimalSeparator - Разделитель десятичной части (по умолчанию '.')
 * @param {string} options.thousandsSeparator - Разделитель тысяч (по умолчанию ',')
 * @param {number} options.precision - Количество знаков после запятой (по умолчанию 2)
 * @param {boolean} options.showPercent - Показывать ли значение как процент (по умолчанию false)
 * @returns {string} - Отформатированное число в виде строки
 */
export function formatNumber(value, options = {}) {
  // Значения по умолчанию
  const decimalSeparator = options.decimalSeparator || '.';
  const thousandsSeparator = options.thousandsSeparator || ',';
  const precision = options.precision !== undefined ? options.precision : 2;
  const showPercent = options.showPercent || false;

  // Если value не число, возвращаем пустую строку
  if (typeof value !== 'number' || isNaN(value)) {
    return '';
  }

  // Применяем множитель для процентов
  const multipliedValue = showPercent ? value * 100 : value;

  // Форматируем число
  const [integerPart, decimalPart] = multipliedValue
    .toFixed(precision)
    .split('.');

  // Добавляем разделители тысяч
  const formattedIntegerPart = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    thousandsSeparator,
  );

  // Собираем результат
  let result = formattedIntegerPart;
  if (precision > 0) {
    result += decimalSeparator + decimalPart;
  }

  // Добавляем знак процента, если нужно
  if (showPercent) {
    result += '%';
  }

  return result;
}

export default {
  parseNumber,
  formatNumber,
};
