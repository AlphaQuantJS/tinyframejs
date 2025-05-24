/**
 * Implementation of shift and related functions for time series data
 * @module methods/timeseries/shift
 */

import { createFrame } from '../../core/createFrame.js';

/**
 * Shifts the values in a column by a specified number of periods
 * @param {Object} deps - Dependencies injected by the system
 * @param {Function} deps.validateColumn - Function to validate column existence
 * @returns {Function} - Function that shifts values in a column
 */
export const shift = (deps) => {
  const { validateColumn } = deps;

  /**
   * Shifts values in specified columns by a given number of periods
   * @param {Object} frame - The DataFrame to operate on
   * @param {Object} options - Configuration options
   * @param {string|string[]} options.columns - The column(s) to shift
   * @param {number} [options.periods=1] - Number of periods to shift (positive for forward, negative for backward)
   * @param {*} [options.fillValue=null] - Value to fill for the new empty values
   * @returns {Object} - New DataFrame with shifted values
   * @throws {Error} - If columns parameter is missing or column doesn't exist
   */
  return (frame, options = {}) => {
    const { columns, periods = 1, fillValue = null } = options;

    if (!columns) {
      throw new Error('columns parameter is required');
    }

    const columnsToShift = Array.isArray(columns) ? columns : [columns];

    // Validate columns
    columnsToShift.forEach((column) => {
      validateColumn(frame, column);
    });

    // Create a new DataFrame with the original data
    const newFrame = { ...frame };
    newFrame.columns = { ...frame.columns };

    // Shift each specified column
    columnsToShift.forEach((column) => {
      const values = frame.columns[column];
      const shiftedValues = new Array(values.length).fill(fillValue);

      if (periods > 0) {
        // Shift forward (down)
        for (let i = periods; i < values.length; i++) {
          shiftedValues[i] = values[i - periods];
        }
      } else if (periods < 0) {
        // Shift backward (up)
        const absPeriods = Math.abs(periods);
        for (let i = 0; i < values.length - absPeriods; i++) {
          shiftedValues[i] = values[i + absPeriods];
        }
      } else {
        // No shift (periods = 0)
        for (let i = 0; i < values.length; i++) {
          shiftedValues[i] = values[i];
        }
      }

      // Create a new column name with the shift suffix
      const targetColumn = `${column}_shift_${periods}`;
      newFrame.columns[targetColumn] = shiftedValues;
    });

    return newFrame;
  };
};

/**
 * Calculates the percentage change between the current and a prior element
 * @param {Object} deps - Dependencies injected by the system
 * @param {Function} deps.validateColumn - Function to validate column existence
 * @returns {Function} - Function that calculates percentage change
 */
export const pctChange = (deps) => {
  const { validateColumn } = deps;

  /**
   * Calculates percentage change for specified columns
   * @param {Object} frame - The DataFrame to operate on
   * @param {Object} options - Configuration options
   * @param {string|string[]} options.columns - The column(s) to calculate percentage change for
   * @param {number} [options.periods=1] - Number of periods to use for calculating percentage change
   * @param {boolean} [options.fillNaN=true] - If true, values before the window is filled are NaN
   * @returns {Object} - New DataFrame with percentage change values
   * @throws {Error} - If columns parameter is missing or column doesn't exist
   */
  return (frame, options = {}) => {
    const { columns, periods = 1, fillNaN = true } = options;

    if (!columns) {
      throw new Error('columns parameter is required');
    }

    const columnsToProcess = Array.isArray(columns) ? columns : [columns];

    // Validate columns
    columnsToProcess.forEach((column) => {
      validateColumn(frame, column);
    });

    // Create a new DataFrame with the original data
    const newFrame = { ...frame };
    newFrame.columns = { ...frame.columns };

    // Process each specified column
    columnsToProcess.forEach((column) => {
      const values = frame.columns[column];
      const pctChangeValues = new Array(values.length);

      // Fill the first 'periods' elements with NaN or 0
      const fillValue = fillNaN ? NaN : 0;
      for (let i = 0; i < periods; i++) {
        pctChangeValues[i] = fillValue;
      }

      // Calculate percentage change for the rest
      for (let i = periods; i < values.length; i++) {
        const currentValue = values[i];
        const previousValue = values[i - periods];

        if (
          previousValue === 0 ||
          isNaN(previousValue) ||
          isNaN(currentValue)
        ) {
          pctChangeValues[i] = NaN;
        } else {
          pctChangeValues[i] = (currentValue - previousValue) / previousValue;
        }
      }

      // Create a new column name with the pct_change suffix
      const targetColumn = `${column}_pct_change_${periods}`;
      newFrame.columns[targetColumn] = pctChangeValues;
    });

    return newFrame;
  };
};
