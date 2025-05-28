/**
 * Registrar for reshape methods
 */

import { register as registerPivot } from './pivot.js';
import { register as registerMelt } from './melt.js';

/**
 * Registers all reshape methods on DataFrame prototype
 * @param {Class} DataFrame - DataFrame class to extend
 */
export function registerReshapeMethods(DataFrame) {
  // Register individual reshape methods
  registerPivot(DataFrame);
  registerMelt(DataFrame);

  // Add additional reshape methods here as they are implemented
  // For example: stack, unstack, groupBy, etc.
}

export default registerReshapeMethods;
