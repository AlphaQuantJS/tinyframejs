/**
 * Tests for Series filter method
 */

import { describe, it, expect } from 'vitest';
import { Series } from '../../../../src/core/dataframe/Series.js';

describe('Series.filter()', () => {
  it('should filter values based on a predicate', () => {
    const series = new Series([1, 2, 3, 4, 5]);
    const filtered = series.filter((value) => value > 3);
    expect(filtered.toArray()).toEqual([4, 5]);
  });

  it('should return an empty Series when no values match the predicate', () => {
    const series = new Series([1, 2, 3]);
    const filtered = series.filter((value) => value > 5);
    expect(filtered.toArray()).toEqual([]);
  });

  it('should handle null and undefined values', () => {
    const series = new Series([1, null, 3, undefined, 5]);
    const filtered = series.filter(
      (value) => value !== null && value !== undefined,
    );
    expect(filtered.toArray()).toEqual([1, 3, 5]);
  });

  it('should handle string values', () => {
    const series = new Series(['apple', 'banana', 'cherry']);
    const filtered = series.filter((value) => value.startsWith('a'));
    expect(filtered.toArray()).toEqual(['apple']);
  });

  it('should return a new Series instance', () => {
    const series = new Series([1, 2, 3]);
    const filtered = series.filter((value) => value > 1);
    expect(filtered).toBeInstanceOf(Series);
    expect(filtered).not.toBe(series);
  });
});
