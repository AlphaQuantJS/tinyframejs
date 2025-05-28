/**
 * Тесты для метода mean в Series
 */

import { describe, it, expect } from 'vitest';
import { Series } from '../../../../src/core/dataframe/Series.js';
import { mean } from '../../../../src/methods/series/aggregation/mean.js';

describe('Series mean', () => {
  it('should calculate the mean of values in a Series', () => {
    const series = new Series([1, 2, 3, 4, 5]);
    expect(mean(series)).toBe(3);
  });

  it('should return NaN for an empty Series', () => {
    const series = new Series([]);
    expect(isNaN(mean(series))).toBe(true);
  });

  it('should handle null and undefined values', () => {
    const series = new Series([1, null, 3, undefined, 5]);
    expect(mean(series)).toBe(3); // (1 + 3 + 5) / 3 = 3
  });

  it('should convert string values to numbers when possible', () => {
    const series = new Series(['1', '2', '3']);
    expect(mean(series)).toBe(2);
  });

  it('should return NaN when Series contains only non-numeric strings', () => {
    const series = new Series(['a', 'b', 'c']);
    expect(isNaN(mean(series))).toBe(true);
  });
});
