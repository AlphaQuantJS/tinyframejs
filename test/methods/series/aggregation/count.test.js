/**
 * Тесты для метода count в Series
 */

import { describe, it, expect } from 'vitest';
import { Series } from '../../../../src/core/dataframe/Series.js';
import { count } from '../../../../src/methods/series/aggregation/count.js';

describe('Series count', () => {
  it('should count non-null, non-undefined, non-NaN values in a Series', () => {
    const series = new Series([1, 2, 3, 4, 5]);
    expect(count(series)).toBe(5);
  });

  it('should return 0 for an empty Series', () => {
    const series = new Series([]);
    expect(count(series)).toBe(0);
  });

  it('should ignore null, undefined, and NaN values', () => {
    const series = new Series([1, null, 3, undefined, 5, NaN]);
    expect(count(series)).toBe(3); // Only 1, 3, and 5 are valid values
  });

  it('should count string values', () => {
    const series = new Series(['a', 'b', 'c']);
    expect(count(series)).toBe(3);
  });

  it('should count mixed values', () => {
    const series = new Series([1, 'a', true, {}, []]);
    expect(count(series)).toBe(5); // All values are valid
  });
});
