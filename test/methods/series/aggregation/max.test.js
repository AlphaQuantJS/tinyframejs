/**
 * Tests for the max method in Series
 */

import { describe, it, expect } from 'vitest';
import { Series } from '../../../../src/core/dataframe/Series.js';
import { max } from '../../../../src/methods/series/aggregation/max.js';

describe('Series max', () => {
  it('should find the maximum value in a Series', () => {
    const series = new Series([1, 2, 3, 4, 5]);
    expect(max(series)).toBe(5);
  });

  it('should return NaN for an empty Series', () => {
    const series = new Series([]);
    expect(isNaN(max(series))).toBe(true);
  });

  it('should ignore null, undefined, and NaN values', () => {
    const series = new Series([1, null, 3, undefined, 5, NaN]);
    expect(max(series)).toBe(5);
  });

  it('should convert string values to numbers when possible', () => {
    const series = new Series(['1', '2', '10']);
    expect(max(series)).toBe(10);
  });

  it('should return NaN when Series contains only non-numeric strings', () => {
    const series = new Series(['a', 'b', 'c']);
    expect(isNaN(max(series))).toBe(true);
  });

  it('should handle negative numbers correctly', () => {
    const series = new Series([-5, -3, -10, -1]);
    expect(max(series)).toBe(-1);
  });
});
