/**
 * Centralized dependency injection for methods (validators and others)
 *
 * This file imports all method registrars and applies them to DataFrame and Series classes.
 * In accordance with the new structure, here all methods from directories dataframe, series and reshape are registered.
 */

import { extendDataFrame } from './dataframe/registerAll.js';
import { extendSeries } from './series/registerAll.js';
import { registerReshapeMethods } from './reshape/register.js';

/**
 * Registers all methods for DataFrame and Series classes
 * @param {Object} classes - Object containing DataFrame and Series classes
 * @param {Class} classes.DataFrame - DataFrame class to extend
 * @param {Class} classes.Series - Series class to extend
 */
export function registerAllMethods({ DataFrame, Series }) {
  // Apply all registrars to DataFrame and Series classes
  extendDataFrame(DataFrame);
  extendSeries(Series);
  registerReshapeMethods(DataFrame);

  // Here you can add logging or other actions during registration
  console.debug('All methods successfully registered');
}

export default registerAllMethods;
