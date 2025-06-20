/**
 * Utility for extending DataFrame prototype with methods
 *
 * This module provides a clean way to extend DataFrame with methods
 * that supports namespacing and conflict prevention.
 *
 * @module core/extendDataFrame
 */

/**
 * Attaches a collection of methods to DataFrame prototype
 * - Supports namespacing (df.namespace.method())
 * - Prevents method name conflicts
 * - Handles proper 'this' binding
 *
 * @param {Object} proto - The prototype to extend (typically DataFrame.prototype)
 * @param {Object} methods - Map of method names to functions
 * @param {Object} [options] - Extension options
 * @param {boolean} [options.strict=true] - Throw error on name conflicts
 * @param {string} [options.namespace] - Optional namespace for methods
 */
export function extendDataFrame(proto, methods, options = {}) {
  const { namespace, strict = true } = options;

  // Determine target object - either namespace or prototype directly
  const target = namespace
    ? (proto[namespace] ?? (proto[namespace] = Object.create(null)))
    : proto;

  // Attach each method to the target
  for (const [name, fn] of Object.entries(methods)) {
    // Check for conflicts if strict mode is enabled
    if (strict && Object.prototype.hasOwnProperty.call(target, name)) {
      throw new Error(
        `Method conflict: ${namespace ? namespace + '.' : ''}${name}`,
      );
    }

    // Bind method with proper 'this' context
    target[name] = function (...args) {
      return fn(this, ...args);
    };
  }
}
