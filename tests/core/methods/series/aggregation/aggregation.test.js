// tests/core/methods/series/aggregation/aggregation.test.js
import { describe, it, expect, beforeAll } from 'vitest';
import { Series } from '../../../../../packages/core/src/data/model/Series.js';
import { sum } from '../../../../../packages/core/src/methods/series/aggregation/sum.js';
import { mean } from '../../../../../packages/core/src/methods/series/aggregation/mean.js';
import { min } from '../../../../../packages/core/src/methods/series/aggregation/min.js';
import { max } from '../../../../../packages/core/src/methods/series/aggregation/max.js';
import { count } from '../../../../../packages/core/src/methods/series/aggregation/count.js';
import { extendSeries } from '../../../../../packages/core/src/data/model/extendSeries.js';

describe('Series aggregation methods', () => {
  // Define test data
  const testData = [10, 20, 15, 25, 30];
  const name = 'test_series';
  let series;

  beforeAll(() => {
    // Register aggregation methods on Series prototype
    extendSeries(Series.prototype, {
      sum,
      mean,
      min,
      max,
      count,
    });

    // Create Series with test data
    series = new Series(testData, { name });

    // Output Series information for debugging
    console.log('Test Series:', series);
    console.log('Series vector:', series.vector);
    if (series.vector && series.vector.__data) {
      console.log('Series vector.__data:', series.vector.__data);
    }
    console.log(
      'Series prototype methods:',
      Object.keys(Series.prototype).filter(
        (key) => typeof Series.prototype[key] === 'function',
      ),
    );
  });

  it('should calculate sum correctly', () => {
    console.log('Series.sum exists:', typeof series.sum === 'function');
    const result = series.sum();
    console.log('sum() result:', result);
    expect(result).toBe(100); // 10 + 20 + 15 + 25 + 30 = 100
  });

  it('should calculate mean correctly', () => {
    console.log('Series.mean exists:', typeof series.mean === 'function');
    const result = series.mean();
    console.log('mean() result:', result);
    expect(result).toBe(20); // (10 + 20 + 15 + 25 + 30) / 5 = 20
  });

  it('should find minimum value correctly', () => {
    console.log('Series.min exists:', typeof series.min === 'function');
    const result = series.min();
    console.log('min() result:', result);
    expect(result).toBe(10);
  });

  it('should find maximum value correctly', () => {
    console.log('Series.max exists:', typeof series.max === 'function');
    const result = series.max();
    console.log('max() result:', result);
    expect(result).toBe(30);
  });

  it('should count values correctly', () => {
    console.log('Series.count exists:', typeof series.count === 'function');
    const result = series.count();
    console.log('count() result:', result);
    expect(result).toBe(5);
  });

  // Test for direct function calls
  it('should work when called directly', () => {
    expect(sum(series)).toBe(100);
    expect(mean(series)).toBe(20);
    expect(min(series)).toBe(10);
    expect(max(series)).toBe(30);
    expect(count(series)).toBe(5);
  });
});
