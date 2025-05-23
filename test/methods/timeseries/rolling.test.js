import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../src/core/DataFrame.js';

describe('Rolling Window Functions', () => {
  // Sample data for testing
  const data = {
    columns: {
      date: [
        '2023-01-01',
        '2023-01-02',
        '2023-01-03',
        '2023-01-04',
        '2023-01-05',
        '2023-01-06',
        '2023-01-07',
        '2023-01-08',
        '2023-01-09',
        '2023-01-10',
      ],
      value: [10, 15, 20, 25, 30, 35, 40, 45, 50, 55],
      withNaN: [10, NaN, 20, 25, NaN, 35, 40, NaN, 50, 55],
    },
  };

  test('rolling should calculate rolling mean correctly', () => {
    const df = new DataFrame(data);

    // Test with window size 3
    const result = df.rolling({
      column: 'value',
      window: 3,
      method: 'mean',
    });

    // First two values should be NaN (not enough data for window)
    expect(isNaN(result[0])).toBe(true);
    expect(isNaN(result[1])).toBe(true);

    // Check calculated values
    expect(result[2]).toBeCloseTo((10 + 15 + 20) / 3);
    expect(result[3]).toBeCloseTo((15 + 20 + 25) / 3);
    expect(result[4]).toBeCloseTo((20 + 25 + 30) / 3);
    expect(result[9]).toBeCloseTo((45 + 50 + 55) / 3);
  });

  test('rolling should handle centered windows', () => {
    const df = new DataFrame(data);

    // Test with window size 3 and centered
    const result = df.rolling({
      column: 'value',
      window: 3,
      method: 'mean',
      center: true,
    });

    // First and last values should be NaN
    expect(isNaN(result[0])).toBe(true);
    expect(isNaN(result[9])).toBe(true);

    // Check centered values
    expect(result[1]).toBeCloseTo((10 + 15 + 20) / 3);
    expect(result[2]).toBeCloseTo((15 + 20 + 25) / 3);
    expect(result[8]).toBeCloseTo((45 + 50 + 55) / 3);
  });

  test('rolling should handle NaN values correctly', () => {
    const df = new DataFrame(data);

    // Test with column containing NaN values
    const result = df.rolling({
      column: 'withNaN',
      window: 3,
      method: 'mean',
    });

    // Check values with NaN in window
    expect(isNaN(result[0])).toBe(true);
    expect(isNaN(result[1])).toBe(true);
    expect(result[2]).toBeCloseTo((10 + 20) / 2); // Skip NaN
    expect(result[3]).toBeCloseTo((20 + 25) / 2); // Skip NaN
    expect(result[5]).toBeCloseTo((25 + 35) / 2); // Skip NaN
  });

  test('rolling should support different aggregation methods', () => {
    const df = new DataFrame(data);

    // Test sum method
    const sumResult = df.rolling({
      column: 'value',
      window: 3,
      method: 'sum',
    });
    expect(sumResult[2]).toBe(10 + 15 + 20);

    // Test min method
    const minResult = df.rolling({
      column: 'value',
      window: 3,
      method: 'min',
    });
    expect(minResult[2]).toBe(10);

    // Test max method
    const maxResult = df.rolling({
      column: 'value',
      window: 3,
      method: 'max',
    });
    expect(maxResult[2]).toBe(20);

    // Test median method
    const medianResult = df.rolling({
      column: 'value',
      window: 3,
      method: 'median',
    });
    expect(medianResult[2]).toBe(15);

    // Test std method
    const stdResult = df.rolling({
      column: 'value',
      window: 3,
      method: 'std',
    });
    expect(stdResult[2]).toBeCloseTo(5);

    // Test var method
    const varResult = df.rolling({
      column: 'value',
      window: 3,
      method: 'var',
    });
    expect(varResult[2]).toBeCloseTo(25);

    // Test count method
    const countResult = df.rolling({
      column: 'withNaN',
      window: 3,
      method: 'count',
    });
    expect(countResult[2]).toBe(2); // 10, NaN, 20 -> count of non-NaN is 2
  });

  test('rolling should support custom aggregation functions', () => {
    const df = new DataFrame(data);

    // Test custom function (range = max - min)
    const customResult = df.rolling({
      column: 'value',
      window: 3,
      method: 'custom',
      customFn: (values) => {
        const filteredValues = values.filter((v) => !isNaN(v));
        return Math.max(...filteredValues) - Math.min(...filteredValues);
      },
    });

    expect(customResult[2]).toBe(20 - 10);
    expect(customResult[3]).toBe(25 - 15);
  });

  test('rollingApply should create a new DataFrame with rolling values', () => {
    const df = new DataFrame(data);

    // Apply rolling mean
    const newDf = df.rollingApply({
      column: 'value',
      window: 3,
      method: 'mean',
    });

    // Check that original columns are preserved
    expect(newDf.columns).toContain('date');
    expect(newDf.columns).toContain('value');
    expect(newDf.columns).toContain('withNaN');

    // Check that new column is added
    expect(newDf.columns).toContain('value_mean_3');

    // Check values in new column
    const rollingValues = newDf.frame.columns['value_mean_3'];
    expect(isNaN(rollingValues[0])).toBe(true);
    expect(isNaN(rollingValues[1])).toBe(true);
    expect(rollingValues[2]).toBeCloseTo((10 + 15 + 20) / 3);
  });

  test('rollingApply should allow custom target column name', () => {
    const df = new DataFrame(data);

    // Apply rolling mean with custom target column
    const newDf = df.rollingApply({
      column: 'value',
      window: 3,
      method: 'mean',
      targetColumn: 'rolling_avg',
    });

    // Check that new column is added with custom name
    expect(newDf.columns).toContain('rolling_avg');

    // Check values in new column
    const rollingValues = newDf.frame.columns['rolling_avg'];
    expect(rollingValues[2]).toBeCloseTo((10 + 15 + 20) / 3);
  });

  test('ewma should calculate exponentially weighted moving average', () => {
    const df = new DataFrame(data);

    // Apply EWMA with alpha = 0.5
    const newDf = df.ewma({
      column: 'value',
      alpha: 0.5,
    });

    // Check that new column is added
    expect(newDf.columns).toContain('value_ewma');

    // Check EWMA values
    const ewmaValues = newDf.frame.columns['value_ewma'];
    expect(ewmaValues[0]).toBe(10); // First value is the original value

    // Manual calculation for verification
    // ewma[1] = 0.5 * 15 + 0.5 * 10 = 12.5
    expect(ewmaValues[1]).toBeCloseTo(12.5);

    // ewma[2] = 0.5 * 20 + 0.5 * 12.5 = 16.25
    expect(ewmaValues[2]).toBeCloseTo(16.25);
  });

  test('ewma should handle NaN values correctly', () => {
    const df = new DataFrame(data);

    // Apply EWMA to column with NaN values
    const newDf = df.ewma({
      column: 'withNaN',
      alpha: 0.5,
    });

    const ewmaValues = newDf.frame.columns['withNaN_ewma'];

    // First value
    expect(ewmaValues[0]).toBe(10);

    // NaN value should use previous value
    expect(ewmaValues[1]).toBe(10);

    // Next value after NaN
    // ewma[2] = 0.5 * 20 + 0.5 * 10 = 15
    expect(ewmaValues[2]).toBeCloseTo(15);
  });

  test('ewma should allow custom target column name', () => {
    const df = new DataFrame(data);

    // Apply EWMA with custom target column
    const newDf = df.ewma({
      column: 'value',
      alpha: 0.3,
      targetColumn: 'smoothed_values',
    });

    // Check that new column is added with custom name
    expect(newDf.columns).toContain('smoothed_values');
  });
});
