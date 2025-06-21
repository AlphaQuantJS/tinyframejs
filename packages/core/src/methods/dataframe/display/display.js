/**
 * Display DataFrame in a web environment
 *
 * @param {DataFrame} frame - DataFrame instance
 * @param {Object} options - Display options
 * @returns {DataFrame} Original DataFrame for chaining
 */
import { toHTML } from './toHTML.js';

/**
 * Display DataFrame in a web environment
 *
 * @param {DataFrame} frame - DataFrame instance
 * @param {Object} options - Display options
 * @returns {DataFrame} Original DataFrame for chaining
 */
export function display(frame, options = {}) {
  // Create HTML representation
  const html = toHTML(frame, options);

  // Check if we're in a browser environment
  if (typeof document !== 'undefined') {
    const div = document.createElement('div');
    div.innerHTML = html;
    document.body.appendChild(div);
  }

  // Check if we're in a Jupyter environment
  if (typeof global !== 'undefined' && global.jupyter) {
    global.jupyter.display(html);
  }

  return frame;
}
