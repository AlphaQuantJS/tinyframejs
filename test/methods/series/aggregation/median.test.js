/**
 * Тесты для метода median в Series
 */

import { describe, it, expect } from 'vitest';
import { Series } from '../../../../src/core/dataframe/Series.js';
import { median } from '../../../../src/methods/series/aggregation/median.js';

describe('Series median', () => {
  it('should find the median value in a Series with odd number of elements', () => {
    const series = new Series([1, 3, 2, 5, 4]);
    expect(median(series)).toBe(3);
  });

  it('should find the median value in a Series with even number of elements', () => {
    const series = new Series([1, 3, 2, 4]);
    expect(median(series)).toBe(2.5); // (2 + 3) / 2 = 2.5
  });

  it('should return NaN for an empty Series', () => {
    const series = new Series([]);
    expect(isNaN(median(series))).toBe(true);
  });

  it('should ignore null, undefined, and NaN values', () => {
    const series = new Series([10, null, 3, undefined, 5, NaN]);
    expect(median(series)).toBe(5); // Median of [10, 3, 5] is 5
  });

  it('should convert string values to numbers when possible', () => {
    const series = new Series(['10', '2', '5']);
    expect(median(series)).toBe(5);
  });

  it('should return NaN when Series contains only non-numeric strings', () => {
    const series = new Series(['a', 'b', 'c']);
    expect(isNaN(median(series))).toBe(true);
  });

  it('should handle negative numbers correctly', () => {
    const series = new Series([-5, -3, -10, -1]);
    expect(median(series)).toBe(-4); // Median of [-10, -5, -3, -1] is (-5 + -3) / 2 = -4
  });
});
