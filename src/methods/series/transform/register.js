/**
 * Registrar for Series transformation methods
 */

// Import all transformation methods
import { sort } from './sort.js';
import { unique } from './unique.js';
import { replace } from './replace.js';
import { fillna } from './fillna.js';
import { dropna } from './dropna.js';
import { clip } from './clip.js';
import { diff } from './diff.js';
import { pctChange } from './pctChange.js';
import { map } from './map.js';
import { apply } from './apply.js';
import { round } from './round.js';
import { abs } from './abs.js';

/**
 * Registers all transformation methods for Series
 * @param {Class} Series - Series class to extend
 */
export function registerSeriesTransform(Series) {
  // Map method is imported from map.js

  /**
   * Filters Series elements using the provided predicate
   * @param {Function} predicate - Function that returns true for elements to keep
   * @returns {Series} - New Series with filtered values
   */
  Series.prototype.filter = function (predicate) {
    const data = this.values;
    const result = [];

    for (let i = 0; i < data.length; i++) {
      if (predicate(data[i], i, data)) {
        result.push(data[i]);
      }
    }

    return new Series(result, { name: this.name });
  };

  // Abs method is imported from abs.js

  // Round method is imported from round.js

  /**
   * Returns cumulative sum of the Series
   * @returns {Series} - New Series with cumulative sum
   */
  Series.prototype.cumsum = function () {
    const data = this.values;
    const result = new Array(data.length);
    let sum = 0;

    for (let i = 0; i < data.length; i++) {
      if (data[i] !== null && data[i] !== undefined && !Number.isNaN(data[i])) {
        sum += data[i];
      }
      result[i] = sum;
    }

    return new Series(result, { name: this.name });
  };

  /**
   * Returns Series with values normalized to range [0, 1]
   * @returns {Series} - Normalized Series
   */
  Series.prototype.normalize = function () {
    const min = this.min();
    const max = this.max();

    if (min === max) {
      return this.map(() => 0);
    }

    const range = max - min;
    return this.map((x) => (x - min) / range);
  };

  // Apply method is imported from apply.js

  // Register new transformation methods
  if (!Series.prototype.map) {
    Series.prototype.map = map();
  }

  if (!Series.prototype.apply) {
    Series.prototype.apply = apply();
  }

  if (!Series.prototype.round) {
    Series.prototype.round = round();
  }

  if (!Series.prototype.abs) {
    Series.prototype.abs = abs();
  }

  if (!Series.prototype.sort) {
    Series.prototype.sort = sort();
  }

  if (!Series.prototype.unique) {
    Series.prototype.unique = unique();
  }

  if (!Series.prototype.replace) {
    Series.prototype.replace = replace();
  }

  if (!Series.prototype.fillna) {
    Series.prototype.fillna = fillna();
  }

  if (!Series.prototype.dropna) {
    Series.prototype.dropna = dropna();
  }

  if (!Series.prototype.clip) {
    Series.prototype.clip = clip();
  }

  if (!Series.prototype.diff) {
    Series.prototype.diff = diff();
  }

  if (!Series.prototype.pctChange) {
    Series.prototype.pctChange = pctChange();
  }
}

export default registerSeriesTransform;
