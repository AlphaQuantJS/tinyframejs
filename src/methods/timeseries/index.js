/**
 * Timeseries methods for DataFrame and Series
 * @module methods/timeseries
 */

// Import registrars
import registerDataFrameTimeSeries from './dataframe/register.js';
import registerSeriesTimeSeries from './series/register.js';

// Import DataFrame and Series classes
import { DataFrame } from '../../core/dataframe/DataFrame.js';
import { Series } from '../../core/dataframe/Series.js';

// Register methods
registerDataFrameTimeSeries(DataFrame);
registerSeriesTimeSeries(Series);

// Export nothing as methods are attached to DataFrame and Series prototypes
export {};
