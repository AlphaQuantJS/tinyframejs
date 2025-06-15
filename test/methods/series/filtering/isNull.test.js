import { describe, test, expect, beforeAll } from 'vitest';
import { Series } from '../../../../src/core/dataframe/Series.js';
import {
  isNull,
  register,
} from '../../../../src/methods/series/filtering/isNull.js';

describe('Series.isNull', () => {
  // Register the method before running tests
  beforeAll(() => {
    register(Series);
  });
  test('filters only null and undefined values', () => {
    const series = new Series(['apple', null, 'banana', undefined, 'cherry']);
    const filtered = series.isNull();
    expect(filtered.toArray()).toEqual([null, undefined]);
  });

  test('returns empty Series when no null or undefined values exist', () => {
    const series = new Series(['apple', 'banana', 'cherry', 0, '', false]);
    const filtered = series.isNull();
    expect(filtered.toArray()).toEqual([]);
  });

  test('handles empty Series', () => {
    const series = new Series([]);
    const filtered = series.isNull();
    expect(filtered.toArray()).toEqual([]);
  });

  test('handles Series with only null and undefined values', () => {
    const series = new Series([null, undefined, null]);
    const filtered = series.isNull();
    expect(filtered.toArray()).toEqual([null, undefined, null]);
  });

  test('does not consider falsy values as null', () => {
    const series = new Series([0, '', false, NaN]);
    const filtered = series.isNull();
    expect(filtered.toArray()).toEqual([]);
  });

  test('works with direct function call', () => {
    const isNullFunc = isNull();
    const series = new Series(['apple', null, 'banana', undefined]);
    const filtered = isNullFunc.call(series, null);
    expect(filtered.toArray()).toEqual([null, undefined]);
  });
});
