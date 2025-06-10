import { describe, test, expect, beforeAll } from 'vitest';
import { Series } from '../../../../src/core/dataframe/Series.js';
import { matches, register } from '../../../../src/methods/series/filtering/matches.js';

describe('Series.matches', () => {
  // Register the method before running tests
  beforeAll(() => {
    register(Series);
  });
  test('filters string values that match the specified RegExp pattern', () => {
    const series = new Series(['apple', 'banana', 'cherry', 'date', '123', 'abc123']);
    const filtered = series.matches(/^[a-c]/);
    expect(filtered.toArray()).toEqual(['apple', 'banana', 'cherry', 'abc123']);
  });

  test('filters string values that match the specified string pattern', () => {
    const series = new Series(['apple', 'banana', 'cherry', 'date', '123', 'abc123']);
    const filtered = series.matches('^[a-c]');
    expect(filtered.toArray()).toEqual(['apple', 'banana', 'cherry', 'abc123']);
  });

  test('accepts RegExp flags when pattern is a string', () => {
    const series = new Series(['apple', 'banana', 'APPLE', 'Cherry', 'date']);
    const filtered = series.matches('^a', { flags: 'i' });
    expect(filtered.toArray()).toEqual(['apple', 'APPLE']);
  });

  test('handles non-string values by converting them to strings', () => {
    const series = new Series([123, 456, 789, 234]);
    const filtered = series.matches(/^2/);
    expect(filtered.toArray()).toEqual([234]);
  });

  test('filters out null and undefined values', () => {
    const series = new Series(['apple', null, 'banana', undefined, 'cherry']);
    const filtered = series.matches(/^[ab]/);
    expect(filtered.toArray()).toEqual(['apple', 'banana']);
  });

  test('returns empty Series when no values match the pattern', () => {
    const series = new Series(['apple', 'banana', 'cherry']);
    const filtered = series.matches(/^z/);
    expect(filtered.toArray()).toEqual([]);
  });

  test('handles empty Series', () => {
    const series = new Series([]);
    const filtered = series.matches(/^a/);
    expect(filtered.toArray()).toEqual([]);
  });

  test('throws error when pattern is not provided', () => {
    const series = new Series(['apple', 'banana', 'cherry']);
    expect(() => series.matches()).toThrow('Regular expression pattern must be provided');
    expect(() => series.matches(null)).toThrow('Regular expression pattern must be provided');
  });

  test('works with direct function call', () => {
    const matchesFunc = matches();
    const series = new Series(['apple', 'banana', 'cherry']);
    const filtered = matchesFunc.call(series, /^a/);
    expect(filtered.toArray()).toEqual(['apple']);
  });
});
