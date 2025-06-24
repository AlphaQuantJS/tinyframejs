/**
 * DataFrame display methods
 *
 * This module exports all display methods for DataFrame.
 * Methods are registered using extendDataFrame.
 *
 * @module methods/dataframe/display
 */

import { DataFrame } from '../../../data/model/index.js';
import { extendDataFrame } from '../../../data/model/extendDataFrame.js';
import * as pool from './pool.js';

extendDataFrame(DataFrame.prototype, pool); // without namespace — base display methods

// export directly (so that you can call display(df) if needed)
export * from './pool.js';
