/**
 * Exports all timeseries utility functions for both DataFrame and Series
 * @module methods/timeseries/alltypes
 */

// Import utilities
import { inferFrequency, inferFrequencyFromData } from './inferFrequency.js';
import {
  validateRollingOptions,
  applyRollingWindow,
  validateExpandingOptions,
  applyExpandingWindow,
} from './rollingCore.js';
import {
  isBusinessDay,
  nextBusinessDay,
  previousBusinessDay,
  endOfMonth,
  startOfMonth,
  endOfQuarter,
  startOfQuarter,
  endOfYear,
  startOfYear,
  addBusinessDays,
  dateRange,
} from './calendar.js';

// Export all utilities
export {
  // Frequency inference
  inferFrequency,
  inferFrequencyFromData,

  // Rolling and expanding window core functions
  validateRollingOptions,
  applyRollingWindow,
  validateExpandingOptions,
  applyExpandingWindow,

  // Calendar functions
  isBusinessDay,
  nextBusinessDay,
  previousBusinessDay,
  endOfMonth,
  startOfMonth,
  endOfQuarter,
  startOfQuarter,
  endOfYear,
  startOfYear,
  addBusinessDays,
  dateRange,
};
