// test/methods/timeseries/dataframe/resample.test.js
import { describe, test, expect, beforeAll } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import registerDataFrameTimeSeries from '../../../../src/methods/timeseries/dataframe/register.js';

describe('resample', () => {
  beforeAll(() => {
    // Register timeseries methods before tests
    registerDataFrameTimeSeries(DataFrame);
  });
  test('should resample daily data to monthly data', async () => {
    // Create test data with daily timestamps
    const dates = [];
    const values = [];
    const startDate = new Date('2023-01-01');

    // Generate 90 days of test data (Jan-Mar 2023)
    for (let i = 0; i < 90; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
      values.push(i + 1); // Simple increasing values
    }

    const df = DataFrame.create({
      date: dates,
      value: values,
    });

    // Resample to monthly frequency with sum aggregation
    const resampled = df.resample({
      dateColumn: 'date',
      freq: 'M',
      aggregations: {
        value: (arr) => arr.reduce((sum, val) => sum + val, 0),
      },
    });

    // Should have 3 months (Jan, Feb, Mar)
    expect(resampled.rowCount).toBe(3);

    // Check that dates are first day of each month
    const resultDates = resampled.col('date').toArray();
    expect(resultDates[0].getMonth()).toBe(0); // January
    expect(resultDates[1].getMonth()).toBe(1); // February
    expect(resultDates[2].getMonth()).toBe(2); // March

    // Check aggregated values
    const resultValues = resampled.col('value').toArray();

    // January should be sum of days 1-31
    const janSum = Array.from({ length: 31 }, (_, i) => i + 1).reduce(
      (a, b) => a + b,
      0,
    );
    expect(resultValues[0]).toBeCloseTo(janSum);

    // February should be sum of days 32-59 (28 days in Feb 2023)
    const febSum = Array.from({ length: 28 }, (_, i) => i + 32).reduce(
      (a, b) => a + b,
      0,
    );
    expect(resultValues[1]).toBeCloseTo(febSum);

    // March should be sum of days 60-90 (31 days)
    const marSum = Array.from({ length: 31 }, (_, i) => i + 60).reduce(
      (a, b) => a + b,
      0,
    );
    expect(resultValues[2]).toBeCloseTo(marSum);
  });

  test('should resample with multiple aggregations', async () => {
    const dates = [
      new Date('2023-01-01'),
      new Date('2023-01-02'),
      new Date('2023-01-03'),
      new Date('2023-02-01'),
      new Date('2023-02-02'),
    ];

    const df = DataFrame.create({
      date: dates,
      value: [10, 20, 30, 40, 50],
      count: [1, 2, 3, 4, 5],
    });

    const resampled = df.resample({
      dateColumn: 'date',
      freq: 'M',
      aggregations: {
        value: (arr) => arr.reduce((sum, val) => sum + val, 0),
        count: (arr) => arr.length,
      },
    });

    expect(resampled.rowCount).toBe(2);

    const valueResults = resampled.col('value').toArray();
    expect(valueResults[0]).toBe(60); // January: 10+20+30
    expect(valueResults[1]).toBe(90); // February: 40+50

    const countResults = resampled.col('count').toArray();
    expect(countResults[0]).toBe(3); // 3 entries in January
    expect(countResults[1]).toBe(2); // 2 entries in February
  });

  test('should throw error for invalid options', () => {
    const df = DataFrame.create({
      date: [new Date()],
      value: [1],
    });

    // Missing dateColumn
    expect(() =>
      df.resample({
        freq: 'D',
        aggregations: { value: (arr) => arr[0] },
      }),
    ).toThrow();

    // Missing freq
    expect(() =>
      df.resample({
        dateColumn: 'date',
        aggregations: { value: (arr) => arr[0] },
      }),
    ).toThrow();

    // Missing aggregations
    expect(() =>
      df.resample({
        dateColumn: 'date',
        freq: 'D',
      }),
    ).toThrow();

    // Invalid column name
    expect(() =>
      df.resample({
        dateColumn: 'date',
        freq: 'D',
        aggregations: { nonexistent: (arr) => arr[0] },
      }),
    ).toThrow();
  });

  test('should handle different frequencies', () => {
    const dates = [];
    const values = [];
    const startDate = new Date('2023-01-01');

    // Generate a year of test data
    for (let i = 0; i < 365; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
      values.push(i % 7); // Values 0-6 repeating
    }

    const df = DataFrame.create({
      date: dates,
      value: values,
    });

    // Test daily aggregation
    const dailyDf = df.resample({
      dateColumn: 'date',
      freq: 'D',
      aggregations: {
        value: (arr) => arr.reduce((sum, val) => sum + val, 0),
      },
    });

    // Should have 365 days
    expect(dailyDf.rowCount).toBe(365);

    // Test weekly aggregation
    const weeklyDf = df.resample({
      dateColumn: 'date',
      freq: 'W',
      aggregations: {
        value: (arr) => arr.reduce((sum, val) => sum + val, 0),
      },
    });

    // Should have ~52 weeks (might be 53 depending on exact dates)
    expect(weeklyDf.rowCount).toBeGreaterThanOrEqual(52);
    expect(weeklyDf.rowCount).toBeLessThanOrEqual(53);

    // Test quarterly aggregation
    const quarterlyDf = df.resample({
      dateColumn: 'date',
      freq: 'Q',
      aggregations: {
        value: (arr) => arr.reduce((sum, val) => sum + val, 0),
      },
    });

    // Should have 4 quarters
    expect(quarterlyDf.rowCount).toBe(4);

    // Test yearly aggregation
    const yearlyDf = df.resample({
      dateColumn: 'date',
      freq: 'Y',
      aggregations: {
        value: (arr) => arr.reduce((sum, val) => sum + val, 0),
      },
    });

    // Should have 1 year
    expect(yearlyDf.rowCount).toBe(1);
  });
});
