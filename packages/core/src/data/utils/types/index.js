/**
 * Type utilities
 *
 * This barrel file exports all type-related utilities
 * Side-effects free for tree-shaking support
 */

export { inferType } from './inferType.js';
export {
  isNumeric,
  isString,
  isArray,
  isObject,
  isFunction,
  isDate,
  isNullOrUndefined,
} from './typeChecks.js';
