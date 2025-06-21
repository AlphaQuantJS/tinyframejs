/**
 * Convert DataFrame to Jupyter notebook compatible representation
 *
 * @param {DataFrame} frame - DataFrame instance
 * @param {Object} options - Conversion options
 * @returns {Object} - Jupyter display object
 */
import { toHTML } from './toHTML.js';

/**
 * Convert DataFrame to Jupyter notebook compatible representation
 *
 * @param {DataFrame} frame - DataFrame instance
 * @param {Object} options - Display options
 * @returns {Object} Jupyter display object
 */
export function toJupyter(frame, options = {}) {
  // Generate HTML representation
  const html = toHTML(frame, options);

  // Create Jupyter display object
  return {
    'text/html': html,
    'application/json': frame.toJSON
      ? frame.toJSON()
      : JSON.stringify(frame.toArray()),
  };
}

/**
 * Register Jupyter display handler
 *
 * This function registers a handler for Jupyter notebook display
 * It should be called when running in a Jupyter environment
 */
export function registerJupyterDisplay() {
  if (typeof global !== 'undefined' && !global.jupyter) {
    global.jupyter = {
      display: (obj) => {
        if (typeof console !== 'undefined') {
          console.log('Jupyter display:', obj);
        }
      },
    };
  }
}

/**
 * Register Jupyter display methods on DataFrame prototype
 *
 * @param {Class} DataFrame - DataFrame class to register methods on
 */
export function registerJupyterDisplayForDataFrame(DataFrame) {
  jupyterRegister(DataFrame);
}
