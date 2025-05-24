/**
 * Implementation of time series forecasting functions
 * @module methods/timeseries/forecast
 */

import { createFrame } from '../../core/createFrame.js';
import { parseDate, formatDateISO, getNextDate } from './dateUtils.js';

/**
 * Forecasts future values of a time series
 * @param {Object} deps - Dependencies injected by the system
 * @returns {Function} - Function that forecasts time series values
 */
export const forecast = (deps) => {
  const { validateColumn } = deps;

  /**
   * @param {Object} frame - The DataFrame to operate on
   * @param {Object} options - Configuration options
   * @param {string} options.column - The column to forecast
   * @param {string} options.dateColumn - The column containing dates
   * @param {string} options.method - Forecasting method ('ma', 'ets', 'naive')
   * @param {number} options.steps - Number of steps to forecast
   * @param {number} options.window - Window size for moving average method
   * @param {number} options.alpha - Smoothing parameter for ETS method (0 < alpha < 1)
   * @param {number} options.beta - Trend parameter for ETS method (0 < beta < 1)
   * @param {number} options.gamma - Seasonal parameter for ETS method (0 < gamma < 1)
   * @param {number} options.period - Seasonal period for ETS method
   * @param {string} options.freq - Frequency for date generation ('D', 'W', 'M', 'Q', 'Y')
   * @returns {Object} - New DataFrame with forecasted values
   */
  return (frame, options = {}) => {
    const {
      column,
      dateColumn,
      method = 'ma',
      steps = 10,
      window = 5,
      alpha = 0.3,
      beta = 0.1,
      gamma = 0.1,
      period = 12,
      freq = 'D',
    } = options;

    validateColumn(frame, column);

    if (dateColumn) {
      validateColumn(frame, dateColumn);
    }

    if (steps <= 0 || !Number.isInteger(steps)) {
      throw new Error('steps must be a positive integer');
    }

    const values = frame.columns[column];
    const n = values.length;

    if (n === 0) {
      throw new Error('Cannot forecast an empty series');
    }

    // Generate future dates if dateColumn is provided
    let futureDates = [];
    if (dateColumn) {
      const dates = frame.columns[dateColumn].map((d) => parseDate(d));
      const lastDate = dates[dates.length - 1];

      futureDates = new Array(steps);
      let currentDate = lastDate;

      for (let i = 0; i < steps; i++) {
        currentDate = getNextDate(currentDate, freq);
        futureDates[i] = currentDate;
      }
    }

    // Calculate forecasted values based on the selected method
    let forecastValues = [];

    switch (method) {
      case 'ma': // Moving Average
        if (window <= 0 || !Number.isInteger(window)) {
          throw new Error('window must be a positive integer for MA method');
        }

        forecastValues = movingAverageForecast(values, steps, window);
        break;

      case 'ets': // Exponential Smoothing
        if (alpha <= 0 || alpha >= 1) {
          throw new Error(
            'alpha must be between 0 and 1 (exclusive) for ETS method',
          );
        }

        if (beta < 0 || beta >= 1) {
          throw new Error(
            'beta must be between 0 and 1 (inclusive) for ETS method',
          );
        }

        if (gamma < 0 || gamma >= 1) {
          throw new Error(
            'gamma must be between 0 and 1 (inclusive) for ETS method',
          );
        }

        forecastValues = exponentialSmoothingForecast(
          values,
          steps,
          alpha,
          beta,
          gamma,
          period,
        );
        break;

      case 'naive': // Naive Forecast (last value)
        forecastValues = new Array(steps).fill(values[n - 1]);
        break;

      default:
        throw new Error(`Unsupported forecasting method: ${method}`);
    }

    // Create result DataFrame
    const result = {
      columns: {},
    };

    if (dateColumn) {
      result.columns[dateColumn] = futureDates.map((d) => formatDateISO(d));
    }

    result.columns['forecast'] = Array.isArray(forecastValues)
      ? forecastValues
      : Array.from(forecastValues);

    // Проверяем, что все колонки содержат массивы
    for (const key in result.columns) {
      if (!Array.isArray(result.columns[key])) {
        result.columns[key] = Array.from(result.columns[key]);
      }
    }

    return createFrame(result);
  };
};

/**
 * Performs a moving average forecast
 * @param {Array} values - Original time series values
 * @param {number} steps - Number of steps to forecast
 * @param {number} window - Window size for moving average
 * @returns {Array} - Forecasted values
 */
function movingAverageForecast(values, steps, window) {
  const n = values.length;
  const result = new Array(steps);

  // Use the last 'window' values for the forecast
  const lastValues = values.slice(Math.max(0, n - window));
  const avg = lastValues.reduce((sum, val) => sum + val, 0) / lastValues.length;

  // Fill all forecasted values with the average
  for (let i = 0; i < steps; i++) {
    result[i] = avg;
  }

  return result;
}

/**
 * Performs an exponential smoothing forecast
 * @param {Array} values - Original time series values
 * @param {number} steps - Number of steps to forecast
 * @param {number} alpha - Smoothing parameter
 * @param {number} beta - Trend parameter
 * @param {number} gamma - Seasonal parameter
 * @param {number} period - Seasonal period
 * @returns {Array} - Forecasted values
 */
function exponentialSmoothingForecast(
  values,
  steps,
  alpha,
  beta,
  gamma,
  period,
) {
  const n = values.length;
  const result = new Array(steps);

  // Initialize level, trend, and seasonal components
  let level = values[0];
  let trend = 0;

  // Initialize seasonal components
  const seasonals = new Array(period).fill(0);

  // Calculate initial seasonal components
  if (n >= period) {
    for (let i = 0; i < period; i++) {
      const seasonalValues = [];
      for (let j = i; j < n; j += period) {
        seasonalValues.push(values[j]);
      }

      if (seasonalValues.length > 0) {
        const sum = seasonalValues.reduce((a, b) => a + b, 0);
        seasonals[i] = sum / seasonalValues.length;
      }
    }

    // Normalize seasonal components
    const seasonalAvg = seasonals.reduce((a, b) => a + b, 0) / period;
    for (let i = 0; i < period; i++) {
      seasonals[i] /= seasonalAvg;
    }
  }

  // Apply Holt-Winters algorithm to the historical data
  for (let i = 1; i < n; i++) {
    const oldLevel = level;
    const seasonalIndex = (i - 1) % period;

    // Update level
    level =
      alpha * (values[i] / seasonals[seasonalIndex]) +
      (1 - alpha) * (oldLevel + trend);

    // Update trend
    trend = beta * (level - oldLevel) + (1 - beta) * trend;

    // Update seasonal component
    seasonals[seasonalIndex] =
      gamma * (values[i] / level) + (1 - gamma) * seasonals[seasonalIndex];
  }

  // Generate forecasts
  for (let i = 0; i < steps; i++) {
    const seasonalIndex = (n + i) % period;
    result[i] = (level + (i + 1) * trend) * seasonals[seasonalIndex];
  }

  return result;
}
