import { describe, expect, test, beforeAll } from 'vitest';
import { Series } from '../../../../src/core/dataframe/Series';
import registerSeriesTimeSeries from '../../../../src/methods/timeseries/series/register';

// Register timeseries methods before tests
beforeAll(() => {
  registerSeriesTimeSeries(Series);
  console.log('Series timeseries methods registered successfully');
});

describe('Series.shift', () => {
  test('should shift values forward by default', () => {
    const series = Series.create([1, 2, 3, 4, 5], { name: 'values' });

    const result = series.shift();

    // Check that result is a Series
    expect(result).toBeInstanceOf(Series);

    // Check name
    expect(result.name).toBe('values');

    // Check values
    const values = result.toArray();
    expect(values).toEqual([null, 1, 2, 3, 4]);
  });

  test('should shift values forward with custom periods', () => {
    const series = Series.create([1, 2, 3, 4, 5], { name: 'values' });

    const result = series.shift(2);

    // Check values
    const values = result.toArray();
    expect(values).toEqual([null, null, 1, 2, 3]);
  });

  test('should shift values backward with negative periods', () => {
    const series = Series.create([1, 2, 3, 4, 5], { name: 'values' });

    const result = series.shift(-2);

    // Check values
    const values = result.toArray();
    expect(values).toEqual([3, 4, 5, null, null]);
  });

  test('should use custom fill value', () => {
    const series = Series.create([1, 2, 3, 4, 5], { name: 'values' });

    const result = series.shift(1, 0);

    // Check values
    const values = result.toArray();
    expect(values).toEqual([0, 1, 2, 3, 4]);
  });

  test('should return copy of series when shift is 0', () => {
    const series = Series.create([1, 2, 3, 4, 5], { name: 'values' });

    const result = series.shift(0);

    // Check values
    const values = result.toArray();
    expect(values).toEqual([1, 2, 3, 4, 5]);
  });

  test('should handle empty series', () => {
    const series = Series.create([], { name: 'empty' });

    const result = series.shift();

    expect(result).toBeInstanceOf(Series);
    expect(result.length).toBe(0);
  });
});

describe('Series.pctChange', () => {
  test('should calculate percentage change with default periods', () => {
    const series = Series.create([1, 2, 4, 8, 16], { name: 'values' });

    const result = series.pctChange();

    // Check that result is a Series
    expect(result).toBeInstanceOf(Series);

    // Check name
    expect(result.name).toBe('values_pct_change');

    // Check values
    const values = result.toArray();
    expect(values[0]).toBeNull(); // First value is always null
    expect(values[1]).toBeCloseTo((2 - 1) / 1); // 100%
    expect(values[2]).toBeCloseTo((4 - 2) / 2); // 100%
    expect(values[3]).toBeCloseTo((8 - 4) / 4); // 100%
    expect(values[4]).toBeCloseTo((16 - 8) / 8); // 100%
  });

  test('should calculate percentage change with custom periods', () => {
    const series = Series.create([1, 2, 4, 8, 16, 32], { name: 'values' });

    const result = series.pctChange(2);

    // Check values
    const values = result.toArray();
    expect(values[0]).toBeNull(); // First value is null
    expect(values[1]).toBeNull(); // Second value is null
    expect(values[2]).toBeCloseTo((4 - 1) / 1); // 300%
    expect(values[3]).toBeCloseTo((8 - 2) / 2); // 300%
    expect(values[4]).toBeCloseTo((16 - 4) / 4); // 300%
    expect(values[5]).toBeCloseTo((32 - 8) / 8); // 300%
  });

  test('should handle zero values by returning null', () => {
    const series = Series.create([0, 1, 0, 3, 4], { name: 'values' });

    const result = series.pctChange();

    // Check values
    const values = result.toArray();
    expect(values[0]).toBeNull(); // First value is always null
    expect(values[1]).toBeNull(); // Previous value is 0, should be null
    expect(values[2]).toBeNull(); // Previous value is 1, current is 0
    expect(values[3]).toBeNull(); // Previous value is 0, should be null
    expect(values[4]).toBeCloseTo((4 - 3) / 3); // ~33.3%
  });

  test('should handle NaN values', () => {
    const series = Series.create([1, NaN, 3, 4, 5], { name: 'values' });

    const result = series.pctChange();

    // Check values
    const values = result.toArray();
    expect(values[0]).toBeNull(); // First value is always null
    expect(values[1]).toBeNull(); // Current value is NaN
    expect(values[2]).toBeNull(); // Previous value is NaN
    expect(values[3]).toBeCloseTo((4 - 3) / 3); // ~33.3%
    expect(values[4]).toBeCloseTo((5 - 4) / 4); // 25%
  });

  test('should handle empty series', () => {
    const series = Series.create([], { name: 'empty' });

    const result = series.pctChange();

    expect(result).toBeInstanceOf(Series);
    expect(result.length).toBe(0);
  });
});
