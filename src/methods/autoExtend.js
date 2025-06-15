/**
 * Centralized registration of methods for DataFrame and Series classes
 *
 * This file automatically extends the prototypes of DataFrame and Series
 * with all available methods from the methods module.
 */

import { registerAllMethods } from './registerAll.js';
import { DataFrame } from '../core/dataframe/DataFrame.js';
import { Series } from '../core/dataframe/Series.js';

/**
 * Automatically extends DataFrame and Series classes with all available methods.
 *
 * This script is intended for one-time import at project startup to globally extend the classes.
 *
 * @param {Object} classes - Object containing DataFrame and Series classes
 * @param {Class} classes.DataFrame - DataFrame class to extend
 * @param {Class} classes.Series - Series class to extend
 */
export function extendClasses({ DataFrame, Series }) {
  // Register all methods from corresponding directories
  registerAllMethods({ DataFrame, Series });

  console.debug(
    'DataFrame and Series classes successfully extended with all methods',
  );
}

// Automatically extend classes when importing this file
extendClasses({ DataFrame, Series });
