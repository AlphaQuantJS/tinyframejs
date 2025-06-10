import { describe, test, expect, beforeAll } from 'vitest';
import { Series } from '../../../../src/core/dataframe/Series.js';
import { register } from '../../../../src/methods/series/transform/replace.js';

describe('Series.replace', () => {
  beforeAll(() => {
    // Register the replace method on Series prototype
    register(Series);
  });

  test('replaces exact values', () => {
    const series = new Series([1, 2, 3, 2, 4]);
    const replaced = series.replace(2, 99);
    expect(replaced.toArray()).toEqual([1, 99, 3, 99, 4]);
  });

  test('replaces string values', () => {
    const series = new Series(['apple', 'banana', 'apple', 'orange']);
    const replaced = series.replace('apple', 'pear');
    expect(replaced.toArray()).toEqual(['pear', 'banana', 'pear', 'orange']);
  });

  test('handles null and undefined values', () => {
    const series = new Series([1, null, 3, undefined, 5]);
    const replaced = series.replace(null, 0);
    expect(replaced.toArray()).toEqual([1, 0, 3, undefined, 5]);
  });

  test('replaces values using regex pattern', () => {
    const series = new Series(['apple', 'banana', 'apricot', 'orange']);
    const replaced = series.replace('^ap', 'fruit-', { regex: true });
    expect(replaced.toArray()).toEqual(['fruit-', 'banana', 'fruit-', 'orange']);
  });

  test('replaces in place when inplace option is true', () => {
    const series = new Series([1, 2, 3, 2, 4]);
    const result = series.replace(2, 99, { inplace: true });
    expect(series.toArray()).toEqual([1, 99, 3, 99, 4]);
    expect(result).toBe(series); // Should return the same instance
  });

  test('returns a new Series when inplace option is false (default)', () => {
    const series = new Series([1, 2, 3, 2, 4]);
    const replaced = series.replace(2, 99);
    expect(series.toArray()).toEqual([1, 2, 3, 2, 4]); // Original unchanged
    expect(replaced.toArray()).toEqual([1, 99, 3, 99, 4]); // New Series with replaced values
    expect(replaced).not.toBe(series); // Should be a different instance
  });

  test('throws error when oldValue is not provided', () => {
    const series = new Series([1, 2, 3]);
    expect(() => series.replace(undefined, 99)).toThrow('Old value must be provided');
  });

  test('throws error when newValue is not provided', () => {
    const series = new Series([1, 2, 3]);
    expect(() => series.replace(2, undefined)).toThrow('New value must be provided');
  });

  test('works with empty Series', () => {
    const series = new Series([]);
    const replaced = series.replace(1, 2);
    expect(replaced.toArray()).toEqual([]);
  });

  test('handles NaN values correctly', () => {
    const series = new Series([1, NaN, 3, NaN, 5]);
    const replaced = series.replace(NaN, 0);
    expect(replaced.toArray()).toEqual([1, 0, 3, 0, 5]);
  });

  test('works with direct function call', () => {
    // Регистрируем метод
    register(Series);
    const series = new Series([1, 2, 3, 2]);
    // Используем метод напрямую
    const replaced = series.replace(2, 99);
    expect(replaced.toArray()).toEqual([1, 99, 3, 99]);
  });
});
