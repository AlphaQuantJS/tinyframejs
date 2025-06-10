import { describe, test, expect, beforeAll } from 'vitest';
import { Series } from '../../../../src/core/dataframe/Series.js';
import { register } from '../../../../src/methods/series/transform/dropna.js';

describe('Series.dropna', () => {
  beforeAll(() => {
    // Register the dropna method on Series prototype
    register(Series);
  });

  test('removes null values from Series', () => {
    const series = new Series([1, null, 3, null, 5]);
    const result = series.dropna();
    expect(result.toArray()).toEqual([1, 3, 5]);
  });

  test('removes undefined values from Series', () => {
    const series = new Series([1, undefined, 3, undefined, 5]);
    const result = series.dropna();
    expect(result.toArray()).toEqual([1, 3, 5]);
  });

  test('removes both null and undefined values from Series', () => {
    const series = new Series([1, null, 3, undefined, 5]);
    const result = series.dropna();
    expect(result.toArray()).toEqual([1, 3, 5]);
  });

  test('returns original Series when there are no null/undefined values', () => {
    const series = new Series([1, 2, 3, 4, 5]);
    const result = series.dropna();
    expect(result.toArray()).toEqual([1, 2, 3, 4, 5]);
    expect(result).not.toBe(series); // Should still be a new instance
  });

  test('returns empty Series when all values are null/undefined', () => {
    const series = new Series([null, undefined, null]);
    const result = series.dropna();
    expect(result.toArray()).toEqual([]);
  });

  test('works with empty Series', () => {
    const series = new Series([]);
    const result = series.dropna();
    expect(result.toArray()).toEqual([]);
  });

  test('preserves the order of non-null values', () => {
    const series = new Series([5, null, 3, undefined, 1]);
    const result = series.dropna();
    expect(result.toArray()).toEqual([5, 3, 1]);
  });

  test('works with mixed data types', () => {
    const series = new Series([1, 'text', null, true, undefined]);
    const result = series.dropna();
    expect(result.toArray()).toEqual([1, 'text', true]);
  });

  test('works with direct function call', () => {
    // Регистрируем метод
    register(Series);
    const series = new Series([1, null, 3]);
    // Используем метод напрямую
    const result = series.dropna();
    expect(result.toArray()).toEqual([1, 3]);
  });
});
