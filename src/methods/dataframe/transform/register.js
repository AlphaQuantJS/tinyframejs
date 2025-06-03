/**
 * Registrar for DataFrame transformation methods
 */

// Import transformation methods
import { register as registerAssign } from './assign.js';
import { register as registerApply } from './apply.js';
import { register as registerCategorize } from './categorize.js';
import { register as registerCut } from './cut.js';
import { register as registerJoin } from './join.js';
import { register as registerSort } from './sort.js';
import { register as registerStack } from './stack.js';
import { register as registerOneHot } from './oneHot.js';

/**
 * Registers all transformation methods for DataFrame
 * @param {Class} DataFrame - DataFrame class to extend
 */
export function registerDataFrameTransform(DataFrame) {
  // Проверяем, что DataFrame существует
  if (!DataFrame) {
    console.warn(
      'DataFrame class is not provided, skipping transformation methods registration',
    );
    return;
  }

  try {
    // Register individual transformation methods
    registerAssign(DataFrame);
    registerApply(DataFrame);
    registerCategorize(DataFrame);
    registerCut(DataFrame);
    registerJoin(DataFrame);
    registerStack(DataFrame);
    registerOneHot(DataFrame);
    registerSort(DataFrame);
  } catch (error) {
    console.error('Error registering transformation methods:', error.message);
  }

  // Here you can add other transformation methods
}

export default registerDataFrameTransform;
