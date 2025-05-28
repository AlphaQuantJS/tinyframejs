/**
 * Registrar for DataFrame transformation methods
 */

// Import transformation methods
import { assign } from './assign.js';
import { apply } from './apply.js';
import { categorize } from './categorize.js';
import { cut } from './cut.js';
import { join } from './join.js';
import { sort } from '../aggregation/sort.js';

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
    DataFrame.prototype.assign = assign();
    DataFrame.prototype.apply = apply();
    DataFrame.prototype.categorize = categorize();
    DataFrame.prototype.cut = cut();
    DataFrame.prototype.join = join();

    // Sorting methods
    DataFrame.prototype.sort = sort({
      validateColumn: (frame, column) => {
        if (!frame.columns.includes(column)) {
          throw new Error(`Column '${column}' not found`);
        }
      },
    });
  } catch (error) {
    console.error('Error registering transformation methods:', error.message);
  }

  // Here you can add other transformation methods
}

export default registerDataFrameTransform;
