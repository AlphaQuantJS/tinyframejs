import { describe, test, expect, beforeAll } from 'vitest';
import { Series } from '../../../../src/core/dataframe/Series.js';
import {
  endsWith,
  register,
} from '../../../../src/methods/series/filtering/endsWith.js';

describe('Series.endsWith', () => {
  // Register the method before running tests
  beforeAll(() => {
    register(Series);
  });
  test('filters string values that end with the specified suffix (case sensitive)', () => {
    const series = new Series([
      'apple',
      'banana',
      'pineapple',
      'Orange',
      'grape',
    ]);
    const filtered = series.endsWith('e');
    // String.endsWith() returns true for 'Orange' with suffix 'e'
    expect(filtered.toArray()).toEqual([
      'apple',
      'pineapple',
      'Orange',
      'grape',
    ]);
  });

  test('filters string values that end with the specified suffix (case insensitive)', () => {
    const series = new Series([
      'apple',
      'banana',
      'pineapple',
      'Orange',
      'grape',
    ]);
    const filtered = series.endsWith('E', { caseSensitive: false });
    expect(filtered.toArray()).toEqual([
      'apple',
      'pineapple',
      'Orange',
      'grape',
    ]);
  });

  test('handles non-string values by converting them to strings', () => {
    const series = new Series([120, 125, 130, 135]);
    const filtered = series.endsWith('5');
    expect(filtered.toArray()).toEqual([125, 135]);
  });

  test('filters out null and undefined values', () => {
    const series = new Series(['apple', null, 'pineapple', undefined, 'grape']);
    const filtered = series.endsWith('e');
    expect(filtered.toArray()).toEqual(['apple', 'pineapple', 'grape']);
  });

  test('returns empty Series when no values end with the suffix', () => {
    const series = new Series(['apple', 'banana', 'cherry']);
    const filtered = series.endsWith('z');
    expect(filtered.toArray()).toEqual([]);
  });

  test('handles empty Series', () => {
    const series = new Series([]);
    const filtered = series.endsWith('a');
    expect(filtered.toArray()).toEqual([]);
  });

  test('throws error when suffix is not provided', () => {
    const series = new Series(['apple', 'banana', 'cherry']);
    expect(() => series.endsWith()).toThrow('Suffix must be provided');
    expect(() => series.endsWith(null)).toThrow('Suffix must be provided');
  });

  test('works with empty string suffix', () => {
    const series = new Series(['apple', 'banana', 'cherry']);
    const filtered = series.endsWith('');
    // Empty string is a suffix of all strings
    expect(filtered.toArray()).toEqual(['apple', 'banana', 'cherry']);
  });

  test('works with direct function call', () => {
    const endsWithFunc = endsWith();
    const series = new Series(['apple', 'banana', 'cherry']);
    const filtered = endsWithFunc.call(series, 'e');
    expect(filtered.toArray()).toEqual(['apple']);
  });
});
