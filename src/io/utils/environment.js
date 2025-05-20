// src/io/utils/environment.js

/**
 * Utility functions for environment detection and compatibility
 */

/**
 * Detects the JavaScript runtime environment.
 * Used to determine which parsing strategy and APIs to use.
 *
 * @returns {string} The detected environment: 'node', 'deno', 'bun', or 'browser'
 */
export function detectEnvironment() {
  // Check for Node.js
  if (
    typeof process !== 'undefined' &&
    process.versions !== null &&
    process.versions.node !== null
  ) {
    return 'node';
  }

  // Check for Deno
  if (typeof Deno !== 'undefined') {
    return 'deno';
  }

  // Check for Bun
  if (
    typeof process !== 'undefined' &&
    process.versions !== null &&
    process.versions.bun !== null
  ) {
    return 'bun';
  }

  // Default to browser
  return 'browser';
}

/**
 * Safely requires a module in Node.js environment
 * Provides helpful error message if module is not installed
 *
 * @param {string} moduleName - Name of the module to require
 * @param {string} [installCommand] - Custom install command (defaults to npm install moduleName)
 * @returns {Object|null} The required module or null if not in Node.js environment
 * @throws {Error} If module is not installed in Node.js environment
 */
export function safeRequire(moduleName, installCommand) {
  // Only attempt to require in Node.js environment
  if (detectEnvironment() !== 'node') {
    return null;
  }

  try {
    // For compatibility with ESM and CommonJS
    // Используем глобальный require, если он доступен
    if (typeof require !== 'undefined') {
      return require(moduleName);
    }

    // В Node.js мы можем использовать глобальный require
    if (
      typeof process !== 'undefined' &&
      process.versions &&
      process.versions.node
    ) {
      return require(moduleName);
    }

    // Если мы здесь, то не можем загрузить модуль
    return null;
  } catch (error) {
    const command = installCommand || `npm install ${moduleName}`;
    throw new Error(
      `The ${moduleName} package is required for this operation. ` +
        `Please install it using: ${command}`,
    );
  }
}

/**
 * Checks if code is running in a browser environment
 *
 * @returns {boolean} True if running in a browser, false otherwise
 */
export function isBrowser() {
  return detectEnvironment() === 'browser';
}

/**
 * Checks if code is running in Node.js environment
 *
 * @returns {boolean} True if running in Node.js, false otherwise
 */
export function isNodeJs() {
  return detectEnvironment() === 'node';
}

/**
 * Checks if code is running in Deno environment
 *
 * @returns {boolean} True if running in Deno, false otherwise
 */
export function isDeno() {
  return detectEnvironment() === 'deno';
}

/**
 * Checks if code is running in Bun environment
 *
 * @returns {boolean} True if running in Bun, false otherwise
 */
export function isBun() {
  return detectEnvironment() === 'bun';
}
