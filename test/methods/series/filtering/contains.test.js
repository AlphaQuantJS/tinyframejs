import { describe, test, expect, beforeAll } from 'vitest';
import { Series } from '../../../../src/core/dataframe/Series.js';
import { contains, register } from '../../../../src/methods/series/filtering/contains.js';

describe('Series.contains', () => {
  // Register the method before running tests
  beforeAll(() => {
    register(Series);
  });
  test('filters string values that contain the specified substring (case sensitive)', () => {
    const series = new Series(['apple', 'banana', 'cherry', 'Apple', 'date']);
    const filtered = series.contains('a');
    expect(filtered.toArray()).toEqual(['apple', 'banana', 'date']);
  });

  test('filters string values that contain the specified substring (case insensitive)', () => {
    const series = new Series(['apple', 'banana', 'cherry', 'Apple', 'date']);
    const filtered = series.contains('a', { caseSensitive: false });
    expect(filtered.toArray()).toEqual(['apple', 'banana', 'Apple', 'date']);
  });

  test('handles non-string values by converting them to strings', () => {
    const series = new Series([123, 456, 789, 1234]);
    const filtered = series.contains('23');
    expect(filtered.toArray()).toEqual([123, 1234]);
  });

  test('filters out null and undefined values', () => {
    const series = new Series(['apple', null, 'banana', undefined, 'cherry']);
    const filtered = series.contains('a');
    expect(filtered.toArray()).toEqual(['apple', 'banana']);
  });

  test('returns empty Series when no values contain the substring', () => {
    const series = new Series(['apple', 'banana', 'cherry']);
    const filtered = series.contains('z');
    expect(filtered.toArray()).toEqual([]);
  });

  test('handles empty Series', () => {
    const series = new Series([]);
    const filtered = series.contains('a');
    expect(filtered.toArray()).toEqual([]);
  });

  test('throws error when substring is not provided', () => {
    const series = new Series(['apple', 'banana', 'cherry']);
    expect(() => series.contains()).toThrow('Substring must be provided');
    expect(() => series.contains(null)).toThrow('Substring must be provided');
  });

  test('works with empty string substring', () => {
    const series = new Series(['apple', 'banana', 'cherry']);
    const filtered = series.contains('');
    // Empty string is contained in all strings
    expect(filtered.toArray()).toEqual(['apple', 'banana', 'cherry']);
  });

  test('works with direct function call', () => {
    const containsFunc = contains();
    const series = new Series(['apple', 'banana', 'cherry']);
    const filtered = containsFunc.call(series, 'a');
    expect(filtered.toArray()).toEqual(['apple', 'banana']);
  });
});
