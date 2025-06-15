/**
 * Timeseries methods for DataFrame and Series
 * @module methods/timeseries
 */

// Import registerAll function
import registerAllTimeSeries from './registerAll.js';

// Import DataFrame and Series classes
import { DataFrame } from '../../core/dataframe/DataFrame.js';
import { Series } from '../../core/dataframe/Series.js';

// Import utility functions from alltypes
import * as timeseriesUtils from './alltypes/index.js';

// Register all timeseries methods
registerAllTimeSeries(DataFrame, Series);

// Export utility functions for external use
export { timeseriesUtils };
