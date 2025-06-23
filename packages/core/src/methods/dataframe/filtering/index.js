/**
 * DataFrame filtering methods
 *
 * This module exports all filtering methods for DataFrame.
 * Methods are registered using extendDataFrame.
 *
 * @module methods/dataframe/filtering
 */

import { DataFrame } from '../../../data/model/index.js';
import { extendDataFrame } from '../../../data/model/extendDataFrame.js';
import * as pool from './pool.js';

// Register methods for DataFrame without namespace
extendDataFrame(DataFrame.prototype, pool);

// Export methods directly for functional style calls
export * from './pool.js';
