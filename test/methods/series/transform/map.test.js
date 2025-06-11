import { describe, test, expect, beforeAll } from 'vitest';
import { Series } from '../../../../src/core/dataframe/Series.js';
import { register } from '../../../../src/methods/series/transform/map.js';

describe('Series.map', () => {
  beforeAll(() => {
    // Register the map method on Series prototype
    register(Series);
  });

  test('applies function to each element in the Series', () => {
    const series = new Series([1, 2, 3, 4, 5]);
    const doubled = series.map((x) => x * 2);
    expect(doubled.toArray()).toEqual([2, 4, 6, 8, 10]);
  });

  test('provides index as second argument to map function', () => {
    const series = new Series(['a', 'b', 'c', 'd']);
    const withIndices = series.map((val, idx) => `${val}${idx}`);
    expect(withIndices.toArray()).toEqual(['a0', 'b1', 'c2', 'd3']);
  });

  test('provides full array as third argument to map function', () => {
    const series = new Series([10, 20, 30, 40]);
    const withArrayAccess = series.map((val, idx, arr) => val + arr[0]);
    expect(withArrayAccess.toArray()).toEqual([20, 30, 40, 50]);
  });

  test('handles null and undefined values', () => {
    const series = new Series([1, null, 3, undefined, 5]);
    const mapped = series.map((x) =>
      x === null || x === undefined ? 0 : x * 2,
    );
    expect(mapped.toArray()).toEqual([2, 0, 6, 0, 10]);
  });

  test('handles empty Series', () => {
    const series = new Series([]);
    const mapped = series.map((x) => x * 2);
    expect(mapped.toArray()).toEqual([]);
  });

  test('preserves Series name', () => {
    const series = new Series([1, 2, 3], { name: 'test_series' });
    const mapped = series.map((x) => x * 2);
    expect(mapped.name).toBe('test_series');
  });

  test('works with non-numeric values', () => {
    const series = new Series(['apple', 'banana', 'cherry']);
    const mapped = series.map((x) => x.toUpperCase());
    expect(mapped.toArray()).toEqual(['APPLE', 'BANANA', 'CHERRY']);
  });

  test('works with direct function call', () => {
    // Register the method
    register(Series);
    const series = new Series([1, 2, 3]);
    // Use the method directly
    const mapped = series.map((x) => x * 3);
    expect(mapped.toArray()).toEqual([3, 6, 9]);
  });
});
