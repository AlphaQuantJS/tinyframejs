import { describe, test, expect, beforeAll } from 'vitest';
import { Series } from '../../../../src/core/dataframe/Series.js';
import {
  startsWith,
  register,
} from '../../../../src/methods/series/filtering/startsWith.js';

describe('Series.startsWith', () => {
  // Register the method before running tests
  beforeAll(() => {
    register(Series);
  });
  test('filters string values that start with the specified prefix (case sensitive)', () => {
    const series = new Series(['apple', 'banana', 'apricot', 'Apple', 'date']);
    const filtered = series.startsWith('a');
    expect(filtered.toArray()).toEqual(['apple', 'apricot']);
  });

  test('filters string values that start with the specified prefix (case insensitive)', () => {
    const series = new Series(['apple', 'banana', 'apricot', 'Apple', 'date']);
    const filtered = series.startsWith('a', { caseSensitive: false });
    expect(filtered.toArray()).toEqual(['apple', 'apricot', 'Apple']);
  });

  test('handles non-string values by converting them to strings', () => {
    const series = new Series([123, 456, 789, 234]);
    const filtered = series.startsWith('12');
    expect(filtered.toArray()).toEqual([123]);
  });

  test('filters out null and undefined values', () => {
    const series = new Series(['apple', null, 'apricot', undefined, 'banana']);
    const filtered = series.startsWith('a');
    expect(filtered.toArray()).toEqual(['apple', 'apricot']);
  });

  test('returns empty Series when no values start with the prefix', () => {
    const series = new Series(['apple', 'banana', 'cherry']);
    const filtered = series.startsWith('z');
    expect(filtered.toArray()).toEqual([]);
  });

  test('handles empty Series', () => {
    const series = new Series([]);
    const filtered = series.startsWith('a');
    expect(filtered.toArray()).toEqual([]);
  });

  test('throws error when prefix is not provided', () => {
    const series = new Series(['apple', 'banana', 'cherry']);
    expect(() => series.startsWith()).toThrow('Prefix must be provided');
    expect(() => series.startsWith(null)).toThrow('Prefix must be provided');
  });

  test('works with empty string prefix', () => {
    const series = new Series(['apple', 'banana', 'cherry']);
    const filtered = series.startsWith('');
    // Empty string is a prefix of all strings
    expect(filtered.toArray()).toEqual(['apple', 'banana', 'cherry']);
  });

  test('works with direct function call', () => {
    const startsWithFunc = startsWith();
    const series = new Series(['apple', 'banana', 'cherry']);
    const filtered = startsWithFunc.call(series, 'a');
    expect(filtered.toArray()).toEqual(['apple']);
  });
});
