/**
 * Convert DataFrame to Jupyter notebook compatible representation
 * @returns {Function} Function that takes a frame and returns Jupyter display object
 */
import {
  toJupyter as jupyterToJupyter,
  registerJupyterDisplay as jupyterRegister,
} from '../../../display/web/jupyter.js';

/**
 * Factory function that returns a toJupyter function for DataFrame
 * @returns {Function} Function that takes a frame and returns Jupyter display object
 */
export const toJupyter =
  () =>
  (frame, options = {}) =>
    // Use the existing toJupyter function from display/web/jupyter.js
    jupyterToJupyter(frame, options);

/**
 * Register special display methods for Jupyter notebook
 * @param {Class} DataFrame - DataFrame class to extend
 */
export const registerJupyterDisplay = (DataFrame) => {
  // Use the existing registerJupyterDisplay function from display/web/jupyter.js
  jupyterRegister(DataFrame);
};

export default toJupyter;
