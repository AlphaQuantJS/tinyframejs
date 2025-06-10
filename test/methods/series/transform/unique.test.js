import { describe, test, expect, beforeAll } from 'vitest';
import { Series } from '../../../../src/core/dataframe/Series.js';
import { register } from '../../../../src/methods/series/transform/unique.js';

describe('Series.unique', () => {
  beforeAll(() => {
    // Register the unique method on Series prototype
    register(Series);
  });

  test('returns unique values from a Series with duplicates', () => {
    const series = new Series([1, 2, 2, 3, 1, 4, 3, 5]);
    const unique = series.unique();
    expect(unique.toArray()).toEqual([1, 2, 3, 4, 5]);
  });

  test('preserves the original order of first occurrence', () => {
    const series = new Series(['apple', 'banana', 'apple', 'orange', 'banana', 'grape']);
    const unique = series.unique();
    expect(unique.toArray()).toEqual(['apple', 'banana', 'orange', 'grape']);
  });

  test('handles null and undefined values (keeps them by default)', () => {
    const series = new Series([1, null, 2, undefined, null, 3, undefined]);
    const unique = series.unique();
    // Only one null and one undefined should be kept
    expect(unique.toArray()).toEqual([1, null, 2, undefined, 3]);
  });

  test('can exclude null and undefined values when keepNull is false', () => {
    const series = new Series([1, null, 2, undefined, null, 3, undefined]);
    const unique = series.unique({ keepNull: false });
    expect(unique.toArray()).toEqual([1, 2, 3]);
  });

  test('handles empty Series', () => {
    const series = new Series([]);
    const unique = series.unique();
    expect(unique.toArray()).toEqual([]);
  });

  test('handles Series with all duplicate values', () => {
    const series = new Series([42, 42, 42, 42]);
    const unique = series.unique();
    expect(unique.toArray()).toEqual([42]);
  });

  test('handles mixed types correctly', () => {
    const series = new Series([1, '1', true, 1, '1', true]);
    const unique = series.unique();
    expect(unique.toArray()).toEqual([1, '1', true]);
  });

  test('handles object values by comparing their string representation', () => {
    const obj1 = { id: 1 };
    const obj2 = { id: 2 };
    const obj3 = { id: 1 }; // Same content as obj1
    const series = new Series([obj1, obj2, obj3]);
    const unique = series.unique();
    // Should have only two objects since obj1 and obj3 have the same content
    expect(unique.toArray().length).toBe(2);
  });

  test('works with direct function call', () => {
    // Регистрируем метод
    register(Series);
    const series = new Series([1, 2, 2, 3, 1]);
    // Используем метод напрямую
    const unique = series.unique();
    expect(unique.toArray()).toEqual([1, 2, 3]);
  });
});
