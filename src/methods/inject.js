// methods/inject.js

import * as rawFns from './raw.js';
import { validateColumn } from '../core/validators.js';

const deps = {
  validateColumn,
  // you can add more dependencies here in the future
};

/**
 * Injects dependencies into all aggregation/transformation methods and returns an object
 * where each method is pre-curried with the required dependencies.
 *
 * @returns {Record<string, Function>} An object with method names as keys and ready-to-use
 * functions as values
 */
export function injectMethods() {
  return Object.fromEntries(
    Object.entries(rawFns).map(([name, fn]) => [
      name,
      fn(deps), // curry each function with validation and other dependencies
    ]),
  );
}
