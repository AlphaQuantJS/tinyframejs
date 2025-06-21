/**
 * DataFrame aggregation methods
 *
 * This module exports all aggregation methods for DataFrame.
 * Methods are registered using extendDataFrame.
 *
 * @module methods/dataframe/aggregation
 */

import { DataFrame } from '../../../data/model/index.js';
import { extendDataFrame } from '../../../data/model/extendDataFrame.js';
import * as pool from './pool.js';

extendDataFrame(DataFrame.prototype, pool); // without namespace — base aggregations

// export directly (so that you can call min(df, 'a') if needed)
export * from './pool.js';
