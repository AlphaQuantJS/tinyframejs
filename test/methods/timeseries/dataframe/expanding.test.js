import { describe, expect, test, beforeAll } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame';
import registerDataFrameTimeSeries from '../../../../src/methods/timeseries/dataframe/register';

// Register timeseries methods before tests
beforeAll(() => {
  registerDataFrameTimeSeries(DataFrame);
  console.log('Apache Arrow integration initialized successfully');
});

describe('expanding', () => {
  test('should calculate expanding window with default options', () => {
    const df = DataFrame.create({
      value: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    });

    const result = df.expanding({
      aggregations: {
        value: (values) =>
          values.reduce((sum, val) => sum + val, 0) / values.length,
      },
    });

    const expandingValues = result.col('value_expanding').toArray();

    // Check that all columns are preserved
    expect(result.columns).toContain('value');
    expect(result.columns).toContain('value_expanding');

    // Check aggregation results
    expect(expandingValues[0]).toBe(1); // [1]
    expect(expandingValues[1]).toBeCloseTo((1 + 2) / 2); // [1, 2]
    expect(expandingValues[2]).toBeCloseTo((1 + 2 + 3) / 3); // [1, 2, 3]
    expect(expandingValues[3]).toBeCloseTo((1 + 2 + 3 + 4) / 4); // [1, 2, 3, 4]
    expect(expandingValues[9]).toBeCloseTo(
      (1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 + 10) / 10,
    ); // [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  });

  test('should handle minPeriods option', () => {
    const df = DataFrame.create({
      value: [1, 2, 3, 4, 5],
    });

    const result = df.expanding({
      minPeriods: 3,
      aggregations: {
        value: (values) =>
          values.reduce((sum, val) => sum + val, 0) / values.length,
      },
    });

    const expandingValues = result.col('value_expanding').toArray();

    // First two values should be null since minPeriods = 3
    expect(expandingValues[0]).toBeNull();
    expect(expandingValues[1]).toBeNull();

    // Starting from the third value, we should have results
    expect(expandingValues[2]).toBeCloseTo((1 + 2 + 3) / 3);
    expect(expandingValues[3]).toBeCloseTo((1 + 2 + 3 + 4) / 4);
    expect(expandingValues[4]).toBeCloseTo((1 + 2 + 3 + 4 + 5) / 5);
  });

  test('should handle multiple column aggregations', () => {
    const df = DataFrame.create({
      A: [1, 2, 3, 4, 5],
      B: [10, 20, 30, 40, 50],
    });

    const result = df.expanding({
      aggregations: {
        A: (values) => values.reduce((sum, val) => sum + val, 0),
        B: (values) =>
          values.reduce((sum, val) => sum + val, 0) / values.length,
      },
    });

    const expandingA = result.col('A_expanding').toArray();
    const expandingB = result.col('B_expanding').toArray();

    // Check that all columns are preserved
    expect(result.columns).toContain('A');
    expect(result.columns).toContain('B');
    expect(result.columns).toContain('A_expanding');
    expect(result.columns).toContain('B_expanding');

    // Check aggregation results for column A (sum)
    expect(expandingA[0]).toBe(1);
    expect(expandingA[1]).toBe(1 + 2);
    expect(expandingA[2]).toBe(1 + 2 + 3);
    expect(expandingA[3]).toBe(1 + 2 + 3 + 4);
    expect(expandingA[4]).toBe(1 + 2 + 3 + 4 + 5);

    // Check aggregation results for column B (average)
    expect(expandingB[0]).toBe(10);
    expect(expandingB[1]).toBeCloseTo((10 + 20) / 2);
    expect(expandingB[2]).toBeCloseTo((10 + 20 + 30) / 3);
    expect(expandingB[3]).toBeCloseTo((10 + 20 + 30 + 40) / 4);
    expect(expandingB[4]).toBeCloseTo((10 + 20 + 30 + 40 + 50) / 5);
  });

  test('should handle NaN values correctly', () => {
    const df = DataFrame.create({
      value: [1, NaN, 3, 4, NaN, 6],
    });

    const result = df.expanding({
      aggregations: {
        value: (values) => {
          // Proper handling of NaN values in the aggregation function
          if (values.length === 0) return null;
          return values.reduce((sum, val) => sum + val, 0) / values.length;
        },
      },
    });

    const expandingValues = result.col('value_expanding').toArray();

    // Check aggregation results with NaN values filtering
    expect(expandingValues[0]).toBe(1); // [1]
    expect(expandingValues[1]).toBe(1); // [1] (NaN is filtered out)
    expect(expandingValues[2]).toBeCloseTo((1 + 3) / 2); // [1, 3]
    expect(expandingValues[3]).toBeCloseTo((1 + 3 + 4) / 3); // [1, 3, 4]
    expect(expandingValues[4]).toBeCloseTo((1 + 3 + 4) / 3); // [1, 3, 4] (NaN is filtered out)
    expect(expandingValues[5]).toBeCloseTo((1 + 3 + 4 + 6) / 4); // [1, 3, 4, 6]
  });

  test('should throw error for invalid options', () => {
    const df = DataFrame.create({
      value: [1, 2, 3, 4, 5],
    });

    // Check that an error is thrown if no aggregations are specified
    expect(() => df.expanding({})).toThrow(
      'At least one aggregation must be specified',
    );

    // Check that an error is thrown if a non-existent column is specified
    expect(() =>
      df.expanding({
        aggregations: {
          nonexistent: (values) => values.length,
        },
      }),
    ).toThrow("Column 'nonexistent' not found in DataFrame");
  });
});
