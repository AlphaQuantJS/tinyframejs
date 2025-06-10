/**
 * Diff method for Series
 * Returns a new Series with the difference between consecutive elements
 */

/**
 * Creates a diff method for Series
 * @returns {Function} - Function to be attached to Series prototype
 */
export function diff() {
  /**
   * Returns a new Series with the difference between consecutive elements
   * @param {Object} [options] - Options object
   * @param {number} [options.periods=1] - Number of periods to shift for calculating difference
   * @returns {Series} - New Series with differences
   */
  return function(options = {}) {
    const { periods = 1 } = options;
    
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
      result[i] = NaN;
    }
    
    // Calculate differences for the rest
    for (let i = periods; i < values.length; i++) {
      const currentValue = values[i];
      const previousValue = values[i - periods];
      
      // Проверка на строки, которые можно преобразовать в числа
      const numCurrent = typeof currentValue === 'string' ? Number(currentValue) : currentValue;
      const numPrevious = typeof previousValue === 'string' ? Number(previousValue) : previousValue;
      
      if (numCurrent === null || numCurrent === undefined || 
          numPrevious === null || numPrevious === undefined ||
          typeof numCurrent !== 'number' || typeof numPrevious !== 'number' ||
          Number.isNaN(numCurrent) || Number.isNaN(numPrevious)) {
        result[i] = NaN;
      } else {
        result[i] = numCurrent - numPrevious;
      }
    }
    
    return new this.constructor(result, { name: this.name });
  };
}

/**
 * Registers the diff method on Series prototype
 * @param {Class} Series - Series class to extend
 */
export function register(Series) {
  if (!Series.prototype.diff) {
    Series.prototype.diff = diff();
  }
}

export default diff;
