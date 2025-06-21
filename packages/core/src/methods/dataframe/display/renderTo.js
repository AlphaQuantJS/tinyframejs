/**
 * Render DataFrame to HTML element
 *
 * @param {DataFrame} frame - DataFrame instance
 * @param {HTMLElement|string} element - Target element or CSS selector
 * @param {Object} options - Display options
 * @returns {DataFrame} Original DataFrame for chaining
 */
import { toHTML } from './toHTML.js';

/**
 * Render DataFrame to HTML element
 *
 * @param {DataFrame} frame - DataFrame instance
 * @param {HTMLElement|string} element - Target element or CSS selector
 * @param {Object} options - Display options
 * @returns {DataFrame} Original DataFrame for chaining
 */
export function renderTo(frame, element, options = {}) {
  // Generate HTML representation
  const html = toHTML(frame, options);

  // Find target element
  let targetElement = element;
  if (typeof element === 'string') {
    if (typeof document !== 'undefined') {
      targetElement = document.querySelector(element);
    } else {
      console.warn('Document not available, cannot query selector:', element);
      return frame;
    }
  }

  // Insert HTML into target element
  if (targetElement && typeof targetElement.innerHTML !== 'undefined') {
    targetElement.innerHTML = html;
  } else {
    console.warn('Invalid target element for rendering');
  }

  return frame;
}
