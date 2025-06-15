/**
 * Normalizes chart title configuration
 * Handles cases when title is a string or object, ensuring consistent structure
 *
 * @param {Object} targetObj - The object where title should be set (options or options.plugins)
 * @param {string|Object} rawTitle - The raw title value (string or object)
 * @param {string} defaultText - Default text to use if title is not provided
 * @param {boolean} [isPluginBased=false] - Whether title is in plugins.title or directly in options
 */
export function normalizeTitle(
  targetObj,
  rawTitle,
  defaultText,
  isPluginBased = false,
) {
  // Determine where to set the title
  const titleTarget = isPluginBased
    ? (targetObj.plugins = targetObj.plugins || {})
    : targetObj;

  // If user provided a string, convert to object
  if (typeof rawTitle === 'string') {
    titleTarget.title = { display: true, text: rawTitle };
  }

  // If no title exists, create default
  if (!titleTarget.title) {
    titleTarget.title = { display: true, text: defaultText };
  } else {
    // Ensure display and text properties exist
    titleTarget.title.display ??= true;
    titleTarget.title.text ??= defaultText;
  }
}
