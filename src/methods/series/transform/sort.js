/**
 * Sort method for Series
 * Returns a new Series with sorted values
 */

/**
 * Creates a sort method for Series
 * @returns {Function} - Function to be attached to Series prototype
 */
export function sort() {
  /**
   * Returns a new Series with sorted values
   * @param {Object} [options] - Options object
   * @param {boolean} [options.ascending=true] - Sort in ascending order
   * @param {boolean} [options.inplace=false] - Modify the Series in place
   * @returns {Series} - New Series with sorted values
   */
  return function (options = {}) {
    const { ascending = true, inplace = false } = options;

    const values = this.toArray();
    const sortedValues = [...values].sort((a, b) => {
      // Handle null and undefined values
      // (they go to the end in ascending order,
      // to the beginning in descending order)
      if (a === null || a === undefined) return ascending ? 1 : -1;
      if (b === null || b === undefined) return ascending ? -1 : 1;

      // Handle mixed types (numbers and strings)
      const typeA = typeof a;
      const typeB = typeof b;

      // If types are different, sort by type first
      if (typeA !== typeB) {
        // Numbers come before strings
        if (typeA === 'number' && typeB === 'string') return ascending ? -1 : 1;
        if (typeA === 'string' && typeB === 'number') return ascending ? 1 : -1;
      }

      // Regular comparison
      if (ascending) {
        return a > b ? 1 : a < b ? -1 : 0;
      } else {
        return a < b ? 1 : a > b ? -1 : 0;
      }
    });

    if (inplace) {
      // Replace the values in the current Series
      // Since the set method is not available, create a new array and replace the internal values array
      // through the _data property or another available method
      const result = new this.constructor(sortedValues, { name: this.name });
      Object.assign(this, result);
      return this;
    } else {
      // Create a new Series with the sorted values
      return new this.constructor(sortedValues, { name: this.name });
    }
  };
}

/**
 * Registers the sort method on Series prototype
 * @param {Class} Series - Series class to extend
 */
export function register(Series) {
  if (!Series.prototype.sort) {
    Series.prototype.sort = sort();
  }
}

export default sort;
