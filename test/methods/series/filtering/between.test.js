import { describe, test, expect, beforeAll } from 'vitest';
import { Series } from '../../../../src/core/dataframe/Series.js';
import {
  between,
  register,
} from '../../../../src/methods/series/filtering/between.js';

describe('Series.between', () => {
  // Register the method before running tests
  beforeAll(() => {
    register(Series);
  });
  test('filters values between lower and upper bounds (inclusive by default)', () => {
    const series = new Series([1, 2, 3, 4, 5]);
    const filtered = series.between(2, 4);
    expect(filtered.toArray()).toEqual([2, 3, 4]);
  });

  test('filters values between lower and upper bounds (exclusive)', () => {
    const series = new Series([1, 2, 3, 4, 5]);
    const filtered = series.between(2, 4, { inclusive: false });
    expect(filtered.toArray()).toEqual([3]);
  });

  test('handles string values that can be converted to numbers', () => {
    const series = new Series(['1', '2', '3', '4', '5']);
    const filtered = series.between(2, 4);
    expect(filtered.toArray()).toEqual(['2', '3', '4']);
  });

  test('filters out non-numeric values', () => {
    const series = new Series([1, '2', null, 4, 'abc', 5]);
    const filtered = series.between(2, 4);
    expect(filtered.toArray()).toEqual(['2', 4]);
  });

  test('returns empty Series when no values are in range', () => {
    const series = new Series([1, 2, 10, 20]);
    const filtered = series.between(3, 9);
    expect(filtered.toArray()).toEqual([]);
  });

  test('handles empty Series', () => {
    const series = new Series([]);
    const filtered = series.between(1, 10);
    expect(filtered.toArray()).toEqual([]);
  });

  test('throws error when lower bound is greater than upper bound', () => {
    const series = new Series([1, 2, 3, 4, 5]);
    expect(() => series.between(4, 2)).toThrow(
      'Lower bound must be less than or equal to upper bound',
    );
  });

  test('throws error when bounds are not provided', () => {
    const series = new Series([1, 2, 3, 4, 5]);
    expect(() => series.between()).toThrow(
      'Both lower and upper bounds must be provided',
    );
    expect(() => series.between(1)).toThrow(
      'Both lower and upper bounds must be provided',
    );
  });

  test('works with direct function call', () => {
    const betweenFunc = between();
    const series = new Series([1, 2, 3, 4, 5]);
    const filtered = betweenFunc.call(series, 2, 4);
    expect(filtered.toArray()).toEqual([2, 3, 4]);
  });
});
