/**
 * Тесты для метода sum в Series
 */

import { describe, it, expect } from 'vitest';
import { Series } from '../../../../src/core/dataframe/Series.js';
import { sum } from '../../../../src/methods/series/aggregation/sum.js';

describe('Series sum', () => {
  it('should calculate the sum of values in a Series', () => {
    const series = new Series([1, 2, 3, 4, 5]);
    expect(sum(series)).toBe(15);
  });

  it('should return 0 for an empty Series', () => {
    const series = new Series([]);
    expect(sum(series)).toBe(0);
  });

  it('should ignore null and undefined values', () => {
    const series = new Series([1, null, 3, undefined, 5]);
    expect(sum(series)).toBe(9);
  });

  it('should convert string values to numbers when possible', () => {
    const series = new Series(['1', '2', '3']);
    expect(sum(series)).toBe(6);
  });

  it('should return 0 when Series contains non-numeric strings', () => {
    const series = new Series(['a', 'b', 'c']);
    expect(sum(series)).toBe(0);
  });
});
