/**
 * Registrar for reshape methods
 */

import { register as registerPivot } from './pivot.js';
import { register as registerMelt } from './melt.js';
import { register as registerUnstack } from './unstack.js';
import { register as registerStack } from './stack.js';

/**
 * Registers all reshape methods on DataFrame prototype
 * @param {Class} DataFrame - DataFrame class to extend
 */
export function registerReshapeMethods(DataFrame) {
  // Register individual reshape methods
  registerPivot(DataFrame);
  registerMelt(DataFrame);
  registerUnstack(DataFrame);
  registerStack(DataFrame);

  // Add additional reshape methods here as they are implemented
  // For example: groupBy, etc.
}

export default registerReshapeMethods;
