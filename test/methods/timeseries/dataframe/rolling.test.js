// test/methods/timeseries/dataframe/rolling.test.js
import { describe, test, expect, beforeAll } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import rolling from '../../../../src/methods/timeseries/dataframe/rolling.js';
import registerDataFrameTimeSeries from '../../../../src/methods/timeseries/dataframe/register.js';

describe('rolling', () => {
  beforeAll(() => {
    // Register timeseries methods before tests
    registerDataFrameTimeSeries(DataFrame);
  });
  test('should calculate rolling window with default options', () => {
    const df = DataFrame.create({
      value: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    });

    const result = df.rolling({
      window: 3,
      aggregations: {
        value: (values) =>
          values.reduce((sum, val) => sum + val, 0) / values.length,
      },
    });

    // Check that original column is preserved
    expect(result.columns).toContain('value');

    // Check that rolling column was added
    expect(result.columns).toContain('value_rolling');

    // Check values (first two should be null because window size is 3)
    const rollingValues = result.col('value_rolling').toArray();
    expect(rollingValues[0]).toBeNull();
    expect(rollingValues[1]).toBeNull();
    expect(rollingValues[2]).toBeCloseTo((1 + 2 + 3) / 3);
    expect(rollingValues[3]).toBeCloseTo((2 + 3 + 4) / 3);
    expect(rollingValues[4]).toBeCloseTo((3 + 4 + 5) / 3);
    expect(rollingValues[9]).toBeCloseTo((8 + 9 + 10) / 3);
  });

  test('should calculate rolling window with centered option', () => {
    const df = DataFrame.create({
      value: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    });

    const result = df.rolling({
      window: 3,
      center: true,
      aggregations: {
        value: (values) =>
          values.reduce((sum, val) => sum + val, 0) / values.length,
      },
    });

    // Check values (first and last should be null because of centering)
    const rollingValues = result.col('value_rolling').toArray();
    expect(rollingValues[0]).toBeNull();
    expect(rollingValues[1]).toBeCloseTo((1 + 2 + 3) / 3);
    expect(rollingValues[2]).toBeCloseTo((2 + 3 + 4) / 3);
    expect(rollingValues[8]).toBeCloseTo((8 + 9 + 10) / 3);
    expect(rollingValues[9]).toBeNull();
  });

  test('should handle minPeriods option', () => {
    const df = DataFrame.create({
      value: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    });

    const result = df.rolling({
      window: 3,
      minPeriods: 2, // Only require 2 observations instead of full window
      aggregations: {
        value: (values) =>
          values.reduce((sum, val) => sum + val, 0) / values.length,
      },
    });

    // Check values (first should be null, second should have value)
    const rollingValues = result.col('value_rolling').toArray();
    expect(rollingValues[0]).toBeNull();
    expect(rollingValues[1]).toBeCloseTo((1 + 2) / 2);
    expect(rollingValues[2]).toBeCloseTo((1 + 2 + 3) / 3);
  });

  test('should handle multiple column aggregations', () => {
    const df = DataFrame.create({
      a: [1, 2, 3, 4, 5],
      b: [10, 20, 30, 40, 50],
    });

    const result = df.rolling({
      window: 2,
      aggregations: {
        a: (values) => values.reduce((sum, val) => sum + val, 0),
        b: (values) => Math.max(...values),
      },
    });

    // Check that both original columns are preserved
    expect(result.columns).toContain('a');
    expect(result.columns).toContain('b');

    // Check that both rolling columns were added
    expect(result.columns).toContain('a_rolling');
    expect(result.columns).toContain('b_rolling');

    // Check values for column a (sum)
    const rollingA = result.col('a_rolling').toArray();
    expect(rollingA[0]).toBeNull();
    expect(rollingA[1]).toBe(1 + 2);
    expect(rollingA[2]).toBe(2 + 3);
    expect(rollingA[4]).toBe(4 + 5);

    // Check values for column b (max)
    const rollingB = result.col('b_rolling').toArray();
    expect(rollingB[0]).toBeNull();
    expect(rollingB[1]).toBe(20);
    expect(rollingB[2]).toBe(30);
    expect(rollingB[4]).toBe(50);
  });

  test('should handle NaN values correctly', () => {
    const df = DataFrame.create({
      value: [1, NaN, 3, 4, NaN, 6],
    });

    const result = df.rolling({
      window: 3,
      minPeriods: 1, // Require minimum 1 value in window instead of 3 (default)
      aggregations: {
        value: (values) => {
          // Proper handling of NaN values in the aggregation function
          if (values.length === 0) return null;
          return values.reduce((sum, val) => sum + val, 0) / values.length;
        },
      },
    });

    const rollingValues = result.col('value_rolling').toArray();

    // With minPeriods=1, first values will contain average of available values
    expect(rollingValues[0]).toBe(1); // Only one value [1]
    expect(rollingValues[1]).toBe(1); // Only one value [1] (NaN is filtered out)

    // Window [1, NaN, 3] should filter NaN and calculate average of [1, 3]
    expect(rollingValues[2]).toBeCloseTo((1 + 3) / 2);

    // Window [NaN, 3, 4] should filter NaN and calculate average of [3, 4]
    expect(rollingValues[3]).toBeCloseTo((3 + 4) / 2);

    // Window [3, 4, NaN] should filter NaN and calculate average of [3, 4]
    expect(rollingValues[4]).toBeCloseTo((3 + 4) / 2);

    // Window [4, NaN, 6] should filter NaN and calculate average of [4, 6]
    expect(rollingValues[5]).toBeCloseTo((4 + 6) / 2);
  });

  test('should throw error for invalid options', () => {
    const df = DataFrame.create({
      value: [1, 2, 3, 4, 5],
    });

    // Invalid window size
    expect(() =>
      df.rolling({
        window: 0,
        aggregations: { value: (arr) => arr[0] },
      }),
    ).toThrow();

    expect(() =>
      df.rolling({
        window: -1,
        aggregations: { value: (arr) => arr[0] },
      }),
    ).toThrow();

    expect(() =>
      df.rolling({
        window: 'invalid',
        aggregations: { value: (arr) => arr[0] },
      }),
    ).toThrow();

    // Missing aggregations
    expect(() =>
      df.rolling({
        window: 3,
      }),
    ).toThrow();

    // Invalid column name
    expect(() =>
      df.rolling({
        window: 3,
        aggregations: { nonexistent: (arr) => arr[0] },
      }),
    ).toThrow();
  });
});
