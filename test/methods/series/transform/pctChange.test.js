import { describe, test, expect, beforeAll } from 'vitest';
import { Series } from '../../../../src/core/dataframe/Series.js';
import { register } from '../../../../src/methods/series/transform/pctChange.js';

describe('Series.pctChange', () => {
  beforeAll(() => {
    // Register the pctChange method on Series prototype
    register(Series);
  });

  test('calculates percentage changes between consecutive elements with default period', () => {
    const series = new Series([100, 110, 121, 133.1]);
    const result = series.pctChange();

    // First element is null, rest are percentage changes
    expect(result.toArray()[0]).toBe(null);
    expect(result.toArray()[1]).toBeCloseTo(0.1, 5); // (110-100)/100 = 0.1
    expect(result.toArray()[2]).toBeCloseTo(0.1, 5); // (121-110)/110 = 0.1
    expect(result.toArray()[3]).toBeCloseTo(0.1, 5); // (133.1-121)/121 ≈ 0.1
  });

  test('calculates percentage changes with custom period', () => {
    const series = new Series([100, 110, 121, 133.1, 146.41]);
    const result = series.pctChange({ periods: 2 });

    // First two elements are null, rest are percentage changes with lag 2
    expect(result.toArray()[0]).toBe(null);
    expect(result.toArray()[1]).toBe(null);
    expect(result.toArray()[2]).toBeCloseTo(0.21, 5); // (121-100)/100 = 0.21
    expect(result.toArray()[3]).toBeCloseTo(0.21, 5); // (133.1-110)/110 ≈ 0.21
    expect(result.toArray()[4]).toBeCloseTo(0.21, 5); // (146.41-121)/121 ≈ 0.21
  });

  test('handles null and undefined values (returns null for affected positions)', () => {
    const series = new Series([100, null, 120, undefined, 150]);
    const result = series.pctChange();

    expect(result.toArray()[0]).toBe(null);
    expect(result.toArray()[1]).toBe(null);
    expect(result.toArray()[2]).toBe(null);
    expect(result.toArray()[3]).toBe(null);
    expect(result.toArray()[4]).toBe(null);
  });

  test('handles division by zero (returns null)', () => {
    const series = new Series([0, 10, 0, 20]);
    const result = series.pctChange();

    expect(result.toArray()[0]).toBe(null);
    expect(result.toArray()[1]).toBe(null); // (10-0)/0 = Infinity, but we return null
    expect(result.toArray()[2]).toBeCloseTo(-1, 5); // (0-10)/10 = -1
    expect(result.toArray()[3]).toBe(null); // (20-0)/0 = Infinity, but we return null
  });

  test('handles custom fill value', () => {
    const series = new Series([100, 110, 121, 133.1]);
    const result = series.pctChange({ fill: 0 });

    expect(result.toArray()[0]).toBe(0); // First element is filled with 0
    expect(result.toArray()[1]).toBeCloseTo(0.1, 5);
    expect(result.toArray()[2]).toBeCloseTo(0.1, 5);
    expect(result.toArray()[3]).toBeCloseTo(0.1, 5);
  });

  test('throws error when periods is not a positive integer', () => {
    const series = new Series([100, 110, 121]);
    expect(() => series.pctChange({ periods: 0 })).toThrow(
      'Periods must be a positive integer',
    );
    expect(() => series.pctChange({ periods: -1 })).toThrow(
      'Periods must be a positive integer',
    );
    expect(() => series.pctChange({ periods: 1.5 })).toThrow(
      'Periods must be a positive integer',
    );
  });

  test('works with empty Series', () => {
    const series = new Series([]);
    const result = series.pctChange();
    expect(result.toArray()).toEqual([]);
  });

  test('handles Series with one element (returns null)', () => {
    const series = new Series([42]);
    const result = series.pctChange();
    expect(result.toArray()[0]).toBe(null);
  });

  test('handles negative values correctly', () => {
    const series = new Series([-10, -5, 0, 5]);
    const result = series.pctChange();

    expect(result.toArray()[0]).toBe(null);
    expect(result.toArray()[1]).toBeCloseTo(0.5, 5); // (-5-(-10))/(-10) = 0.5
    expect(result.toArray()[2]).toBeCloseTo(1, 5); // (0-(-5))/(-5) = 1
    expect(result.toArray()[3]).toBe(null); // (5-0)/0 = Infinity, but we return null
  });

  test('works with direct function call', () => {
    // Register the pctChange method on Series prototype
    register(Series);
    const series = new Series([100, 110, 121]);
    // Use the method directly
    const result = series.pctChange();

    expect(result.toArray()[0]).toBe(null);
    expect(result.toArray()[1]).toBeCloseTo(0.1, 5);
    expect(result.toArray()[2]).toBeCloseTo(0.1, 5);
  });
});
