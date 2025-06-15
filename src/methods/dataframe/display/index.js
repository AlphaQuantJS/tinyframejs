/**
 * DataFrame display methods
 *
 * This module provides a unified API for DataFrame display operations.
 * It imports and re-exports the register function from register.js.
 *
 * @module methods/dataframe/display
 */
import { registerDataFrameDisplay as registerMethods } from './register.js';

// Export individual display methods for direct use
export { print } from './print.js';
export { toHTML } from './toHTML.js';
export { display } from './display.js';
export { renderTo } from './renderTo.js';
export { toJupyter, registerJupyterDisplay } from './toJupyter.js';

/**
 * Register all display methods on DataFrame prototype
 *
 * @param {Function} DataFrame - DataFrame class
 */
export function register(DataFrame) {
  // Register all display methods from register.js
  registerMethods(DataFrame);
}

export default register;
