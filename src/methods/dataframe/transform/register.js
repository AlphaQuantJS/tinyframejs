/**
 * Registrar for DataFrame transformation methods
 */

// Import transformation methods
import { register as registerAssign } from './assign.js';
import { register as registerApply } from './apply.js';
import { register as registerCategorize } from './categorize.js';
import { register as registerCut } from './cut.js';
import { register as registerDropna } from './dropna.js';
import { register as registerMutate } from './mutate.js';
import joinModule from './join.js';
import { registerSort } from './sort.js';
import { register as registerStack } from '../../reshape/stack.js';
import oneHotModule from './oneHot.js';

/**
 * Registers all transformation methods for DataFrame
 * @param {Class} DataFrame - DataFrame class to extend
 */
export function registerDataFrameTransform(DataFrame) {
  // Check that DataFrame exists
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
    registerDropna(DataFrame);
    registerMutate(DataFrame);
    // Register join method directly from module
    DataFrame.prototype.join = function (other, options) {
      return joinModule.join()(this, other, options);
    };
    registerStack(DataFrame);
    // Register oneHot method directly from module
    DataFrame.prototype.oneHot = function (column, options) {
      return oneHotModule.oneHot()(this, column, options);
    };
    registerSort(DataFrame);
  } catch (error) {
    console.error('Error registering transformation methods:', error.message);
  }

  // Here you can add other transformation methods
}

export default registerDataFrameTransform;
