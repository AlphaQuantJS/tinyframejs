import { describe, test, expect, beforeAll } from 'vitest';
import { Series } from '../../../../src/core/dataframe/Series.js';
import { register } from '../../../../src/methods/series/transform/diff.js';

describe('Series.diff', () => {
  beforeAll(() => {
    // Register the diff method on Series prototype
    register(Series);
  });

  test('calculates differences between consecutive elements with default period', () => {
    const series = new Series([1, 2, 4, 7, 11]);
    const result = series.diff();
    
    // First element is NaN, rest are differences
    expect(Number.isNaN(result.toArray()[0])).toBe(true);
    expect(result.toArray().slice(1)).toEqual([1, 2, 3, 4]);
  });

  test('calculates differences with custom period', () => {
    const series = new Series([1, 2, 4, 7, 11, 16]);
    const result = series.diff({ periods: 2 });
    
    // First two elements are NaN, rest are differences with lag 2
    expect(Number.isNaN(result.toArray()[0])).toBe(true);
    expect(Number.isNaN(result.toArray()[1])).toBe(true);
    expect(result.toArray().slice(2)).toEqual([3, 5, 7, 9]);
  });

  test('handles null and undefined values (returns NaN for affected positions)', () => {
    const series = new Series([1, null, 3, undefined, 5]);
    const result = series.diff();
    
    expect(Number.isNaN(result.toArray()[0])).toBe(true);
    expect(Number.isNaN(result.toArray()[1])).toBe(true);
    expect(Number.isNaN(result.toArray()[2])).toBe(true);
    expect(Number.isNaN(result.toArray()[3])).toBe(true);
    expect(Number.isNaN(result.toArray()[4])).toBe(true);
  });

  test('handles non-numeric values (returns NaN for affected positions)', () => {
    const series = new Series([1, 'text', 3, true, 5]);
    const result = series.diff();
    
    expect(Number.isNaN(result.toArray()[0])).toBe(true);
    expect(Number.isNaN(result.toArray()[1])).toBe(true);
    expect(Number.isNaN(result.toArray()[2])).toBe(true);
    expect(Number.isNaN(result.toArray()[3])).toBe(true);
    expect(Number.isNaN(result.toArray()[4])).toBe(true); // В нашей реализации строки не преобразуются в числа
  });

  test('throws error when periods is not a positive integer', () => {
    const series = new Series([1, 2, 3]);
    expect(() => series.diff({ periods: 0 })).toThrow('Periods must be a positive integer');
    expect(() => series.diff({ periods: -1 })).toThrow('Periods must be a positive integer');
    expect(() => series.diff({ periods: 1.5 })).toThrow('Periods must be a positive integer');
  });

  test('works with empty Series', () => {
    const series = new Series([]);
    const result = series.diff();
    expect(result.toArray()).toEqual([]);
  });

  test('handles Series with one element (returns NaN)', () => {
    const series = new Series([42]);
    const result = series.diff();
    expect(Number.isNaN(result.toArray()[0])).toBe(true);
  });

  test('handles NaN values (returns NaN for affected positions)', () => {
    const series = new Series([1, NaN, 3, 5]);
    const result = series.diff();
    
    expect(Number.isNaN(result.toArray()[0])).toBe(true);
    expect(Number.isNaN(result.toArray()[1])).toBe(true);
    expect(Number.isNaN(result.toArray()[2])).toBe(true);
    expect(result.toArray()[3]).toBe(2); // 5 - 3 = 2
  });

  test('works with direct function call', () => {
    // Регистрируем метод
    register(Series);
    const series = new Series([1, 2, 4, 7]);
    // Используем метод напрямую
    const result = series.diff();
    
    expect(Number.isNaN(result.toArray()[0])).toBe(true);
    expect(result.toArray().slice(1)).toEqual([1, 2, 3]);
  });
});
