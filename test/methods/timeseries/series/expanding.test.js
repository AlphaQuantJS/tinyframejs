import { describe, expect, test, beforeAll } from 'vitest';
import { Series } from '../../../../src/core/dataframe/Series';
import registerSeriesTimeSeries from '../../../../src/methods/timeseries/series/register';

// Register timeseries methods before tests
beforeAll(() => {
  registerSeriesTimeSeries(Series);
  console.log('Series timeseries methods registered successfully');
});

describe('Series.expanding', () => {
  test('should apply expanding window with mean aggregation', () => {
    const series = Series.create([1, 2, 3, 4, 5], { name: 'values' });

    const result = series.expanding({
      aggregation: (values) =>
        values.reduce((sum, v) => sum + v, 0) / values.length,
    });

    // Check that result is a Series
    expect(result).toBeInstanceOf(Series);

    // Check name
    expect(result.name).toBe('values_expanding');

    // Check values
    const values = result.toArray();
    expect(values[0]).toBeCloseTo(1); // Just the first value
    expect(values[1]).toBeCloseTo((1 + 2) / 2); // First two values
    expect(values[2]).toBeCloseTo((1 + 2 + 3) / 3); // First three values
    expect(values[3]).toBeCloseTo((1 + 2 + 3 + 4) / 4); // First four values
    expect(values[4]).toBeCloseTo((1 + 2 + 3 + 4 + 5) / 5); // All values
  });

  test('should apply expanding window with custom minPeriods', () => {
    const series = Series.create([1, 2, 3, 4, 5], { name: 'values' });

    const result = series.expanding({
      minPeriods: 3,
      aggregation: (values) =>
        values.reduce((sum, v) => sum + v, 0) / values.length,
    });

    // Check values
    const values = result.toArray();
    expect(values[0]).toBeNull(); // Not enough values for minPeriods
    expect(values[1]).toBeNull(); // Not enough values for minPeriods
    expect(values[2]).toBeCloseTo((1 + 2 + 3) / 3); // First three values (enough for minPeriods)
    expect(values[3]).toBeCloseTo((1 + 2 + 3 + 4) / 4); // First four values
    expect(values[4]).toBeCloseTo((1 + 2 + 3 + 4 + 5) / 5); // All values
  });

  test('should handle empty series', () => {
    const series = Series.create([], { name: 'empty' });

    const result = series.expanding({
      aggregation: (values) =>
        values.reduce((sum, v) => sum + v, 0) / values.length,
    });

    expect(result).toBeInstanceOf(Series);
    expect(result.length).toBe(0);
  });

  test('should throw error for invalid options', () => {
    const series = Series.create([1, 2, 3, 4, 5]);

    // Missing aggregation
    expect(() => series.expanding({})).toThrow(
      'aggregation must be a function',
    );

    // Invalid aggregation
    expect(() =>
      series.expanding({
        aggregation: 'not a function',
      }),
    ).toThrow('aggregation must be a function');
  });

  test('should handle NaN and null values', () => {
    const series = Series.create([1, NaN, null, 4, 5], { name: 'values' });

    const result = series.expanding({
      aggregation: (values) =>
        values.reduce((sum, v) => sum + v, 0) / values.length,
    });

    // Check values - NaN and null should be filtered out
    const values = result.toArray();
    expect(values[0]).toBeCloseTo(1); // Just the first value
    expect(values[1]).toBeCloseTo(1); // Only the first value (NaN filtered out)
    expect(values[2]).toBeCloseTo(1); // Only the first value (null filtered out)
    expect(values[3]).toBeCloseTo((1 + 4) / 2); // First and fourth values
    expect(values[4]).toBeCloseTo((1 + 4 + 5) / 3); // First, fourth, and fifth values
  });
});
