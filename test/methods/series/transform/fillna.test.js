import { describe, test, expect, beforeAll } from 'vitest';
import { Series } from '../../../../src/core/dataframe/Series.js';
import { register } from '../../../../src/methods/series/transform/fillna.js';

describe('Series.fillna', () => {
  beforeAll(() => {
    // Register the fillna method on Series prototype
    register(Series);
  });

  test('fills null values with specified value', () => {
    const series = new Series([1, null, 3, null, 5]);
    const filled = series.fillna(0);
    expect(filled.toArray()).toEqual([1, 0, 3, 0, 5]);
  });

  test('fills undefined values with specified value', () => {
    const series = new Series([1, undefined, 3, undefined, 5]);
    const filled = series.fillna(0);
    expect(filled.toArray()).toEqual([1, 0, 3, 0, 5]);
  });

  test('fills both null and undefined values with specified value', () => {
    const series = new Series([1, null, 3, undefined, 5]);
    const filled = series.fillna(0);
    expect(filled.toArray()).toEqual([1, 0, 3, 0, 5]);
  });

  test('fills with non-zero values', () => {
    const series = new Series([1, null, 3, null, 5]);
    const filled = series.fillna(999);
    expect(filled.toArray()).toEqual([1, 999, 3, 999, 5]);
  });

  test('fills with string values', () => {
    const series = new Series(['a', null, 'c', null, 'e']);
    const filled = series.fillna('missing');
    expect(filled.toArray()).toEqual(['a', 'missing', 'c', 'missing', 'e']);
  });

  test('fills in place when inplace option is true', () => {
    const series = new Series([1, null, 3, null, 5]);
    const result = series.fillna(0, { inplace: true });
    expect(series.toArray()).toEqual([1, 0, 3, 0, 5]);
    expect(result).toBe(series); // Should return the same instance
  });

  test('returns a new Series when inplace option is false (default)', () => {
    const series = new Series([1, null, 3, null, 5]);
    const filled = series.fillna(0);
    expect(series.toArray()).toEqual([1, null, 3, null, 5]); // Original unchanged
    expect(filled.toArray()).toEqual([1, 0, 3, 0, 5]); // New Series with filled values
    expect(filled).not.toBe(series); // Should be a different instance
  });

  test('throws error when value is not provided', () => {
    const series = new Series([1, null, 3]);
    expect(() => series.fillna(undefined)).toThrow('Fill value must be provided');
  });

  test('works with empty Series', () => {
    const series = new Series([]);
    const filled = series.fillna(0);
    expect(filled.toArray()).toEqual([]);
  });

  test('does nothing when there are no null/undefined values', () => {
    const series = new Series([1, 2, 3, 4, 5]);
    const filled = series.fillna(0);
    expect(filled.toArray()).toEqual([1, 2, 3, 4, 5]);
  });

  test('works with direct function call', () => {
    // Регистрируем метод
    register(Series);
    const series = new Series([1, null, 3, undefined]);
    // Используем метод напрямую
    const filled = series.fillna(0);
    expect(filled.toArray()).toEqual([1, 0, 3, 0]);
  });
});
