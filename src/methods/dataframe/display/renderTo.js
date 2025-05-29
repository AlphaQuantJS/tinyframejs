/**
 * Render DataFrame to a specified DOM element
 * @returns {Function} Function that takes a frame and renders it to a DOM element
 */
import { renderTo as webRenderTo } from '../../../display/web/html.js';

/**
 * Factory function that returns a renderTo function for DataFrame
 * @returns {Function} Function that takes a frame and renders it to a DOM element
 */
export const renderTo =
  () =>
  (frame, element, options = {}) => {
    // Use the existing renderTo function from display/web/html.js
    webRenderTo(frame, element, options);

    // Return the frame for method chaining
    return frame;
  };

export default renderTo;
