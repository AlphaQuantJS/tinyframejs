/**
 * Display DataFrame in browser environment
 * @returns {Function} Function that takes a frame and displays it in browser
 */
import { display as webDisplay } from '../../../display/web/html.js';

/**
 * Factory function that returns a display function for DataFrame
 * @returns {Function} Function that takes a frame and displays it in browser
 */
export const display =
  () =>
  (frame, options = {}) => {
    // Use the existing display function from display/web/html.js
    webDisplay(frame, options);

    // Return the frame for method chaining
    return frame;
  };

export default display;
