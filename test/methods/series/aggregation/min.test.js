/**
 * Тесты для метода min в Series
 */

import { describe, it, expect } from 'vitest';
import { Series } from '../../../../src/core/dataframe/Series.js';
import { min } from '../../../../src/methods/series/aggregation/min.js';

describe('Series min', () => {
  it('should find the minimum value in a Series', () => {
    const series = new Series([1, 2, 3, 4, 5]);
    expect(min(series)).toBe(1);
  });

  it('should return NaN for an empty Series', () => {
    const series = new Series([]);
    expect(isNaN(min(series))).toBe(true);
  });

  it('should ignore null, undefined, and NaN values', () => {
    const series = new Series([10, null, 3, undefined, 5, NaN]);
    expect(min(series)).toBe(3);
  });

  it('should convert string values to numbers when possible', () => {
    const series = new Series(['10', '2', '5']);
    expect(min(series)).toBe(2);
  });

  it('should return NaN when Series contains only non-numeric strings', () => {
    const series = new Series(['a', 'b', 'c']);
    expect(isNaN(min(series))).toBe(true);
  });

  it('should handle negative numbers correctly', () => {
    const series = new Series([-5, -3, -10, -1]);
    expect(min(series)).toBe(-10);
  });
});
