import { describe, test, expect, beforeAll } from 'vitest';
import { Series } from '../../../../src/core/dataframe/Series.js';
import { register } from '../../../../src/methods/series/transform/apply.js';

describe('Series.apply', () => {
  beforeAll(() => {
    // Register the apply method on Series prototype
    register(Series);
  });

  test('applies function to each element in the Series', () => {
    const series = new Series([1, 2, 3, 4, 5]);
    const doubled = series.apply((x) => x * 2);
    expect(doubled.toArray()).toEqual([2, 4, 6, 8, 10]);
  });

  test('works the same as map method', () => {
    const series = new Series([1, 2, 3, 4, 5]);
    const applied = series.apply((x) => x * 3);
    const mapped = series.map((x) => x * 3);
    expect(applied.toArray()).toEqual(mapped.toArray());
  });

  test('handles null and undefined values', () => {
    const series = new Series([1, null, 3, undefined, 5]);
    const applied = series.apply((x) =>
      x === null || x === undefined ? 0 : x * 2,
    );
    expect(applied.toArray()).toEqual([2, 0, 6, 0, 10]);
  });

  test('handles empty Series', () => {
    const series = new Series([]);
    const applied = series.apply((x) => x * 2);
    expect(applied.toArray()).toEqual([]);
  });

  test('preserves Series name', () => {
    const series = new Series([1, 2, 3], { name: 'test_series' });
    const applied = series.apply((x) => x * 2);
    expect(applied.name).toBe('test_series');
  });

  test('works with non-numeric values', () => {
    const series = new Series(['apple', 'banana', 'cherry']);
    const applied = series.apply((x) => x.toUpperCase());
    expect(applied.toArray()).toEqual(['APPLE', 'BANANA', 'CHERRY']);
  });

  test('works with complex transformations', () => {
    const series = new Series([1, 2, 3, 4, 5]);
    const applied = series.apply((x) => {
      if (x % 2 === 0) return x * 10;
      return x;
    });
    expect(applied.toArray()).toEqual([1, 20, 3, 40, 5]);
  });

  test('works with direct function call', () => {
    // Register the method
    register(Series);
    const series = new Series([1, 2, 3]);
    // Use the method directly
    const applied = series.apply((x) => x * 3);
    expect(applied.toArray()).toEqual([3, 6, 9]);
  });
});
