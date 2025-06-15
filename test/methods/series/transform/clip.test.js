import { describe, test, expect, beforeAll } from 'vitest';
import { Series } from '../../../../src/core/dataframe/Series.js';
import { register } from '../../../../src/methods/series/transform/clip.js';

describe('Series.clip', () => {
  beforeAll(() => {
    // Register the clip method on Series prototype
    register(Series);
  });

  test('clips values below minimum', () => {
    const series = new Series([1, 2, 3, 4, 5]);
    const clipped = series.clip({ min: 3 });
    expect(clipped.toArray()).toEqual([3, 3, 3, 4, 5]);
  });

  test('clips values above maximum', () => {
    const series = new Series([1, 2, 3, 4, 5]);
    const clipped = series.clip({ max: 3 });
    expect(clipped.toArray()).toEqual([1, 2, 3, 3, 3]);
  });

  test('clips values between min and max', () => {
    const series = new Series([1, 2, 3, 4, 5]);
    const clipped = series.clip({ min: 2, max: 4 });
    expect(clipped.toArray()).toEqual([2, 2, 3, 4, 4]);
  });

  test('handles null and undefined values (leaves them unchanged)', () => {
    const series = new Series([1, null, 3, undefined, 5]);
    const clipped = series.clip({ min: 2, max: 4 });
    expect(clipped.toArray()).toEqual([2, null, 3, undefined, 4]);
  });

  test('handles non-numeric values (leaves them unchanged)', () => {
    const series = new Series([1, 'text', 3, true, 5]);
    const clipped = series.clip({ min: 2, max: 4 });
    expect(clipped.toArray()).toEqual([2, 'text', 3, true, 4]);
  });

  test('clips in place when inplace option is true', () => {
    const series = new Series([1, 2, 3, 4, 5]);
    const result = series.clip({ min: 2, max: 4, inplace: true });
    expect(series.toArray()).toEqual([2, 2, 3, 4, 4]);
    expect(result).toBe(series); // Should return the same instance
  });

  test('returns a new Series when inplace option is false (default)', () => {
    const series = new Series([1, 2, 3, 4, 5]);
    const clipped = series.clip({ min: 2, max: 4 });
    expect(series.toArray()).toEqual([1, 2, 3, 4, 5]); // Original unchanged
    expect(clipped.toArray()).toEqual([2, 2, 3, 4, 4]); // New Series with clipped values
    expect(clipped).not.toBe(series); // Should be a different instance
  });

  test('throws error when neither min nor max is provided', () => {
    const series = new Series([1, 2, 3]);
    expect(() => series.clip({})).toThrow(
      'At least one of min or max must be provided',
    );
  });

  test('works with empty Series', () => {
    const series = new Series([]);
    const clipped = series.clip({ min: 0, max: 10 });
    expect(clipped.toArray()).toEqual([]);
  });

  test('handles NaN values (leaves them unchanged)', () => {
    const series = new Series([1, NaN, 3, 5]);
    const clipped = series.clip({ min: 2, max: 4 });
    expect(clipped.toArray()[0]).toBe(2);
    expect(Number.isNaN(clipped.toArray()[1])).toBe(true);
    expect(clipped.toArray()[2]).toBe(3);
    expect(clipped.toArray()[3]).toBe(4);
  });

  test('works with direct function call', () => {
    // Register the clip method on Series prototype
    register(Series);
    const series = new Series([1, 2, 3, 4, 5]);
    // Use the method directly
    const clipped = series.clip({ min: 2, max: 4 });
    expect(clipped.toArray()).toEqual([2, 2, 3, 4, 4]);
  });
});
