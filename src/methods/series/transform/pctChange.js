/**
 * Percent change method for Series
 * Returns a new Series with the percentage change between consecutive elements
 */

/**
 * Creates a pctChange method for Series
 * @returns {Function} - Function to be attached to Series prototype
 */
export function pctChange() {
  /**
   * Returns a new Series with the percentage change between consecutive elements
   * @param {Object} [options] - Options object
   * @param {number} [options.periods=1] - Number of periods to shift for calculating percentage change
   * @param {boolean} [options.fill=null] - Value to use for filling NA/NaN values
   * @returns {Series} - New Series with percentage changes
   */
  return function(options = {}) {
    const { periods = 1, fill = null } = options;
    
    if (!Number.isInteger(periods) || periods < 1) {
      throw new Error('Periods must be a positive integer');
    }
    
    const values = this.toArray();
    
    // Обработка пустого массива - возвращаем пустой массив
    if (values.length === 0) {
      return new this.constructor([], { name: this.name });
    }
    
    const result = new Array(values.length);
    
    // First N elements will be NaN (where N is the number of periods)
    for (let i = 0; i < periods && i < values.length; i++) {
      result[i] = fill;
    }
    
    // Calculate percentage changes for the rest
    for (let i = periods; i < values.length; i++) {
      const currentValue = values[i];
      const previousValue = values[i - periods];
      
      if (currentValue === null || currentValue === undefined || 
          previousValue === null || previousValue === undefined ||
          typeof currentValue !== 'number' || typeof previousValue !== 'number' ||
          Number.isNaN(currentValue) || Number.isNaN(previousValue) ||
          previousValue === 0) {
        result[i] = fill;
      } else {
        // Правильный расчет процентного изменения для отрицательных значений
        result[i] = (currentValue - previousValue) / Math.abs(previousValue);
      }
    }
    
    return new this.constructor(result, { name: this.name });
  };
}

/**
 * Registers the pctChange method on Series prototype
 * @param {Class} Series - Series class to extend
 */
export function register(Series) {
  if (!Series.prototype.pctChange) {
    Series.prototype.pctChange = pctChange();
  }
}

export default pctChange;
