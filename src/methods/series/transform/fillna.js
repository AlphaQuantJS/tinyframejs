/**
 * FillNA method for Series
 * Returns a new Series with null/undefined values filled
 */

/**
 * Creates a fillna method for Series
 * @returns {Function} - Function to be attached to Series prototype
 */
export function fillna() {
  /**
   * Returns a new Series with null/undefined values filled
   * @param {*} value - Value to fill null/undefined values with
   * @param {Object} [options] - Options object
   * @param {boolean} [options.inplace=false] - Modify the Series in place
   * @returns {Series} - New Series with filled values
   */
  return function (value, options = {}) {
    const { inplace = false } = options;

    if (value === undefined) {
      throw new Error('Fill value must be provided');
    }

    const values = this.toArray();
    const result = new Array(values.length);

    for (let i = 0; i < values.length; i++) {
      result[i] =
        values[i] === null || values[i] === undefined ? value : values[i];
    }

    if (inplace) {
      // Replace the values in the current Series
      // Since there is no set method, create a new Series object and replace its internal properties
      const newSeries = new this.constructor(result, { name: this.name });
      Object.assign(this, newSeries);
      return this;
    } else {
      // Create a new Series with the filled values
      return new this.constructor(result, { name: this.name });
    }
  };
}

/**
 * Registers the fillna method on Series prototype
 * @param {Class} Series - Series class to extend
 */
export function register(Series) {
  if (!Series.prototype.fillna) {
    Series.prototype.fillna = fillna();
  }
}

export default fillna;
