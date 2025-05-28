/**
 * Centralized method injection into DataFrame and Series classes
 *
 * This file automatically extends the prototypes of DataFrame and Series
 * with all available methods from the methods module.
 */

import { injectMethods } from './inject.js';
import { registerAllMethods } from './registerAll.js';
import { DataFrame } from '../core/dataframe/DataFrame.js';
import { Series } from '../core/dataframe/Series.js';

/**
 * Automatically extends DataFrame and Series classes with all available methods.
 *
 * Transformation methods (returning objects with .columns) will return a new DataFrame instance.
 * Aggregation methods (returning values) will return values directly.
 *
 * This script is intended to import once at project startup for global class extension.
 *
 * @param {Object} classes - Object containing DataFrame and Series classes
 * @param {Class} classes.DataFrame - DataFrame class to extend
 * @param {Class} classes.Series - Series class to extend
 */
export function extendClasses({ DataFrame, Series }) {
  // Register all methods from corresponding directories
  registerAllMethods({ DataFrame, Series });

  // Inject methods from raw.js
  const injectedMethods = injectMethods();

  // Extend DataFrame prototype with methods from inject.js
  for (const [name, methodFn] of Object.entries(injectedMethods)) {
    // Add methods only if they are not already defined
    if (!DataFrame.prototype[name]) {
      DataFrame.prototype[name] = function(...args) {
        const result = methodFn(this, ...args);

        // If the result has .columns, treat it as DataFrame
        if (result?.columns) {
          return new DataFrame(result);
        }
        // Otherwise, it's an aggregation result (number, array, etc.)
        return result;
      };
    }

    // Add methods to Series if they are appropriate for Series
    // and have not been defined yet
    if (name.startsWith('series') && !Series.prototype[name.substring(6)]) {
      const seriesMethodName = name.substring(6); // Remove the 'series' prefix
      Series.prototype[seriesMethodName] = function(...args) {
        const result = methodFn(this, ...args);

        // If the result has .values, treat it as Series
        if (result?.values) {
          return new Series(result.values);
        }
        // Иначе это результат агрегации
        return result;
      };
    }
  }

  console.debug('DataFrame and Series classes successfully extended with all methods');
}

// Automatically extend classes when importing this file
extendClasses({ DataFrame, Series });
