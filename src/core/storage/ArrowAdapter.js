/**
 * Adapter for Apache Arrow
 * This file provides a compatibility layer for Apache Arrow
 * to work with TinyFrameJS regardless of Arrow version
 */

// Import Arrow directly using ESM
import * as Arrow from 'apache-arrow';

/**
 * Creates an Arrow Vector from a JavaScript array
 * @param {Array} array - The source array
 * @returns {Arrow.Vector} - An Arrow vector
 */
export function vectorFromArray(array) {
  if (!array || !array.length) {
    return null;
  }

  try {
    // Determine the data type based on the first non-null element
    const firstNonNull = array.find((x) => x !== null && x !== undefined);
    const type = typeof firstNonNull;

    // Create appropriate Arrow vector based on data type
    if (type === 'string') {
      return Arrow.vectorFromArray(array);
    } else if (type === 'number') {
      return Arrow.vectorFromArray(array, new Arrow.Float64());
    } else if (type === 'boolean') {
      return Arrow.vectorFromArray(array, new Arrow.Bool());
    } else if (firstNonNull instanceof Date) {
      return Arrow.vectorFromArray(array, new Arrow.DateMillisecond());
    } else {
      // For complex objects or mixed types, serialize to JSON strings
      return Arrow.vectorFromArray(
        array.map((item) =>
          item !== null && item !== undefined ? JSON.stringify(item) : null,
        ),
      );
    }
  } catch (error) {
    console.error('Error creating Arrow vector:', error);
    return null;
  }
}

// Check Arrow availability
export function isArrowAvailable() {
  return !!Arrow && typeof Arrow.vectorFromArray === 'function';
}

// Export Arrow for use in other modules
export { Arrow };
