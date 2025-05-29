/**
 * Centralized dependency injection for methods (validators and others)
 *
 * This file imports all methods from raw.js and injects dependencies into them,
 * such as validators and other utilities needed for their operation.
 */

import * as rawFns from './raw.js';
import { validateColumn, validateType } from '../core/utils/validators.js';
import { isNumeric } from '../core/utils/typeChecks.js';

/**
 * Dependencies that will be injected into methods
 * @type {Object}
 */
const deps = {
  validateColumn,
  isNumeric,
  validateType,
  // Add other dependencies in the future
};

/**
 * Injects dependencies into all aggregation/transform methods and returns an object,
 * where each method is prepared with the necessary dependencies.
 *
 * @returns {Record<string, Function>} Object with method names as keys and
 * prepared functions as values
 */
export function injectMethods() {
  return Object.fromEntries(
    Object.entries(rawFns).map(([name, fn]) => [
      name,
      typeof fn === 'function' ? fn(deps) : fn, // inject dependencies only into functions
    ]),
  );
}
