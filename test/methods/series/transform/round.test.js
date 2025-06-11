import { describe, test, expect, beforeAll } from 'vitest';
import { Series } from '../../../../src/core/dataframe/Series.js';
import { register } from '../../../../src/methods/series/transform/round.js';

describe('Series.round', () => {
  beforeAll(() => {
    // Register the round method on Series prototype
    register(Series);
  });

  test('rounds values to nearest integer by default', () => {
    const series = new Series([1.4, 2.5, 3.6, 4.5]);
    const rounded = series.round();
    expect(rounded.toArray()).toEqual([1, 3, 4, 5]);
  });

  test('rounds to specified number of decimal places', () => {
    const series = new Series([1.234, 2.345, 3.456, 4.567]);
    const rounded = series.round(2);
    expect(rounded.toArray()).toEqual([1.23, 2.35, 3.46, 4.57]);
  });

  test('handles negative decimals', () => {
    const series = new Series([123, 456, 789]);
    const rounded = series.round(-2);
    expect(rounded.toArray()).toEqual([100, 500, 800]);
  });

  test('handles null and undefined values', () => {
    const series = new Series([1.5, null, 3.5, undefined]);
    const rounded = series.round();
    // Math.round(null) returns 0, Math.round(undefined) returns NaN
    expect(rounded.toArray()[0]).toBe(2);
    expect(rounded.toArray()[1]).toBe(0);
    expect(rounded.toArray()[2]).toBe(4);
    expect(isNaN(rounded.toArray()[3])).toBe(true);
  });

  test('handles empty Series', () => {
    const series = new Series([]);
    const rounded = series.round();
    expect(rounded.toArray()).toEqual([]);
  });

  test('preserves Series name', () => {
    const series = new Series([1.5, 2.5], { name: 'test_series' });
    const rounded = series.round();
    expect(rounded.name).toBe('test_series');
  });

  test('handles non-numeric strings', () => {
    const series = new Series(['1.5', '2.5', 'abc']);
    const rounded = series.round();
    expect(rounded.toArray()[0]).toBe(2);
    expect(rounded.toArray()[1]).toBe(3);
    expect(isNaN(rounded.toArray()[2])).toBe(true);
  });

  test('works with direct function call', () => {
    // Register the method
    register(Series);
    const series = new Series([1.1, 2.2, 3.3]);
    // Use the method directly
    const rounded = series.round();
    expect(rounded.toArray()).toEqual([1, 2, 3]);
  });
});
