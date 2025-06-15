import { describe, test, expect, beforeAll } from 'vitest';
import { Series } from '../../../../src/core/dataframe/Series.js';
import { register } from '../../../../src/methods/series/transform/sort.js';

describe('Series.sort', () => {
  beforeAll(() => {
    // Register the sort method on Series prototype
    register(Series);
  });

  test('sorts numeric values in ascending order by default', () => {
    const series = new Series([5, 3, 1, 4, 2]);
    const sorted = series.sort();
    expect(sorted.toArray()).toEqual([1, 2, 3, 4, 5]);
  });

  test('sorts numeric values in descending order when specified', () => {
    const series = new Series([5, 3, 1, 4, 2]);
    const sorted = series.sort({ ascending: false });
    expect(sorted.toArray()).toEqual([5, 4, 3, 2, 1]);
  });

  test('sorts string values alphabetically', () => {
    const series = new Series(['banana', 'apple', 'orange', 'grape']);
    const sorted = series.sort();
    expect(sorted.toArray()).toEqual(['apple', 'banana', 'grape', 'orange']);
  });

  test('sorts string values in reverse alphabetical order when specified', () => {
    const series = new Series(['banana', 'apple', 'orange', 'grape']);
    const sorted = series.sort({ ascending: false });
    expect(sorted.toArray()).toEqual(['orange', 'grape', 'banana', 'apple']);
  });

  test('handles null and undefined values (they go to the end in ascending order)', () => {
    const series = new Series([5, null, 3, undefined, 1]);
    const sorted = series.sort();
    expect(sorted.toArray()).toEqual([1, 3, 5, null, undefined]);
  });

  test('handles null and undefined values (they go to the beginning in descending order)', () => {
    const series = new Series([5, null, 3, undefined, 1]);
    const sorted = series.sort({ ascending: false });
    expect(sorted.toArray()).toEqual([null, 5, 3, 1, undefined]);
  });

  test('sorts mixed types (numbers and strings)', () => {
    const series = new Series([5, '3', 1, '10', 2]);
    const sorted = series.sort();
    expect(sorted.toArray()).toEqual([1, 2, 5, '10', '3']);
  });

  test('sorts in place when inplace option is true', () => {
    const series = new Series([5, 3, 1, 4, 2]);
    const result = series.sort({ inplace: true });
    expect(series.toArray()).toEqual([1, 2, 3, 4, 5]);
    expect(result).toBe(series); // Should return the same instance
  });

  test('returns a new Series when inplace option is false (default)', () => {
    const series = new Series([5, 3, 1, 4, 2]);
    const sorted = series.sort();
    expect(series.toArray()).toEqual([5, 3, 1, 4, 2]); // Original unchanged
    expect(sorted.toArray()).toEqual([1, 2, 3, 4, 5]); // New Series with sorted values
    expect(sorted).not.toBe(series); // Should be a different instance
  });

  test('works with empty Series', () => {
    const series = new Series([]);
    const sorted = series.sort();
    expect(sorted.toArray()).toEqual([]);
  });

  test('works with direct function call', () => {
    // Register the sort method on Series prototype
    register(Series);
    const series = new Series([5, 3, 1, 4, 2]);
    // Use the method directly
    const sorted = series.sort();
    expect(sorted.toArray()).toEqual([1, 2, 3, 4, 5]);
  });
});
