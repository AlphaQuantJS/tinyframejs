/**
 * Core rolling window functionality for both DataFrame and Series
 * @module methods/timeseries/alltypes/rollingCore
 */

/**
 * Validates rolling window options
 *
 * @param {Object} options - Rolling window options
 * @param {number} options.window - Window size
 * @param {Function} options.aggregation - Aggregation function
 * @param {number} [options.minPeriods=null] - Minimum number of observations in window required to have a value
 * @returns {Object} - Validated options with defaults applied
 * @throws {Error} - If options are invalid
 */
function validateRollingOptions(options) {
  if (!options) {
    throw new Error('options must be provided');
  }

  const { window, aggregation, minPeriods = null } = options;

  // Validate window
  if (typeof window !== 'number' || window <= 0) {
    throw new Error('window must be a positive number');
  }

  // Validate aggregation
  if (typeof aggregation !== 'function') {
    throw new Error('aggregation must be a function');
  }

  // Validate minPeriods
  const validatedMinPeriods = minPeriods === null ? window : minPeriods;
  if (typeof validatedMinPeriods !== 'number' || validatedMinPeriods <= 0) {
    throw new Error('minPeriods must be a positive number');
  }

  return {
    window,
    aggregation,
    minPeriods: validatedMinPeriods,
  };
}

/**
 * Applies a rolling window operation to an array of values
 *
 * @param {Array} values - Array of values to apply rolling window to
 * @param {Object} options - Rolling window options
 * @param {number} options.window - Window size
 * @param {Function} options.aggregation - Aggregation function
 * @param {number} options.minPeriods - Minimum number of observations in window required to have a value
 * @returns {Array} - Array of results after applying rolling window
 */
function applyRollingWindow(values, options) {
  const { window, aggregation, minPeriods } = validateRollingOptions(options);

  // Create result array with same length as input, filled with null
  const result = Array(values.length).fill(null);

  // Apply rolling window
  for (let i = 0; i < values.length; i++) {
    // Calculate start index of window
    const startIdx = Math.max(0, i - window + 1);
    // Get window values
    const windowValues = values.slice(startIdx, i + 1);

    // Filter out null and NaN values
    const validValues = windowValues.filter(
      (v) => v !== null && typeof v !== 'undefined' && !Number.isNaN(v),
    );

    // Only calculate if we have enough valid values
    if (validValues.length >= minPeriods) {
      try {
        result[i] = aggregation(validValues);
      } catch (error) {
        // If aggregation fails, keep as null
        result[i] = null;
      }
    }
  }

  return result;
}

/**
 * Validates expanding window options
 *
 * @param {Object} options - Expanding window options
 * @param {Function} options.aggregation - Aggregation function
 * @param {number} [options.minPeriods=1] - Minimum number of observations in window required to have a value
 * @returns {Object} - Validated options with defaults applied
 * @throws {Error} - If options are invalid
 */
function validateExpandingOptions(options) {
  if (!options) {
    throw new Error('options must be provided');
  }

  const { aggregation, minPeriods = 1 } = options;

  // Validate aggregation
  if (typeof aggregation !== 'function') {
    throw new Error('aggregation must be a function');
  }

  // Validate minPeriods
  if (typeof minPeriods !== 'number' || minPeriods <= 0) {
    throw new Error('minPeriods must be a positive number');
  }

  return {
    aggregation,
    minPeriods,
  };
}

/**
 * Applies an expanding window operation to an array of values
 *
 * @param {Array} values - Array of values to apply expanding window to
 * @param {Object} options - Expanding window options
 * @param {Function} options.aggregation - Aggregation function
 * @param {number} options.minPeriods - Minimum number of observations in window required to have a value
 * @returns {Array} - Array of results after applying expanding window
 */
function applyExpandingWindow(values, options) {
  const { aggregation, minPeriods } = validateExpandingOptions(options);

  // Create result array with same length as input, filled with null
  const result = Array(values.length).fill(null);

  // Apply expanding window
  for (let i = 0; i < values.length; i++) {
    // Get all values up to current index
    const windowValues = values.slice(0, i + 1);

    // Filter out null and NaN values
    const validValues = windowValues.filter(
      (v) => v !== null && typeof v !== 'undefined' && !Number.isNaN(v),
    );

    // Only calculate if we have enough valid values
    if (validValues.length >= minPeriods) {
      try {
        result[i] = aggregation(validValues);
      } catch (error) {
        // If aggregation fails, keep as null
        result[i] = null;
      }
    }
  }

  return result;
}

export {
  validateRollingOptions,
  applyRollingWindow,
  validateExpandingOptions,
  applyExpandingWindow,
};
