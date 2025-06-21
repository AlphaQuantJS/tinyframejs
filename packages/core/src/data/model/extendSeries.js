/**
 * Utility to extend Series prototype with methods
 *
 * This utility provides a consistent way to add methods to Series prototype
 * with support for namespacing and conflict detection.
 *
 * @module data/model/extendSeries
 */

/**
 * Add methods to Series prototype
 *
 * @param {Object} target - Series prototype to extend
 * @param {Object} methods - Object with methods to add
 * @param {Object} [options={}] - Extension options
 * @param {boolean} [options.strict=true] - Whether to throw on name conflicts
 * @param {string} [options.namespace] - Optional namespace for methods
 * @returns {Object} Extended target
 */
export function extendSeries(target, methods, options = {}) {
  const { strict = true, namespace } = options;

  // Process each method
  Object.entries(methods).forEach(([name, method]) => {
    // Skip non-function exports (like VERSION, etc)
    if (typeof method !== 'function') return;

    // Determine where to add the method
    const targetObj = namespace
      ? (target[namespace] = target[namespace] || {})
      : target;

    // Check for conflicts in strict mode
    if (strict && name in targetObj) {
      throw new Error(
        `Method name conflict: ${namespace ? `${namespace}.` : ''}${name} already exists`,
      );
    }

    // Add the method to target
    targetObj[name] = method;
  });

  return target;
}
