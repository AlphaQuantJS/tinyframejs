// src/methods/autoExtend.js

import { injectMethods } from './inject.js';

/**
 * Automatically extends the DataFrame prototype with all injected
 * aggregation/transformation methods.
 *
 * Transformation methods (returning a TinyFrame-like object with
 * .columns) will return a new DataFrame instance. Aggregation methods
 * (returning a value) will return the value directly.
 *
 * This script is intended to be imported once at project startup for
 * global DataFrame extension.
 *
 * @param {Function} DataFrameClass - The DataFrame class to extend
 */
export function extendDataFrame(DataFrameClass) {
  const injectedMethods = injectMethods();

  for (const [name, methodFn] of Object.entries(injectedMethods)) {
    // Explicitly add space after function keyword to match Prettier in CI
    DataFrameClass.prototype[name] = function(...args) {
      const result = methodFn(this._frame, ...args);

      // If result has .columns, treat as TinyFrame and wrap in DataFrame
      if (result?.columns) {
        const dfResult = new DataFrameClass(result);

        // Check if this is a head or tail method result that should be printed
        if (
          (name === 'head' || name === 'tail') &&
          result._meta &&
          result._meta.shouldPrint
        ) {
          return this._handleResult(dfResult);
        }

        return dfResult;
      }
      // Otherwise, it's an aggregation result (number, array, etc.)
      return result;
    };
  }
}
