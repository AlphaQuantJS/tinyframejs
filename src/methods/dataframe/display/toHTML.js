/**
 * Convert DataFrame to HTML table
 * @returns {Function} Function that takes a frame and returns HTML string
 */
import { toHTML as webToHTML } from '../../../display/web/html.js';

/**
 * Factory function that returns a toHTML function for DataFrame
 * @returns {Function} Function that takes a frame and returns HTML string
 */
export const toHTML =
  () =>
  (frame, options = {}) =>
    // Use the existing toHTML function from display/web/html.js
    webToHTML(frame, options);

export default toHTML;
