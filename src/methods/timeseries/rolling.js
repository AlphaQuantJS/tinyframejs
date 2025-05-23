/**
 * Implementation of rolling window functions for time series data
 * @module methods/timeseries/rolling
 */

/**
 * Calculates the mean of an array of values
 * @param {Array} values - Array of numeric values
 * @returns {number} - Mean value
 */
function calculateMean(values) {
  const filteredValues = values.filter((v) => !isNaN(v));
  if (filteredValues.length === 0) return NaN;

  const sum = filteredValues.reduce((acc, val) => acc + val, 0);
  return sum / filteredValues.length;
}

/**
 * Calculates the sum of an array of values
 * @param {Array} values - Array of numeric values
 * @returns {number} - Sum value
 */
function calculateSum(values) {
  const filteredValues = values.filter((v) => !isNaN(v));
  if (filteredValues.length === 0) return NaN;

  return filteredValues.reduce((acc, val) => acc + val, 0);
}

/**
 * Calculates the median of an array of values
 * @param {Array} values - Array of numeric values
 * @returns {number} - Median value
 */
function calculateMedian(values) {
  const filteredValues = values.filter((v) => !isNaN(v));
  if (filteredValues.length === 0) return NaN;

  const sorted = [...filteredValues].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  } else {
    return sorted[mid];
  }
}

/**
 * Calculates the variance of an array of values
 * @param {Array} values - Array of numeric values
 * @returns {number} - Variance value
 */
function calculateVariance(values) {
  const filteredValues = values.filter((v) => !isNaN(v));
  if (filteredValues.length <= 1) return NaN;

  const mean = calculateMean(filteredValues);
  const squaredDiffs = filteredValues.map((v) => Math.pow(v - mean, 2));
  const sum = squaredDiffs.reduce((acc, val) => acc + val, 0);

  return sum / (filteredValues.length - 1); // Sample variance
}

/**
 * Calculates the standard deviation of an array of values
 * @param {Array} values - Array of numeric values
 * @returns {number} - Standard deviation value
 */
function calculateStd(values) {
  const variance = calculateVariance(values);
  return isNaN(variance) ? NaN : Math.sqrt(variance);
}

/**
 * Applies a rolling window function to a column of data
 * @param {Object} deps - Dependencies injected by the system
 * @returns {Function} - Function that applies rolling window calculations
 */
export const rolling = (deps) => {
  const { validateColumn } = deps;

  /**
   * @param {Object} frame - The DataFrame to operate on
   * @param {Object} options - Configuration options
   * @param {string} options.column - The column to apply the rolling function to
   * @param {number} options.window - The size of the rolling window
   * @param {string} options.method - The aggregation method ('mean', 'sum', 'min', 'max', 'median', 'std', 'var', 'count')
   * @param {boolean} options.center - If true, the result is centered (default: false)
   * @param {boolean} options.fillNaN - If true, values before the window is filled are NaN (default: true)
   * @param {Function} options.customFn - Custom aggregation function for 'custom' method
   * @returns {Array} - Array of rolling values
   */
  return (frame, options = {}) => {
    const {
      column,
      window = 3,
      method = 'mean',
      center = false,
      fillNaN = true,
      customFn = null,
    } = options;

    validateColumn(frame, column);

    if (window <= 0 || !Number.isInteger(window)) {
      throw new Error('Window size must be a positive integer');
    }

    const values = frame.columns[column];
    const result = new Array(values.length);

    // Determine offset for centering
    const offset = center ? Math.floor(window / 2) : 0;

    for (let i = 0; i < values.length; i++) {
      // For centered windows, we need to adjust the window position
      let start, end;

      if (center) {
        // For centered windows, position the window around the current point
        start = Math.max(0, i - Math.floor(window / 2));
        end = Math.min(values.length, i + Math.ceil(window / 2));

        // Skip if we're at the edges and can't form a complete window
        if (
          i < Math.floor(window / 2) ||
          i >= values.length - Math.floor(window / 2)
        ) {
          result[i] = NaN;
          continue;
        }
      } else {
        // For trailing windows, use the original logic
        start = Math.max(0, i - window + 1);
        end = Math.min(values.length, i + 1);

        // Skip if we don't have enough data yet
        if (end - start < window && fillNaN) {
          result[i] = NaN;
          continue;
        }
      }

      // Extract window values
      const windowValues = values.slice(start, end);

      // Apply the selected aggregation method
      switch (method) {
        case 'mean':
          result[i] = calculateMean(windowValues);
          break;
        case 'sum':
          result[i] = calculateSum(windowValues);
          break;
        case 'min':
          result[i] = Math.min(...windowValues.filter((v) => !isNaN(v)));
          break;
        case 'max':
          result[i] = Math.max(...windowValues.filter((v) => !isNaN(v)));
          break;
        case 'median':
          result[i] = calculateMedian(windowValues);
          break;
        case 'std':
          result[i] = calculateStd(windowValues);
          break;
        case 'var':
          result[i] = calculateVariance(windowValues);
          break;
        case 'count':
          result[i] = windowValues.filter((v) => !isNaN(v)).length;
          break;
        case 'custom':
          if (typeof customFn !== 'function') {
            throw new Error('Custom method requires a valid function');
          }
          result[i] = customFn(windowValues);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
    }

    return result;
  };
};

/**
 * Creates a new DataFrame with rolling window calculations applied
 * @param {Object} deps - Dependencies injected by the system
 * @returns {Function} - Function that creates a new DataFrame with rolling window calculations
 */
export const rollingApply = (deps) => {
  const rollingFn = rolling(deps);

  /**
   * @param {Object} frame - The DataFrame to operate on
   * @param {Object} options - Configuration options
   * @param {string} options.column - The column to apply the rolling function to
   * @param {number} options.window - The size of the rolling window
   * @param {string} options.method - The aggregation method ('mean', 'sum', 'min', 'max', 'median', 'std', 'var', 'count')
   * @param {boolean} options.center - If true, the result is centered (default: false)
   * @param {boolean} options.fillNaN - If true, values before the window is filled are NaN (default: true)
   * @param {Function} options.customFn - Custom aggregation function for 'custom' method
   * @param {string} options.targetColumn - The name of the target column (default: column_method_window)
   * @returns {Object} - New DataFrame with rolling window calculations
   */
  return (frame, options = {}) => {
    const {
      column,
      window = 3,
      method = 'mean',
      center = false,
      fillNaN = true,
      customFn = null,
      targetColumn = `${column}_${method}_${window}`,
    } = options;

    // Calculate rolling values
    const rollingValues = rollingFn(frame, {
      column,
      window,
      method,
      center,
      fillNaN,
      customFn,
    });

    // Create a new DataFrame with the original data plus the rolling values
    const newFrame = { ...frame };
    newFrame.columns = { ...frame.columns };
    newFrame.columns[targetColumn] = rollingValues;

    return newFrame;
  };
};

/**
 * Calculates exponentially weighted moving average (EWMA)
 * @param {Object} deps - Dependencies injected by the system
 * @returns {Function} - Function that calculates EWMA
 */
export const ewma = (deps) => {
  const { validateColumn } = deps;

  /**
   * @param {Object} frame - The DataFrame to operate on
   * @param {Object} options - Configuration options
   * @param {string} options.column - The column to apply the EWMA to
   * @param {number} options.alpha - The smoothing factor (0 < alpha <= 1)
   * @param {boolean} options.adjust - If true, use adjusted weights (default: true)
   * @param {string} options.targetColumn - The name of the target column (default: column_ewma)
   * @returns {Object} - New DataFrame with EWMA values
   */
  return (frame, options = {}) => {
    const {
      column,
      alpha = 0.3,
      adjust = true,
      targetColumn = `${column}_ewma`,
    } = options;

    validateColumn(frame, column);

    if (alpha <= 0 || alpha > 1) {
      throw new Error(
        'Alpha must be between 0 and 1 (exclusive and inclusive)',
      );
    }

    const values = frame.columns[column];
    const result = new Array(values.length);

    // Initialize with first non-NaN value
    let firstValidIndex = 0;
    while (firstValidIndex < values.length && isNaN(values[firstValidIndex])) {
      firstValidIndex++;
    }

    if (firstValidIndex >= values.length) {
      // All values are NaN
      for (let i = 0; i < values.length; i++) {
        result[i] = NaN;
      }
    } else {
      // Set initial values to NaN
      for (let i = 0; i < firstValidIndex; i++) {
        result[i] = NaN;
      }

      // Set first valid value
      result[firstValidIndex] = values[firstValidIndex];

      // Calculate EWMA
      if (adjust) {
        // Adjusted weights
        let weightSum = 1;
        for (let i = firstValidIndex + 1; i < values.length; i++) {
          if (isNaN(values[i])) {
            result[i] = result[i - 1]; // Carry forward last valid value
          } else {
            weightSum = alpha + (1 - alpha) * weightSum;
            result[i] =
              (alpha * values[i] + (1 - alpha) * result[i - 1] * weightSum) /
              weightSum;
          }
        }
      } else {
        // Standard EWMA
        for (let i = firstValidIndex + 1; i < values.length; i++) {
          if (isNaN(values[i])) {
            result[i] = result[i - 1]; // Carry forward last valid value
          } else {
            result[i] = alpha * values[i] + (1 - alpha) * result[i - 1];
          }
        }
      }
    }

    // Create a new DataFrame with the original data plus the EWMA values
    const newFrame = { ...frame };
    newFrame.columns = { ...frame.columns };
    newFrame.columns[targetColumn] = result;

    return newFrame;
  };
};
