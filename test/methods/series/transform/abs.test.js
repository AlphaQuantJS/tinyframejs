import { describe, test, expect, beforeAll } from 'vitest';
import { Series } from '../../../../src/core/dataframe/Series.js';
import { register } from '../../../../src/methods/series/transform/abs.js';

describe('Series.abs', () => {
  beforeAll(() => {
    // Register the abs method on Series prototype
    register(Series);
  });

  test('returns absolute values of all elements', () => {
    const series = new Series([-1, 2, -3, 4, -5]);
    const absolute = series.abs();
    expect(absolute.toArray()).toEqual([1, 2, 3, 4, 5]);
  });

  test('leaves positive values unchanged', () => {
    const series = new Series([1, 2, 3, 4, 5]);
    const absolute = series.abs();
    expect(absolute.toArray()).toEqual([1, 2, 3, 4, 5]);
  });

  test('converts zero to zero', () => {
    const series = new Series([-0, 0]);
    const absolute = series.abs();
    expect(absolute.toArray()).toEqual([0, 0]);
  });

  test('handles null and undefined values', () => {
    const series = new Series([-1, null, -3, undefined, -5]);
    const absolute = series.abs();
    // Math.abs(null) returns 0, Math.abs(undefined) returns NaN
    expect(absolute.toArray()[0]).toBe(1);
    expect(absolute.toArray()[1]).toBe(0);
    expect(absolute.toArray()[2]).toBe(3);
    expect(isNaN(absolute.toArray()[3])).toBe(true);
    expect(absolute.toArray()[4]).toBe(5);
  });

  test('handles empty Series', () => {
    const series = new Series([]);
    const absolute = series.abs();
    expect(absolute.toArray()).toEqual([]);
  });

  test('preserves Series name', () => {
    const series = new Series([-1, -2, -3], { name: 'test_series' });
    const absolute = series.abs();
    expect(absolute.name).toBe('test_series');
  });

  test('handles non-numeric strings', () => {
    const series = new Series(['-1', '-2', 'abc']);
    const absolute = series.abs();
    expect(absolute.toArray()[0]).toBe(1);
    expect(absolute.toArray()[1]).toBe(2);
    expect(isNaN(absolute.toArray()[2])).toBe(true);
  });

  test('works with direct function call', () => {
    // Register the method
    register(Series);
    const series = new Series([-1, -2, -3]);
    // Use the method directly
    const absolute = series.abs();
    expect(absolute.toArray()).toEqual([1, 2, 3]);
  });
});
