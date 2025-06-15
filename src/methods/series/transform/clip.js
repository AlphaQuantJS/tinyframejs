/**
 * Clip method for Series
 * Returns a new Series with values clipped to specified min and max
 */

/**
 * Creates a clip method for Series
 * @returns {Function} - Function to be attached to Series prototype
 */
export function clip() {
  /**
   * Returns a new Series with values clipped to specified min and max
   * @param {Object} [options] - Options object
   * @param {number} [options.min] - Minimum value
   * @param {number} [options.max] - Maximum value
   * @param {boolean} [options.inplace=false] - Modify the Series in place
   * @returns {Series} - New Series with clipped values
   */
  return function (options = {}) {
    const { min = undefined, max = undefined, inplace = false } = options;

    if (min === undefined && max === undefined) {
      throw new Error('At least one of min or max must be provided');
    }

    const values = this.toArray();
    const result = new Array(values.length);

    for (let i = 0; i < values.length; i++) {
      const value = values[i];

      if (value === null || value === undefined) {
        result[i] = value;
        continue;
      }

      if (typeof value !== 'number' || Number.isNaN(value)) {
        result[i] = value;
        continue;
      }

      let clippedValue = value;

      if (min !== undefined && value < min) {
        clippedValue = min;
      }

      if (max !== undefined && value > max) {
        clippedValue = max;
      }

      result[i] = clippedValue;
    }

    if (inplace) {
      // Replace the values in the current Series
      // Since there is no set method, create a new Series object and replace its internal properties
      const newSeries = new this.constructor(result, { name: this.name });
      Object.assign(this, newSeries);
      return this;
    } else {
      // Create a new Series with the clipped values
      return new this.constructor(result, { name: this.name });
    }
  };
}

/**
 * Registers the clip method on Series prototype
 * @param {Class} Series - Series class to extend
 */
export function register(Series) {
  if (!Series.prototype.clip) {
    Series.prototype.clip = clip();
  }
}

export default clip;
