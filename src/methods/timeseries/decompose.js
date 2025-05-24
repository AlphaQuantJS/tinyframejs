/**
 * Implementation of time series decomposition functions
 * @module methods/timeseries/decompose
 */

import { createFrame, cloneFrame } from '../../core/createFrame.js';
import { rolling } from './rolling.js';

/**
 * Decomposes a time series into trend, seasonal, and residual components
 * @param {Object} deps - Dependencies injected by the system
 * @returns {Function} - Function that decomposes a time series
 */
export const decompose = (deps) => {
  const { validateColumn } = deps;
  const rollingFn = rolling(deps);

  /**
   * @param {Object} frame - The DataFrame to operate on
   * @param {Object} options - Configuration options
   * @param {string} options.column - The column to decompose
   * @param {string} options.model - Decomposition model ('additive' or 'multiplicative')
   * @param {number} options.period - The period of the seasonality
   * @returns {Object} - New DataFrame with trend, seasonal, and residual components
   */
  return (frame, options = {}) => {
    const { column, model = 'additive', period = 12 } = options;

    validateColumn(frame, column);

    if (model !== 'additive' && model !== 'multiplicative') {
      throw new Error('model must be either "additive" or "multiplicative"');
    }

    if (period <= 1 || !Number.isInteger(period)) {
      throw new Error('period must be a positive integer greater than 1');
    }

    if (frame.rowCount < period * 2) {
      throw new Error(
        `Not enough data for decomposition. Need at least ${period * 2} points, got ${frame.rowCount}`,
      );
    }

    const values = frame.columns[column];
    const n = values.length;

    // Step 1: Calculate the trend component using a centered moving average
    const trendValues = rollingFn(frame, {
      column,
      window: period,
      method: 'mean',
      center: true,
      fillNaN: true,
    });

    // Step 2: Remove the trend to get the detrended series
    const detrendedValues = new Array(n);
    for (let i = 0; i < n; i++) {
      if (isNaN(trendValues[i])) {
        detrendedValues[i] = NaN;
      } else if (model === 'additive') {
        detrendedValues[i] = values[i] - trendValues[i];
      } else {
        // multiplicative
        detrendedValues[i] = values[i] / trendValues[i];
      }
    }

    // Step 3: Calculate the seasonal component by averaging values at the same phase
    const seasonalValues = new Array(n).fill(NaN);
    const seasonalIndices = new Array(period).fill(0);

    // Calculate the average for each position in the cycle
    for (let i = 0; i < period; i++) {
      const phaseValues = [];
      for (let j = i; j < n; j += period) {
        if (!isNaN(detrendedValues[j])) {
          phaseValues.push(detrendedValues[j]);
        }
      }

      if (phaseValues.length > 0) {
        const sum = phaseValues.reduce((a, b) => a + b, 0);
        seasonalIndices[i] = sum / phaseValues.length;
      }
    }

    // Normalize the seasonal component
    let seasonalSum = 0;
    let seasonalCount = 0;
    for (let i = 0; i < period; i++) {
      if (!isNaN(seasonalIndices[i])) {
        seasonalSum += seasonalIndices[i];
        seasonalCount++;
      }
    }

    const seasonalMean = seasonalCount > 0 ? seasonalSum / seasonalCount : 0;

    // Adjust seasonal indices to sum to 0 for additive or average to 1 for multiplicative
    for (let i = 0; i < period; i++) {
      if (model === 'additive') {
        seasonalIndices[i] -= seasonalMean;
      } else if (seasonalMean !== 0) {
        // multiplicative
        seasonalIndices[i] /= seasonalMean;
      }
    }

    // Apply the seasonal indices to the full series
    for (let i = 0; i < n; i++) {
      const phaseIndex = i % period;
      seasonalValues[i] = seasonalIndices[phaseIndex];
    }

    // Step 4: Calculate the residual component
    const residualValues = new Array(n);
    for (let i = 0; i < n; i++) {
      if (isNaN(trendValues[i]) || isNaN(seasonalValues[i])) {
        residualValues[i] = NaN;
      } else if (model === 'additive') {
        residualValues[i] = values[i] - trendValues[i] - seasonalValues[i];
      } else {
        // multiplicative
        residualValues[i] = values[i] / (trendValues[i] * seasonalValues[i]);
      }
    }

    // Create a new DataFrame with the decomposed components
    const result = cloneFrame(frame, {
      useTypedArrays: true,
      copy: 'shallow',
      saveRawData: false,
      freeze: false,
    });

    result.columns[`${column}_trend`] = trendValues;
    result.columns[`${column}_seasonal`] = seasonalValues;
    result.columns[`${column}_residual`] = residualValues;

    return result;
  };
};
