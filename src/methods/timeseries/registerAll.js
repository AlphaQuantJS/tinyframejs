/**
 * Registers all timeseries methods for DataFrame and Series
 * @module methods/timeseries/registerAll
 */

// Import registrars
import registerDataFrameTimeSeries from './dataframe/register.js';
import registerSeriesTimeSeries from './series/register.js';

/**
 * Registers all timeseries methods for DataFrame and Series
 *
 * @param {Object} DataFrame - DataFrame class
 * @param {Object} Series - Series class
 */
function registerAllTimeSeries(DataFrame, Series) {
  // Register DataFrame methods
  registerDataFrameTimeSeries(DataFrame);

  // Register Series methods
  registerSeriesTimeSeries(Series);
}

export default registerAllTimeSeries;
