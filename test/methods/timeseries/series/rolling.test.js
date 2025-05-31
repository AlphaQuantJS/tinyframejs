import { describe, expect, test, beforeAll } from 'vitest';
import { Series } from '../../../../src/core/dataframe/Series';
import registerSeriesTimeSeries from '../../../../src/methods/timeseries/series/register';

// Register timeseries methods before tests
beforeAll(() => {
  registerSeriesTimeSeries(Series);
  console.log('Series timeseries methods registered successfully');
});

describe('Series.rolling', () => {
  test('should apply rolling window with mean aggregation', () => {
    const series = Series.create([1, 2, 3, 4, 5], { name: 'values' });

    const result = series.rolling({
      window: 3,
      aggregation: (values) =>
        values.reduce((sum, v) => sum + v, 0) / values.length,
    });

    // Check that result is a Series
    expect(result).toBeInstanceOf(Series);

    // Check name
    expect(result.name).toBe('values_rolling');

    // Check values
    const values = result.toArray();
    expect(values[0]).toBeNull(); // Not enough values for window
    expect(values[1]).toBeNull(); // Not enough values for window
    expect(values[2]).toBeCloseTo((1 + 2 + 3) / 3); // First complete window
    expect(values[3]).toBeCloseTo((2 + 3 + 4) / 3);
    expect(values[4]).toBeCloseTo((3 + 4 + 5) / 3);
  });

  test('should apply rolling window with custom minPeriods', () => {
    const series = Series.create([1, 2, 3, 4, 5], { name: 'values' });

    const result = series.rolling({
      window: 3,
      minPeriods: 2,
      aggregation: (values) =>
        values.reduce((sum, v) => sum + v, 0) / values.length,
    });

    // Check values
    const values = result.toArray();
    expect(values[0]).toBeNull(); // Not enough values for minPeriods
    expect(values[1]).toBeCloseTo((1 + 2) / 2); // Enough for minPeriods
    expect(values[2]).toBeCloseTo((1 + 2 + 3) / 3);
    expect(values[3]).toBeCloseTo((2 + 3 + 4) / 3);
    expect(values[4]).toBeCloseTo((3 + 4 + 5) / 3);
  });

  test('should handle empty series', () => {
    const series = Series.create([], { name: 'empty' });

    const result = series.rolling({
      window: 3,
      aggregation: (values) =>
        values.reduce((sum, v) => sum + v, 0) / values.length,
    });

    expect(result).toBeInstanceOf(Series);
    expect(result.length).toBe(0);
  });

  test('should throw error for invalid options', () => {
    const series = Series.create([1, 2, 3, 4, 5]);

    // Missing window
    expect(() =>
      series.rolling({
        aggregation: (values) =>
          values.reduce((sum, v) => sum + v, 0) / values.length,
      }),
    ).toThrow('window must be a positive number');

    // Invalid window
    expect(() =>
      series.rolling({
        window: -1,
        aggregation: (values) =>
          values.reduce((sum, v) => sum + v, 0) / values.length,
      }),
    ).toThrow('window must be a positive number');

    // Missing aggregation
    expect(() =>
      series.rolling({
        window: 3,
      }),
    ).toThrow('aggregation must be a function');

    // Invalid aggregation
    expect(() =>
      series.rolling({
        window: 3,
        aggregation: 'not a function',
      }),
    ).toThrow('aggregation must be a function');
  });
});
