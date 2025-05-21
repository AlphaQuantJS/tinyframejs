// src/viz/utils/scales.js

/**
 * Calculates the appropriate scale range for a set of values
 * @param {number[]} values - Array of numeric values
 * @param {Object} [options] - Scale options
 * @param {boolean} [options.includeZero=true] - Whether to include zero in the range
 * @param {number} [options.padding=0.1] - Padding percentage (0-1) to add to the range
 * @returns {[number, number]} Min and max values for the scale
 */
export function calculateScaleRange(values, options = {}) {
  const { includeZero = true, padding = 0.1 } = options;

  if (!values || values.length === 0) {
    return [0, 1];
  }

  // Filter out non-numeric values
  const numericValues = values.filter(
    (v) => typeof v === 'number' && !isNaN(v),
  );

  if (numericValues.length === 0) {
    return [0, 1];
  }

  // Calculate min and max
  let min = Math.min(...numericValues);
  let max = Math.max(...numericValues);

  // Include zero if needed
  if (includeZero) {
    min = Math.min(0, min);
    max = Math.max(0, max);
  }

  // Apply padding
  const range = max - min;
  const paddingValue = range * padding;

  return [min - paddingValue, max + paddingValue];
}

/**
 * Generates tick values for a numeric scale
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {number} [count=5] - Approximate number of ticks
 * @returns {number[]} Array of tick values
 */
export function generateTicks(min, max, count = 5) {
  if (min === max) {
    return [min];
  }

  // Calculate step size based on range and desired tick count
  const range = max - min;
  const rawStep = range / (count - 1);

  // Round step to a nice number
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const normalizedStep = rawStep / magnitude;

  let step;
  if (normalizedStep < 1.5) {
    step = magnitude;
  } else if (normalizedStep < 3) {
    step = 2 * magnitude;
  } else if (normalizedStep < 7) {
    step = 5 * magnitude;
  } else {
    step = 10 * magnitude;
  }

  // Generate ticks
  const ticks = [];
  const firstTick = Math.ceil(min / step) * step;

  for (let tick = firstTick; tick <= max; tick += step) {
    // Avoid floating point errors
    ticks.push(parseFloat(tick.toFixed(10)));
  }

  // Ensure min and max are included
  if (ticks[0] > min) {
    ticks.unshift(parseFloat(min.toFixed(10)));
  }

  if (ticks[ticks.length - 1] < max) {
    ticks.push(parseFloat(max.toFixed(10)));
  }

  return ticks;
}

/**
 * Formats a number for display on an axis
 * @param {number} value - The value to format
 * @param {Object} [options] - Formatting options
 * @param {number} [options.precision] - Number of decimal places
 * @param {boolean} [options.compact=false] - Whether to use compact notation (K, M, B)
 * @param {string} [options.prefix=''] - Prefix to add (e.g., '$')
 * @param {string} [options.suffix=''] - Suffix to add (e.g., '%')
 * @returns {string} Formatted value
 */
export function formatNumber(value, options = {}) {
  const { precision, compact = false, prefix = '', suffix = '' } = options;

  if (value === null || value === undefined || isNaN(value)) {
    return '';
  }

  let formatted;

  if (compact) {
    // Use compact notation (K, M, B)
    const absValue = Math.abs(value);

    if (absValue >= 1e9) {
      formatted =
        (value / 1e9).toFixed(precision !== undefined ? precision : 1) + 'B';
    } else if (absValue >= 1e6) {
      formatted =
        (value / 1e6).toFixed(precision !== undefined ? precision : 1) + 'M';
    } else if (absValue >= 1e3) {
      formatted =
        (value / 1e3).toFixed(precision !== undefined ? precision : 1) + 'K';
    } else {
      formatted =
        precision !== undefined ? value.toFixed(precision) : value.toString();
    }
  } else {
    // Use standard notation
    formatted =
      precision !== undefined ? value.toFixed(precision) : value.toString();
  }

  return `${prefix}${formatted}${suffix}`;
}

/**
 * Calculates a logarithmic scale for values with a large range
 * @param {number[]} values - Array of numeric values
 * @param {Object} [options] - Scale options
 * @param {number} [options.base=10] - Logarithm base
 * @returns {Object} Scale information with min, max, and transform functions
 */
export function logScale(values, options = {}) {
  const { base = 10 } = options;

  // Filter positive values (log scale requires positive values)
  const positiveValues = values.filter(
    (v) => typeof v === 'number' && !isNaN(v) && v > 0,
  );

  if (positiveValues.length === 0) {
    return {
      min: 1,
      max: base,
      transform: (value) => value,
      inverse: (value) => value,
    };
  }

  const min = Math.min(...positiveValues);
  const max = Math.max(...positiveValues);

  return {
    min,
    max,
    transform: (value) => Math.log(value) / Math.log(base),
    inverse: (value) => Math.pow(base, value),
  };
}
