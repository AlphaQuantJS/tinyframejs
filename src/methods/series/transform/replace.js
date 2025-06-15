/**
 * Replace method for Series
 * Returns a new Series with replaced values
 */

/**
 * Creates a replace method for Series
 * @returns {Function} - Function to be attached to Series prototype
 */
export function replace() {
  /**
   * Returns a new Series with replaced values
   * @param {*} oldValue - Value to replace
   * @param {*} newValue - New value
   * @param {Object} [options] - Options object
   * @param {boolean} [options.regex=false] - Whether to treat oldValue as a regular expression
   * @param {boolean} [options.inplace=false] - Modify the Series in place
   * @returns {Series} - New Series with replaced values
   */
  return function (oldValue, newValue, options = {}) {
    const { regex = false, inplace = false } = options;

    if (oldValue === undefined) {
      throw new Error('Old value must be provided');
    }

    if (newValue === undefined) {
      throw new Error('New value must be provided');
    }

    const values = this.toArray();
    const result = new Array(values.length);

    if (regex && typeof oldValue === 'string') {
      // Create a RegExp object from the string pattern
      const pattern = new RegExp(oldValue);

      for (let i = 0; i < values.length; i++) {
        const value = values[i];

        if (value === null || value === undefined) {
          result[i] = value;
          continue;
        }

        const strValue = String(value);
        if (pattern.test(strValue)) {
          result[i] = newValue;
        } else {
          result[i] = value;
        }
      }
    } else {
      // Direct value comparison
      for (let i = 0; i < values.length; i++) {
        result[i] = Object.is(values[i], oldValue) ? newValue : values[i];
      }
    }

    if (inplace) {
      // Replace the values in the current Series
      // Since there is no set method, create a new Series object and replace its internal properties
      const newSeries = new this.constructor(result, { name: this.name });
      Object.assign(this, newSeries);
      return this;
    } else {
      // Create a new Series with the replaced values
      return new this.constructor(result, { name: this.name });
    }
  };
}

/**
 * Registers the replace method on Series prototype
 * @param {Class} Series - Series class to extend
 */
export function register(Series) {
  if (!Series.prototype.replace) {
    Series.prototype.replace = replace();
  }
}

export default replace;
